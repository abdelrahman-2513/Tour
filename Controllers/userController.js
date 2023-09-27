const userModel = require('./../models/userModel');
const multer = require('multer');
const sharp = require('sharp');

//First we want to make multer storAage to save the photo in with specific name
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public/img/users");
//     },
//     filename: (req, file, cb) => {
//         //photoname (user-215444466-12513311631.jpeg)
//         const exten = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user._id}-${Date.now()}.${exten}`);
//     }
// })
const multerStorage = multer.memoryStorage();

//Second we want to make multer filter to filter the unabled files to be applied such as .json extensions

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

exports.updateUserPhoto = upload.single("photo");

exports.resizeUserPhoto = (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
    sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`)
    next();
}
// exports.checkId = (req, res, next, val) => {
//     console.log(`The value of Param: ${val}`);
//     if (req.params.id * 1 > users.length) {
//         return res.status(404).json({
//             status: 'failed',
//             result: 'data not found!'
//         })
//     }
//     next();
// }
exports.checkPasswords = (req, res, next) => {
    if (req.body.password !== req.body.confirmPassword)
        return res.status(404).json({
            status: 'failed',
            result: 'Passwords not matched!'
        })
    next();
}

exports.getAllUsers = (req, res) => {
    userModel.find({}).then(users => {
        res.status(200).json({
            status: 'success',
            result: users.length,
            data: {
                users
            }
        })
    })

}
exports.createUser = (req, res) => {
    new userModel({
        name: req.body.name,
        email: req.body.email,
        photo: req.body.photo,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        role: req.body.role
    }).save().then(newUser => {
        res.status(201).json({
            status: 'success',
            data: {
                newUser
            }
        })
    }).catch(err => res.status(404).json({
        status: 'failed',
        data: {
            err
        }
    }))

}
exports.getUser = (req, res) => {

    userModel.findOne({ _id: req.params.id }).then(user => {
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        })
    }).catch(err => {
        res.status(404).json({
            status: 'failed',
            data: {
                err
            }
        })
    })
}
exports.updateUser = (req, res) => {
    userModel.findByIdAndUpdate(req.params.id, req.body).then(updateddata => {
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
exports.deleteUser = (req, res) => {

    userModel.findOneAndDelete({ _id: req.params.id }).then(() => {
        res.status(400).json({
            data: null
        })
    })
}
exports.getUsers = async (req, res) => {
    try {
        const users = await userModel.aggregate([
            {
                $match: {
                    role: { $ne: 'user' }
                }
            },
            {
                $group: {
                    _id: '$active',
                    name: { $push: '$name' }
                }
            }
        ])
        res.status(200).json({
            status: 'updated',
            data: {
                users
            }
        })
    } catch (err) {
        console.log(err);
        res.status(404).json({

            status: 'Failed',
            data: { err }
        })
    }
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user[0]._id;
    next();
}