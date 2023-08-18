const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors')
connectToMongo();
const app = express()
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json());
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))


app.listen(PORT, () => {
    console.log(`note app listening at ${PORT}`)
})