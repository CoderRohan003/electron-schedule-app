const { ipcRenderer } = require('electron');
const { exec } = require('child_process');

// Get the subject dynamically (e.g., from URL or context)
const subject = document.body.getAttribute('data-subject');

if (!subject) {
    console.error('No subject detected. Ensure your HTML file has a "data-subject" attribute in the <body> tag.');
    throw new Error('Subject not specified.');
}

// DOM elements
const labNoInput = document.getElementById('labNoInput');
const topicInput = document.getElementById('topicInput');
const attendanceTable = document.getElementById('attendanceTable');
const addAttendanceButton = document.getElementById('addAttendanceButton');
const backButton = document.getElementById('backButton'); // Add reference to back button

// Load attendance records when the page is loaded
async function loadAttendance() {
    await ipcRenderer.invoke('initialize-attendance', subject); // Ensure attendance file exists
    const attendanceList = await ipcRenderer.invoke('get-attendance', subject);
    renderAttendance(attendanceList);
}

// Render the attendance records in the table
function renderAttendance(attendanceList) {
    attendanceTable.innerHTML = ''; // Clear existing rows

    attendanceList.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.labNo}</td>
            <td>${record.topic}</td>
            <td><button onclick="deleteAttendance(${index})">Delete</button></td>
        `;
        attendanceTable.appendChild(row);
    });
}

// Add a new attendance entry
async function addAttendance() {
    const labNo = labNoInput.value.trim();
    const topic = topicInput.value.trim();

    if (!labNo || !topic) {
        alert('Please enter both Lab No. and Topic.');
        return;
    }

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;

    const newRecord = {
        date: formattedDate,
        labNo,
        topic,
    };

    const attendanceList = await ipcRenderer.invoke('get-attendance', subject);
    attendanceList.push(newRecord);

    await ipcRenderer.invoke('save-attendance', attendanceList, subject);
    loadAttendance(); // Reload the attendance after adding

    // Clear input fields
    labNoInput.value = '';
    topicInput.value = '';
}

// Delete an attendance record
async function deleteAttendance(index) {
    const attendanceList = await ipcRenderer.invoke('get-attendance', subject);
    attendanceList.splice(index, 1); // Remove the record at the given index
    await ipcRenderer.invoke('save-attendance', attendanceList, subject);
    renderAttendance(attendanceList); // Re-render the table with updated records
}

// Unified function to open folders in VSCode
async function openInVSCode(folderPath, id) {
    const basePath = `D:\\Programing\\ELECTRON JS\\pdf-organizer\\Lab\\Subject ${id}`;
    const fullPath = `${basePath}\\${folderPath}`;

    exec(`code "${fullPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error opening folder in VSCode: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`Folder opened in VSCode: ${stdout}`);
    });
}

// Attach event listeners to "Open in VSCode" buttons
function attachVSCodeButtons() {
    document.querySelectorAll('.open-week-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const week = event.target.getAttribute('data-week');
            const id = event.target.getAttribute('data-id');
            openInVSCode(week, id);
        });
    });
}

// Go back to the previous page
function goBack() {
    ipcRenderer.send('navigate-back'); // Sends the back navigation event to main.js
}


// Setup event listeners for attendance and back button
function setupEventListeners() {
    addAttendanceButton.addEventListener('click', addAttendance);
    backButton.addEventListener('click', goBack); // Add event listener for back button
}

// Initialize the application
function initialize() {
    loadAttendance(); // Load attendance records
    attachVSCodeButtons(); // Attach event listeners to "Open in VSCode" buttons
    setupEventListeners(); // Setup input, attendance, and back button event listeners
}

initialize(); // Start the renderer process
