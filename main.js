const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        },
    });

    mainWindow.loadFile('index.html');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Define the path to the attendance data
const attendanceFilePath = (subject) => path.join(__dirname, `attendance-${subject}.json`);

// Get attendance data for a specific subject
ipcMain.handle('get-attendance', (event, subject) => {
    const filePath = attendanceFilePath(subject);
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } else {
        return [];  
    }
});

// Save attendance data for a specific subject
ipcMain.handle('save-attendance', (event, attendanceList, subject) => {
    const filePath = attendanceFilePath(subject);
    fs.writeFileSync(filePath, JSON.stringify(attendanceList, null, 2));
});

// Delete an attendance record for a specific subject
ipcMain.handle('delete-attendance', (event, subject, index) => {
    const filePath = attendanceFilePath(subject);
    if (!fs.existsSync(filePath)) {
        throw new Error(`No attendance file found for subject: ${subject}`);
    }
    const attendanceList = JSON.parse(fs.readFileSync(filePath));
    attendanceList.splice(index, 1);
    fs.writeFileSync(filePath, JSON.stringify(attendanceList, null, 2));
    return attendanceList;
});

// Ensure subject-specific JSON files are created if they do not exist
ipcMain.handle('initialize-attendance', (event, subject) => {
    const filePath = attendanceFilePath(subject);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
});

// Handle back navigation
ipcMain.on('navigate-back', (event) => {
    const webContents = event.sender;

    // Check if we can go back using the new method
    if (webContents.navigationHistory.canGoBack()) {
        // If true, go back to the previous page
        webContents.navigationHistory.goBack();
    }
});