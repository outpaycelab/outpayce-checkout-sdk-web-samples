const express = require('express')
const app = express()

app.get('/ppid', (req, res) => {
    res.json({ppid: '<PPID>'});
})

app.listen(8080);
