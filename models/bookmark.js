const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookmarkSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },
    storyId: {
        type: Schema.Types.ObjectId,
        ref: 'addStory',
        required: true
    },
    slideId: {
        type: Schema.Types.ObjectId,
        required: true,
    }
});


const Bookmark = mongoose.model('Bookmark', BookmarkSchema);

module.exports = Bookmark;

