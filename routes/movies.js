
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Movie = require('../models/Movie');
const Playlist = require('../models/Playlist');
const User = require('../models/User');

const {isLoggedin } = require('../middleware')


router.get('/' , (req,res)=>{
    res.render('movies/basic')
})

// route to fetch all playlists
router.get('/home', isLoggedin, async (req, res) => {
    try {
        // Fetch public playlists
        const publicPlaylists = await Playlist.find({ visibility: 'public' }).populate('movies').exec();

        // Fetch private playlists for the logged-in user
        const user = await User.findById(req.user._id).populate({
            path: 'playlists',
            match: { visibility: 'private' },
            populate: { path: 'movies' }
        }).exec();

        const privatePlaylists = user.playlists;

        res.render('movies/index', { publicPlaylists, privatePlaylists });
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).send('Error fetching playlists');
    }
});

// Route to fetch all public playlists
router.get('/playlists/public', async (req, res) => {
    try {
        const publicPlaylists = await Playlist.find({ visibility: 'public' });
        res.json(publicPlaylists);
    } catch (error) {
        console.error('Error fetching public playlists:', error);
        res.status(500).send('Error fetching public playlists');
    }
});

// Route to fetch private playlists for the logged-in user
router.get('/playlists/private', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'playlists',
            match: { visibility: 'private' }
        }).exec();
        const privatePlaylists = user.playlists;
        res.json(privatePlaylists);
    } catch (error) {
        console.error('Error fetching private playlists:', error);
        res.status(500).send('Error fetching private playlists');
    }
});

// Route to fetch movies and playlists for the homepage
router.get('/movies',isLoggedin, async (req, res) => {
    try {
        const response = await axios.get(`https://www.omdbapi.com/?&apikey=f9dfe63a&s=${req.query.movie_name}&type=movie`);
        const data = response.data.Search;
        const allPlaylists = await Playlist.find({});
        const movie_name = req.query.movie_name;
        res.render('movies/moviee', { data, allPlaylists, movie_name });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).send('Error fetching movies');
    }
});

// Route to add a movie to selected playlists
router.post('/add',isLoggedin, async (req, res) => {
    try {
        const playlists = req.body.playlist;
        const imdbID = req.body.imdbID;

        // Fetch movie details from OMDB API
        const response = await axios.get(`https://www.omdbapi.com/?i=${imdbID}&apikey=f9dfe63a`);
        const data = response.data;
        const { Title: title, Poster: image, Year: year } = data;

        // Check if the movie already exists in the Movie collection
        let movie = await Movie.findOne({ imdbID });
        if (!movie) {
            movie = new Movie({ title, imdbID, image, year });
            await movie.save();
        }

        // Add the movie to each selected playlist
        if (Array.isArray(playlists)) {
            for (const playlistName of playlists) {
                const playlist = await Playlist.findOne({ name: playlistName });
                if (playlist && !playlist.movies.includes(movie._id)) {
                    playlist.movies.push(movie._id);
                    await playlist.save();
                }
            }
        } else {
            const playlist = await Playlist.findOne({ name: playlists });
            if (playlist && !playlist.movies.includes(movie._id)) {
                playlist.movies.push(movie._id);
                await playlist.save();
            }
        }

        res.redirect(`/movies?movie_name=${req.body.movie_name}`);
    } catch (error) {
        console.error('Error adding movie to playlists:', error);
        res.status(500).send('Error adding movie to playlists');
    }
});

router.get('/new' , isLoggedin,(req,res)=>{
    res.render('movies/new')
})

// Route to create a new playlist
router.post('/create',isLoggedin, async (req, res) => {
    try {
        const { name, visibility } = req.body;

        // Check if the playlist already exists
        const existingPlaylist = await Playlist.findOne({ name });
        if (existingPlaylist) {
            return res.status(400).send('Playlist already exists');
        }

        // Create the new playlist
        const newPlaylist = new Playlist({ name, visibility });
        await newPlaylist.save();

        if (visibility === 'private') {
            const user = await User.findById(req.user._id);
            user.playlists.push(newPlaylist._id);
            await user.save();
        }

        res.redirect('/home');
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).send('Error creating playlist');
    }
});

module.exports = router;

