require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');

const port = process.env.PORT || 3000;
require('./db/conn');
const Register = require('../src/models/registers');
const {json} = require("express");
const bcrypt = require('bcryptjs');

const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../template/views")
const partials_path = path.join(__dirname, "../template/partials")

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path))
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);


app.get("/", (req, res) => {
    res.render("index")
})

app.get("/login", (req, res) => {
    res.render("login")
})


app.get("/register", (req, res) => {
    res.render("register")
})


app.post("/register", async (req, res) => {
    try {

        const password =  req.body.password;
        const cpassword =  req.body.confirmpassword;

        if (password == cpassword) {

            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                age: req.body.age,
                phone: req.body.phone,
                password: password,
                confirmpassword: cpassword,
            })

            const token = await registerEmployee.generateAuthToken();
            console.log(token);
            const registered = await registerEmployee.save();
            console.log(registered);
            res.status(201).render("index");

        } else{
            res.send("password are not matching");
        }

    } catch (error) {
        res.status(400).send(error);
    }
})

// looggggin check

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        
        const useremail = await Register.findOne({email: email});
        
        const compare = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("login token is " + token);

        if (compare) {
            res.status(201).render("index");
        } else{
            res.send("invalid login password")
        }
        
    } catch (error) {
        res.status(400).send("invalid login details");
    }
})








app.listen(port, () => {
    console.log(`server is running at port ${port}`);
})