const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MilestoneSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    milestoneName: {
        type: String,
        required: true
    },
    milestoneDesc: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Milestone', MilestoneSchema);