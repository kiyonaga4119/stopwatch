function addMessage(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    document.getElementById('messages').appendChild(item);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}



