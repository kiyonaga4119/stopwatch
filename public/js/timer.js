var startTime = null;
var elapsedTime = 0;
var timerInterval = null;
var previousLapTime = 0;

function startTimer(start) {
    startTime = start;
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
    stopwatch.textContent = formatTime(Math.floor(tenths / 10));
}

function updateLap(tenths, nickname, lapsList) {
    var lapTime = Math.floor(tenths / 10);
    var splitTime = lapTime - previousLapTime;
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
