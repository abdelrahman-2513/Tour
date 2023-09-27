const stripe = require('stripe')('sk_test_51NjB3uLX3Z2uEP5crc0RbQEtasncUuIMKuak7TXA754oaKeOkENyoghMhFG0CSxjB9FHmD1DEpSZClyYmuf3xoku00EAPP4ZkV')
const tourModel = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
exports.getCheckoutSession = async (req, res) => {
    try { //1)get tour to be booked
        const tour = await tourModel.findById(req.params.tourId);
        console.log(tour)
        //2) create checkout-session 
        const session = await stripe.checkout.sessions.create({
            success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user._id}&price=${tour.price}`,
            cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour._id}`,
            customer_email: req.user.email,
            client_reference_id: req.params.tourId,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: tour.price * 100,
                        product_data: {
                            name: `${tour.name} Tour`,
                            description: `${tour.summary}`,
                            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                        },
                    },
                    quantity: 1,
                }],

            mode: 'payment'
        })

        //3)send checkout session
        res.status(200).json({
            status: 'success',
            session
        })
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status: 'failed',
            err
        })
    }
}

exports.createBookingCheckout = async (req, res, next) => {
    try {
        const { tour, user, price } = req.query;

        if (!user || !price || !tour) return next();

        await Booking.create({ tour, user, price });
        res.redirect(req.originalUrl.split('?')[0]);
        // next()
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status: 'failed',
            err
        })
    }
}

exports.getAllBookings = async (req, res) => {
    try {
        const Bookings = await Booking.find();
        res.status(200).json({
            status: 'success',
            Bookings
        })
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status: 'failed',
            err
        })
    }
}

exports.getBook = async (req, res) => {
    try {
        const Booking = await Booking.findOne({ _id: req.params.bookId });
        res.status(200).json({
            status: 'success',
            Booking
        })
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status: 'failed',
            err
        })
    }
}

exports.createBook = async (req, res) => {
    try {
        const Booking = await Booking.create(req.body);
        res.status(200).json({
            status: 'success',
            Booking
        })
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status: 'failed',
            err
        })
    }
}
exports.updateBook = async (req, res) => {
    try {
        const Booking = await Booking.findByIdAndUpdate(req.params.bookId, req.body);
        res.status(200).json({
            status: 'success',
            Booking
        })
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status: 'failed',
            err
        })
    }
}
exports.deleteBook = async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.bookId);
        res.status(200).json({
            status: 'success',
            data: null
        })
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status: 'failed',
            err
        })
    }
}