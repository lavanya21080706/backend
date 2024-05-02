const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // console.log('token extracting',token)

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.userId = decoded.userId;
        // console.log('hey',req.userId)
         // Extract user ID from the decoded token
        next();
    });
};

module.exports = verifyToken;
