const { createProxyMiddleware } = require('http-proxy-middleware');

// IP whitelist
const allowedIPs = [
  '127.0.0.1',
  '192.168.1.x',
];

// IP restriction middleware
const ipRestriction = (req, res, next) => {
  const clientIP = req.ip || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   (req.connection.socket ? req.connection.socket.remoteAddress : null);
  
  console.log(`Access attempt from IP: ${clientIP}`);
  
  // Extract IP from potential IPv6 format
  const cleanIP = clientIP.replace(/^.*:/, '');
  
  if (allowedIPs.includes(cleanIP) || allowedIPs.includes(clientIP)) {
    next();
  } else {
    console.log(`❌ Access denied for IP: ${clientIP}`);
    res.status(403).json({ 
      error: 'Access Denied', 
      message: 'Your IP address is not authorized',
      ip: clientIP 
    });
  }
};

module.exports = function(app) {
  // Apply IP restriction to all routes
  app.use(ipRestriction);
};