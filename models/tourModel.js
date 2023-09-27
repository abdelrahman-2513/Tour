const mongoose = require('mongoose');
const User = require('./userModel');
const { promises } = require('nodemailer/lib/xoauth2');
// const Review = require('./reviewModel')

const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'There must be a name for the tour']
    },
    price: {
        type: Number,
        required: [true, 'the tour must have price!']
    },
    priceDiscount: Number,
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        min: 0,
        default: 0
    },
    duration: {
        type: Number,
        required: [true, 'Duration of tour required!']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'the tour must have Max Group Size.']
    },
    difficulty: {
        type: String,
        required: [true, 'The difficulty must be placed']
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    images: [String]
    ,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    imageCover: {
        type: String,
        // required: [true, 'The Tour must have image cover']
    },
    // Geoson
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: {
        virtuals: true
    }
})
tourSchema.virtual('durationINweek').get(function () {
    return this.duration / 7;
})

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})
tourSchema.index({ startLocation: '2dsphere' })
// tourSchema.pre('save', async function (next) {
//     const guidePromise = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidePromise);
//     next();
// })
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v '
    })

    next();
})
const Tour = new mongoose.model('Tour', tourSchema);

module.exports = Tour;