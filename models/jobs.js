const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');
const geoCoder = require('../utils/geocoder');


const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter job title'],
        trim: true,
        maxlength: [100, 'Job title cannot exceed 100 characters.']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please enter job description'],
        maxlength: [1000, 'Job description cannot exceed 1000 characters.']
    },
    email: {
        type: String,
        validate: [validator.isEmail, 'Please add a valid email address.']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    company: {
        type: String,
        required: [true, 'Please add a valid Company name.']
    },
    industry: {
        type: [String], //Array value of strings
        required: [true,'Please enter industry for this job'],
        enum: {
            values: [
                'Business',
                'Information Technology',
                'Banking',
                'Education/Training',
                'Telecommunication',
                'Others'
            ],
            message: 'Please select correct options for industry',
        }
    },
    jobType: {
        type: String, //Only one value, even though we have options
        required: [true,'Please enter jobType'],
        enum: {
            values: [
                'Permanent',
                'Temporary',
                'Internship'
            ],
            message: 'Please select correct options for Job type.'
        }
    },
    minEducation: {
        type: String,
        required: [true,'Please enter min education for this job type'],
        enum: {
            values: [
                'Bachelors',
                'Masters',
                'Phd'
            ],
            message: 'Please select correct options for Education'
        }
    },
    positions: {
        type: Number,
        default: 1
    },
    experience: {
        type: String,
        required: [true,'Please enter experience required for this job'],
        enum: {
            values: [
                'No Experience',
                '1 Year - 2 Years',
                '2 Years - 5 Years',
                '5 Years+'
            ],
            message: 'Please select correct options for experience'
        }
    },
    salary: {
        type: Number,
        required: [true, 'Please enter expected salary for the Job.']
    },
    postingDate: {
        type: Date,
        default: Date.now
    },
    lastDate: {
        type: Date,
        default: new Date().setDate(new Date().getDate() + 7)
    },
    applicantaApplied: {
        type: [Object],
        select: false
    }

});

//creating job slug before saving //pre is like a middle ware thing for mongoose
jobSchema.pre('save', function (next) { //we have to use function here instead of arrow func so that you can use this keyword to refer objects
    this.slug = slugify(this.title, { lower: true });
    next();
});

//setting up location before saving to database
jobSchema.pre('save', async function (next) {

    const loc = await geoCoder.geocode(this.address); //since it return promise, we need await for it
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        state: loc[0].state,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }

});


module.exports = mongoose.model('Job', jobSchema);
