const express = require('express');
const fs = require('fs').promises;
const app = express();
const port = 4200;

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/data', async (req, res) => {
    const { limit = 10 } = req.query;
    try {
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching of any kind
            'Pragma': 'no-cache', // HTTP 1.0.
            'Expires': '0' // Proxies.
        });
        const dataText = await fs.readFile('test_data.txt', 'utf8');
        const data = JSON.parse(dataText).slice(0, Number(limit));
        res.render('dataPage', { data, limit: Number(limit) });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error reading data file');
    }
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});