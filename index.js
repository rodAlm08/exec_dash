const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 4200;

 
const { spawn } = require('child_process'); // this is to run the python script

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use('/images', express.static('C:/Users/rodri/repos/exec_dash/images'));

app.set('view engine', 'ejs');


function removeColumn(matrix, columnName) {
    matrix.forEach(row => {
        delete row[columnName];
    });
    return matrix;
}

app.get('/dashboard', async (req, res) => {
    try {
        
        
        if(req.query.submit === 'filter'){
                console.log('Queryparams', queryParams);
             data = await axios.get("https://zerofourtwo.net/api/dataset");
             
        } else if(req.query.submit === 'clean'){
            console.log('submit clean')
            data = await axios.get("https://zerofourtwo.net/api/dataset" + queryParams);
        }
        else{
            console.log('submit not filter')
            data = await axios.get("https://zerofourtwo.net/api/dataset");
            //console.log('Data LINE 40:', data.data);
        }

        data = data.data;
       
        // console.log('Dataaaaaaaaaaaa:', data[0]);
        // Determine the query parameters or default to all data columns
        const allColumns = Object.keys(data[0]);
        const queryParams = Object.keys(req.query).length === 0 ? allColumns : Object.keys(req.query);        

        console.log('Query parameters:', queryParams);

        // Define columns to exclude
        const excludeColumns = ['_id', '_date', '_user'];

        // Determine selected columns based on query parameters, excluding the ones to be ignored
        var selectedColumns = req.query.columns ? [].concat(req.query.columns) : allColumns.filter(column => !excludeColumns.includes(column));

        var filteredData = data;        

        // Filter out unwanted query parameters (like 'submit', 'rows') and ensure they're not in selectedColumns
        const relevantQueryParams = queryParams.filter(param => !['submit', 'rows'].includes(param) && selectedColumns.includes(param));

        console.log('Selected Columns:', selectedColumns);          
        relevantQueryParams.forEach(column => {
            if (!selectedColumns.includes(column)) {
                filteredData = removeColumn(filteredData, column);
            }
        });

        res.render('./dataPage', {
            data: filteredData,
            columns: selectedColumns,
            selectedColumns:selectedColumns, 
            req:req 
        });
       
        
    } catch (error) {
        //console.error('Failed to fetch data:', error);
        res.status(500).send('Failed to fetch data');
    }
});

// app.get('/dashboard', async (req, res) => {
//     try {
//         // Construct the API URL based on query parameters
//         const queryParams = Object.keys(req.query).map(key => `${key}=${req.query[key]}`).join('&');
//         const apiUrl = `https://zerofourtwo.net/api/dataset?${queryParams}`;
        
//         // Fetch data from the external API
//         const response = await axios.get(apiUrl);
//         let data = response.data; // Assuming the data is directly in the response body

//         const allColumns = data.length > 0 ? Object.keys(data[0]) : [];
        
//         // Define columns to exclude
//         const excludeColumns = ['_id', '_date', '_user'];
//         let selectedColumns = req.query.columns ? [].concat(req.query.columns) : allColumns.filter(column => !excludeColumns.includes(column));

//         // Apply column filtering based on selectedColumns
//         data.forEach(row => {
//             Object.keys(row).forEach(key => {
//                 if (!selectedColumns.includes(key)) {
//                     delete row[key];
//                 }
//             });
//         });

//         res.render('./dataPage', {
//             data,
//             columns: selectedColumns,
//             selectedColumns:selectedColumns, 
//             req:req 
//         });
//     } catch (error) {
//         console.error('Failed to fetch data:', error);
//         res.status(500).send('Failed to fetch data');
//     }
// });

// app.get('/dashboard', async (req, res) => {
   
    
//     try {       
        
//         const qp = Object.keys(req.query).length == 0 ? Object.keys(data[0]) : Object.keys(req.query)       
//         console.log('queryparams >>>>>', qp);        
//         const apiUrl = 'https://zerofourtwo.net/api/dataset?' + qp;
//         //console.log('apiUrl >>>>>', apiUrl);

//         //const response = await axios.get('https://zerofourtwo.net/api/dataset');
//          const allColumns = Object.keys(data[0]);
//          const excludeColumns = ['_id', '_date', '_user'];

//          //console.log('**********************************', response);
//          //const columns = Object.keys(response.data[0]);
//         //console.log('**********************************', columns)

//         // Determine selected columns from query parameters or default to all (minus exclusions)
//         let selectedColumns = req.query.columns || allColumns;
//         if (typeof selectedColumns === 'string') {
//             selectedColumns = [selectedColumns];
//         }        
//         // Filter out excluded columns from the selection
//         selectedColumns = selectedColumns.filter(column => !excludeColumns.includes(column));

//         let bag = data;
//         let colBag = []

//         for(let i =0; i < qp.length; i++){
//             if(qp[i] == 'submit' || qp[i] == 'rows'){
//             } else {
//                 colBag.push(qp[i]);
//             }   
//         }
        
//         console.log('ColBAG', colBag);

//         for(let i =0; i < qp.length; i++){       
//             if(colBag.includes(qp[i])){                
//             }else{
//                 bag = removeColumn(bag, qp[i]);
//             }
//         }       

//         console.log(selectedColumns);        

//         res.render('./dataPage', { 
//             data:bag , 
//             columns: selectedColumns, 
//             selectedColumns: selectedColumns, 
//             req: req
//         });
        
                 
//      } catch (error) {
//          console.error(error);
//          res.status(500).send('Failed to fetch data');
//      }
    
// });


// function removeColumn(matrix, columnIndex) {
//    for(let i = 0; i < matrix.length; i++){
//        delete matrix[i][columnIndex];
//     };
//     console.log('matrix', matrix.length)
//     return matrix
// }

// Endpoint for submitting data for Python analysis
app.post('/analyze-data', (req, res) => {
    // Convert the request data to a format suitable for your Python script
    // This example assumes your Python script can handle JSON data directly
    const dataToAnalyze = req.body;

    const pythonProcess = spawn('python', ['./analyze_data.py', JSON.stringify(dataToAnalyze)]);

    pythonProcess.stdout.on('data', (data) => {
        // This assumes the Python script returns the path to the generated plot image
        // Alternatively, if your Python script returns a Base64-encoded image, you would handle it accordingly
        const result = data.toString();
        res.json({plotPath: result.trim()}); // Send the plot image path back to the client
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).send('Error during data analysis');
    });
});
  
// Submit Data
app.post('/submit-data', (req, res) => {
   
    console.log(req.body); 
    res.redirect('/'); 
});

app.get('/syncData', async (req, res) => {
    try {
       
        const updatedData = await getData();
        // For full page reload:
        res.render('yourTemplate', { data: updatedData });

        // For AJAX response:
        // res.json(updatedData);
    } catch (error) {
        console.error('Failed to sync data:', error);
        res.status(500).send('Failed to sync data');
    }
});



// data = [{
//     "_id": 1,
//     "_date": "2024-01-04T12:29:54.000Z",
//     "_user": "jjj",
//     "fm_avg_trk_time": 5,
//     "fm_accuracy": 70.5882,
//     "vx_avg_res_time": 3,
//     "vx_shot_accuracy": 35.4839,
//     "vx_trg_accuracy": 45.8333,
//     "au_avg_res_time": 2655,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 2,
//     "_date": "2024-01-04T23:25:08.000Z",
//     "_user": "jjj",
//     "fm_avg_trk_time": 2,
//     "fm_accuracy": 92.3077,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 50.8197,
//     "vx_trg_accuracy": 67.3913,
//     "au_avg_res_time": 1670,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 3,
//     "_date": "2024-01-05T08:11:41.000Z",
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 85.7143,
//     "vx_avg_res_time": 3,
//     "vx_shot_accuracy": 58.9286,
//     "vx_trg_accuracy": 78.5714,
//     "au_avg_res_time": 1739,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 4,
//     "_date": "2024-01-06T07:17:56.000Z",
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 85.7143,
//     "vx_avg_res_time": 3,
//     "vx_shot_accuracy": 48.4375,
//     "vx_trg_accuracy": 75.6098,
//     "au_avg_res_time": 2148,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// },
// {
//     "_id": 5,
//     "_date": null,
//     "_user": "jjj",
//     "fm_avg_trk_time": 3,
//     "fm_accuracy": 80,
//     "vx_avg_res_time": 2,
//     "vx_shot_accuracy": 58.0645,
//     "vx_trg_accuracy": 83.7209,
//     "au_avg_res_time": 1875,
//     "bm_HR_max": null,
//     "bm_HR_avg": null,
//     "bm_HR_var": null,
//     "bm_act_steps": null,
//     "bm_sleep": null
// }]



app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});