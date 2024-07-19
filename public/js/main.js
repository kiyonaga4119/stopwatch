document.addEventListener('DOMContentLoaded', function() {
    var socket = io();

    var initialScreen = document.getElementById('initial-screen');
    var chatScreen = document.getElementById('chat-screen');
    var nicknameDisplay = document.getElementById('nickname-display');
    var form = document.getElementById('form');
    var input = document.getElementById('input');
    var nicknameInput = document.getElementById('nickname');
    var roomIdInput = document.getElementById('roomId');
    var createRoomButton = document.getElementById('createRoom');
    var joinRoomButton = document.getElementById('joinRoom');
    var roomUrlDisplay = document.getElementById('room-url');
    var viewOnlyCheckbox = document.getElementById('view-only');
    var popup = document.getElementById('popup');
    var popupUrlDisplay = document.getElementById('popup-url');
    var popupQrCodeContainer = document.getElementById('popup-qr-code');
    var closePopupButton = document.querySelector('.popup-content .close');
    var startStopButton = document.getElementById('startStop');
    var lapResetButton = document.getElementById('lapReset');
    var historyList = document.getElementById('history-list');
    var lapsList = document.getElementById('laps');

    var roomId;
    var nickname;

    function validateNickname(nickname) {
        return nickname.length > 0 && nickname.length <= 5;
    }

    createRoomButton.addEventListener('mousedown', function() {
        nickname = nicknameInput.value.trim(); // ここでnicknameの値を取得
        if (validateNickname(nickname)) {
            socket.emit('create room', nickname);
        } else {
            alert('Nickname must be between 1 and 5 characters');
        }
    });

    joinRoomButton.addEventListener('mousedown', function() {
        nickname = nicknameInput.value.trim(); // ここでnicknameの値を取得
        var roomIdToJoin = roomIdInput.value.trim();
        if (validateNickname(nickname) && roomIdToJoin) {
            socket.emit('join room', roomIdToJoin, nickname);
        } else {
            alert('Nickname must be between 1 and 5 characters and room ID must be entered');
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (input.value && roomId) {
            var message = nickname + ': ' + input.value;
            socket.emit('chat message', roomId, message);
            input.value = '';
        }
    });

    initializeSocketEvents(socket, initialScreen, chatScreen, nicknameDisplay, updateRoomUrlAndQRCode, updateStopwatch, updateLap, addMessage, startTimer, stopTimer, startStopButton, roomUrlDisplay, popupUrlDisplay, popupQrCodeContainer, lapsList);
    initializeUIEvents(socket, roomUrlDisplay, popup, popupUrlDisplay, popupQrCodeContainer, closePopupButton, viewOnlyCheckbox, startStopButton, lapResetButton);
});













