const express = require('express');
const userController = require('./../Controllers/userController');
const authController = require('./../Controllers/authController');


const router = express.Router();

// router.param('id', userController.checkId);
router.route('/signUp').post(authController.signUp);
router.post('/logIn', authController.logIn);
router.get('/logOut', authController.loggingOut);

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatePassword', authController.protect, authController.updatePassword);
router.patch('/updateMe', authController.protect, userController.updateUserPhoto, userController.resizeUserPhoto, authController.updateMe);
router.delete('/deleteMe', authController.protect, authController.deleteMe);
router.post('/Me', authController.protect, userController.getMe, userController.getUser)

router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/users').get(userController.getUsers);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);


module.exports = router;