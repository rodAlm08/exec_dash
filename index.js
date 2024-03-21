const express = require('express');
const app = express();
const port = 4200;

app.set('view engine', 'ejs');
app.use(express.static('public'));

const data = [
    { name: 'Item 1', value: 'This is item 1' },
    { name: 'Item 2', value: 'This is item 2' }
];

// Define a route to render the index.ejs template
app.get('/dataset', (req, res) => {
    res.render('index', { data: data });
});


// Define a root route if necessary
app.get('/', (req, res) => {
    res.render('someOtherTemplate');
    
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
