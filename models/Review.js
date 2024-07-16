const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewText: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    reviewDate: {
        type: Date,
        default: Date.now
    },
    likes: [
        {
            user:{
                type: Schema.Types.ObjectId
            }
        }
    ],
    reviewComments: [
        {
            user: {
                type: Schema.Types.ObjectId
            },
            text: {
                type: String,
                required: true
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
});

module.exports = mongoose.model('Review', ReviewSchema);
