const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'private' },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

module.exports = mongoose.model('Playlist', playlistSchema);
