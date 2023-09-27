const express = require('express');
const tourController = require('./../Controllers/tourController');
const auhtController = require('./../Controllers/authController');
const reviewController = require('./../Controllers/reviewController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();


// router.param('id', tourController.checkId);
router.use('/:tourId/review', reviewRouter);
router.route('/get-top-cheap').get(tourController.aliasTop, tourController.getAllTours)
router.route('/tour-states').get(tourController.getToursStats);
router.route('/tour-plan/:year').get(tourController.getToursPlan);
router.route('/').get(auhtController.protect, tourController.getAllTours).post(tourController.createTour);
router.route('/:id')
    .get(tourController.getTour)
    .patch(auhtController.protect, auhtController.restrictTo('admin', 'leaad-guide'), tourController.uploadTourImages, tourController.resizeTourImages, tourController.updateTour)
    .delete(auhtController.protect, auhtController.restrictTo('admin', 'leaad-guide'), tourController.deleteTour);
//nested routes
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getWithinTours)
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
// router.route('/:tourId/review').post(auhtController.protect, auhtController.restrictTo('user'), reviewController.createReview)

module.exports = router;