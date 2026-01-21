const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { body } = require('express-validator');

const blogValidation = [
    body('title', 'Başlık zorunludur').trim().notEmpty(),
    body('content', 'İçerik zorunludur').trim().notEmpty(),
    body('visibility', 'Görünürlük seçilmelidir').isIn(['public', 'private'])
];

router.get('/', blogController.getPosts);
router.get('/new', ensureAuthenticated, blogController.getCreatePost);

router.post('/', 
    ensureAuthenticated, 
    upload.single('image'), 
    blogValidation, 
    blogController.createPost
);

router.get('/:id', blogController.getPost);

router.get('/:id/edit', ensureAuthenticated, blogController.getEditPost);

router.put('/:id', 
    ensureAuthenticated, 
    upload.single('image'), 
    blogValidation, 
    blogController.updatePost
);

router.delete('/:id', ensureAuthenticated, blogController.deletePost);

module.exports = router;