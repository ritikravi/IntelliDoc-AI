import Document from '../models/Document.model.js';
import { AppError } from '../middleware/errorHandler.js';

// Auto-categorize based on vendor name and amount
const autoCategorizeinvoice = (vendorName, amount, lineItems) => {
  const vendor = vendorName.toLowerCase();
  
  // Technology & Software
  if (vendor.includes('microsoft') || vendor.includes('google') || vendor.includes('amazon') || vendor.includes('apple')) {
    return {
      category: 'Technology & Software',
      subCategory: 'Cloud Services',
      tags: ['cloud', 'saas', 'technology']
    };
  }
  
  // Consulting
  if (vendor.includes('consulting') || vendor.includes('services')) {
    return {
      category: 'Professional Services',
      subCategory: 'Consulting',
      tags: ['consulting', 'services', 'professional']
    };
  }
  
  // Office & Equipment
  if (vendor.includes('office') || vendor.includes('equipment')) {
    return {
      category: 'Office & Equipment',
      subCategory: 'Supplies',
      tags: ['office', 'equipment', 'supplies']
    };
  }
  
  // High-value purchases
  if (amount > 20000) {
    return {
      category: 'Capital Expenditure',
      subCategory: 'Major Purchase',
      tags: ['capex', 'high-value', 'major-purchase']
    };
  }
  
  // Default category
  return {
    category: 'General Expenses',
    subCategory: 'Other',
    tags: ['general', 'miscellaneous']
  };
};

export const categorizeDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, subCategory, tags } = req.body;

    const document = await Document.findOne({ _id: id, user: req.user._id });
    
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    document.category = category;
    document.subCategory = subCategory;
    document.tags = tags || [];
    await document.save();

    res.json({
      success: true,
      message: 'Document categorized successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};

export const autoCategorizeAll = async (req, res, next) => {
  try {
    const documents = await Document.find({
      user: req.user._id,
      status: 'processed',
      category: { $in: [null, undefined, ''] }
    });

    let categorizedCount = 0;

    for (const doc of documents) {
      const categorization = autoCategorizeinvoice(doc.vendorName, doc.totalAmount, doc.lineItems);
      doc.category = categorization.category;
      doc.subCategory = categorization.subCategory;
      doc.tags = categorization.tags;
      await doc.save();
      categorizedCount++;
    }

    res.json({
      success: true,
      message: `${categorizedCount} documents auto-categorized`,
      categorizedCount
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryStats = async (req, res, next) => {
  try {
    const stats = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          avgAmount: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const subCategoryStats = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      {
        $group: {
          _id: { category: '$category', subCategory: '$subCategory' },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      categoryStats: stats,
      subCategoryStats
    });
  } catch (error) {
    next(error);
  }
};

export const getTagCloud = async (req, res, next) => {
  try {
    const tags = await Document.aggregate([
      { $match: { user: req.user._id, status: 'processed' } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      tags
    });
  } catch (error) {
    next(error);
  }
};

export const getByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const documents = await Document.find({
      user: req.user._id,
      status: 'processed',
      category: new RegExp(category, 'i')
    })
    .select('-embedding -fileUrl')
    .sort('-invoiceDate')
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const count = await Document.countDocuments({
      user: req.user._id,
      status: 'processed',
      category: new RegExp(category, 'i')
    });

    res.json({
      success: true,
      documents,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    next(error);
  }
};

export const getByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;

    const documents = await Document.find({
      user: req.user._id,
      status: 'processed',
      tags: tag
    })
    .select('-embedding -fileUrl')
    .sort('-invoiceDate')
    .limit(50);

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
};

export const addTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;

    if (!tag) {
      throw new AppError('Tag is required', 400);
    }

    const document = await Document.findOne({ _id: id, user: req.user._id });
    
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (!document.tags) {
      document.tags = [];
    }

    if (!document.tags.includes(tag)) {
      document.tags.push(tag);
      await document.save();
    }

    res.json({
      success: true,
      message: 'Tag added successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};

export const removeTag = async (req, res, next) => {
  try {
    const { id, tag } = req.params;

    const document = await Document.findOne({ _id: id, user: req.user._id });
    
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.tags) {
      document.tags = document.tags.filter(t => t !== tag);
      await document.save();
    }

    res.json({
      success: true,
      message: 'Tag removed successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};
