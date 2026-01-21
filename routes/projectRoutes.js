const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { body } = require('express-validator');

// Validation Chain
const projectValidation = [
    body('title', 'Proje başlığı zorunludur').trim().notEmpty(),
    body('description', 'Açıklama zorunludur').trim().notEmpty(),
    body('visibility', 'Görünürlük seçilmelidir').isIn(['public', 'private'])
];

router.get('/', projectController.getProjects);
router.get('/new', ensureAuthenticated, projectController.getCreateProject);

router.post('/', 
    ensureAuthenticated, 
    upload.single('image'), 
    projectValidation, 
    projectController.createProject
);

router.get('/:id', projectController.getProject);

router.get('/:id/edit', ensureAuthenticated, projectController.getEditProject);

router.put('/:id', 
    ensureAuthenticated, 
    upload.single('image'), 
    projectValidation, 
    projectController.updateProject
);

router.delete('/:id', ensureAuthenticated, projectController.deleteProject);

module.exports = router;