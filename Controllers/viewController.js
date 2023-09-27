const tourModel = require('../models/tourModel')
const Booking = require('../models/bookingModel')

exports.getOverview = async (req, res) => {
    //1)get data for all tours 
    try {
        const tours = await tourModel.find({});

        res.status(200).render('overview', {
            title: 'Overview Tours',
            tours
        })
    } catch (err) {
        console.log(err)
        res.status(200).render('overview', {
            title: 'Overview Tours',
        })
    }
}
exports.getTour = async (req, res) => {
    try {//1) get the tour according to the tour name and populating reviews
        const tour = await tourModel.findById(req.params.tourId).populate('reviews');
        //2)send the data to the server-side
        res.status(200).render('tour', {
            title: 'Special Tour',
            tour
        })
    } catch (err) {
        console.log(err);
        req.status(404)
    }
}

exports.getLoginPage = (req, res) => {
    res.status(200).render('login', {
        title: 'Login to your account'
    })
}

exports.getSignupPage = (req, res) => {
    res.status(200).render('signup', {
        title: 'Login to your account'
    })
}

exports.getUserData = (req, res) => {
    res.status(200).render('me', {
        title: 'My Account Data'
    })
}

exports.getBookedTours = async (req, res) => {
    try {//1) find all bookings by this user
        const bookings = await Booking.find({ user: req.user._id })

        //2)) return all tours by tour id from bookings
        const tourIDS = bookings.map(el => el.tour)

        const tours = await tourModel.find({ _id: { $in: tourIDS } });
        res.status(200).render('overview', {
            title: 'My tours',
            tours
        })
    } catch (err) {
        console.log(err)
        res.status(200).render('overview', {
            title: 'My Tours',
        })
    }
}