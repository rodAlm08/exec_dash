const express = require('express');
const fs = require('fs').promises;
const app = express();
const port = 4200;

app.set('view engine', 'ejs');
app.use(express.static('public'));

const allColumns = [
    '_id', '_date', '_user', 'vx_avg_res_time', 'vx_shot_accuracy', 'vx_trg_accuracy',
    
];


app.get('/data', async (req, res) => {
    const { limit = 10, columns } = req.query;
    try {
        const dataText = await fs.readFile('test_data.txt', 'utf8');
        let data = JSON.parse(dataText).slice(0, Number(limit));
        
        // If specific columns are selected, filter the objects to only include these columns
        if (columns && columns.length) {
            data = data.map(item => {
                const filteredItem = {};
                columns.forEach(col => {
                    if (item.hasOwnProperty(col)) {
                        filteredItem[col] = item[col];
                    }
                });
                return filteredItem;
            });
        }

        res.render('dataPage', { data, limit: Number(limit), allColumns, selectedColumns: columns || allColumns });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error reading data file');
    }
});



app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});