const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const morgan = require('morgan');

//require api router
const apiRouter = require('./api/api');


// Add middleware for handling CORS requests from index.html
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api', apiRouter);

app.use(errorhandler());
//serves the files in public
//app.use(express.static('public'));




//server listening 
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});



  module.exports = app;