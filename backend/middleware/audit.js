import AuditLog from '../models/AuditLog.js';

export const logAction = (actionName) => {
  return async (req, res, next) => {
    // Capture the original send method to execute after the request finishes
    const originalSend = res.send;

    res.send = function (body) {
      res.send = originalSend;
      
      // Log only on successful modifications or specific actions
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const log = new AuditLog({
            userId: req.user ? req.user.id : null,
            userType: req.user ? (req.user.role === 'admin' ? 'Admin' : 'Employee') : 'Admin',
            action: actionName || `${req.method} ${req.originalUrl}`,
            details: {
              body: req.body,
              params: req.params,
              query: req.query
            },
            ipAddress: req.ip
          });
          // Fire and forget
          log.save().catch(err => console.error('Audit Log Save Error:', err));
        } catch (error) {
          console.error('Audit Log Error:', error);
        }
      }
      
      return res.send(body);
    };
    
    next();
  };
};
