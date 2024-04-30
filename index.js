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
/*
const Genres = Models.Genre;
const Directors = Models.Director;
*/
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
app.get('/movies/:Genre', async (req, res) => {
    await Movies.findOne({Genre: req.params.Genre})
        .then((Genre) => {
            res.send(Genre.Name),
            res.send(Genre.Description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get Director by Name
app.get('/movies/:Director', async (req, res) => {
    await Movies.findOne({Director: req.params.Director})
        .then((Director) => {
            res.send(Director.Name),
            res.send(Director.Bio);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
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
    await Users.findOneAndRemove({Name: req.params.Name})
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

/*
//Old Code from 2. ... 4?
//New Favorite Movie added to user
app.post("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params
    let user = users.find(user => user.id == id);
    if(user){
        user.favoriteMovies.push(movieTitle);
        res.status(200).json(user);
    }else{
        res.status(400).send(`${movieTitle} has been added to user ${id}'s array of favorite movies`);
    }
})
//New Movie
app.post("/movies", (req, res) => {
    let newMovie = req.body;
    if(!newMovie.title) {
        const message = "Missing 'Title' in request body";
        res.status(400).send(message);
    }else if(!newMovie.genre) {
        const message = "Missing 'Genre' inn request body";
        res.status(400).send(message);
    }else if(!newMovie.director) {
        const message = "Missing 'Director' in request body";
        res.status(400).send(message);
    }else if(!newMovie.year) {
        const message = "Missing 'Year' in request body";
        res.status(400).send(message);
    }else{
        newMovie.id = uuid.v4();
        movies.push(newMovie);
        res.status(201).send(newMovie + " Added to Mind Theatre");
    }
    return res.status(201).send("New Movie Added");
});

//Update
//Update User info
app.put("/users/:id", (req, res) => {
    const { id } = req.params;
    
    let user = users.find(user => user.id == id);
    if(user){
        user.name = updatedUser.name;
        res.status(200).json(user);
    }else{
        res.status(400).send("User not found");
    }
})


//READ
//get requests
app.get ("/", (req, res) => {
    res.status(200).send("Welcome to Mind Theatre!");
    res.sendFile("/index.html", {root: __dirname});
});
app.get("/movies", (req, res) => {
    res.status(200).json(movies);
})
app.get("/movies/:title", (req, res) => {
    const { title }= req.params;
    const movie = movies.find(movie => movie.Title === title);
    if(movie) {
        res.status(200).json(movie);
    }else{
        res.status(40).send("Movie not here");
    }
})
app.get("/movies/genre/:genreName", (req, res) => {
    const { genreName } = req.params;
    const genre = movies.filter(movie => movie.Genre.Name.includes(genreName));
    if(genre){
        res.status(200).json(genre);
    }else{
        res.status(400).send("Genre not found");
    }
})
app.get("/movies/directors/:directorName", (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;
    if(director){
        res.status(200).json(director);
    }else{
        res.status(400).send("Director not Found");
    }
})
app.get("/documentation", (req, res) => {
    res.status(200).sendFile("/public/documentation.html", {root: __dirname});
})

//DELETE
//New Favorite Movie added to user
app.delete("/users/:id", (req, res) => {
    const { id } = req.params
    let user = users.find(user => user.id == id);
    if(user){
        users = users.filter(user => user.id != id);
        res.status(200).send(`User ${id} has been deleted`);
    }else{
        res.status(400).send("Cannot find user to remove");
    }
});
app.delete("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params
    let user = users.find(user => user.id == id);
    if(user){
        user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
        res.status(200).json(user);
    }else{
        res.status(400).send(`${movieTitle} has been added to user ${id}'s array of favorite movies`);
    }
});*/

//Server Port
app.listen(8080, () => {
    console.log("Server is running on http://localhost:8080");
});