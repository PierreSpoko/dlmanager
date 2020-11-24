var socket = io();
var vm = new Vue({
    el: '#app',
    data: {
        input_url: "",
        files: [],
        notifications: []
    },
    methods: {
        checkForm: function(){
            if(this.input_url == ""){
                return null;
            }
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            var raw = JSON.stringify({"url":this.input_url});
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
            var notif = JSON.stringify({'type' : 'success', 'message' : 'Le téléchargement va démarrer'});
            this.notifications.push(JSON.parse(notif));
            this.input_url = "";
            setInterval(() => {
                this.notifications = [];
            }, 2000);

            fetch("/download", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
        }
    },
    created() {
        socket.on('download', (data) => {
            //.replace(/\./g,' ').substring(0, 30)
            var json = JSON.parse(data);
            if(this.files.findIndex(i => i.name === json.name) === -1){
                this.files.push(json);
            }else{
                var index = this.files.findIndex(i => i.name === json.name);
                this.files[index].speed = json.speed;
                this.files[index].progress = json.progress;
                this.files[index].download = json.download;
                this.files[index].css = json.css;
            }
        });

        socket.on('finish', (data) => {
            var json = JSON.parse(data);
            var index = this.files.findIndex(i => i.name === json.name);
                this.files[index].speed = json.speed;
                this.files[index].progress = json.progress;
                this.files[index].download = json.download;
                this.files[index].css = json.css;
                if(json.css === 'success'){
                    deleteObject(this.files, index, 2000);
                }
        });

        function deleteObject(object, index, time){
            console.log("j'appel le delete avec comme index " + index);
            setTimeout(function() {
                object.splice(index, 1);
            }, time)
        }
        socket.on('notification', (data) => {
            var error = JSON.parse(data);
            this.notifications.push(error);
            setInterval(() => {
                this.notifications = [];
            }, 2000);
        });
    },
})
