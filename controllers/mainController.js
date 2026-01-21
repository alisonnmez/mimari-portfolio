const Project = require('../models/Project');
const BlogPost = require('../models/BlogPost');

exports.getHome = async (req, res) => {
    try {
        // Fetch last 6 public projects
        const projects = await Project.find({ visibility: 'public' })
            .sort({ createdAt: -1 })
            .limit(6)
            .populate('createdBy', 'username');

        // Fetch last 3 public blog posts
        const posts = await BlogPost.find({ visibility: 'public' })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('createdBy', 'username');

        res.render('home', {
            title: 'Ana Sayfa',
            projects,
            posts
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};

exports.getAbout = (req, res) => {
    res.render('about', { title: 'Hakkımda' });
};

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.session.userId;
        const role = req.session.role;

        // Determine query filter based on role
        // Admin sees all, User sees only their own
        const filter = role === 'admin' ? {} : { createdBy: userId };

        // Execute queries concurrently
        const [projects, posts, projectCount, postCount] = await Promise.all([
            Project.find(filter).sort({ createdAt: -1 }).limit(5),
            BlogPost.find(filter).sort({ createdAt: -1 }).limit(5),
            Project.countDocuments(filter),
            BlogPost.countDocuments(filter)
        ]);

        res.render('dashboard', {
            title: 'Kontrol Paneli',
            projects,
            posts,
            stats: {
                projectCount,
                postCount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};