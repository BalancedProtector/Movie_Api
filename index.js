const express = require("express"),
    morgan = require("morgan"),
    fs = require("fs"),
    path = require("path"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    uuid = require("uuid");

const app = express();

const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/MindTheatreDB");

//Logging Middleware
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {flags: "a"});
app.use(morgan("combined" , {stream: accessLogStream}));

//Body Parser Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Method Override Middleware
app.use(methodOverride());

//Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
})

//Express.static middleware
app.use(express.static("public"));

//New Code for Mongoose
//Create

//New Users
app.post('/users', async (req, res) => {
    await Users.findOne({Name: req.body.Name})
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Name + ' already exists');
            }else{
                Users
                    .create({
                        Name: req.body.Name,
                        Password: req.body.Password,
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
app.post('/users/:Name/movies/:MovieID', async (req, res) => {
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
app.get('/users', async (req, res) => {
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
app.get('/users/:Name', async (req, res) => {
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
app.get('/movies', (req, res) => {
    Movies.find()
        .then ((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get Movie by Title
app.get('/movies/:Title', (req, res) => {
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
app.get('/genres/:Name', async (req, res) => {
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
app.get('/directors/:Director', async (req, res) => {
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
app.get("/documentation", (req, res) => {
    res.status(200).sendFile("/public/documentation.html", {root: __dirname});
})

//Update

//Update User by Username (Name)
app.put('/users/:Name', async (req, res) => {
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
app.delete('/users/:Name', async (req, res) => {
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
app.delete('/users/:Name/movies/:MovieID', async (req, res) => {
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
app.listen(8080, () => {
    console.log("Server is running on http://localhost:8080");
});