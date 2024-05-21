const express = require('express');
const app = express();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Initialize Firebase Admin
const serviceAccount = require('./node_modules/credentials/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://appauth-9d83d-default-rtdb.firebaseio.com/',
});

// Route for user registration
app.post('/api/users/register', async (req, res) => {
    const { username, email, phone, address, password } = req.body;
  
    try {
        // Create a new user in Firebase Realtime Database
        await admin.auth().createUser({
            email,
            password,
            phone,
            address,
            displayName: username,
        });
  
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Route for user login
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
        // Sign in user using Firebase Authentication
        const userCredential = await admin.auth().signInWithEmailAndPassword(email, password);
        const token = await userCredential.user.getIdToken();
  
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden: Invalid token' });
        }
        req.user = user; // Attach user data to request object
        next(); // Move to the next middleware or route handler
    });
};

// Route for fetching reports
app.get('/api/reports', authenticateToken, async (req, res) => {
    try {
        // Fetch missing child reports from Firebase Realtime Database
        const snapshot = await admin.database().ref('missing_child_reports').once('value');
        const reports = snapshot.val();
  
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching missing child reports:', error);
        res.status(500).json({ error: 'Failed to fetch missing child reports' });
    }
});
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

app.post('/submit-report', upload.single('image'), (req, res) => {
  const personName = req.body.personName;
  const description = req.body.description;
  const image = req.file;

  // Handle the data (save to database, etc.)
  console.log('Received report:');
  console.log('Person Name:', personName);
  console.log('Description:', description);
  console.log('Image:', image);

  // Send response
  res.status(200).json({ message: 'Report submitted successfully' });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Create a new report
router.post('/reports', (req, res) => {
  const { category, description } = req.body;
  const newReportRef = reportsRef.push();
  newReportRef.set({ category, description })
    .then(() => {
      res.status(201).json({ message: 'Report created successfully' });
    })
    .catch((error) => {
      console.error('Error creating report:', error);
      res.status(500).json({ error: 'Server error' });
    });
});

// Get all reports
router.get('/reports', (req, res) => {
  reportsRef.once('value', (snapshot) => {
    const reports = snapshot.val();
    res.json(reports);
  }, (errorObject) => {
    console.error('Error reading reports:', errorObject);
    res.status(500).json({ error: 'Server error' });
  });
});
