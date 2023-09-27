const mongoose = require('mongoose');
const tourModel = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'You must add a Review']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: Date,
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'There must be a tour ']
    }
    ,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'There must be a user for review']
    }
})

// to make the user allowed only to make one review

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// calculating the statics of rating avg and rating quantity

reviewSchema.statics.calcAvgQuantity = async function (tourId) {

    const stats = await this.aggregate(
        [
            {
                $match: { tour: tourId }
            },
            {
                $group: {
                    _id: '$tour',
                    nrating: { $avg: '$rating' },
                    number: { $sum: 1 }
                }
            }
        ]
    )
    return stats
}

reviewSchema.post('save', async function () {
    const stats = await this.constructor.calcAvgQuantity(this.tour);
    await tourModel.findByIdAndUpdate(this.tour, {
        ratingsAverage: stats[0].nrating || 4.5,
        ratingsQuantity: stats[0].number || 0
    })
})
//updating reviews avg rating and quantiny after deleting reviews
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//     //using this.r to save the document to use it in the nest step to save the data in tour document as well
//     // this.r = await this.findOne();
//     console.log(await this.findOne())
//     next();
// })

// reviewSchema.post(/^findOneAnd/, async function () {
//     //using this.r to save the document to use it in the nest step to save the data in tour document as well
//     await this.r.constructor.calcAvgQuantity(this.r.tour);
// })
reviewSchema.pre(/^find/, function (next) {
    //to prevent nested arrays or child populate in parent we make virtual populate in tour model
    // this.populate({
    //     path: 'tour',
    //     select: 'name -guides'
    // })
    this.populate({
        path: 'user',
        select: 'name photo'
    })

    next();
})
reviewSchema.pre('save', function (next) {
    this.createdAt = Date.now();
    next();
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;