const express = require("express"),
    morgan = require("morgan"),
    fs = require("fs"),
    path = require("path"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    uuid = require("uuid");

const app = express();

let movies = [
    {
        "Title": "The Matrix Reloaded",
        "Year": 2003,
        "Genre": {
            "Name": ["Action", "Sci-fi"],
            "Description1": "Action films predominately feature fight scenes, chase sequences, shootouts, explosions and stunt work.",
            "Description2": "Science Fiction is a genre of speculative fiction which typically deals with imaginative and futuristic concepts such as advanced science and technology often set in space travel time travel, parallel universes and sometimes featuring extra terrestrial life forms."
        },
        "Director": {
            "Name": "Larry and Andy Wachowski",
            "Bio1": "Larry and Andy Wachowski are American film and television directors, writers and producers. The brothers have worked as a writing and directing team through most of their careers, making their debut with the movie Bound (1996). They made their most successful film with the Matrix series, for which they won the Saturn Award for Best Director. They wrote and directed the sequels The Matrix Reloaded and The Matrix Revolutions and were involved in the writing and production of other works in that franchise."
        },
        "Thumbnail": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpicfiles.alphacoders.com%2F399%2Fthumb-1920-399701.jpg&f=1&nofb=1&ipt=87f09aef555bbbc90801fdcce27addcd296ed1f8ca8c843179dbaa579c0023a5&ipo=images",
        "Overview": "Freedom fighters Neo, Trinity and Morpheus continue to lead the revolt against the Machine Army, unleashing their arsenal of extraordinary skills and weaponry against the systematic forces of repression and exploitation."
    },
    {
        "Title": "The Matrix",
        "Year": 1999,
        "Genre": {
            "Name": ["Action", "Sci-fi"],
            "Description1": "Action films predominately feature fight scenes, chase sequences, shootouts, explosions and stunt work.",
            "Description2": "Science Fiction is a genre of speculative fiction which typically deals with imaginative and futuristic concepts such as advanced science and technology often set in space travel time travel, parallel universes and sometimes featuring extra terrestrial life forms."
        },
        "Director": {
            "Name": "Larry and Andy Wachowski",
            "Bio1": "Larry and Andy Wachowski are American film and television directors, writers and producers. The brothers have worked as a writing and directing team through most of their careers, making their debut with the movie Bound (1996). They made their most successful film with the Matrix series, for which they won the Saturn Award for Best Director. They wrote and directed the sequels The Matrix Reloaded and The Matrix Revolutions and were involved in the writing and production of other works in that franchise."
        },
        "Thumbnail": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi0.wp.com%2Fglenn.zucman.com%2Fi2va%2Fwp-content%2Fuploads%2F2016%2F09%2FThe-Matrix-Poster.jpg&f=1&nofb=1&ipt=c12bf41587bb2743b9c8f510b1ac1dbc4f0d0a5b48a5092c47df3850706092cf&ipo=images",
        "Overview": "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence."
    },
    {
        "Title": "Ms. Doubtfire",
        "Year": 1993,
        "Genre": {
            "Name": ["Comedy", "Drama"],
            "Description1":"The Comedy Genre is a subgenre of Fiction that consists of discourses intended to be humorous or amousing by inducing laughter through various mediums like movies, television, stand-up shows, books, etc.",
            "Description2":"Drama is a genre of narrative fiction intended to be more serious than humourous in tone focusing on in-depth development of realistic characters who must deal with realistic emotional struggles. Drama is often combined with other genres to create more complex and realistic storylines."
        },
        "Director": {
            "Name": "Chris Columbus",
            "Bio1": "Chris Colu,bus is an American film director, producer, and screenwriter. Born in Spangler, Pennsylvania, Columbus studied film at New York University's Tisch school of the arts, where he developed his interest in filmmaking. Co-founder of several film studios/firms such as 1492 Pictures, Maiden Voyage Pictures, and Zag animation Studios, Columbus has directed and been a part of several box office hits, such as Home Alone, Ms, Doubtfire, Harry Potter and the Sorcerer's Stone, and The Help."
        },
        "Thumbnail": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.themoviedb.org%2Ft%2Fp%2Foriginal%2FzSCOzX9Yo9eyUgoGrSZXt7H3MwY.jpg&f=1&nofb=1&ipt=51aa2e5e040ccbbfda4ce74182831766c8ea9039b56cc1816d672e9b6b3b3cdc&ipo=images",
        "Overview": "After a bitter divorce, an actor disguises himself as a female housekeeper to spend time with his children held in custody by his former wife."
    },
    {
        "Title": "Flushed Away",
        "Year": 2006,
        "Genre": {
            "Name": ["Action", "Animation"],
            "Description1": "Action films predominately feature fight scenes, chase sequences, shootouts, explosions and stunt work.",
            "Description2": "Animation is a filmmaking technique in which successive still images or drawings are manipulated to create moving images. Traditionaly animation projects were hand drawn, and colored on transparent celluloid sheets to be photographed and exhibited on film."
        },
        "Director": {
            "Name": ["Sam, Fell", "David Bowers"],
            "Bio1": "Samuel Jason Fell is a British film director, animator, screenwriter, and voice actor. After starting in short films and television, he movied to animated movies.",
            "Bio2": "David Bowers is a British film director , screenwriter, animator, storyboard artist and voice actor. Best know for directing Flushed Way with Sam Fell."
        },
        "Thumbnail": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F75%2F5a%2F18%2F755a18b98ceb8dfa90b4eb3fdf3eca45.jpg&f=1&nofb=1&ipt=d94a82a2997ddd53c3c7156fc4cf342b9d22dacce338b6304bf4228705e76692&ipo=images",
        "Overview": "The story of an uptown rat that gets flushed down the toilet from his penthouse apartment, ending in the sewers of London, where he has to learn a whole new and different way of life."
    },
    {
        "Title": "Kingsman: The Secret Service",
        "Year": 2014,
        "Genre": {
            "Name": ["Action", "Adventure"],
            "Description1": "Action films predominately feature fight scenes, chase sequences, shootouts, explosions and stunt work.",
            "Description2": "Adventure Films can vary by setting and time period, but the central theme is the protagonist's journey to find his destiny, or to seek out a treasure or solve a mystery. Adventure films are often set in exotic locations and feature action scenes that display physical feats of strength and endurance."
        },
        "Director": {
            "Name": "Matthew Vaughn",
            "Bio1": "Matthew Allard de Vere Drummond (born Matthew Allard Robert Vaughn; 7 March 1971), known professionally as Matthew Vaughn, is an English filmmaker. After arriving in Los Angeles during his early hard rock cafe tour, he began working as an assistant film director. Later returning to london to attend University College London to study Andthropology and Ancient History, He dropped out after a few weeks."
        },
        "Thumbnail": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Famc-theatres-res.cloudinary.com%2Fv1579119409%2Famc-cdn%2Fproduction%2F2%2Fmovies%2F42700%2F42683%2FPoster%2Fp_800x1200_AMC_KingsmanTheSecretService_02112019.jpg&f=1&nofb=1&ipt=346dcc602d0e9155cda5c8cd16470d0965278478f44b5e0d44f484ca6ac10fc9&ipo=images",
        "Overview": "A spy organisation recruits a promising street kid into the agency's training program, while a global threat emerges from a twisted tech genius."
    },
    {
        "Title": "Kingsman: The Golden Circle",
        "Year": 2017,
        "Genre": {
            "Name": ["Action", "Adventure"],
            "Description1": "Action films predominately feature fight scenes, chase sequences, shootouts, explosions and stunt work.",
            "Description2": "Adventure Films can vary by setting and time period, but the central theme is the protagonist's journey to find his destiny, or to seek out a treasure or solve a mystery. Adventure films are often set in exotic locations and feature action scenes that display physical feats of strength and endurance."
        },
        "Director": {
            "Name": "Matthew Vaughn",
            "Bio1": "Matthew Allard de Vere Drummond (born Matthew Allard Robert Vaughn; 7 March 1971), known professionally as Matthew Vaughn, is an English filmmaker. After arriving in Los Angeles during his early hard rock cafe tour, he began working as an assistant film director. Later returning to london to attend University College London to study Andthropology and Ancient History, He dropped out after a few weeks."
        },
        "Thumbnail": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2Fc1%2Fef%2F10%2Fc1ef10329bcf6695c654fde2ce5aef2d.jpg&f=1&nofb=1&ipt=7c2a2f5fd50938d2f9ec21e2f36593a8194357971de101e13cebd82e2d771fa0&ipo=images",
        "Overview": "After the Kingsman's headquarters is destroyed and the world is held hostage, an allied spy organization in the United States is discovered. These two elite secret agencies must band together to defeat a common enemy."
    },
    {
        "Title": "The Kings Man",
        "Year": 2021,
        "Genre": {
            "Name": ["Action", "Adventure"],
            "Description1": "Action films predominately feature fight scenes, chase sequences, shootouts, explosions and stunt work.",
            "Description2": "Adventure Films can vary by setting and time period, but the central theme is the protagonist's journey to find his destiny, or to seek out a treasure or solve a mystery. Adventure films are often set in exotic locations and feature action scenes that display physical feats of strength and endurance."
        },
        "Director": {
            "Name": "Matthew Vaughn",
            "Bio1": "Matthew Allard de Vere Drummond (born Matthew Allard Robert Vaughn; 7 March 1971), known professionally as Matthew Vaughn, is an English filmmaker. After arriving in Los Angeles during his early hard rock cafe tour, he began working as an assistant film director. Later returning to london to attend University College London to study Andthropology and Ancient History, He dropped out after a few weeks."
        },
        "Thumbnail": "https://cdn.traileraddict.com/content/20th-century-fox/the-kings-man-poster-2.jpg",
        "Overview": "In the early years of the 20th century, the Kingsman agency is formed to stand against a cabal plotting a war to wipe out millions."
    },
    {
        "Title": "Guardians of the Galaxy",
        "Year": 2014,
        "Genre": {
            "Name": ["Action", "Adventure"],
            "Description1": "Action films predominately feature fight scenes, chase sequences, shootouts, explosions and stunt work.",
            "Description2": "Adventure Films can vary by setting and time period, but the central theme is the protagonist's journey to find his destiny, or to seek out a treasure or solve a mystery. Adventure films are often set in exotic locations and feature action scenes that display physical feats of strength and endurance."
        },
        "Director": {
            "Name": "James Gunn",
            "Bio1": "James Francis Gunn Jr. (born August 5, 1966) is an American filmmaker and studio executive. He began his career as a screenwriter in the mid-1990s moving from Horror Comedy to Super hero Films like Super(2010) and Guardians of the Galaxy (2014, 2017, and 2023). In 2022 Warner Bros. Discovery Hired Gunn and Peter Safran to become co-chairman and co-CEOs of DC Studios."
        },
        "Thumbnail": "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.my-sf.com%2Fwp-content%2Fuploads%2F2014%2F08%2FGuardians-of-the-Galaxy-theatrical-teaser-poster.jpg&f=1&nofb=1&ipt=565f33562d9a3b7895380046705bec999beeefd5c67df0004c0954919b44cdb9&ipo=images",
        "Overview": "A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe."
    },
    {
        "Title": "Guardians of the Galaxy Vol. 2",
        "Year": 2017,
        "Genre": {
            "Name": ["Action", "Adventure"],
            "Description1": "Action films predominately feature fight scenes, chase sequences, shootouts, explosions and stunt work.",
            "Description2": "Adventure Films can vary by setting and time period, but the central theme is the protagonist's journey to find his destiny, or to seek out a treasure or solve a mystery. Adventure films are often set in exotic locations and feature action scenes that display physical feats of strength and endurance."
        },
        "Director": {
            "Name": "James Gunn",
            "Bio1": "James Francis Gunn Jr. (born August 5, 1966) is an American filmmaker and studio executive. He began his career as a screenwriter in the mid-1990s moving from Horror Comedy to Super hero Films like Super(2010) and Guardians of the Galaxy (2014, 2017, and 2023). In 2022 Warner Bros. Discovery Hired Gunn and Peter Safran to become co-chairman and co-CEOs of DC Studios."
        },
        "Thumbnail": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.vintagemovieposters.co.uk%2Fwp-content%2Fuploads%2F2020%2F11%2FIMG_0771-scaled.jpeg&f=1&nofb=1&ipt=adeac8d2f591fd50fa082fdcbc6cdb8bcaf9bb0b7a9d43b3d7d05f8e67a6bb46&ipo=images",
        "Overview": "The Guardians struggle to keep together as a team while dealing with their personal family issues, notably Star-Lord's encounter with his father, the ambitious celestial being Ego."
    },
    {
        "Title": "Guardians of the Galaxy Vol. 3",
        "Year": 2023,
        "Genre": {
            "Name": ["Action", "Adventure"],
            "Description1": "Action films predominately feature fight scenes, chase sequences, shootouts, explosions and stunt work.",
            "Description2": "Adventure Films can vary by setting and time period, but the central theme is the protagonist's journey to find his destiny, or to seek out a treasure or solve a mystery. Adventure films are often set in exotic locations and feature action scenes that display physical feats of strength and endurance."
        },
        "Director": {
            "Name": "James Gunn",
            "Bio1": "James Francis Gunn Jr. (born August 5, 1966) is an American filmmaker and studio executive. He began his career as a screenwriter in the mid-1990s moving from Horror Comedy to Super hero Films like Super(2010) and Guardians of the Galaxy (2014, 2017, and 2023). In 2022 Warner Bros. Discovery Hired Gunn and Peter Safran to become co-chairman and co-CEOs of DC Studios."
        },
        "Thumbnail": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages-wixmp-ed30a86b8c4ca887773594c2.wixmp.com%2Ff%2F6508d53d-9f08-4740-a8a1-d26e4506f78a%2Fdetgxzi-6277fddb-9d41-4d09-8854-5f3407b3efa6.jpg%2Fv1%2Ffill%2Fw_1280%2Ch_1811%2Cq_75%2Cstrp%2Fguardians_of_the_galaxy_vol_3_poster_by_marvelmango_detgxzi-fullview.jpg%3Ftoken%3DeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTgxMSIsInBhdGgiOiJcL2ZcLzY1MDhkNTNkLTlmMDgtNDc0MC1hOGExLWQyNmU0NTA2Zjc4YVwvZGV0Z3h6aS02Mjc3ZmRkYi05ZDQxLTRkMDktODg1NC01ZjM0MDdiM2VmYTYuanBnIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.yeJTCLtpExnAbGlzWCsXBcOgXzj1yYVXZeNOwDE-nc8&f=1&nofb=1&ipt=84ff8252a29058b41cf8036bef807361f303e974e94086bbe2c2818e69f116ad&ipo=images",
        "Overview": "Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe and one of their own - a mission that could mean the end of the Guardians if not successful."
    },
];
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

//New Users
app.post("/users", (req, res) => {
    let newUser = req.body;
    if(!newUser.name) {
        const message = "Missing 'name' in request body";
        res.status(400).send(message);
    }else{
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).send(newUser);
    }
})

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
    const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;
    if(genre){
        res.status(200).json(genre);
    }else{
        res.status(400).send("Genre not found");
    }
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
})

//Server Port
app.listen(8080, () => {
    console.log("Server is running on http://localhost:8080");
});