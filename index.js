const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 4200;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cors());

// const allColumns = [
//     '_id', '_date', '_user', 'vx_avg_res_time', 'vx_shot_accuracy', 'vx_trg_accuracy',
    
// ];

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


app.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://zerofourtwo.net/api/dataset');
        //res.render('./dataPage', { data: data });
        console.log('**********************************', response.data)
        res.render('./dataPage',{data: response.data}) 
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to fetch data');
    }
});

data = [{
    "_id": 1,
    "_date": "2024-01-04T12:29:54.000Z",
    "_user": "jjj",
    "fm_avg_trk_time": 5,
    "fm_accuracy": 70.5882,
    "vx_avg_res_time": 3,
    "vx_shot_accuracy": 35.4839,
    "vx_trg_accuracy": 45.8333,
    "au_avg_res_time": 2655,
    "bm_HR_max": null,
    "bm_HR_avg": null,
    "bm_HR_var": null,
    "bm_act_steps": null,
    "bm_sleep": null
},
{
    "_id": 2,
    "_date": "2024-01-04T23:25:08.000Z",
    "_user": "jjj",
    "fm_avg_trk_time": 2,
    "fm_accuracy": 92.3077,
    "vx_avg_res_time": 2,
    "vx_shot_accuracy": 50.8197,
    "vx_trg_accuracy": 67.3913,
    "au_avg_res_time": 1670,
    "bm_HR_max": null,
    "bm_HR_avg": null,
    "bm_HR_var": null,
    "bm_act_steps": null,
    "bm_sleep": null
},
{
    "_id": 3,
    "_date": "2024-01-05T08:11:41.000Z",
    "_user": "jjj",
    "fm_avg_trk_time": 3,
    "fm_accuracy": 85.7143,
    "vx_avg_res_time": 3,
    "vx_shot_accuracy": 58.9286,
    "vx_trg_accuracy": 78.5714,
    "au_avg_res_time": 1739,
    "bm_HR_max": null,
    "bm_HR_avg": null,
    "bm_HR_var": null,
    "bm_act_steps": null,
    "bm_sleep": null
},
{
    "_id": 4,
    "_date": "2024-01-06T07:17:56.000Z",
    "_user": "jjj",
    "fm_avg_trk_time": 3,
    "fm_accuracy": 85.7143,
    "vx_avg_res_time": 3,
    "vx_shot_accuracy": 48.4375,
    "vx_trg_accuracy": 75.6098,
    "au_avg_res_time": 2148,
    "bm_HR_max": null,
    "bm_HR_avg": null,
    "bm_HR_var": null,
    "bm_act_steps": null,
    "bm_sleep": null
},
{
    "_id": 5,
    "_date": null,
    "_user": "jjj",
    "fm_avg_trk_time": 3,
    "fm_accuracy": 80,
    "vx_avg_res_time": 2,
    "vx_shot_accuracy": 58.0645,
    "vx_trg_accuracy": 83.7209,
    "au_avg_res_time": 1875,
    "bm_HR_max": null,
    "bm_HR_avg": null,
    "bm_HR_var": null,
    "bm_act_steps": null,
    "bm_sleep": null
}]

// // Submit Data
// app.post('/submit-data', (req, res) => {
   
//     console.log(req.body); 
//     res.redirect('/'); 
// });

// app.get('/syncData', async (req, res) => {
//     try {
       
//         const updatedData = await getData();
//         // For full page reload:
//         res.render('yourTemplate', { data: updatedData });

//         // For AJAX response:
//         // res.json(updatedData);
//     } catch (error) {
//         console.error('Failed to sync data:', error);
//         res.status(500).send('Failed to sync data');
//     }
// });

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});