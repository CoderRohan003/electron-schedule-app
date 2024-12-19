const fs = require('fs');
const path = require('path');
const { shell } = require('electron');

const folderPath = 'D:\\Programing\\ELECTRON JS\\pdf-organizer\\PDFs';
const subjectList = document.getElementById('subjectList');
const pdfViewer = document.getElementById('pdfViewer');
const pageTitle = document.getElementById('pageTitle');

const backButton = document.getElementById('backButton');
const backToHomeButton = document.getElementById('backToHomeButton');
const openInAdobeButton = document.getElementById('openInAdobeButton');

backButton.style.display = 'block';
backToHomeButton.style.display = 'block';
let currentPath = folderPath;
let currentFilePath = '';

function loadSubjects() {
    currentPath = folderPath;
    loadDirectory(currentPath);
    pageTitle.textContent = 'PDF Organizer';
}

function loadDirectory(directoryPath) {
    currentPath = directoryPath;
    const items = fs.readdirSync(directoryPath);
    subjectList.innerHTML = '';

    items.forEach(item => {
        const itemPath = path.join(directoryPath, item);

        if (fs.statSync(itemPath).isDirectory()) {
            const li = document.createElement('li');
            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-folder');
            li.appendChild(icon);
            li.appendChild(document.createTextNode(item));
            li.addEventListener('click', () => {
                pageTitle.textContent = item;
                loadDirectory(itemPath);
            });
            subjectList.appendChild(li);
        } else if (item.toLowerCase().endsWith('.pdf')) {
            const li = document.createElement('li');
            const icon = document.createElement('i');
            icon.classList.add('fas', 'fa-file-pdf');
            li.appendChild(icon);
            li.appendChild(document.createTextNode(item.replace('.pdf', '')));
            li.addEventListener('click', () => {
                pageTitle.textContent = item.replace('.pdf', '');
                openPDF(itemPath);
            });
            subjectList.appendChild(li);
        }
    });
}

function openPDF(filePath) {
    currentFilePath = filePath;
    pdfViewer.src = filePath;
    openInAdobeButton.style.display = 'block';
}

function goBack() {
    if (currentPath !== folderPath) {
        const parentPath = path.dirname(currentPath);
        loadDirectory(parentPath);
        openInAdobeButton.style.display = 'none';
    }
}

function goHome() {
    window.location.href = 'index.html';
}

function openInAdobe() {
    if (currentFilePath) {
        shell.openPath(currentFilePath);
    }
}

backButton.addEventListener('click', goBack);
backToHomeButton.addEventListener('click', goHome);
openInAdobeButton.addEventListener('click', openInAdobe);

loadSubjects();
