const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    imdbID: {
        type: String,
        trim: true,
        required: true
    },
    image: {
        type: String,
        trim: true,
        required: true
    },
    year: {
        type: Number,
        trim: true,
        required: true
    }
});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
