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

    // Use lowdb's in-memory database (same as all other operations)
    const existingUser = router.db.get('users').find({ email: email }).value();
    if (existingUser) {
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

    // Add to lowdb's in-memory database
    router.db.get('users').push(newUser).write();

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

    // Use lowdb's in-memory database (same as registration)
    const user = router.db.get('users').find({ email: email }).value();

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
app.post('/appointments', authenticate, (req, res) => {
    // Use json-server's in-memory database instead of reading/writing file
    // This ensures the data is immediately available for queries
    const newAppointment = {
        ...req.body,
        patientId: String(req.user.id) // Ensure user can only create their own appointments
    };

    // Add to json-server's in-memory database
    router.db.get('appointments').push(newAppointment).write();

    res.status(201).json(newAppointment);
});

// Protected: PATCH appointment (e.g., cancel)
app.patch('/appointments/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Get the appointment - try both string and number ID (appointments use string IDs)
    let appointment = router.db.get('appointments').find({ id: id }).value();
    if (!appointment) {
        // Fallback: try as number in case some appointments were created with numeric IDs
        appointment = router.db.get('appointments').find({ id: parseInt(id) }).value();
    }

    if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update the appointment in json-server's database using the original appointment's ID type
    router.db.get('appointments')
        .find({ id: appointment.id })
        .assign(updates)
        .write();

    // Return updated appointment
    const updated = router.db.get('appointments').find({ id: appointment.id }).value();
    res.json(updated);
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

app.patch('/users/:id', authenticate, requireRole('admin'), (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Find the user (try both string and number ID)
    let user = router.db.get('users').find({ id: id }).value();
    if (!user) {
        user = router.db.get('users').find({ id: parseInt(id) }).value();
    }

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Update the user in json-server's database
    router.db.get('users')
        .find({ id: user.id })
        .assign(updates)
        .write();

    // Return updated user
    const updated = router.db.get('users').find({ id: user.id }).value();
    res.json(updated);
});

// Admin can delete users
app.delete('/users/:id', authenticate, requireRole('admin'), (req, res) => {
    const { id } = req.params;

    // Remove from json-server's in-memory database (try both string and number ID)
    let removed = router.db.get('users').remove({ id: id }).write();
    if (removed.length === 0) {
        removed = router.db.get('users').remove({ id: parseInt(id) }).write();
    }

    res.status(200).json({ message: 'User deleted' });
});

// Admin can create new users (e.g., doctor accounts)
app.post('/users', authenticate, requireRole('admin'), async (req, res) => {
    const newUser = req.body;

    // Hash password with bcrypt if provided
    if (newUser.password) {
        newUser.password = await bcrypt.hash(newUser.password, 10);
    }

    // Add to json-server's in-memory database
    router.db.get('users').push(newUser).write();

    res.status(201).json(newUser);
});

// Protected: doctors (admin only for write)
app.post('/doctors', authenticate, requireRole('admin'), (req, res) => {
    const newDoctor = req.body;

    // Add to json-server's in-memory database
    router.db.get('doctors').push(newDoctor).write();

    res.status(201).json(newDoctor);
});

app.put('/doctors/:id', authenticate, requireRole('admin', 'doctor'), (req, res, next) => {
    next();
});

app.delete('/doctors/:id', authenticate, requireRole('admin'), (req, res) => {
    const { id } = req.params;

    // Remove from json-server's in-memory database
    router.db.get('doctors').remove({ id: id }).write();

    res.status(200).json({ message: 'Doctor deleted' });
});

// Protected: availabilities (doctor or admin)
app.post('/availabilities', authenticate, requireRole('doctor', 'admin'), (req, res) => {
    const newAvailability = req.body;
    // Note: frontend sends doctorId based on the doctor profile being viewed

    // Add to json-server's in-memory database
    router.db.get('availabilities').push(newAvailability).write();

    res.status(201).json(newAvailability);
});

app.put('/availabilities/:id', authenticate, requireRole('doctor', 'admin'), (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    router.db.get('availabilities')
        .find({ id: id })
        .assign(updates)
        .write();

    const updated = router.db.get('availabilities').find({ id: id }).value();
    res.json(updated);
});

app.delete('/availabilities/:id', authenticate, requireRole('doctor', 'admin'), (req, res) => {
    const { id } = req.params;
    router.db.get('availabilities').remove({ id: id }).write();
    res.status(200).json({ message: 'Availability deleted' });
});

// Protected: absences (doctor or admin)
app.post('/absences', authenticate, requireRole('doctor', 'admin'), (req, res) => {
    const newAbsence = req.body;
    // Note: frontend sends doctorId based on the doctor profile being viewed

    // Add to json-server's in-memory database
    router.db.get('absences').push(newAbsence).write();

    res.status(201).json(newAbsence);
});

app.delete('/absences/:id', authenticate, requireRole('doctor', 'admin'), (req, res) => {
    const { id } = req.params;
    router.db.get('absences').remove({ id: id }).write();
    res.status(200).json({ message: 'Absence deleted' });
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
