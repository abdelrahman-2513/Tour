const express = require('express');
const viewController = require('../Controllers/viewController');
const router = express.Router();
const authController = require('../Controllers/authController')
const bookingController = require('../Controllers/bookingController')



router.get('/me', authController.protect, viewController.getUserData)
router.get('/My-Tours', authController.protect, viewController.getBookedTours);

router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewController.getOverview);
router.use(authController.isLoggedIn)
router.get('/tour/:tourId', viewController.getTour);
router.get('/login', viewController.getLoginPage);

router.get('/signup', viewController.getSignupPage);

module.exports = router;
