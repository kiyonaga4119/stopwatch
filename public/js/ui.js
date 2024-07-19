function updateRoomUrlAndQRCode(id, roomUrlDisplay, popupUrlDisplay, popupQrCodeContainer) {
    var roomUrl = window.location.href.split('?')[0] + '?room=' + id;
    roomUrlDisplay.textContent = 'IDを表示';
    popupUrlDisplay.textContent = roomUrl;

    var qr = qrcode(0, 'L');
    qr.addData(roomUrl);
    qr.make();
    popupQrCodeContainer.innerHTML = qr.createImgTag(4);
}

function initializeUIEvents(socket, roomUrlDisplay, popup, popupUrlDisplay, popupQrCodeContainer, closePopupButton, viewOnlyCheckbox, startStopButton, lapResetButton) {
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
}





