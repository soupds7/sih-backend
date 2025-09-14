const express = require('express');
const router = express.Router();  
const userModel = require('../models/userModel.js')
const cors = require("cors");
  
router.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));




router.post('/register', (req, res) => {
    const { name, email, number, password } = req.body;
    userModel.findOne({ email: email })
        .then(user => {
            if (user) {
                res.json("Already registered");
            } else {
                userModel.create(req.body)
                    .then(user => res.json(user))
                    .catch(err => res.json(err));
            }
        });
});


router.post('/login', (req, res) => {
    const { email, password } = req.body;
    userModel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json(user); // <-- Return the user object here!
                } else {
                    res.json("Wrong Password");
                }
            } else {
                res.json("No records found! ");
            }
        });
});


module.exports = router;