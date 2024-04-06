const express = require("express"),
    morgan = require("morgan"),
    fs = require("fs"),
    path = require("path"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    uuid = require("uuid");
const app = express();
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
//get requests
app.get ("/", (req, res) => {
    res.status(200).send("Welcome to Mind Theatre!");
    res.sendFile("/index.html", {root: __dirname});
});
app.get("/movies", (req, res) => {
    res.sendFile("/public/movies.json", {root: __dirname});
})
app.get("/movies/:title", (req, res) => {
    res.send("Sends data about a specific movie");
    return res.status(200).send(req.params.title);
})
app.get("/movies/:genre", (req, res) => {
    res.send("sends data about all movies in a specific genre");
    return res.status(200).send(req.params.genre + " movies");
})
app.get("/movies/:director", (req, res) => {
    res.send("Sends data about all the movies directed by a specific director");
    return res.status(200).send("Movies directed by " + req.params.director);
})
app.get("/movies/:year", (req, res) => {
    res.send("sends data about all movies directed in a given year");
    return res.status(200).send("Movies released in " + req.params.year);
})
app.get("/movies/:genre/:year", (req, res) => {
    res.send("Sends data about all movies in a given genre released in a given year");
    return res.status (200).send(req.params.genre + " movies released in " + req.params.year);
})
app.get("/directors", (req, res) => {
    res.send("Sends list of all directors");
    return res.status(200).send("List of Directors");
})
app.get("/genres", (req, res) => {
    res.send ("Sends list of all genres");
    return res.status(200).send("List of Genres");
})
app.get("/documentation", (req, res) => {
    res.sendFile("/public/documentation.html", {root: __dirname});
});
//post requests
app.post("/movies", (req, res) => {
    res.send("Adds a new movie to the list of movies");
    return res.status(201).send("New Movie Added");
})
//Server Port
app.listen(8080, () => {
    console.log("Server is running on http://localhost:8080");
});