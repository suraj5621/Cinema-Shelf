const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Playlist = require('./Playlist');

const userSchema = new mongoose.Schema({
    email :{
        type:String,
        required :true
    },
    playlists : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Playlist'
        }
    ]
} )

userSchema.plugin(passportLocalMongoose);


let User = mongoose.model('User' , userSchema);
module.exports = User;
