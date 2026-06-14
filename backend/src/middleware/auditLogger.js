import { createAuditLog } from '../controllers/audit.controller.js';

export const auditLogger = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const logData = {
          user: req.user?._id,
          document: req.params.id || req.body.documentId || data.documentId,
          action,
          actionBy: req.user?._id,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
          }
        };

        if (req.auditPreviousValue) {
          logData.previousValue = req.auditPreviousValue;
        }
        if (req.auditNewValue || data.document) {
          logData.newValue = req.auditNewValue || data.document;
        }

        createAuditLog(logData).catch(err => {
          console.error('Audit log failed:', err);
        });
      }
      return originalJson(data);
    };

    next();
  };
};
