import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'created',
        'updated',
        'deleted',
        'approved',
        'rejected',
        'status_changed',
        'payment_marked',
        'category_assigned',
        'exported',
        'viewed'
      ],
      required: true,
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ document: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
