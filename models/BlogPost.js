const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        maxLength: 300,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
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

BlogPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BlogPost', BlogPostSchema);