
const tourModel = require('./../models/tourModel');
const Tour = require('./../models/tourModel');
const apiFeatures = require('./../utilies/apiFeatures');
const Review = require('./../models/reviewModel')
const factory = require('./factoryHandler')
const multer = require('multer');
const sharp = require('sharp');
// exports.checkId = (req, res, next, val) => {
//     console.log(`The value of Param: ${val}`);
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: 'failed',
//             result: 'data not found!'
//         })
//     }
//     next();
// }

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(404).json({
//             statues: 'failed',
//             result: 'wrong params!'
//         })
//     }
//     next();
// }
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {

    if (file.mimetype.startsWith('image'))
        cb(null, true)
    else
        cb(new Error("this type is not allowed please upload photo extensions(png,jpg,jpeg,..)"), false);
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
])

exports.resizeTourImages = async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next()

    //1) image cover resizzing and saving to file
    req.body.imageCover = `tour-${req.params.id}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/tours/${req.body.imageCover}`)
    //2) images 
    req.body.images = [];
    await Promise.all(req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${i + 1}.jpeg`
        await sharp(file.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/tours/${filename}`)
        req.body.images.push(filename);
    }))

    next();

}

exports.aliasTop = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.feilds = 'name,price,difficulty,duration';
    next();
}
exports.getAllTours = async (req, res) => {
    try {
        // //1A)  filtering
        // const queryObj = { ...req.query };
        // const execludedFeilds = ['sort', 'limit', 'page', 'feilds'];
        // execludedFeilds.forEach(item => delete queryObj[item]);
        // let query = '';
        // //1B) Advanced Filtering
        // if (req.query) {

        //     query = JSON.parse(JSON.stringify(queryObj).replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`));
        // }
        // let tours = tourModel.find(query);

        // //2) Sorting
        // if (req.query.sort) {
        //     tours.sort(req.query.sort.split(',').join(' '));
        // } else {
        //     tours.sort('-createdAt')
        // }

        // //3)Feild Limiting
        // if (req.query.feilds) {
        //     tours.select(req.query.feilds.split(',').join(' '));
        // } else {
        //     tours.select('-__v');
        // }

        // //4) Pagination
        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // let skip = (page - 1) * limit;
        // tours = tours.skip(skip).limit(limit);

        // if (req.query.page) {
        //     const numTours = tourModel.countDocuments();
        //     console.log(numTours);
        //     if (skip > numTours)
        //         throw new Error('Page Doesnot Exist!');
        // }

        // Execute Query
        const features = new apiFeatures(tourModel.find(), req.query).filter().sort().feildLimit().paginate();
        let finalTours = await features.query;
        res.status(200).json({
            status: 'success',
            result: finalTours.length,
            data: {
                finalTours
            }
        })
    } catch (err) {
        console.log(err);
    }

}
exports.createTour = async (req, res) => {
    // await tourModel.insert({
    //     name: req.body.name,
    //     price: req.body.price,
    //     rating: req.body.rating
    // }).save().then(newTour => {
    //     res.status(201).json({
    //         status: 'success',
    //         data: {
    //             newTour
    //         }
    //     })
    // }).catch(err => res.status(404).json({
    //     status: 'failed',
    //     data: {
    //         err
    //     }
    // }))
    // exports.createTour = async (req, res) => {
    try {
        const newTour = await tourModel.create(req.body);
        res.status(200).json({
            status: 'Success',
            data: {
                newTour
            }
        })
    } catch (err) {
        console.log(err)
        res.status(404).json({

            status: 'Failed',
            massage: 'erroe on entring data!!!'
        })
    }
}



exports.getTour = (req, res) => {
    tourModel.findOne({ _id: req.params.id }).populate('reviews').then(tour => {
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    }).catch(err => {
        console.log(err)
        res.status(404).json({
            status: 'failed',
            data: {
                err
            }
        })
    })

}

exports.updateTour = (req, res) => {

    tourModel.findByIdAndUpdate(req.params.id, req.body).then(updateddata => {
        res.status(200).json({
            status: 'updated',
            data: {
                updateddata
            }
        })
    }).catch(err => {
        res.status(404).json({
            status: 'failed'
        })
    })


}
exports.deleteTour = factory.deleteOne(tourModel);

exports.getToursStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: {
                    ratingsAverage: { $gte: 4.5 }
                }
            },
            {
                $group: {
                    _id: '$difficulty',
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $sum: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { price: -1 }
            }
        ],);
        console.log(stats)
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }

}
exports.getToursPlan = async (req, res) => {
    try {
        console.log(req.params)

        let year = req.params.year * 1;
        console.log(new Date(`${year}-01-01`));
        const plan = await tourModel.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTours: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $sort: {
                    numTours: -1
                }
            }, {
                $addFields: { month: '$_id' }
            }, {
                $project: { _id: 0 }
            }


        ]);
        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status: 'failed'
            ,
            data: {
                err
            }
        })
    }
}
//  /tours-within/:distance/center/:latlng/unit/:unit
exports.getWithinTours = async (req, res) => {
    try {
        const { distance, latlng, unit } = req.params;
        const [lat, lng] = latlng.split(',');
        const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
        if (!lat || !lng)
            res.status(400).json({
                message: 'please enter the center in the form of LAT,Lng'
            })

        const tours = await tourModel.find({
            startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
        })
        res.status(200).json({
            message: 'Succsess',
            result: tours.length,
            data: {
                tours
            }
        })
    }
    catch (err) {
        console.log(err)
        res.status(404).json({
            message: 'Failed'
        })
    }

}
exports.getDistances = async (req, res) => {
    try {
        const { latlng, unit } = req.params;
        const [lat, lng] = latlng.split(',');
        if (!lat || !lng)
            res.status(400).json({
                message: 'please enter the center in the form of LAT,Lng'
            })
        const multiplier = unit === 'mi' ? 0.000621371192 : 0.001

        const distances = await Tour.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [lng * 1, lat * 1]
                    },
                    distanceField: 'distance',
                    distanceMultiplier: multiplier
                },
            },
            {
                $project: {
                    name: 1,
                    distance: 1
                }
            }

        ])
        res.status(200).json({
            message: 'Succsess',
            data: {
                distances
            }
        })
    }
    catch (err) {
        console.log(err)
        res.status(400).json({
            message: 'Failed'
        })
    }
}