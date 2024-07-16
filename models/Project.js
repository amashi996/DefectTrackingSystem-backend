const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema ({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, 
    projectName : {
        type: String,
        required: true
    },
    projectCode: {
        type: String,
        required: true
    },
    projectDescription: {
        type: String,
        required: true
    },
    from: {
        type: Date,
        required: true
    },
    to: {
        type: Date
    },
    current: {
        type: Boolean,
        default: false
    },
    teamMembers: [
        {
            user: {
                type: Schema.Types.ObjectId
            },
            teamRole: {
                type: String,
                required: true
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date
            },
            current: {
                type: Boolean,
                default: false
            },
        }
    ],
});

module.exports = mongoose.model('Project', ProjectSchema);