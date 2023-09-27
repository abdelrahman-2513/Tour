const express = require('express');
const reviewController = require('./../Controllers/reviewController');
const auhtController = require('./../Controllers/authController');

// we use mergeParams to use review routes in another routers
const router = express.Router({ mergeParams: true });

router.route('/')
    .get(reviewController.getAllReviews)
    .post(auhtController.protect, auhtController.restrictTo('user'), reviewController.createReview);
router.route('/:id').get(reviewController.getReview).delete(auhtController.protect, auhtController.restrictTo('user', 'admin'), reviewController.deleteReview);



module.exports = router;