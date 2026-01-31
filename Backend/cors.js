// CORS Middleware for JSON-Server
// Allows cross-origin requests from Dashboard (5173) and Citizen App (5174)

module.exports = (req, res, next) => {
  // Allow requests from any origin (development only)
  res.header('Access-Control-Allow-Origin', '*');
  
  // Allow specific methods
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  
  // Allow specific headers
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};
