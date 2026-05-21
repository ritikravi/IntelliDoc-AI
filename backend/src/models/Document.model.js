import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  description: String,
  quantity: Number,
  unitPrice: Number,
  amount: Number,
  taxRate: Number,
});

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'png', 'jpg', 'jpeg'],
      required: true,
    },
    fileSize: Number,
    cloudinaryId: String,
    
    // Processing status
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'failed'],
      default: 'uploaded',
    },
    processingError: String,
    
    // Extracted data
    documentType: {
      type: String,
      enum: ['invoice', 'receipt', 'purchase_order', 'quotation', 'other'],
    },
    invoiceNumber: String,
    vendorName: String,
    vendorAddress: String,
    vendorGST: String,
    vendorEmail: String,
    vendorPhone: String,
    
    customerName: String,
    customerAddress: String,
    customerGST: String,
    
    invoiceDate: Date,
    dueDate: Date,
    
    currency: {
      type: String,
      default: 'INR',
    },
    subtotal: Number,
    taxAmount: Number,
    totalAmount: Number,
    
    lineItems: [lineItemSchema],
    
    paymentTerms: String,
    notes: String,
    
    // AI metadata
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
    },
    ocrEngine: {
      type: String,
      enum: ['paddleocr', 'tesseract'],
    },
    processingTime: Number, // in milliseconds
    
    // Embeddings for semantic search
    embedding: [Number],
    
    // Flags
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    isFraudulent: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ invoiceNumber: 1 });
documentSchema.index({ vendorName: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ invoiceDate: 1 });

export default mongoose.model('Document', documentSchema);
