/**
 * Generate JWT Token
 * 
 * Creates a JSON Web Token containing the user's ID and role.
 * This token is sent to the frontend and used for all authenticated API calls.
 */
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = generateToken;
