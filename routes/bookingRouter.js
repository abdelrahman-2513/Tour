const express = require('express');
const bookingController = require('./../Controllers/bookingController');
const auhtController = require('./../Controllers/authController');

// we use mergeParams to use review routes in another routers
const router = express.Router();

router.get("/checkout-session/:tourId", auhtController.protect, bookingController.getCheckoutSession)
router.use(auhtController.protect, auhtController.restrictTo('admin'))
router.route('/').get(bookingController.getAllBookings).post(bookingController.createBook)
router.route('/bookId').get(bookingController.getBook).patch(bookingController.updateBook).delete(bookingController.deleteBook)

module.exports = router;