const express = require('express');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const PORT = 3000;
const JWT_SECRET = 'medapp-secret-key-lab12';
const JWT_EXPIRES_IN = '1h';

// Middleware
app.use(middlewares);
app.use(express.json()); // Ensure body parsing is available for custom endpoints

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Helper to read db.json
const getDb = () => {
    const data = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
    return JSON.parse(data);
};

const saveDb = (db) => {
    fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(db, null, 2));
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// Verify JWT middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Optional auth - doesn't fail if no token
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            // Token invalid, but that's ok - continue without user
        }
    }
    next();
};

// Role check middleware
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
};

// ==================== AUTH ENDPOINTS ====================

// POST /register
app.post('/register', async (req, res) => {
    const { email, password, name, role = 'patient' } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    const db = getDb();

    // Check if email exists
    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
        id: Date.now(),
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: role === 'admin' ? 'patient' : role, // Prevent self-admin registration
        isBanned: false
    };

    db.users.push(newUser);
    saveDb(db);

    // Generate token
    const accessToken = generateToken(newUser);

    res.status(201).json({
        accessToken,
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
        }
    });
});

// POST /login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    const db = getDb();
    const user = db.users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ message: 'Cannot find user' });
    }

    // Check if banned
    if (user.isBanned) {
        return res.status(403).json({ message: 'User is banned' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
        return res.status(401).json({ message: 'Incorrect password' });
    }

    // Generate token
    const accessToken = generateToken(user);

    res.json({
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    });
});

// ==================== PROTECTED ROUTES ====================

// Protected: appointments (require login for write operations)
app.post('/appointments', authenticate, (req, res, next) => {
    req.body.patientId = req.user.id; // Ensure user can only create their own appointments
    next();
});

app.patch('/appointments/:id', authenticate, (req, res, next) => {
    next();
});

app.delete('/appointments/:id', authenticate, requireRole('admin'), (req, res, next) => {
    next();
});

// Protected: users (admin only for list)
app.get('/users', optionalAuth, (req, res, next) => {
    // Anyone can read users for now (for login check)
    // In production, you'd want to restrict this
    next();
});

app.patch('/users/:id', authenticate, requireRole('admin'), (req, res, next) => {
    next();
});

// Protected: doctors (admin only for write)
app.post('/doctors', authenticate, requireRole('admin'), (req, res, next) => {
    next();
});

app.put('/doctors/:id', authenticate, requireRole('admin', 'doctor'), (req, res, next) => {
    next();
});

app.delete('/doctors/:id', authenticate, requireRole('admin'), (req, res, next) => {
    next();
});

// Protected: availabilities (doctor or admin)
app.post('/availabilities', authenticate, requireRole('doctor', 'admin'), (req, res, next) => {
    if (req.user.role === 'doctor') {
        req.body.doctorId = String(req.user.id); // Doctors can only add for themselves
    }
    next();
});

app.put('/availabilities/:id', authenticate, requireRole('doctor', 'admin'), (req, res, next) => {
    next();
});

app.delete('/availabilities/:id', authenticate, requireRole('doctor', 'admin'), (req, res, next) => {
    next();
});

// Protected: absences (doctor or admin)
app.post('/absences', authenticate, requireRole('doctor', 'admin'), (req, res, next) => {
    if (req.user.role === 'doctor') {
        req.body.doctorId = String(req.user.id);
    }
    next();
});

app.delete('/absences/:id', authenticate, requireRole('doctor', 'admin'), (req, res, next) => {
    next();
});

// ==================== JSON SERVER ROUTER ====================
app.use(router);

// Start server
app.listen(PORT, () => {
    console.log(`\n🏥 MedApp Backend Server running on http://localhost:${PORT}`);
    console.log(`   JWT Authentication enabled`);
    console.log(`\n   Endpoints:`);
    console.log(`   POST /register - Register new user`);
    console.log(`   POST /login    - Login and get JWT token`);
    console.log(`   GET  /doctors  - List doctors (public)`);
    console.log(`   *    /appointments - CRUD (authenticated)`);
    console.log(`\n   Test accounts (password: test123):`);
    console.log(`   admin@admin.com   - Admin`);
    console.log(`   jan@lekarz.pl     - Doctor`);
    console.log(`   pacjent@test.pl   - Patient`);
    console.log('');
});
