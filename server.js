const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// 1. MIDDLEWARE & CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// 2. DATABASE CONNECTION
mongoose.connect("mongodb://127.0.0.1:27017/clinikProDB")
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// 3. MODELS & SCHEMAS
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    email: { type: String, unique: true, sparse: true },
    role: { type: String, required: true },
    pass: { type: String },
    image: { type: String, default: null }, 
    tsID: { type: String, default: null },
    tsKey: { type: String, default: null }
});
const User = mongoose.model('User', userSchema);

const appointmentSchema = new mongoose.Schema({
    patientName: String,
    patientEmail: String,
    date: String,
    time: String,
    specialty: String,
    reason: String,
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

// 4. FILE STORAGE CONFIGURATION
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// 5. AUTHENTICATION ROUTES
app.post('/register', upload.single('image'), async (req, res) => {
    try {
        const { name, email, role, pass, tsID, tsKey, dob } = req.body;
        const newUser = new User({
            name, dob, role,
            email: role === 'doctor' ? email : `patient_${Date.now()}@clinik.com`, 
            pass: role === 'doctor' ? pass : null,
            tsID: role === 'patient' ? tsID : null,
            tsKey: role === 'patient' ? tsKey : null,
            image: req.file ? req.file.filename : null 
        });
        await newUser.save();
        res.status(201).json({ message: "Saved Successfully" });
    } catch (err) {
        res.status(500).json({ error: "Registration Error." });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { role, email, pass, tsID, tsKey } = req.body;
        let query = { role };
        if (role === 'doctor') {
            query.email = email;
            query.pass = pass;
        } else {
            query.tsID = tsID;
            query.tsKey = tsKey;
        }
        const user = await User.findOne(query);
        if (user) res.status(200).json(user);
        else res.status(401).json({ error: "Invalid credentials" });
    } catch (err) {
        res.status(500).json({ error: "Login error" });
    }
});

// 6. DASHBOARD & APPOINTMENT ROUTES

// Fetch all users (for Doctor's patient list)
app.get('/users', async (req, res) => {
    try {
        const allUsers = await User.find({}); 
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Unified Appointment Routes
// Use this for BOTH Patient booking AND Doctor fetching
app.route('/appointments')
    .get(async (req, res) => {
        try {
            const apps = await Appointment.find({}).sort({ createdAt: -1 });
            res.status(200).json(apps);
        } catch (err) {
            res.status(500).json({ error: "Fetch failed" });
        }
    })
    .post(async (req, res) => {
        try {
            const newApp = new Appointment(req.body);
            await newApp.save();
            res.status(201).json({ message: "Appointment Booked" });
        } catch (err) {
            res.status(500).json({ error: "Booking failed" });
        }
    });

// Doctor Action: Approve/Cancel
app.patch('/appointments/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedApp = await Appointment.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        if (!updatedApp) return res.status(404).json({ error: "Not found" });
        res.json(updatedApp);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

// 7. START SERVER
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server Running: http://localhost:${PORT}`));