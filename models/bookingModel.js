const mongoose = require('mongoose');


const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'The Booking process must have tour']
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'The Booking process must have user']
    },
    price: {
        type: Number,
        required: [true, 'There must be a price'],
        min: 0
    },
    paid: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    })
    next()
})

const Booking = new mongoose.model("Booking", bookingSchema);

module.exports = Booking;