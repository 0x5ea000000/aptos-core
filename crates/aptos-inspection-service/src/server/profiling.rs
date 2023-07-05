// Copyright © Aptos Foundation

use hyper::{Body, StatusCode};
use crate::{
    server::utils::CONTENT_TYPE_HTML
};

use std::fs::File;
use std::io::Read;

pub fn handle_profiling_request() -> (StatusCode, Body, String) {
    //let mut file = File::open("./crates/aptos-inspection-service/src/server/profiling_dashboard/index.html").expect("Failed to open file");

    // Read the contents of the file into a string
    let mut contents = String::from("<!DOCTYPE html>
    <html>
    <head>
        <title>Node Profiling Dashboard</title>
        <style>
            body {
                font-family: Arial, sans-serif;
            }
            .content {
                width: 80%;
                margin: auto;
            }
            select, button {
                margin: 20px 0;
            }
            table {
                width: 100%;
                margin-top: 50px;
            }
            th, td {
                padding: 15px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
        </style>
    </head>
    <body>

        <div class='content'>
            <h1>Node Profiling Dashboard</h1>

            <select id='profilingType'>
                <option value=''>--Select Profiling Type--</option>
                <option value='cpu'>CPU Profiling</option>
                <option value='heap'>Heap Profiling</option>
                <option value='thread'>Thread Dump</option>
            </select>
            <button id='startButton' disabled>Start Profiling</button>
            <button id='saveButton'>Save Rows</button>
            <button id='clearButton'>Clear Saved Rows</button>



            <table id='resultsTable'>
                <tr>
                    <th>Profiling ID</th>
                    <th>Type</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </table>


                <!-- Rows will be populated dynamically -->

        </div>

        <script>

            function downloadFile(type) {

                // Create a new a-element
                let a = document.createElement('a');

                // Set the href to the file URL
                switch(type) {
                        case 'heap':
                            a.href = 'http://localhost:1234/memory_txt';
                            // Use the download attribute to prompt a file download
                            a.download = 'memory.txt'; // Optional: you can set a custom file name
                            break;
                        case 'cpu':
                            a.href = 'http://localhost:1234/cpu_flamegraph';
                            // Use the download attribute to prompt a file download
                            a.download = 'cpu_flamegraph.svg'; // Optional: you can set a custom file name
                            break;
                        case 'thread':
                            a.href = 'http://localhost:1234/thread_dump_results';
                            // Use the download attribute to prompt a file download
                            a.download = 'thread_dump.txt'; // Optional: you can set a custom file name
                            break;
                    }


                // Trigger the download by simulating a click
                a.click();
    }
            document.getElementById('saveButton').onclick = function() {
            var table = document.getElementById('resultsTable');
            var rows = table.getElementsByTagName('tr');
            var savedRows = '';
            for(var i = 1; i < rows.length; i++) {
                savedRows += rows[i].outerHTML;
            }
            localStorage.setItem('savedRows', savedRows);
            document.getElementById('clearButton').disabled = false;

            }

            // handle clear saved rows
            document.getElementById('clearButton').onclick = function() {
                localStorage.removeItem('savedRows');
                var table = document.getElementById('resultsTable');
                var rows = table.getElementsByTagName('tr');
                while (rows.length > 1) {
                    table.deleteRow(1);
                }
                this.disabled = true;
                document.getElementById('saveButton').disabled = true;
            }


            // handle start button state
            document.getElementById('profilingType').onchange = function() {
                document.getElementById('startButton').disabled = this.value === '';
            }
            window.addEventListener('DOMContentLoaded', function() {
                var savedRows = localStorage.getItem('savedRows');
                if (savedRows) {
                    var table = document.getElementById('resultsTable');
                    table.innerHTML += savedRows;
                }
            });

            // handle start profiling
            document.getElementById('startButton').onclick = function() {
                // Here you'll need to call your backend API to start the profiling.
                // After the profiling has started, append the result to the table.
                // For now, let's just mock this with a random id and the current date/time.


                var type = document.getElementById('profilingType').value;

                // select API endpoint based on the type
                var endpoint;
                switch(type) {
                    case 'cpu':
                        endpoint = 'http://localhost:1234/cpu_profiling';
                        break;
                    case 'heap':
                        endpoint = 'http://localhost:1234/memory_profiling';
                        break;
                     case 'thread':
                        endpoint = 'http://localhost:1234/thread_dump_start/a'
                }




                var id = Math.floor(Math.random() * 1000000);
                var type = document.getElementById('profilingType').value;
                var dateTime = new Date().toLocaleString();
                var statusCell;

                var table = document.getElementById('resultsTable');
                var row = table.insertRow(1); // Insert a new row at position 1 (after the header)

                // Now insert the cells
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);
                var cell5 = row.insertCell(4);

                // Fill the cells with data
                cell1.innerHTML = id;
                cell2.innerHTML = type;
                cell3.innerHTML = dateTime;
                cell4.innerHTML = 'In progress';

                var viewResultsButton = document.createElement('button');
                viewResultsButton.textContent = 'View Graph';
                //viewResultsButton.disabled = true;

                if (type == 'cpu' || type == 'heap') {
                    var resultEndpoint;
                    switch(type) {
                        case 'cpu':
                            resultEndpoint = 'http://localhost:1234/cpu_flamegraph';
                            break;
                        case 'heap':
                            resultEndpoint = 'http://localhost:1234/memory_svg';
                            break;

                    }
                    viewResultsButton.addEventListener('click', function() {
                        window.open(resultEndpoint, '_blank');
                    });

                    cell5.appendChild(viewResultsButton);
                }


                var viewResultsTextButton = document.createElement('button');
                viewResultsTextButton.textContent = 'View Text';
                //viewResultsTextButton.disabled = true;
                if (type == 'thread' || type == 'heap') {
                    var resultEndpoint1;

                    switch(type) {
                        case 'heap':
                            resultEndpoint1 = 'http://localhost:1234/memory_txt';
                            break;
                        case 'thread':
                            resultEndpoint1 = 'http://localhost:1234/thread_dump_results';
                            break;
                    }
                    viewResultsTextButton.addEventListener('click', function() {
                        window.open(resultEndpoint1, '_blank');
                    });

                    cell5.appendChild(viewResultsTextButton);
                }


                var downloadResultsButton = document.createElement('button');
                downloadResultsButton.textContent = 'Download Result';
                //downloadResultsButton.disabled = true;

                downloadResultsButton.addEventListener('click', function() {
                        downloadFile(type);
                    });

                cell5.appendChild(downloadResultsButton);

                document.getElementById('saveButton').disabled = false;

                // make the API call
                fetch(endpoint)
                    .then(response => {
                    if (response.ok) {
                        statusCell.innerHTML = 'Complete'; // Update the status to 'Complete'
                        viewResultsTextButton.disabled = false;
                        viewResultsButton.disabled = false;
                        downloadResultsButton.disabled = false;


                        return response.json();
                }})

                    .catch(error => {
                        // Handle any errors
                        console.error('Error:', error);
                    });
                statusCell = cell4;
                }


            </script>
    </body>
    </html>");
    //file.read_to_string(&mut contents).expect("Failed to read file");
    (
        StatusCode::OK,
        Body::from(contents),
        CONTENT_TYPE_HTML.into(),
    )
}
