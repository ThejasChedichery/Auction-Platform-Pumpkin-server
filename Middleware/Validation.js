const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('../database')

// Register new user
const Register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: "Email, name, and password are required" });
        }

        // Check if email already exists
        db.get("SELECT * FROM users WHERE email = ?", [email], async (err, existingUser) => {
            if (err) {
                return res.status(500).send({ message: "DB error: " + err.message });
            }

            if (existingUser) {
                return res.status(400).json({ message: "Email already registered" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user
            db.run(
                "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
                [email, hashedPassword, name],
                function (err) {
                    if (err) {
                        return res.status(500).send({ message: "Error inserting user: " + err.message });
                    }

                    // Generate token for new user
                    const Token = jwt.sign(
                        { id: this.lastID, email },
                        'Pumpkin@2025'
                    );

                    req.user = {
                        id: this.lastID,
                        name: name,
                        email: email,
                        token: Token
                    };
                    next()
                }
            );
        });
    } catch (err) {
        res.status(500).send({ message: "Can't register user: " + err.message });
    }
};

// Login validation & creating token
const LoginValidation = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user in SQLite
        db.get("SELECT * FROM users WHERE email = ?", [email], async (err, findUser) => {
            if (err) {
                return res.status(500).send({ message: "DB error: " + err.message });
            }

            if (findUser) {
                const isPasswordValied = await bcrypt.compare(password, findUser.password);

                if (isPasswordValied) {
                    const Token = jwt.sign(
                        { id: findUser.id, email: findUser.email },
                        'Pumpkin@2025'
                    );

                    req.user = {
                        id: findUser.id,
                        name: findUser.name,   
                        email: findUser.email,
                        token: Token
                    };
                    next();
                } else {
                    res.status(401).send({ message: 'Invalid password' });
                }
            } else {
                res.status(401).send({ message: 'Invalid email id' });
            }
        });
    } catch (err) {
        res.status(500).send({ message: "can't login  " + err });
    }
}

// checking is a valied user 
const Validation = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.user?.token;

    if (!token) {
        return res.status(401).json({ message: 'Token missing or invalid' });
    }

    try {
        const decoded = jwt.verify(token, 'Pumpkin@2025');
        req.id = decoded.id;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = { LoginValidation, Validation ,Register}
