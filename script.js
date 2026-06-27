// ---------- SPEED READING ENGINE ----------
let wordsArray = [];        // array of words
let currentIndex = 0;      // current word position
let isPlaying = false;
let timer = null;
let currentWPM = 300;       // default
let splitLength = 16; // words of this length are split
let speedChange = 10; // increment/decrement wpm
let posChange = 100; // increment/decrement position
let maxWPM = 800;
let longLength = 10; // words of this length are displayed twice

// DOM elements
document.addEventListener('DOMContentLoaded', function() {
    const wordDisplay = document.getElementById('wordDisplay');
    const resetBtn = document.getElementById('resetBtn');
    const wpmDisplay = document.getElementById('wpmDisplay');
    const textInput = document.getElementById('textInput');
    const loadTextBtn = document.getElementById('loadTextBtn');
    const sampleTextBtn = document.getElementById('sampleTextBtn');
    const statusMsg = document.getElementById('statusMsg');
    const themeToggle = document.getElementById('themeToggle');
    const fontToggle = document.getElementById('fontToggle');
    const playToggle = document.getElementById('playToggle');
    const incrementWPMBtn = document.getElementById('incrementWPMBtn');
    const decrementWPMBtn = document.getElementById('decrementWPMBtn');
    const incrementPosBtn = document.getElementById('incrementPosBtn');
    const decrementPosBtn = document.getElementById('decrementPosBtn');
});

function incrementWPM() {
    let newWPM = currentWPM + speedChange;
    if (newWPM > maxWPM) newWPM = maxWPM;
    updateWPM(newWPM);
}

function decrementWPM() {
    let newWPM = currentWPM - speedChange;
    if (newWPM < speedChange) newWPM = speedChange;
    updateWPM(newWPM);
}

function incrementPos() {
    let newPos = currentIndex + posChange;
    if (newPos > wordsArray.length - 1) newPos = wordsArray.length;
    currentIndex = newPos;
}

function decrementPos() {
    let newPos = currentIndex - posChange;
    if (newPos < 0) newPos = - 1;
    currentIndex = newPos;
}

// ---------- THEME MANAGEMENT ----------
function setTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '⏾';  // Moon icon for switching to dark
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀︎';  // Sun icon for switching to light
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        setTheme('light');
    } else {
        setTheme('dark');  // default to dark
    }
}

/// ---------- FONT MANAGEMENT ----------
function setFont(fontType) {
    if (fontType === 'serif') {
        document.documentElement.setAttribute('data-font', 'serif');
        localStorage.setItem('font', 'serif');
    } else {
        document.documentElement.setAttribute('data-font', 'sans');
        localStorage.setItem('font', 'sans');
    }
}

function toggleFont() {
    const currentFont = document.documentElement.getAttribute('data-font');
    if (currentFont === 'serif') {
        setFont('sans');
    } else {
        setFont('serif');
    }
}

function loadSavedFont() {
    const savedFont = localStorage.getItem('font');
    if (savedFont === 'sans') {
        setFont('sans');
    } else {
        setFont('serif');  // default to serif
    }
}

// ---------- SPEED READING ENGINE ----------
function getDelayMs() {
    if (currentWPM <= 0) return 200;
    return 60000 / currentWPM;
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    isPlaying = false;
}

function displayCurrentWord() {
    if (wordsArray.length === 0) {
        wordDisplay.innerText = '📖';
        return;
    }
    if (currentIndex >= wordsArray.length) {
        wordDisplay.innerText = '🏁 THE END';
        stopTimer();
        statusMsg.innerText = '✅ Finished! Load new text or reset.';
        return;
    }
    let word = wordsArray[currentIndex];
    wordDisplay.innerText = word;
}

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
        
        if (currentIndex >= wordsArray.length) {
            stopTimer();
            statusMsg.innerText = '🎉 Complete! Great job.';
            wordDisplay.innerText = '✨ DONE ✨';
        }
    } else {
        stopTimer();
    }
}

function togglePlay() {
    isPlaying = !(isPlaying);
    if (isPlaying) {
        startReading();
    } else {
        pauseReading();
    }
}

function startReading() {
    if (wordsArray.length === 0) {
        statusMsg.innerText = '❌ No text loaded. Paste or load sample text.';
        return;
    }
    if (currentIndex >= wordsArray.length) {
        statusMsg.innerText = '🔄 End reached. Press RESET to start over.';
        return;
    }
    
    stopTimer();
    
    isPlaying = true;
    const delay = getDelayMs();
    timer = setInterval(() => {
        nextWord();
    }, delay);
    statusMsg.innerText = `▶️ Reading at ${currentWPM} WPM | word ${currentIndex+1}/${wordsArray.length}`;
}

function pauseReading() {
    stopTimer();
    statusMsg.innerText = `⏸ Paused at word ${currentIndex+1}/${wordsArray.length}`;
}

function resetReading() {
    stopTimer();
    currentIndex = 0;
    displayCurrentWord();
    if (wordsArray.length > 0) {
        statusMsg.innerText = `⟳ Reset to start. ${wordsArray.length} words loaded.`;
    } else {
        statusMsg.innerText = `⟳ Reset, but no text loaded.`;
    }
}

function duplicateLongOrEndingWithPeriod(arr) {
    let result = [];
    for (let item of arr) {
        if (item.length > longLength || /[.!?]$/.test(item)) {
            result.push(item, item);
        } else {
            result.push(item);
        }
    }
    return result;
}

function loadTextFromInput() {
    const rawText = textInput.value;
    if (!rawText.trim()) {
        statusMsg.innerText = '⚠️ Please paste some text first.';
        return false;
    }
    
    let words = rawText.trim().split(/\s+/);
    words = words.filter(w => w.length > 0);
    
    // Split long words into halves
    let processedWords = [];
    for (let word of words) {
        if (word.length > splitLength && word.includes('-')) {
            // Split along hyphen
            let hyphenParts = word.split('-');
            for (let i = 0; i < hyphenParts.length; i++) {
                let part = hyphenParts[i];
                if (part.length > 0) {
                    // processedWords.push(part);
                    processedWords.push(i === hyphenParts.length - 1 ? part : part + '-');
                }
            }
        } else if (word.length > splitLength) {
            const midpoint = Math.ceil(word.length / 2);
            const firstHalf = word.slice(0, midpoint);
            const secondHalf = word.slice(midpoint);
            processedWords.push(firstHalf, secondHalf);
        } else {
            processedWords.push(word);
        }
    }
    
    if (processedWords.length === 0) {
        statusMsg.innerText = '❌ No valid words found.';
        return false;
    }
    
    wordsArray = duplicateLongOrEndingWithPeriod(processedWords);
    currentIndex = 0;
    stopTimer();
    displayCurrentWord();
    statusMsg.innerText = `📚 Loaded ${wordsArray.length} words. Press PLAY.`;
    return true;
}



function loadSampleText() {
    const sample = `The art of reading rapidly is not about skipping meaning but about reducing subvocalization and expanding peripheral vision. When you see one word at a time, your brain can process faster without regression. This method is called RSVP - Rapid Serial Visual Presentation. Studies show that with practice, comprehension remains high even at 500 to 700 words per minute. Trust your eyes and let the words flow. Speed reading is a superpower hiding in plain sight. Enjoy the journey!`;
    textInput.value = sample;
    loadTextFromInput();
}

function updateWPM(value) {
    currentWPM = value;
    
    if (isPlaying && wordsArray.length > 0 && currentIndex < wordsArray.length) {
        stopTimer();
        isPlaying = true;
        const newDelay = getDelayMs();
        timer = setInterval(() => {
            nextWord();
        }, newDelay);
        statusMsg.innerText = `⚡ Speed changed to ${currentWPM} WPM (continuing)`;
    } else if (!isPlaying) {
        statusMsg.innerText = `⚙️ Speed set to ${currentWPM} WPM`;
    }
}

// ---------- EVENT LISTENERS ----------
playToggle.addEventListener('click', function() {
    togglePlay();
    this.textContent = isPlaying ? '⏸' : '▶';
    // if (this.textContent === '▶') {
    //     this.textContent = '■';  // or use '⏹' for a more standard stop icon
    // } else {
    //     this.textContent = '▶';
    // }

}
);
resetBtn.addEventListener('click', resetReading);
themeToggle.addEventListener('click', toggleTheme);
fontToggle.addEventListener('click', toggleFont);
incrementWPMBtn.addEventListener('click', incrementWPM);
decrementWPMBtn.addEventListener('click', decrementWPM);
incrementPosBtn.addEventListener('click', incrementPos);
decrementPosBtn.addEventListener('click', decrementPos);



loadTextBtn.addEventListener('click', loadTextFromInput);
sampleTextBtn.addEventListener('click', loadSampleText);

// ---------- INITIALIZATION ----------
(function init() {
    loadSavedTheme();  // Load user's theme preference
    
    const introText = "Welcome to Speed Reader! Paste any article, book excerpt, or story. The words will flash one at a time. Click ▶ to start. Adjust speed with 🐢/🐇. This method boosts reading speed dramatically. Have fun and train your brain.";
    textInput.value = introText;
    loadTextFromInput();
    currentWPM = 300;
})();