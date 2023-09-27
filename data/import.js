const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const fs = require('fs');
const tourModel = require('./../models/tourModel');
const userModel = require('./../models/userModel');
const reviewModel = require('./../models/reviewModel');
const e = require('express');
const { isUtf8 } = require('buffer');

const tour = JSON.parse(fs.readFileSync(`${__dirname}/../data/dev-data/tours.json`));
const user = JSON.parse(fs.readFileSync(`${__dirname}/../data/dev-data/user.json`));
const review = JSON.parse(fs.readFileSync(`${__dirname}/../data/dev-data/reviews.json`));

const DB = process.env.DATABASE_CONN.replace('<PASSWORD>', process.env.DATABASE_PASS);

mongoose.connect(DB, {

}).then(() => {
    console.log('Successfully connected to DB')
})


const importData = async () => {
    try {
        await tourModel.create(tour);
        // await userModel.create(user, { validateBeforeSave: false });
        // await reviewModel.create(review);
        console.log('Data successfully loaded!!')
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

const deleteData = async () => {
    try {
        await tourModel.deleteMany();
        // await userModel.deleteMany();
        // await reviewModel.deleteMany();
        console.log('Data successfully deleted!!')
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

console.log(process.argv[2]);

if (process.argv[2] === '--delete') {
    deleteData();
}
else if (process.argv[2] === '--import') {
    importData();
}