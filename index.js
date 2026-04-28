const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ✅ Empty array + safe ID system
let pets = [];
let currentId = 1;

// ✅ Multer setup (image upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// ✅ 100MB limit
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// ✅ Serve uploaded images
app.use('/uploads', express.static('uploads'));

// API ENDPOINTS
app.get('/', (req, res) => {
  res.send('Welcome to the Pets Adoption');
});

// GET all pets
app.get('/api/pets', (req, res) => {
  res.status(200).json(pets);
});

// GET pet by ID
app.get('/api/pets/:id', (req, res) => {
  const pet = pets.find(p => p.id === parseInt(req.params.id));

  if (!pet) {
    return res.status(404).json({ message: 'Pet not found.' });
  }

  res.status(200).json(pet);
});

// ✅ POST with image upload
app.post('/api/pets', upload.single('image'), (req, res) => {
  const { name, breed, age, description, adopted } = req.body;

  if (!name || !breed || !age || !description) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const newPet = {
    id: currentId++,
    name,
    breed,
    age,
    description,
    adopted: adopted || false,
    image: req.file ? `/uploads/${req.file.filename}` : null
  };

  pets.push(newPet);

  res.status(201).json({
    message: 'Pet added successfully!',
    pet: newPet,
  });
});

// PUT update pet (optional: allow image update)
app.put('/api/pets/:id', upload.single('image'), (req, res) => {
  const petIndex = pets.findIndex(p => p.id === parseInt(req.params.id));

  if (petIndex === -1) {
    return res.status(404).json({ message: 'Pet not found.' });
  }

  const { name, breed, age, description, adopted } = req.body;

  pets[petIndex] = {
    ...pets[petIndex],
    name: name || pets[petIndex].name,
    breed: breed || pets[petIndex].breed,
    age: age || pets[petIndex].age,
    description: description || pets[petIndex].description,
    adopted: adopted !== undefined ? adopted : pets[petIndex].adopted,
    image: req.file ? `/uploads/${req.file.filename}` : pets[petIndex].image
  };

  res.status(200).json({
    message: 'Pet updated successfully!',
    pet: pets[petIndex],
  });
});

// DELETE pet
app.delete('/api/pets/:id', (req, res) => {
  const petIndex = pets.findIndex(p => p.id === parseInt(req.params.id));

  if (petIndex === -1) {
    return res.status(404).json({ message: 'Pet not found.' });
  }

  pets.splice(petIndex, 1);

  res.status(200).json({ message: 'Pet removed successfully.' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});