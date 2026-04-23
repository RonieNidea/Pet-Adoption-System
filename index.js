const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let pets = [
  {
    id: 1,
    name: 'Miro',
    breed: 'Bulldog',
    age: 2,
    description: 'Friendly and loves to play',
    adopted: false
  },
  {
    id: 2,
    name: 'Jao',
    breed: 'dachshund',
    age: 1,
    description: 'Cute na way gamit',
    adopted: false
  }
];

// API ENDPOINTS
app.get('/', (req, res) => {
  res.send('Welcome to the Pets Adoption');
});

// GET: Retrieve all pets
app.get('/api/pets', (req, res) => {
  res.status(200).json(pets);
});

// GET: Retrieve a specific pet by ID
app.get('/api/pets/:id', (req, res) => {
  const pet = pets.find(pet => pet.id === parseInt(req.params.id));

  if (!pet) {
    return res.status(404).json({ message: 'Pet not found.' });
  }

  res.status(200).json(pet);
});

// POST: Add a new pet
app.post('/api/pets', (req, res) => {
  const { name, breed, age, description, adopted } = req.body;

  if (!name || !breed || !age || !description) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const newPet = {
    id: pets.length + 1,
    name,
    breed,
    age,
    description,
    adopted: adopted || false
  };

  pets.push(newPet);
  res.status(201).json({
    message: 'Pet added successfully!',
    pet: newPet,
  });
});

// PUT: Update pet details
app.put('/api/pets/:id', (req, res) => {
  const petIndex = pets.findIndex(pet => pet.id === parseInt(req.params.id));

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
  };

  res.status(200).json({
    message: 'Pet updated successfully!',
    pet: pets[petIndex],
  });
});

// DELETE: Remove a pet by ID
app.delete('/api/pets/:id', (req, res) => {
  const petIndex = pets.findIndex(pet => pet.id === parseInt(req.params.id));

  if (petIndex === -1) {
    return res.status(404).json({ message: 'Pet not found.' });
  }

  pets.splice(petIndex, 1);
  res.status(200).json({ message: 'Pet removed successfully.' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});