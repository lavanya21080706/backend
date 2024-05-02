const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for each slide
const SlideSchema = new Schema({
    heading: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    }
});

// Define schema for the entire slideshow
const SlideshowSchema = new Schema({
    slides: {
        // Only the first 3 slides are mandatory
        type: [SlideSchema], 
        validate: [arrayLimit, '{PATH} exceeds the limit of 6'],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        ref: 'User', // Refers to the User model
        required: true
    }
});

// Custom validator to limit the maximum number of slides
function arrayLimit(val) {
    return val.length <= 6;
}

// Create model
const Slideshow = mongoose.model('addStory', SlideshowSchema);

module.exports = Slideshow;
