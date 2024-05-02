const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const db = require('./config/db.js');
const cors = require('cors')
const auth = require('./routes/auth.js')
const story = require('./routes/story.js')
const bookmark = require('./routes/bookmarks.js');
const verifyToken = require('./middleware/verifyToken.js');


dotenv.config();


const port = process.env.PORT

app.use(express.json());
app.use(cors())

app.use('/api/ver1/auth', auth);

app.use('/api/ver1/story',story);

app.use('/api/ver1',bookmark)

app.use('/api/verifyToken',verifyToken)


app.get('/health', (req, res) => {
    res.json(
        {
            "status": "health check successful"
        })
});



app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});