const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    technologies: [{
        type: String,
        trim: true
    }],
    repoUrl: {
        type: String,
        trim: true
    },
    liveUrl: {
        type: String,
        trim: true
    },
    imagePath: {
        type: String
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Index for sorting by date
ProjectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', ProjectSchema);