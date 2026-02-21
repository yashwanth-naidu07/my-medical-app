const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect("mongodb://127.0.0.1:27017/clinikProDB")
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Error:", err));

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

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// REGISTRATION
app.post('/register', upload.single('image'), async (req, res) => {
    try {
        const { name, email, role, pass, tsID, tsKey, dob } = req.body;

        const newUser = new User({
            name,
            dob,
            role,
            email: role === 'doctor' ? email : `patient_${Date.now()}@clinik.com`, 
            pass: role === 'doctor' ? pass : null,
            tsID: role === 'patient' ? tsID : null,
            tsKey: role === 'patient' ? tsKey : null,
            image: req.file ? req.file.filename : null 
        });

        await newUser.save();
        res.status(201).json({ message: "Saved Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration Error. Check if email is unique." });
    }
});

// LOGIN
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

app.listen(5000, () => console.log("🚀 Server Running: http://localhost:5000"));
