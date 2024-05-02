const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const addStory = require('../models/addStory');
const verifyToken = require('../middleware/verifyToken');

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
  verifyToken,
  asyncHandler(async (req, res) => {
    const { slides } = req.body;
    const userId = req.userId; 
    const newSlideshow = new addStory({ slides,userId });
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
      // if (storyData.length === 0) {
      //   return res.status(404).json({ error: 'No stories found' });
      // }
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

// Route to fetch slides by userId
router.get('/slides/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
      // Find all slideshows associated with the userId
      const slideshows = await addStory.find({ userId }).populate('slides');

      // if (!slideshows || slideshows.length === 0) {
      //     return res.status(404).json({ message: 'Slideshows not found for the specified user.' });
      // }

      // Prepare the desired output structure
      const output = slideshows.map(slideshow => ({
        _id: { $oid: slideshow._id },
        userId: { $oid: userId },
        __v: slideshow.__v,
        slides: slideshow.slides.map(slide => ({
          heading: slide.heading,
          description: slide.description,
          imageUrl: slide.imageUrl,
          category: slide.category,
          _id: { $oid: slide._id }
        }))
      }));

      // Send the formatted output as a response
      res.json(output);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


// Route for updating a specific story by ID
router.put(
  '/updateStory/:id',
  validateSlidesData, // Validate request body
  verifyToken, // Verify user token
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { slides } = req.body;
    const userId = req.userId;

    try {
      // Check if the story exists
      const existingStory = await addStory.findById(id);

      if (!existingStory) {
        return res.status(404).json({ error: 'Story not found' });
      }

      // Check if the user is authorized to update this story
      if (existingStory.userId.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // Update the slides
      existingStory.slides = slides;
      await existingStory.save();

      res.json({
        message: 'Story updated successfully',
        story: existingStory,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

router.put('/likeSlide/:storyId/:slideId', async (req, res) => {
  const { storyId, slideId } = req.params;
  
  try {
      // Find the story by ID
      const story = await addStory.findById(storyId);
      
      // Check if the story exists
      if (!story) {
          return res.status(404).json({ error: 'Story not found' });
      }
      
      // Find the slide by ID
      const slide = story.slides.find(slide => slide._id == slideId);
      
      // Check if the slide exists
      if (!slide) {
          return res.status(404).json({ error: 'Slide not found' });
      }
      
      // Increment the likes count for the specified slide
      slide.likes++;
      
      // Save the updated story
      await story.save();
      
      // Send response with updated like count
      res.json({ likes: slide.likes });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/dislikeSlide/:storyId/:slideId', async (req, res) => {
  const { storyId, slideId } = req.params;
  
  try {
      // Find the story by ID
      const story = await addStory.findById(storyId);
      
      // Check if the story exists
      if (!story) {
          return res.status(404).json({ error: 'Story not found' });
      }
      
      // Find the slide by ID
      const slide = story.slides.find(slide => slide._id == slideId);
      
      // Check if the slide exists
      if (!slide) {
          return res.status(404).json({ error: 'Slide not found' });
      }
      
      // Decrement the likes count for the specified slide
      if (slide.likes > 0) {
          slide.likes--;
      }
      
      // Save the updated story
      await story.save();
      
      // Send response with updated like count
      res.json({ likes: slide.likes });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

 
router.get('/likesCount/:storyId/:slideId', async (req, res) => {
    const { storyId, slideId } = req.params;

    try {
        // Find the story by storyId
        const story = await addStory.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        // Find the slide by slideId
        const slide = story.slides.find(slide => slide._id.toString() === slideId);
        if (!slide) {
            return res.status(404).json({ error: 'Slide not found' });
        }

        // Return the likes count for the slide
        res.json({ likesCount: slide.likes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;

router.use(errorHandler);