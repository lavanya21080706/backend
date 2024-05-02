const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); 
const Bookmark = require('../models/bookmark');
const addStory = require('../models/addStory')


router.post('/bookmark', verifyToken, async (req, res) => {
    try {
        const { storyId, slideId } = req.body;

        // Check if a bookmark with the same slideId and userId already exists
        const existingBookmark = await Bookmark.findOne({ user: req.userId, slideId });

        if (existingBookmark) {
            // If a duplicate bookmark is found, return a duplicate error
            return res.status(400).json({ error: 'Duplicate bookmark: This slide is already bookmarked by the user' });
        }

        // If no duplicate bookmark is found, save the new bookmark
        const bookmark = new Bookmark({
            user: req.userId, 
            storyId,
            slideId
        });
        await bookmark.save();
        res.status(201).json({ message: 'Bookmark added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// router.get('/bookmarks', verifyToken, async (req, res) => {
//     try {
//         const bookmarks = await Bookmark.find({ user: req.userId }).exec();

//         // Extract slide data from each bookmark
//         const slideData = [];
//         for (const bookmark of bookmarks) {
//             // Find the corresponding story in the addStory schema
//             const story = await addStory.findById(bookmark.storyId);
//             if (story) {
//                 // Find the slide data using slideId
//                 const slide = story.slides.find(slide => slide._id.equals(bookmark.slideId));
//                 if (slide) {
//                     slideData.push({
//                         _id: slide._id,
//                         heading: slide.heading,
//                         description: slide.description,
//                         imageUrl: slide.imageUrl,
//                         category: slide.category
//                     });
//                 }
//             }
//         }

//         res.json(slideData);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

router.get('/bookmarks', verifyToken, async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.userId }).exec();

        // Extract slide data from each bookmark
        const slideData = [];
        for (const bookmark of bookmarks) {
            // Find the corresponding story in the addStory schema
            const story = await addStory.findById(bookmark.storyId);
            if (story) {
                // Find the slide data using slideId
                const slide = story.slides.find(slide => slide._id.equals(bookmark.slideId));
                if (slide) {
                    slideData.push({
                        _id: slide._id,
                        storyId: bookmark.storyId, // Include storyId
                        heading: slide.heading,
                        description: slide.description,
                        imageUrl: slide.imageUrl,
                        category: slide.category,
                        user:bookmark.user
                    });
                }
            }
        }

        res.json(slideData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//to delete
router.delete('/unbookmark/:slideId', verifyToken, async (req, res) => {
    try {
        const { slideId } = req.params;

        // Find and delete the bookmark by slideId
        const result = await Bookmark.deleteOne({ user: req.userId, slideId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }

        res.json({ message: 'Bookmark removed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




module.exports = router;
