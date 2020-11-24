require ('dotenv').config();
const fetch = require('node-fetch');
var alldebridUrl = `https://api.alldebrid.com/v4/link/redirector?agent=service&apikey=${process.env.allDebridKey}&link=`;
var get_download_link = `https://uptobox.com/api/link?token=${process.env.uptoboxKey}&file_code=`;

module.exports.byteHelper = function (value) {
    if (value === 0) {
        return '0 b';
    }
    const units = ['b', 'ko', 'Mo', 'Go', 'To'];
    const number = Math.floor(Math.log(value) / Math.log(1024));
    return (value / Math.pow(1024, Math.floor(number))).toFixed(1) + ' ' + units[number];
};

module.exports.getUptoboxLink = async function (url) {
    try{
        let call = await fetch(alldebridUrl + url);
        let answer = await call.json();
        if(answer.status === 'success'){
            return(answer.data.links);
        }
    }
    catch(e){
        console.log(e.message)
    }
};

module.exports.getDownloadLink = async function(urls){
        var links = new Array;
        for (const [key, url] of Object.entries(urls)) {
            try{
                let call = await fetch(get_download_link + url.split('/')[3]);
                let answer = await call.json();
                if(answer.message === 'Success'){
                    links.push(answer.data.dlLink);
                }else{
                    links.push('File_not_found');
                }
            }
            catch(e){
                console.log(e.message);
            }
        }
        return links;
};