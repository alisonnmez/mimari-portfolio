const BlogPost = require('../models/BlogPost');
const { validationResult } = require('express-validator');

exports.getPosts = async (req, res) => {
    try {
        const posts = await BlogPost.find({ visibility: 'public' })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username');
        res.render('blog/index', { title: 'Blog', posts });
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};

exports.getPost = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id).populate('createdBy', 'username');
        
        if (!post) return res.status(404).render('404');

        if (post.visibility === 'private') {
            if (!req.session.userId) return res.status(404).render('404');
            const isOwner = post.createdBy._id.toString() === req.session.userId.toString();
            const isAdmin = req.session.role === 'admin';
            if (!isOwner && !isAdmin) return res.status(404).render('404');
        }

        res.render('blog/show', { title: post.title, post });
    } catch (err) {
        if (err.kind === 'ObjectId') return res.status(404).render('404');
        res.status(500).render('500');
    }
};

exports.getCreatePost = (req, res) => {
    res.render('blog/create', { title: 'Yeni Yazı', errors: [], formData: {} });
};

exports.createPost = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('blog/create', {
            title: 'Yeni Yazı',
            errors: errors.array(),
            formData: req.body
        });
    }

    try {
        const { title, content, summary, tags, visibility } = req.body;
        
        const post = new BlogPost({
            title,
            content,
            summary,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            visibility,
            createdBy: req.session.userId,
            imagePath: req.file ? `/uploads/${req.file.filename}` : null
        });

        await post.save();
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};

exports.getEditPost = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) return res.status(404).render('404');

        const isOwner = post.createdBy.toString() === req.session.userId.toString();
        const isAdmin = req.session.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).render('403');

        res.render('blog/edit', { title: 'Yazıyı Düzenle', post, errors: [] });
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) return res.status(404).render('404');

        const isOwner = post.createdBy.toString() === req.session.userId.toString();
        const isAdmin = req.session.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).render('403');

        const { title, content, summary, tags, visibility } = req.body;
        
        post.title = title;
        post.content = content;
        post.summary = summary;
        post.tags = tags ? tags.split(',').map(t => t.trim()) : [];
        post.visibility = visibility;

        if (req.file) {
            post.imagePath = `/uploads/${req.file.filename}`;
        }

        await post.save();
        res.redirect(`/blog/${post._id}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) return res.status(404).render('404');

        const isOwner = post.createdBy.toString() === req.session.userId.toString();
        const isAdmin = req.session.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).render('403');

        await BlogPost.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};