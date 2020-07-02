const express = require('express');
const router = express.Router();
const API = require('../modules/api');
//const groupController = require('../controllers/groups');

router.get('/', async(req,res)=>{
    res.status(200).json({message:"hello"})
})
module.exports = router;
