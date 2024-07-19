function initializeSocketEvents(socket, initialScreen, chatScreen, nicknameDisplay, updateRoomUrlAndQRCode, updateStopwatch, updateLap, addMessage, startTimer, stopTimer, startStopButton, roomUrlDisplay, popupUrlDisplay, popupQrCodeContainer, lapsList) {
    socket.on('room created', function(id) {
        roomId = id;
        initialScreen.classList.remove('active');
        chatScreen.classList.add('active');
        nicknameDisplay.textContent = `Nickname: ${nickname}`;
        updateRoomUrlAndQRCode(id, roomUrlDisplay, popupUrlDisplay, popupQrCodeContainer);
    });

    socket.on('room joined', function(id, elapsed, laps, start) {
        roomId = id;
        initialScreen.classList.remove('active');
        chatScreen.classList.add('active');
        nicknameDisplay.textContent = `Nickname: ${nickname}`;
        updateRoomUrlAndQRCode(id, roomUrlDisplay, popupUrlDisplay, popupQrCodeContainer);
        elapsedTime = elapsed;
        updateStopwatch(elapsed);
        laps.forEach(function(lap) {
            updateLap(lap.time, lap.nickname, lapsList);
        });
        if (start) {
            startTimer(start);
        }
    });

    socket.on('start stopwatch', function(start, nickname) {
        startTimer(start);
        startStopButton.textContent = 'Stop';
    });

    socket.on('stop stopwatch', function(elapsed, nickname) {
        stopTimer();
        elapsedTime = elapsed;
        updateStopwatch(elapsed);
        startStopButton.textContent = 'Start';
    });

    socket.on('reset stopwatch', function(nickname) {
        stopTimer();
        elapsedTime = 0;
        previousLapTime = 0;
        updateStopwatch(0);
        lapsList.innerHTML = '';
        startStopButton.textContent = 'Start';
    });

    socket.on('lap stopwatch', function(lap, nickname) {
        updateLap(lap, nickname, lapsList);
    });

    socket.on('reset laps', function() {
        lapsList.innerHTML = '';
    });

    socket.on('chat message', function(msg) {
        addMessage(msg);
    });
}




     


