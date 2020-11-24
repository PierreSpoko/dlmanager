const express = require ('express');
const { DownloaderHelper } = require('node-downloader-helper');
const { byteHelper, getUptoboxLink, getDownloadLink } = require('./helper');
const path = require('path');


const app = express();
app.use(express.json());

var server = app.listen('1500', () => {
    console.log('server started at http://localhost:1500')
})
const io = require('socket.io').listen(server);

app.io = io;
app.use(express.static(path.join(__dirname+'/client')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/index.html'));
})

app.post('/download', async (req, res) => {
    var uptoboxLinks = await getUptoboxLink(req.body.url);
    var downloadLinks = await getDownloadLink(uptoboxLinks);
    
    let startTime = new Date();

    for(const [key, downloadLink] of Object.entries(downloadLinks)){
        if(downloadLink === 'File_not_found'){
            req.app.io.emit('notification', JSON.stringify({'type' : 'warning', 'message' : 'Un fichier est manquant sur uptobox'}));
        }else{
            const dl = new DownloaderHelper(downloadLink, '/Users/pierre/down');
            dl.on('progress', stats => {
                const currentTime = new Date();
                const elaspsedTime = currentTime - startTime;
                if (elaspsedTime > 2000) {
                    startTime = currentTime;
                    var data = generateJson(stats.name, stats.progress.toFixed(1), byteHelper(stats.downloaded), byteHelper(stats.total), 'info', byteHelper(stats.speed));
                    req.app.io.emit('download', data);
                }
            });
            dl.on('end', downloadInfo => {
                const total = byteHelper(downloadInfo.totalSize);
                var json = generateJson(downloadInfo.fileName, 100, total, total, 'success', 0);
                req.app.io.emit('finish', json);
            });
            dl.start();
        }
    }
    res.json({'status': '🥳'})
});

function generateJson(filename, progress, downloaded, size, css, speed){
    return JSON.stringify({
        "name" : filename, 
        "speed" : speed,
        "progress" : progress,
        "download" : downloaded,
        "size" : size,
        'css' : css
    });
}
