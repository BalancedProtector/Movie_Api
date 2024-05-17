const express = require("express"),
    morgan = require("morgan"),
    fs = require("fs"),
    path = require("path"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    uuid = require("uuid");

const app = express();

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){ // if a specific origin isnt found on the list of allowed origins
            let message = 'the CORS policy for this application doesnt allow access from origin ' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
    }
}));

const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('process.env.CONNECTION_URI')
/*mongoose.connect("mongodb://localhost:27017/MindTheatreDB");*/

//Logging Middleware
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {flags: "a"});
app.use(morgan("combined" , {stream: accessLogStream}));

//Body Parser Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Authentication
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

//Method Override Middleware
app.use(methodOverride());

//Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
})

//Express.static middleware
app.use(express.static("public"));

//Express Validator
const { check, validationResult } = require('express-validator');

//Create

//New Users
app.post('/users',[
    check('Name', 'Username is required').isLength({min: 5}),
    check('Name', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({Name: req.body.Name}) //Searching for existing Username
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Name + ' already exists');
            }else{
                Users
                    .create({
                        Name: req.body.Name,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => {res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error)
                    })
                }
        })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

//Add / update favoriteMovies Array for one user by name
app.post('/users/:Name/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndUpdate({Name: req.params.Name}, {
    $push: {favoriteMovies: req.params.MovieID}
    },
    {new:true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Read

//Get Homepage
app.get ("/", (req, res) => {
    res.status(200).send("Welcome to Mind Theatre!");
    res.sendFile("/index.html", {root: __dirname});
});

//Get Users
app.get('/users', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get Users By Username (Name)
app.get('/users/:Name', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOne({ Name: req.params.Name})
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get All movies
app.get('/movies', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.find()
        .then ((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get Movie by Title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({Title: req.params.Title})
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get Genre by Name
app.get('/genres/:Name', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.findOne({'Genre.Name' : req.params.Name})
        .then((movie) => {
            res.json(movie.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get Director by Name
app.get('/directors/:Director', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.findOne({'Director.Name': req.params.Director})
        .then((movie) => {
            res.send(movie.Director)
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get Documentation Page
app.get("/documentation", passport.authenticate('jwt', {session: false}), (req, res) => {
    res.status(200).sendFile("/public/documentation.html", {root: __dirname});
})

//Update

//Update User by Username (Name)
app.put('/users/:Name', passport.authenticate('jwt', {session: false}), async (req, res) => {
    //Condition to check added Here
    if (req.user.Name !== req.params.Name){
        return res.status(400).send('Permission Denied');
    }
    //Condition Ends
    await Users.findOneAndUpdate({ Name: req.params.Name }, { $set:
        {
            Name: req.body.Name ,
            Password: req.body.Password ,
            Email: req.body.Email ,
            Birthday: req.body.Birthday
        }
    },
    { new: true}) //Makes sure updated doc is returned
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: '+ err);
    })
});

//Delete

//Delete User by Name
app.delete('/users/:Name', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndDelete({Name: req.params.Name})
        .then((user) => {
            if(!user) {
                res.status(400).send(req.params.Name + ' was not found.');
            }else {
                res.status(200).send(req.params.Name + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Delete Movie from favoriteMovies List
app.delete('/users/:Name/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndUpdate({Name: req.params.Name}, {
    $pull: {favoriteMovies: req.params.MovieID}
    },
    {new:true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Server Port
const port = process.env.PORT || 8080
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});