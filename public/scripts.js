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
    var joinRoomLink = document.getElementById('join-room-link');
    var popupQrCodeContainer = document.getElementById('popup-qr-code');
    var closePopupButton = document.querySelector('.popup-content .close');
    var startStopButton = document.getElementById('startStop');
    var lapResetButton = document.getElementById('lapReset');
    var lapsList = document.getElementById('laps');
    var lineShareLink = document.getElementById('line-share-link');
    var copyLink = document.getElementById('copy-link');
    var exitRoomButton = document.getElementById('exitRoom');

    var nicknamePopup = document.getElementById('nickname-popup');
    var newNicknameInput = document.getElementById('new-nickname');
    var saveNicknameButton = document.getElementById('save-nickname');

    var roomId;
    var nickname;
    var usedNicknames = new Set();

    function generateNickname() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let newNickname;
        do {
            newNickname = letters[Math.floor(Math.random() * letters.length)];
        } while (usedNicknames.has(newNickname));
        usedNicknames.add(newNickname);
        return newNickname;
    }

    function validateNickname(nickname) {
        return nickname.length > 0 && nickname.length <= 5;
    }

    createRoomButton.addEventListener('click', function() {
        nickname = nicknameInput.value.trim();
        if (!validateNickname(nickname)) {
            nickname = generateNickname();
        }
        socket.emit('create room', nickname);
    });

    joinRoomButton.addEventListener('click', function() {
        nickname = nicknameInput.value.trim();
        if (!validateNickname(nickname)) {
            nickname = generateNickname();
        }
        var roomIdToJoin = roomIdInput.value.trim();
        if (roomIdToJoin) {
            socket.emit('join room', roomIdToJoin, nickname);
        } else {
            alert('Room ID must be entered');
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

    function updateRoomUrlAndQRCode(id) {
        var roomUrl = `${window.location.origin}?room=${id}`;
        roomUrlDisplay.textContent = 'IDを表示';
        popupUrlDisplay.textContent = roomUrl;
        joinRoomLink.setAttribute('href', roomUrl);
        joinRoomLink.setAttribute('data-room-id', id);

        var qr = qrcode(0, 'L');
        qr.addData(roomUrl);
        qr.make();
        popupQrCodeContainer.innerHTML = qr.createImgTag(4);

        // LINE共有リンクの生成
        var lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent('Join my room: ' + roomUrl)}`;
        lineShareLink.setAttribute('href', lineShareUrl);

        // コピーリンクの生成
        copyLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigator.clipboard.writeText(roomUrl).then(function() {
                alert('リンクがクリップボードにコピーされました');
            }, function() {
                alert('リンクのコピーに失敗しました');
            });
        });
    }

    joinRoomLink.addEventListener('click', function(e) {
        e.preventDefault();
        var roomIdToJoin = joinRoomLink.getAttribute('data-room-id');
        if (roomIdToJoin && nickname) {
            socket.emit('join room', roomIdToJoin, nickname);
        } else {
            alert('Please enter a valid nickname to join the room.');
        }
    });

    roomUrlDisplay.addEventListener('click', function(e) {
        e.preventDefault();
        popup.style.display = 'block';
    });

    closePopupButton.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    nicknameDisplay.addEventListener('click', function() {
        nicknamePopup.style.display = 'block';
    });

    document.querySelectorAll('.popup .close').forEach(function(button) {
        button.addEventListener('click', function() {
            this.closest('.popup').style.display = 'none';
        });
    });

    saveNicknameButton.addEventListener('click', function() {
        var newNickname = newNicknameInput.value.trim();
        if (validateNickname(newNickname)) {
            var oldNickname = nickname;
            nickname = newNickname;
            nicknameDisplay.textContent = `Nickname: ${nickname}`;
            nicknamePopup.style.display = 'none';
            socket.emit('change nickname', roomId, oldNickname, newNickname);
        } else {
            alert('Nickname must be between 1 and 5 characters');
        }
    });

    window.addEventListener('click', function(event) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
        if (event.target === nicknamePopup) {
            nicknamePopup.style.display = 'none';
        }
    });

    viewOnlyCheckbox.addEventListener('change', function() {
        if (this.checked) {
            startStopButton.style.display = 'none';
            lapResetButton.style.display = 'none';
        } else {
            startStopButton.style.display = 'block';
            lapResetButton.style.display = 'block';
        }
    });

    startStopButton.addEventListener('mousedown', function() {
        if (roomId) {
            if (startStopButton.textContent === 'Start') {
                socket.emit('start stopwatch', roomId);
            } else {
                socket.emit('stop stopwatch', roomId);
            }
        }
    });

    lapResetButton.addEventListener('mousedown', function() {
        if (roomId) {
            if (startStopButton.textContent === 'Stop') {
                socket.emit('lap stopwatch', roomId);
            } else {
                socket.emit('reset stopwatch', roomId);
            }
        }
    });

    socket.on('room created', function(id) {
        roomId = id;
        initialScreen.classList.remove('active');
        chatScreen.classList.add('active');
        nicknameDisplay.textContent = `Nickname: ${nickname}`;
        updateRoomUrlAndQRCode(id);
    });

    socket.on('room joined', function(id, elapsed, laps, start) {
        roomId = id;
        initialScreen.classList.remove('active');
        chatScreen.classList.add('active');
        // nicknameDisplay.textContent = `Nickname: ${nickname}`;
        nicknameDisplay.textContent = `user: ${nickname}`;
        updateRoomUrlAndQRCode(id);
        elapsedTime = elapsed;
        updateStopwatch(elapsed);
        laps.forEach(function(lap) {
            updateLap(lap.time, lap.nickname);
        });
        if (start) {
            startTimer(start);
        }
    });

    socket.on('start stopwatch', function(start, nickname) {
        startTimer(start);
        startStopButton.textContent = 'Stop';
        startStopButton.classList.add('stop');
        lapResetButton.textContent = 'Lap';
        lapResetButton.classList.remove('reset');
    });

    socket.on('stop stopwatch', function(elapsed, nickname) {
        stopTimer();
        elapsedTime = elapsed;
        updateStopwatch(elapsed);
        startStopButton.textContent = 'Start';
        startStopButton.classList.remove('stop');
        lapResetButton.textContent = 'Reset';
        lapResetButton.classList.add('reset');
    });

    socket.on('reset stopwatch', function(nickname) {
        stopTimer();
        elapsedTime = 0;
        previousLapTime = 0;
        updateStopwatch(0);
        document.getElementById('laps').innerHTML = '';
        startStopButton.textContent = 'Start';
        startStopButton.classList.remove('stop');
        lapResetButton.textContent = 'Lap';
        lapResetButton.classList.remove('reset');
    });

    socket.on('lap stopwatch', function(lap, nickname) {
        updateLap(lap, nickname);
    });

    socket.on('reset laps', function() {
        document.getElementById('laps')        .innerHTML = '';
    });

    socket.on('chat message', function(msg) {
        addMessage(msg);
    });

    socket.on('nickname changed', function(oldNickname, newNickname) {
        document.querySelectorAll('.lap-item').forEach(function(item) {
            if (item.querySelector('.nickname').textContent === oldNickname) {
                item.querySelector('.nickname').textContent = newNickname;
            }
        });
    });

    var startTime = null;
    var elapsedTime = 0;
    var timerInterval = null;
    var previousLapTime = 0;

    function startTimer(start) {
        startTime = start;
        previousLapTime = 0; // リセット
        timerInterval = setInterval(() => {
            var now = Date.now();
            var timeDiff = now - startTime;
            updateStopwatch(timeDiff);
        }, 10);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function updateStopwatch(tenths) {
        elapsedTime = Math.floor(tenths / 10);
        splitTime = elapsedTime - previousLapTime; // スプリットタイムを計算
        document.getElementById('elapsedTime').textContent = formatTime(elapsedTime);
        document.getElementById('splitTime').textContent = formatTime(splitTime);
    }

    function updateLap(tenths, nickname) {
        var lapTime = Math.floor(tenths / 10);
        splitTime = lapTime - previousLapTime;
        var item = document.createElement('li');
        item.className = 'lap-item';
        item.innerHTML = `<span class="nickname">${nickname}</span><span class="lap-time">${formatTime(lapTime)}</span><span class="split-time">${formatTime(splitTime)}</span>`;
        lapsList.insertBefore(item, lapsList.firstChild);
        previousLapTime = lapTime;
    }

    function formatTime(tenths) {
        var minutes = Math.floor(tenths / 6000);
        var seconds = Math.floor((tenths % 6000) / 100);
        var hundredths = tenths % 100;
        return String(minutes).padStart(2, '0') + ':' + 
               String(seconds).padStart(2, '0') + '.' + 
               String(hundredths).padStart(2, '0');
    }

    function addMessage(msg) {
        var item = document.createElement('li');
        item.textContent = msg;
        document.getElementById('messages').appendChild(item);
        document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
    }

    // URLクエリパラメータからルームIDを取得
    function getQueryParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // ページ読み込み時にクエリパラメータをチェックして自動でルームに参加
    window.addEventListener('load', function() {
        const roomIdFromUrl = getQueryParameter('room');
        if (roomIdFromUrl) {
            nickname = nicknameInput.value.trim();
            if (!validateNickname(nickname)) {
                nickname = generateNickname();
            }
            socket.emit('join room', roomIdFromUrl, nickname);
        }
    });

    roomUrlDisplay.addEventListener('click', function(e) {
        e.preventDefault();
        popup.style.display = 'block';
    });

    closePopupButton.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
        if (event.target === nicknamePopup) {
            nicknamePopup.style.display = 'none';
        }
    });

    // 退室ボタンのクリックイベント
    exitRoomButton.addEventListener('click', function() {
        socket.emit('leave room', roomId);
        roomId = null;
        chatScreen.classList.remove('active');
        initialScreen.classList.add('active');
    });
});
















