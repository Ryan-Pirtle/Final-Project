const jwt = require('jsonwebtoken');

class TokenAuthentication {
    static JWT_SECRET = 'your_secret_key'; // Use `static` for a constant in a class

    static authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1]; // Extract the token

        if (!token) {
            return res.status(401).json({ error: 'Access denied' });
        }

        jwt.verify(token, TokenAuthentication.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid token' });
            }
            req.user = user; // Attach the user to the request object
            next(); // Pass control to the next middleware
        });
    }

     // Method to generate a token
     static generateToken(user) {
        const payload = {
            id: user.id, // User ID
            role: user.role // User Role
        };
        // Sign and return the token
        return jwt.sign(payload, TokenAuthentication.JWT_SECRET);
    }
}

module.exports = TokenAuthentication;
