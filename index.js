require('dotenv').config({ path: './.env' });

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 4200;


app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use('/images', express.static('C:/Users/rodri/repos/exec_dash/images'));
app.set('view engine', 'ejs');

exports.removeColumn = (matrix, columnName) => {
    matrix.forEach(row => {
        delete row[columnName];
    });
    return matrix;
}

async function fetchData(apiUrl, headers) {
    const response = await axios.get(apiUrl, { headers });
    return response.data;
}

// function constructQueryParamsString(query) {
//     return Object.keys(query)
//         .map(key => {
//             if (Array.isArray(query[key])) {
//                 return query[key].map(k => `${key}=${k}`).join('&');
//             } else {
//                 return `${key}=${query[key]}`
//             }
//         })
//         .join('&');
// }

function constructQueryParamsString(query) {
    return Object.keys(query)
        .map(key => {
            if (Array.isArray(query[key])) {
                return query[key].map(k => `${encodeURIComponent(key)}=${encodeURIComponent(k)}`).join('&');
            } else {
                return `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`;
            }
        })
        .join('&');
}


function determineSelectedColumns(reqQuery, allColumns, excludeColumns) {
  return reqQuery.columns ? reqQuery.columns.filter(column => !excludeColumns.includes(column)) : allColumns.filter(column => !excludeColumns.includes(column));
}


async function handleRequest(req, res) {
    const valuableColumns = [
        "_id",
        "_date",
        "_user",
        "fm_avg_trk_time",
        "fm_accuracy",
        "vx_avg_res_time",
        "vx_shot_accuracy",
        "vx_trg_accuracy",
        "au_avg_res_time",
        "bm_HR_max",
        "bm_HR_avg",
        "bm_HR_var",
        "bm_act_steps",
        "bm_sleep",
    ];

    const headers = { 'Authorization': `Bearer ${process.env.API_SECRET_KEY}` };

    try {
        const queryParams = Object.keys(req.query).length === 0 ? valuableColumns : Object.keys(req.query);
        const excludeColumns = ['_id', '_date', '_user'];
        const selectedColumns = determineSelectedColumns(req.query, valuableColumns, excludeColumns);

        let data;

        if (req.query.submit === 'filter') {
            //data = await fetchData("https://zerofourtwo.net/api/dataset", headers);
            data = await fetchData("http://localhost:3000/api/dataset", headers);
        } else if (req.query.submit === 'clean') {
            const queryString = constructQueryParamsString(req.query);
            //const apiUrl = `https://zerofourtwo.net/api/dataset?${queryString}`;
            const apiUrl = `http://localhost:3000/api/dataset?${queryString}`;
            data = await fetchData(apiUrl, headers);
        } else {
            //data = await fetchData("https://zerofourtwo.net/api/dataset", headers);
            data = await fetchData("http://localhost:3000/api/dataset", headers);
        }

        let filteredData = data;

        const relevantQueryParams = queryParams.filter(param => !['submit', 'rows'].includes(param) && selectedColumns.includes(param));

        relevantQueryParams.forEach(column => {
            if (!selectedColumns.includes(column)) {
                filteredData = removeColumn(filteredData, column);
            }
        });

        const totalCount = filteredData.length;
        console.log('Total count:', totalCount);
        
        res.render('./dataPage', {
            data: filteredData,
            totalCount: totalCount,
            columns: selectedColumns,
            selectedColumns: selectedColumns,
            req: req
        });

    } catch (error) {
        res.status(500).send('Failed to fetch data');
    }
}


app.get('/dashboard', async (req, res) => {
    await handleRequest(req, res);
});


// app.get('/dashboard', async (req, res) => {

//     const valuable = [
//         "_id",
//         "_date",
//         "_user",
//         "fm_avg_trk_time",
//         "fm_accuracy",
//         "vx_avg_res_time",
//         "vx_shot_accuracy",
//         "vx_trg_accuracy",
//         "au_avg_res_time",
//         "bm_HR_max",
//         "bm_HR_avg",
//         "bm_HR_var",
//         "bm_act_steps",
//         "bm_sleep",
//     ];
//     //console.log('precess.env', process.env.API_SECRET_KEY);
//     // create authorization header
//      const headers = {'Authorization': `Bearer ${process.env.API_SECRET_KEY}`};

//     try {
//         const allColumns = valuable;
//         console.log('All Columns:', allColumns);

//         if(req.query.submit === 'filter'){
//                 console.log('Queryparams', queryParams);
           
//             // Fetch data from the external API
//             data = await axios.get("https://zerofourtwo.net/api/dataset", {headers});

//             // data = await axios.get("https://zerofourtwo.net/api/dataset");
             
//         } else if(req.query.submit === 'clean'){
//             console.log('submit clean')
          
//             const qp = Object.keys(req.query).map(
//                 key => {
//                         console.log('key', req.query[key])
//                         if(Array.isArray(req.query[key])){
//                             console.log('isArray');
//                             return req.query[key].map(k => `${key}=${k}`).join('&');
//                         } else {
//                             console.log('isNotArray');
//                             return `${key}=${req.query[key]}`
//                         }
//                     }
//                 ).join('&');
//             const apiUrl = `https://zerofourtwo.net/api/dataset?${qp}`;
//             console.log('apiUrl', apiUrl);

//             // Fetch data from the external API
//             const response = await axios.get(apiUrl, {headers});
//             data = response;
//             console.log('data inside clean', data.data);
//             //data = await axios.get("https://zerofourtwo.net/api/dataset" + queryParams);
//         }
//         else{
//             console.log('submit not filter')
//             data = await axios.get("https://zerofourtwo.net/api/dataset", {headers});
//             //console.log('Data LINE 40:', data.data);
//         }

//         data = data.data;

//         const queryParams = Object.keys(req.query).length === 0 ? allColumns : Object.keys(req.query);        

//         console.log('Query parameters:', queryParams);

//         // Define columns to exclude
//         const excludeColumns = ['_id', '_date', '_user'];

//         // Determine selected columns based on query parameters, excluding the ones to be ignored
//         var selectedColumns = req.query.columns ? [].concat(req.query.columns) : allColumns.filter(column => !excludeColumns.includes(column));

//         var filteredData = data;        

//         // Filter out unwanted query parameters (like 'submit', 'rows') and ensure they're not in selectedColumns
//         const relevantQueryParams = queryParams.filter(param => !['submit', 'rows'].includes(param) && selectedColumns.includes(param));

//         console.log('Selected Columns:', selectedColumns);          
//         relevantQueryParams.forEach(column => {
//             if (!selectedColumns.includes(column)) {
//                 filteredData = removeColumn(filteredData, column);
//             }
//         });

//         res.render('./dataPage', {
//             data: filteredData,
//             columns: selectedColumns,
//             selectedColumns:selectedColumns, 
//             req:req 
//         });
       
        
//     } catch (error) {
//       //  console.error('Failed to fetch data:', error);
//         res.status(500).send('Failed to fetch data');
//     }
// });


module.exports.constructQueryParamsString = constructQueryParamsString;
module.exports.determineSelectedColumns = determineSelectedColumns;
module.exports.fetchData = fetchData;



app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

