const socket = io.connect();
function $$(id) { return document.getElementById(id); }
socket.on('func:detail_new', (res) => {
    console.log(res);
});
socket.on('func:expert_info', (res) => {
    console.log(res);
});
socket.emit('func:detail_new',"5b2737e44a6d35120c4942fc");
socket.emit('func:expert_info',"5b2756584a6d3537a0ef5e49");