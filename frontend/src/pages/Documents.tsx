import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Eye, Trash2, FileText } from 'lucide-react';

const mockDocuments = [
  {
    id: '1',
    name: 'Invoice_2026_001.pdf',
    vendor: 'Amazon Web Services',
    invoiceNumber: 'INV-2026-001',
    date: '2026-05-15',
    amount: 12500,
    currency: 'INR',
    confidence: 0.98,
    status: 'processed',
  },
  {
    id: '2',
    name: 'Receipt_Store_45.jpg',
    vendor: 'Flipkart',
    invoiceNumber: 'RCP-45-2026',
    date: '2026-05-14',
    amount: 8900,
    currency: 'INR',
    confidence: 0.92,
    status: 'processed',
  },
  {
    id: '3',
    name: 'PO_Tech_Corp.pdf',
    vendor: 'Tech Corporation Ltd',
    invoiceNumber: 'PO-2026-789',
    date: '2026-05-13',
    amount: 45000,
    currency: 'INR',
    confidence: 0.95,
    status: 'processed',
  },
];

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents] = useState(mockDocuments);

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all processed documents
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button className="flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDocuments.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  doc.confidence >= 0.9
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}
              >
                {(doc.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>

            <h3 className="font-semibold text-lg mb-2 truncate">{doc.name}</h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendor:</span>
                <span className="font-medium">{doc.vendor}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invoice #:</span>
                <span className="font-medium">{doc.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{doc.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-lg">
                  {doc.currency} {doc.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <button className="flex-1 flex items-center justify-center px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Eye className="w-4 h-4 mr-1" />
                View
              </button>
              <button className="flex items-center justify-center px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center px-3 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or upload new documents
          </p>
        </div>
      )}
    </div>
  );
}
