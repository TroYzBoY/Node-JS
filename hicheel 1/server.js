const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send("Home Page")
})


//about page
app.get('/about', (req, res) => {
    res.send("About Page")
})

//random

app.get("/random", (req, res) => {
    const math = Math.floor(Math.random() * 100);
    res.send(`Random number is ${math}`)
})

//students page json

// app.get("/students", (req, res) => {
//     const students = [
//         {id:1, name: "fenrir", age: 23 },
//         {id:2, name: "tsedo", age: 21 },
//         {id:3, name: "batnyam", age: 19 }
//     ];
//     res.json(students);
// });



const studentsMiddleware = (req, res, next) => {
    const students = [
        { id:1, name:"fenrir", age:23 },
        { id:2, name:"tsedo", age:21 },
        { id:3, name:"batnyam", age:19 }
    ];
    res.json(students);
};

app.get("/students", studentsMiddleware);



app.get("/time", (req, res) => {
    const time = new Date();
    res.send(`Current time is ${time}`);
})


app.get("/hello/:name", (req, res) => {
    const name = req.params.name;
    res.send(`Hello ${name}`)
})



app.listen(3000, () => {
    console.log("server running ...");
})



//nodemon server.js