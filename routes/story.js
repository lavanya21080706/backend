// const express = require('express');
// const router = express.Router();
// const addStory = require('../models/addStory')

// router.post('/addStory', async (req, res) => {
//     // Extract data from request body
//     const { slides } = req.body;

//     // Check if slides data is provided
//     if (!slides || !Array.isArray(slides) || slides.length === 0) {
//         return res.status(400).json({
//             errorMessage: "Bad Request: Slides data is missing or empty",
//         });
//     }

//     try {
//         // Create a new slideshow object and save to database
//         const newSlideshow = new addStory({ slides });
//         await newSlideshow.save();

//         res.json({
//             message: "Slideshow registered successfully",
//             slideshow: newSlideshow,
//             success: true,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to register slideshow', error: error.message });
//     }
// });

// router.get('/getStory', async (req, res) => {
//     try {
  
//       // Fetch details from the database based on the ID
//       const storyData = await addStory.find();
  
//       // Check if details exist
//       if (!storyData) {
//         return res.status(404).json({ error: 'Story not found' });
//       }
  
//       // Return details as JSON response
//       res.json(storyData);
//     } catch (error) {
//       console.error('Error fetching details:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });

// router.get('/getStory/:id', async (req, res) => {
//     try {

//       const id = req.params.id;
  
//       // Fetch details from the database based on the ID
//       const storyData = await addStory.findById(id);
  
//       // Check if details exist
//       if (!storyData) {
//         return res.status(404).json({ error: 'Story not found' });
//       }
  
//       // Return details as JSON response
//       res.json(storyData);
//     } catch (error) {
//       console.error('Error fetching details:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });


//   router.get('/all', async (req, res) => {
//     try {
  
//       // Fetch details from the database based on the ID
//       const storyData = await addStory.find();
  
//       // Check if details exist
//       if (!storyData) {
//         return res.status(404).json({ error: 'Story not found' });
//       }
  
//       // Return details as JSON response
//       res.json(storyData);
//     } catch (error) {
//       console.error('Error fetching details:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });


// module.exports = router;

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const addStory = require('../models/addStory');

// Middleware for handling errors
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
};

// Middleware for validating request body
const validateSlidesData = (req, res, next) => {
  const { slides } = req.body;
  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    return res.status(400).json({
      errorMessage: 'Bad Request: Slides data is missing or empty',
    });
  }
  next();
};

// Route for adding a new story
router.post(
  '/addStory',
  validateSlidesData,
  asyncHandler(async (req, res) => {
    const { slides } = req.body;
    const newSlideshow = new addStory({ slides });
    await newSlideshow.save();
    res.status(201).json({
      message: 'Slideshow registered successfully',
      slideshow: newSlideshow,
    });
  })
);

// Route for getting all stories
router.get(
  '/all',
  asyncHandler(async (req, res) => {
    const storyData = await addStory.find();
    if (storyData.length === 0) {
      return res.status(404).json({ error: 'No stories found' });
    }
    res.json(storyData);
  })
);

// Route for getting category based stories
  router.get(
    '/all/cat',
    asyncHandler(async (req, res) => {
      const { category } = req.query;
      let query = {};
      if (category) {
        query = { 'slides.category': category };
      }
      const storyData = await addStory.find(query);
      if (storyData.length === 0) {
        return res.status(404).json({ error: 'No stories found' });
      }
      res.json(storyData);
    })
  );

// Route for getting a specific story by ID
router.get(
  '/getStory/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const storyData = await addStory.findById(id);
    if (!storyData) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json(storyData);
  })
);

module.exports = router;

router.use(errorHandler);