const express = require('express');
const router = express.Router();
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


router.post('/register', async (req, res) => {
    const { name, password} = req.body;

    if (!name || !password) {
        return res.status(400).json({
            errorMessage: "Bad Request",
        });
    }

    try {
        const existingUser = await User.findOne({ name});
        
        if (existingUser) {
            return res.status(409).json({ message: 'Already registered' });
        }


        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user object and save to database
        const newUser = new User({ name,  password: hashedPassword});
        await newUser.save();


        // Generate token
        const token = jwt.sign({ name: newUser.name }, process.env.JWT_SECRET);

        res.json({
            message: "User registered successfully",
            token: token,
            name: name,
            password: hashedPassword,
            success:true,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to register user', error: error.message });
    }
});



//login route
router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({name});

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!name || !password) {
            return res.status(400).json({
                errorMessage: "Bad Request! Invalid credentials",
            });
        }

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' }); // Use 401 for unauthorized (incorrect password)
        }

        const token = jwt.sign({ name: user.name }, process.env.JWT_SECRET);

        res.json({
            message: "User login successfully",
            token: token,
            name: user.name,
            success:true,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to login', error: error.message });
    }
});


module.exports = router;
