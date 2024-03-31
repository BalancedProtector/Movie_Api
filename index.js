const express = require("express"),
    morgan = require("morgan"),
    fs = require("fs"),
    path = require("path"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override");
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
    res.sendFile("/index.html", {root: __dirname});
});
app.get("/movies", (req, res) => {
    res.sendFile("/public/movies.json", {root: __dirname});
})
app.get("/documentation", (req, res) => {
    res.sendFile("/public/documentation.html", {root: __dirname});
});
//Server Port
app.listen(8080, () => {
    console.log("Server is running on http://localhost:8080");
});