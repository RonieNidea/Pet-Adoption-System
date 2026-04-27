const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large base64 image strings

// In-memory storage
let pets = [];

/* =========================
   ROUTES
========================= */

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Pets Adoption API Running' });
});

// GET all pets
app.get('/api/pets', (req, res) => {
  res.json(pets);
});

app.get('/api/pets/:id', (req, res) => {
  const pet = pets.find(p => p.id === parseInt(req.params.id));
  if (!pet) {
    return res.status(404).json({ message: 'Pet not found' });
  }
  res.json(pet);
});

app.post('/api/pets', (req, res) => {
  const { name, breed, age, description, image } = req.body;

  if (!name || !breed || !age || !description) {
    return res.status(400).json({ message: 'Missing required fields: name, breed, age, description' });
  }

  if (isNaN(Number(age)) || Number(age) <= 0) {
    return res.status(400).json({ message: 'Age must be a positive number' });
  }

  if (image && !image.startsWith('data:image/')) {
    return res.status(400).json({ message: 'Image must be a valid base64 string (e.g. data:image/jpeg;base64,...)' });
  }

  const newPet = {
    id: Date.now(),
    name,
    breed,
    age: Number(age),
    description,
    image: image || ''
  };

  pets.push(newPet);

  res.status(201).json({
    message: 'Pet created successfully',
    pet: newPet
  });
});


app.put('/api/pets/:id', (req, res) => {
  const index = pets.findIndex(p => p.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Pet not found' });
  }

  const { name, breed, age, description, image } = req.body;

  if (age !== undefined && (isNaN(Number(age)) || Number(age) <= 0)) {
    return res.status(400).json({ message: 'Age must be a positive number' });
  }

  if (image && !image.startsWith('data:image/')) {
    return res.status(400).json({ message: 'Image must be a valid base64 string (e.g. data:image/jpeg;base64,...)' });
  }

  const updatedFields = {};
  if (name) updatedFields.name = name;
  if (breed) updatedFields.breed = breed;
  if (age) updatedFields.age = Number(age);
  if (description) updatedFields.description = description;
  if (image !== undefined) updatedFields.image = image;

  pets[index] = {
    ...pets[index],
    ...updatedFields
  };

  res.json({
    message: 'Pet updated successfully',
    pet: pets[index]
  });
});

app.delete('/api/pets/:id', (req, res) => {
  const exists = pets.some(p => p.id === parseInt(req.params.id));

  if (!exists) {
    return res.status(404).json({ message: 'Pet not found' });
  }

  pets = pets.filter(p => p.id !== parseInt(req.params.id));

  res.json({ message: 'Pet deleted successfully' });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    message: 'Server error',
    error: err.message
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});