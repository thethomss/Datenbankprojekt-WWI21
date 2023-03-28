const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require("path");
mongoose.set('strictQuery', true);

const app = express();
const connectionString = 'mongodb://root:password@localhost:27017/db01?authSource=admin';

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
const db = mongoose.connection;

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});

//Middleware to handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error - something went wrong!');
});

//Definition der Image Collection:
const collection_images = 'images';
const schema_images = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tags'}], //Referenziert auf Tags-Collection
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });
const image = mongoose.model('images', schema_images, collection_images);

//Definition der Tags Collection:
const collection_tags = 'tags';
const schema_tags = new mongoose.Schema({
  name: String
}, { versionKey: false });
const tags = mongoose.model('tags', schema_tags, collection_tags);

// Ausgabe aller Images mit Tags
app.get('/api/images', (req, res) => {
  image.find().populate('tags').exec()
    .then((images) => res.json(images))
    .catch((err) => console.error('Error retrieving Images:', err));
});

// Ausgabe eines Images mit einer bestimmten ID
app.get('/api/images/:id', (req, res) => {
  const imageId = req.params.id;
  image.findById(imageId).populate('tags').exec()
    .then((image) => res.json(image))
    .catch((err) => console.error('Error retrieving Image:', err));
});

//Ausgabe aller Tags
app.get('/api/tags', (req, res) => {
  tags.find()
    .then((tags) => res.json(tags))
    .catch((err) => console.error('Error retrieving tags:', err));
});

// Ausgabe eines Tags mit einer bestimmten ID
app.get('/api/tags/:id', (req, res) => {
  const tagId = req.params.id;
  tags.findById(tagId)
    .then((tag) => res.json(tag))
    .catch((err) => console.error('Error retrieving tag:', err));
});

// Ausgabe eines Tags mit einem bestimmten Namen
app.get('/api/tags/name/:name', (req, res) => {
  const tagName = req.params.name;
  tags.findOne({ name: tagName })
    .then((tag) => res.json(tag))
    .catch((err) => console.error('Error retrieving tag:', err));
});

// Image upload storage engine
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
      return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage: storage,
  limits: {
      fileSize: 100000000000000
  }
})

app.use('/profile', express.static('upload/images'));


app.post("/api/images/", upload.single('file-image'), async (req, res) => {
  
  const tagNames = req.body.tags.split(',').map(tag => tag.trim());
  const tagIds = [];
  for (const tagName of tagNames) {
    const tag = await tags.findOneAndUpdate({ name: tagName }, { name: tagName }, { upsert: true, new: true });
    tagIds.push(tag._id);
  }
  
  const newImage = new image({
    image: `http://localhost:${port}/profile/${req.file.filename}`,
    description: req.body.description,
    tags: tagIds,
    createdOn: Date.now(),
    updatedOn: Date.now()
  });

  newImage.save()
    .then(() => res.send('Saved new Image document with Tag references'))
    .catch((err) => {
      console.error('Error saving new Image document:', err);
      res.status(500).send('Error saving new Image document');
    });
});

function errHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
      res.json({
          success: 0,
          message: err.message
      })
  }
}

//Delete Image by ID
app.delete('/api/images/:id', (req, res) => {
  const imageId = req.params.id;
  image.findByIdAndDelete(imageId)
    .then(() => res.send('Successfully deletet Image'))
    .then(() => res.sendStatus(204))
    .catch((err) => console.error('Error deleting Image:', err));
});

//Edit Image by ID
app.put('/api/images/:id', upload.single('file-image'), async (req, res) => {
  try {
    const imageId = req.params.id;
    const foundImage = await image.findOne({ _id: imageId });

    if (!foundImage) {
      return res.status(404).send('Image not found');
    }

    if (req.file) {
      foundImage.image = `http://localhost:${port}/profile/${req.file.filename}`;
    }

    if (req.body.description) {
      foundImage.description = req.body.description;
    }

    if (req.body.tags) {
      const tagNames = req.body.tags.split(',').map(tag => tag.trim());
      const tagIds = [];

      for (const tagName of tagNames) {
        const tag = await tags.findOneAndUpdate({ name: tagName }, { name: tagName }, { upsert: true, new: true });
        tagIds.push(tag._id);
      }

      foundImage.tags = tagIds;
    }

    foundImage.updatedOn = Date.now();

    await foundImage.save();

    res.send('Image updated successfully');
  } catch (err) {
    console.error('Error updating image:', err);
    res.status(500).send('Error updating image');
  }
});