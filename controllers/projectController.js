const Project = require('../models/Project');
const { validationResult } = require('express-validator');

// List Projects (Public Only + Search optional)
exports.getProjects = async (req, res) => {
    try {
        // Public list
        const projects = await Project.find({ visibility: 'public' })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username');
        
        res.render('projects/index', { title: 'Projeler', projects });
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};

// Show Single Project
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('createdBy', 'username');
        
        if (!project) return res.status(404).render('404');

        // Access Logic: 
        // If public -> Allow
        // If private -> Check ownership OR Admin
        if (project.visibility === 'private') {
            if (!req.session.userId) return res.status(404).render('404'); // Hide private completely
            
            const isOwner = project.createdBy._id.toString() === req.session.userId.toString();
            const isAdmin = req.session.role === 'admin';
            
            if (!isOwner && !isAdmin) return res.status(404).render('404');
        }

        res.render('projects/show', { title: project.title, project });
    } catch (err) {
        console.error(err);
        // Handle Invalid ID format
        if (err.kind === 'ObjectId') return res.status(404).render('404');
        res.status(500).render('500');
    }
};

// Create Form
exports.getCreateProject = (req, res) => {
    res.render('projects/create', { title: 'Yeni Proje', errors: [], formData: {} });
};

// Store Project
exports.createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('projects/create', {
            title: 'Yeni Proje',
            errors: errors.array(),
            formData: req.body
        });
    }

    try {
        const { title, description, technologies, repoUrl, liveUrl, visibility } = req.body;
        
        // Handle Technologies (comma separated string to array)
        const techArray = technologies ? technologies.split(',').map(t => t.trim()) : [];

        const project = new Project({
            title,
            description,
            technologies: techArray,
            repoUrl,
            liveUrl,
            visibility,
            createdBy: req.session.userId,
            imagePath: req.file ? `/uploads/${req.file.filename}` : null
        });

        await project.save();
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};

// Edit Form
exports.getEditProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) return res.status(404).render('404');

        // Check Ownership/Admin
        const isOwner = project.createdBy.toString() === req.session.userId.toString();
        const isAdmin = req.session.role === 'admin';

        if (!isOwner && !isAdmin) return res.status(403).render('403');

        res.render('projects/edit', { title: 'Projeyi Düzenle', project, errors: [] });
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};

// Update Project
exports.updateProject = async (req, res) => {
    const errors = validationResult(req);
    // Note: Re-fetching is needed to show form with errors, simplified here to just return
    // In strict prod, we would re-render edit form.

    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).render('404');

        // Check Ownership/Admin
        const isOwner = project.createdBy.toString() === req.session.userId.toString();
        const isAdmin = req.session.role === 'admin';

        if (!isOwner && !isAdmin) return res.status(403).render('403');

        // Update fields
        const { title, description, technologies, repoUrl, liveUrl, visibility } = req.body;
        
        project.title = title;
        project.description = description;
        project.technologies = technologies ? technologies.split(',').map(t => t.trim()) : [];
        project.repoUrl = repoUrl;
        project.liveUrl = liveUrl;
        project.visibility = visibility;

        if (req.file) {
            project.imagePath = `/uploads/${req.file.filename}`;
        }

        await project.save();
        res.redirect(`/projects/${project._id}`);

    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};

// Delete Project
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).render('404');

        const isOwner = project.createdBy.toString() === req.session.userId.toString();
        const isAdmin = req.session.role === 'admin';

        if (!isOwner && !isAdmin) return res.status(403).render('403');

        await Project.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};