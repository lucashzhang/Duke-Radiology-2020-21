(function () {
    const { readDir } = require('./fileHandler');

    const express = require('express')
    const app = express()
    const port = 8878

    app.get('/files', (req, res) => {
        let params = req.params
        res.send('Hello World!')
    })

    app.listen(port, () => {
        console.log(`Backend Setup at http://localhost:${port}`)
    })
})()