const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// AUTO CREATE UPLOADS FOLDER
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 uploads folder created");
}

// MULTER CONFIG (SAFE VERSION)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const safeName = Date.now() + '-' + file.originalname.replace(/\s/g, '-');
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// SERVE IMAGES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let pets = [];
let currentId = 1;

// TEST ROUTE
app.get('/', (req, res) => {
  res.send('Pet Adoption API is running perfectly');
});

// GET ALL PETS
app.get('/api/pets', (req, res) => {
  res.json(pets);
});

// GET SINGLE PET
app.get('/api/pets/:id', (req, res) => {
  const pet = pets.find(p => p.id === parseInt(req.params.id));

  if (!pet) {
    return res.status(404).json({ message: 'Pet not found' });
  }

  res.json(pet);
});

// ADD PET (WITH IMAGE)
app.post('/api/pets', upload.single('image'), (req, res) => {
  try {
    const { name, breed, age, description, adopted } = req.body;

    if (!name || !breed || !age || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newPet = {
      id: currentId++,
      name,
      breed,
      age,
      description,
      adopted: adopted || false,
      image: req.file
        ? `/uploads/${req.file.filename}`
        : null
    };

    pets.push(newPet);

    res.status(201).json({
      message: 'Pet added successfully',
      pet: newPet
    });

  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({
      message: "Failed to add pet",
      error: err.message
    });
  }
});

// UPDATE PET
app.put('/api/pets/:id', upload.single('image'), (req, res) => {
  try {
    const index = pets.findIndex(p => p.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const { name, breed, age, description, adopted } = req.body;

    pets[index] = {
      ...pets[index],
      name: name || pets[index].name,
      breed: breed || pets[index].breed,
      age: age || pets[index].age,
      description: description || pets[index].description,
      adopted: adopted !== undefined ? adopted : pets[index].adopted,
      image: req.file
        ? `/uploads/${req.file.filename}`
        : pets[index].image
    };

    res.json({
      message: 'Pet updated successfully',
      pet: pets[index]
    });

  } catch (err) {
    console.error("PUT ERROR:", err);
    res.status(500).json({
      message: "Failed to update pet",
      error: err.message
    });
  }
});

// DELETE PET
app.delete('/api/pets/:id', (req, res) => {
  const index = pets.findIndex(p => p.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Pet not found' });
  }

  pets.splice(index, 1);

  res.json({ message: 'Pet deleted successfully' });
});

// START SERVER (RENDER SAFE)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});