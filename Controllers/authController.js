const util = require('util')
const User = require('./../models/userModel');
const Email = require('./../data/mail');
const jwt = require('jsonwebtoken');
const { HttpStatusCode } = require('axios');
const crypto = require('crypto')
const Signtoken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
};

const createSendToken = (user, statusCode, res) => {
    const token = Signtoken(user._id);

    const cookiesOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // secure:true  //in production must be set to true
    }

    res.cookie('jwt', token, cookiesOptions);


    res.status(statusCode).json({
        token,
        status: 'success',
        data: {
            user
        }
    })
}

const filterObj = (obj, ...validFeilds) => {
    const validObj = {};
    Object.keys(obj).forEach(el => {
        if (validFeilds.includes(el))
            validObj[el] = obj[el];
    })
    return validObj;
}

exports.signUp = async (req, res) => {
    try {
        //creating user
        const newUser = new User();
        newUser.name = req.body.name
        newUser.email = req.body.email
        newUser.password = req.body.password
        newUser.confirmPassword = req.body.confirmPassword
        newUser.role = req.body.role
        //check validators
        await newUser.validate(newUser.confirmPassword);
        newUser.save();
        // const url = `${req.protocol}://${req.get('host')}/me`;
        // await new Email(newUser, url).sendWelcome();
        //create token
        createSendToken(newUser, 201, res)
    } catch (err) {
        console.log(err)
        res.status(401).json({
            status: 'Failed',
            message: {
                err
            }
        })
    }
}

exports.logIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        //check if no email or password
        if (!email || !password) return res.status(400).json({ status: 'Failed', meassage: 'Enter Emal or Password' })
        //check the email and password
        const user = await User.findOne({ email }).select('+password');
        if (!user || !await user.correctPassword(password, user.password))
            return res.status(400).json({ status: 'Failed', message: 'Invalid Email or Password' })
        createSendToken(user, 201, res);
    } catch (err) {
        console.log(err)
        res.status(400).json({ status: 'Failed', message: err })

    }
}

exports.protect = async (req, res, next) => {
    // try {
    try {
        let token;
        //1) Getting Token and check if its here

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
            token = req.headers.authorization.split(' ')[1];
        else if (req.cookies) {
            token = req.cookies.jwt;
        }
        if (!token)
            return res.status(401).json({
                status: 'Failed',
                message: 'You should Login to get access!'
            })

        //2)Verification of token
        const decoded = (await util.promisify(jwt.verify)(token, process.env.JWT_SECRET));


        //3)Check if User still exists
        const currentUser = await User.findById(decoded.id)
        if (!currentUser)
            return res.status(401).json({
                status: 'Failed',
                message: 'You should Login to get access!'
            })

        //4)check if user change password after token is issued
        req.user = currentUser;
        res.locals.user = currentUser;
        next();
    }
    catch (err) {
        return res.status(401).json({
            status: 'Failed',
            message: 'Try again later'
        })
    }
}
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) verify token
            const decoded = await util.promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // // 3) Check if user changed password after the token was issued
            // if (currentUser.changedPasswordAfter(decoded.iat)) {
            //     return next();
            // }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.loggingOut = (req, res) => {
    res.cookie('jwt', 'LoggingOut', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({ status: 'success' });
}
exports.restrictTo = (...role) => {
    return (req, res, next) => {
        console.log(req.user)
        console.log(req.user.role)
        if (!role.includes(req.user.role))
            return res.status(402).json({
                status: 'Failed',
                message: 'Youd dont have the permission to do that.'
            })

        next();
    }

}

exports.forgetPassword = async (req, res) => {
    //1)Get User  based  on  posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({
            status: 'Failed',
            message: 'Please  enter  valid email'
        })
    }
    //2) generate reset password  token
    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    ///3)send the reset url to the user mail
    try {
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'Success',
            message: 'Check your email to change password'
        })
    } catch (err) {
        console.log(err)
        user.resetPassToken = undefined;
        user.resetTokenExpires = undefined;
        user.save({ validateBeforeSave: false });
        res.status(501).json({
            status: 'Success',
            message: { err }

        })
    }

}
exports.resetPassword = async (req, res) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    //2)find user based on token and expire date of token
    const user = User.findOne({
        resetPassToken: hashedToken,
        resetTokenExpires: { $gt: Date.now() }
    })
    if (!user) {
        return res.status(501).json({
            status: 'Failed',
            message: 'the token is invalid or expires'
        })
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.resetPassToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    createSendToken(user, 201, res)

}
exports.updatePassword = async (req, res) => {
    // 1) Get user based on the id from protect function
    try {
        console.log('From updatePass')
        const id = req.user._id;
        const userone = await User.findOne(
            { _id: id }
        ).select('+password')
        console.log(userone)
        if (!userone || !await userone.correctPassword(req.body.currentPassword, userone.password)) {
            return res.status(501).json({
                status: 'Failed',
                message: 'the token is invalid or expires'
            })
        }
        userone.password = req.body.password;
        userone.confirmPassword = req.body.confirmPassword;
        await userone.save();
        createSendToken(userone, 201, res)
    } catch (err) {
        console.log(err)
    }

}
exports.updateMe = async (req, res) => {
    try {
        const id = req.user._id;
        //1) check if it tries to change password
        if (req.body.password || req.body.confirmPassword)
            return res.status(400).json({
                status: 'Failed',
                message: 'you cannot update on that place'
            })

        ///2) filtering the body from using the role or token or else than name or email

        const updatedObj = filterObj(req.body, 'email', 'name');

        if (req.file) updatedObj.photo = req.file.filename;


        // 3) update the object in the database after filtering

        const updatedUser = await User.findByIdAndUpdate(id, updatedObj, {
            validator: true
        })

        console.log("done!")
        res.status(200).json({
            status: 'success',
            data: {
                updatedUser
            }
        })
    } catch (err) {
        res.status(501).json({
            status: 'Success',
            message: { err }

        })
    }

}
exports.deleteMe = async (req, res) => {
    const id = req.user._id;
    await User.findByIdAndUpdate(id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null
    })
}