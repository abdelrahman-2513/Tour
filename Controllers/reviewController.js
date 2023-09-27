const Review = require('./../models/reviewModel');
const factory = require('./factoryHandler')

exports.getAllReviews = async (req, res) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    try {
        const reviews = await Review.find(filter);
        res.status(200).json({
            status: 'Success',
            data: {
                reviews
            }
        })
    } catch (err) {
        console.log(err)
        res.status(401).json({
            status: 'Failed',
            data: {
                err
            }
        })
    }
}

exports.getReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        res.status(200).json({
            status: 'Success',
            data: {
                review
            }
        })
    } catch (err) {
        console.log(err)
        res.status(401).json({
            status: 'Failed',
            Message: 'Review Not Found!'
        })
    }
}

exports.createReview = async (req, res) => {
    //Access nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user._id

    try {
        const newReview = await new Review({
            review: req.body.review,
            rating: req.body.rating,
            user: req.body.user,
            tour: req.body.tour
        })
        newReview.save();
        res.status(200).json({
            status: 'Success',
            data: {
                newReview
            }
        })
    } catch (err) {

        res.status(404).json({
            status: 'Failed',
            data: {
                err
            }
        })
    }
}

exports.deleteReview = factory.deleteOne(Review);