// ---------- SPEED READING ENGINE ----------
let wordsArray = [];        // array of words
let currentIndex = 0;      // current word position
let isPlaying = false;
let timer = null;
let currentWPM = 300;       // default

// DOM elements
const wordDisplay = document.getElementById('wordDisplay');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const wpmSlider = document.getElementById('wpmSlider');
const wpmValueSpan = document.getElementById('wpmValue');
const textInput = document.getElementById('textInput');
const loadTextBtn = document.getElementById('loadTextBtn');
const sampleTextBtn = document.getElementById('sampleTextBtn');
const statusMsg = document.getElementById('statusMsg');

// helper: calculate delay in ms based on WPM
function getDelayMs() {
    if (currentWPM <= 0) return 200;
    // words per minute -> milliseconds per word
    return 60000 / currentWPM;
}

// stop any running timer
function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    isPlaying = false;
}

// display current word (based on currentIndex)
function displayCurrentWord() {
    if (wordsArray.length === 0) {
        wordDisplay.innerText = '📖';
        return;
    }
    if (currentIndex >= wordsArray.length) {
        // finished reading
        wordDisplay.innerText = '🏁 THE END';
        stopTimer();
        statusMsg.innerText = '✅ Finished! Load new text or reset.';
        return;
    }
    let word = wordsArray[currentIndex];
    wordDisplay.innerText = word;
}

// main tick: move to next word
function nextWord() {
    if (!isPlaying) return;
    if (wordsArray.length === 0) {
        stopTimer();
        statusMsg.innerText = '⚠️ No text loaded. Paste something first.';
        wordDisplay.innerText = '📭';
        return;
    }
    
    if (currentIndex < wordsArray.length) {
        currentIndex++;
        displayCurrentWord();
        
        // if after increment we reached the end, stop playing
        if (currentIndex >= wordsArray.length) {
            stopTimer();
            statusMsg.innerText = '🎉 Complete! Great job.';
            wordDisplay.innerText = '✨ DONE ✨';
        }
    } else {
        // safety stop
        stopTimer();
    }
}

// start reading from current position
function startReading() {
    if (wordsArray.length === 0) {
        statusMsg.innerText = '❌ No text loaded. Paste or load sample text.';
        return;
    }
    if (currentIndex >= wordsArray.length) {
        statusMsg.innerText = '🔄 End reached. Press RESET to start over.';
        return;
    }
    if (isPlaying) return; // already playing
    
    stopTimer(); // clear any existing timer just in case
    
    isPlaying = true;
    const delay = getDelayMs();
    timer = setInterval(() => {
        nextWord();
    }, delay);
    statusMsg.innerText = `▶️ Reading at ${currentWPM} WPM | word ${currentIndex+1}/${wordsArray.length}`;
}

// pause reading
function pauseReading() {
    if (!isPlaying) return;
    stopTimer();
    statusMsg.innerText = `⏸ Paused at word ${currentIndex+1}/${wordsArray.length}`;
}

// reset to first word
function resetReading() {
    const wasPlaying = isPlaying;
    stopTimer();          // stop playback
    currentIndex = 0;
    displayCurrentWord();
    if (wordsArray.length > 0) {
        statusMsg.innerText = `⟳ Reset to start. ${wordsArray.length} words loaded.`;
    } else {
        statusMsg.innerText = `⟳ Reset, but no text loaded.`;
    }
}

// load text from textarea into wordsArray
function loadTextFromInput() {
    const rawText = textInput.value;
    if (!rawText.trim()) {
        statusMsg.innerText = '⚠️ Please paste some text first.';
        return false;
    }
    
    // split by spaces but also keep punctuation attached to words (natural RSVP)
    let words = rawText.trim().split(/\s+/);
    // filter out any empty strings
    words = words.filter(w => w.length > 0);
    
    if (words.length === 0) {
        statusMsg.innerText = '❌ No valid words found.';
        return false;
    }
    
    wordsArray = words;
    currentIndex = 0;
    stopTimer();            // stop any ongoing playback
    displayCurrentWord();
    statusMsg.innerText = `📚 Loaded ${wordsArray.length} words. Press PLAY.`;
    return true;
}

// load sample text (classic literature / speed reading demo)
function loadSampleText() {
    const sample = `The art of reading rapidly is not about skipping meaning but about reducing subvocalization and expanding peripheral vision. When you see one word at a time, your brain can process faster without regression. This method is called RSVP - Rapid Serial Visual Presentation. Studies show that with practice, comprehension remains high even at 500 to 700 words per minute. Trust your eyes and let the words flow. Speed reading is a superpower hiding in plain sight. Enjoy the journey!`;
    textInput.value = sample;
    loadTextFromInput();
}

// update WPM and if currently playing, restart timer with new speed
function updateWPM(value) {
    currentWPM = value;
    wpmValueSpan.innerText = `${currentWPM} WPM`;
    
    // if currently playing, we need to restart timer to apply new speed
    if (isPlaying && wordsArray.length > 0 && currentIndex < wordsArray.length) {
        const wasPlaying = isPlaying;
        if (wasPlaying) {
            stopTimer();       // clear old interval
            isPlaying = true;  // restore flag
            const newDelay = getDelayMs();
            timer = setInterval(() => {
                nextWord();
            }, newDelay);
            statusMsg.innerText = `⚡ Speed changed to ${currentWPM} WPM (continuing)`;
        }
    } else if (!isPlaying) {
        // just update display, no timer restart needed
        statusMsg.innerText = `⚙️ Speed set to ${currentWPM} WPM`;
    }
}

// event listeners
playBtn.addEventListener('click', () => {
    startReading();
});

pauseBtn.addEventListener('click', () => {
    pauseReading();
});

resetBtn.addEventListener('click', () => {
    resetReading();
});

wpmSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    updateWPM(val);
});

loadTextBtn.addEventListener('click', () => {
    loadTextFromInput();
});

sampleTextBtn.addEventListener('click', () => {
    loadSampleText();
});

// initialize with demo text
(function init() {
    const introText = "Welcome to Speed Reader! Paste any article, book excerpt, or story. The words will flash one at a time. Click PLAY to start. Adjust speed with slider. This method boosts reading speed dramatically. Have fun and train your brain.";
    textInput.value = introText;
    loadTextFromInput();
    currentWPM = 300;
    wpmSlider.value = 300;
    wpmValueSpan.innerText = "300 WPM";
})();