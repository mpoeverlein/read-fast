// ---------- SPEED READING ENGINE ----------
let wordsArray = [];        // array of words
let currentIndex = 0;      // current word position
let isPlaying = false;
let timer = null;
let currentWPM = 300;       // default
let splitLength = 16; // words of this length are split

// DOM elements
document.addEventListener('DOMContentLoaded', function() {
    const wordDisplay = document.getElementById('wordDisplay');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const wpmDisplay = document.getElementById('wpmDisplay');
    const textInput = document.getElementById('textInput');
    const loadTextBtn = document.getElementById('loadTextBtn');
    const sampleTextBtn = document.getElementById('sampleTextBtn');
    const statusMsg = document.getElementById('statusMsg');
    const themeToggle = document.getElementById('themeToggle');
    const fontToggle = document.getElementById('fontToggle');
    const incrementWPMBtn = document.getElementById('incrementWPMBtn');
    const decrementWPMBtn = document.getElementById('decrementWPMBtn');
    const incrementPosBtn = document.getElementById('incrementPosBtn');
    const decrementPosBtn = document.getElementById('decrementPosBtn');
});

function incrementWPM() {
    let newWPM = currentWPM + 10;
    if (newWPM > 800) newWPM = 800;
    updateWPM(newWPM);
}

function decrementWPM() {
    let newWPM = currentWPM - 10;
    if (newWPM < 10) newWPM = 10;
    updateWPM(newWPM);
}

function incrementPos() {
    let newPos = currentIndex + 100;
    if (newPos > wordsArray.length - 1) newPos = wordsArray.length;
    currentIndex = newPos;
}

function decrementPos() {
    let newPos = currentIndex - 100;
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

// Helper function to check if a word needs longer display
function needsLongerDisplay(word) {
    // Check if word ends with period or comma
    if (word.endsWith('.') || word.endsWith(',')) {
        return true;
    }
    
    // Check if word is "not" or "none" (case-insensitive, after removing punctuation)
    const cleanWord = word.replace(/[.,!?;:]$/, '').toLowerCase();
    if (cleanWord === 'not' || cleanWord === 'none') {
        return true;
    }
    
    return false;
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

let longDisplayTimer = null; // Timer for extended word display

function nextWord() {
    if (!isPlaying) return;
    if (wordsArray.length === 0) {
        stopTimer();
        statusMsg.innerText = '⚠️ No text loaded. Paste something first.';
        wordDisplay.innerText = '📭';
        return;
    }
    
    if (currentIndex < wordsArray.length) {
        const currentWord = wordsArray[currentIndex];
        const needsLonger = needsLongerDisplay(currentWord);
        
        // Move to next word index but handle display timing
        currentIndex++;
        
        if (needsLonger) {
            // Display the word longer (double time)
            if (longDisplayTimer) clearTimeout(longDisplayTimer);
            
            // Show the word
            displayCurrentWord();
            
            // Schedule the move to next word AFTER the extended time
            if (currentIndex < wordsArray.length) {
                const delay = getDelayMs() * 2; // Double the normal display time
                longDisplayTimer = setTimeout(() => {
                    if (isPlaying && currentIndex < wordsArray.length) {
                        displayCurrentWord();
                    }
                    longDisplayTimer = null;
                }, delay);
            } else if (currentIndex >= wordsArray.length) {
                // Reached the end
                stopTimer();
                statusMsg.innerText = '🎉 Complete! Great job.';
                wordDisplay.innerText = '✨ DONE ✨';
            }
        } else {
            // Normal display
            displayCurrentWord();
            
            if (currentIndex >= wordsArray.length) {
                stopTimer();
                statusMsg.innerText = '🎉 Complete! Great job.';
                wordDisplay.innerText = '✨ DONE ✨';
            }
        }
    } else {
        stopTimer();
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
    if (isPlaying) return;
    
    stopTimer();
    
    // Clear any pending long display timer
    if (longDisplayTimer) {
        clearTimeout(longDisplayTimer);
        longDisplayTimer = null;
    }
    
    isPlaying = true;
    const delay = getDelayMs();
    timer = setInterval(() => {
        nextWord();
    }, delay);
    statusMsg.innerText = `▶️ Reading at ${currentWPM} WPM | word ${currentIndex+1}/${wordsArray.length}`;
}

function pauseReading() {
    if (!isPlaying) return;
    stopTimer();
    // Clear any pending long display timer on pause
    if (longDisplayTimer) {
        clearTimeout(longDisplayTimer);
        longDisplayTimer = null;
    }
    statusMsg.innerText = `⏸ Paused at word ${currentIndex+1}/${wordsArray.length}`;
}

function resetReading() {
    stopTimer();
    // Clear any pending long display timer on reset
    if (longDisplayTimer) {
        clearTimeout(longDisplayTimer);
        longDisplayTimer = null;
    }
    currentIndex = 0;
    displayCurrentWord();
    if (wordsArray.length > 0) {
        statusMsg.innerText = `⟳ Reset to start. ${wordsArray.length} words loaded.`;
    } else {
        statusMsg.innerText = `⟳ Reset, but no text loaded.`;
    }
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
            for (let part of hyphenParts) {
                if (part.length > 0) {
                    processedWords.push(part);
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
    
    wordsArray = processedWords;
    currentIndex = 0;
    stopTimer();
    // Clear any pending long display timer
    if (longDisplayTimer) {
        clearTimeout(longDisplayTimer);
        longDisplayTimer = null;
    }
    displayCurrentWord();
    statusMsg.innerText = `📚 Loaded ${wordsArray.length} words. Press PLAY.`;
    return true;
}

function loadSampleText() {
    const sample = `The art of reading rapidly is not about skipping meaning but about reducing subvocalization and expanding peripheral vision. When you see one word at a time, your brain can process faster without regression. This method is called RSVP - Rapid Serial Visual Presentation. Studies show that with practice, comprehension remains high even at 500 to 700 words per minute. Trust your eyes and let the words flow. Speed reading is a superpower hiding in plain sight. None can deny its benefits. Enjoy the journey!`;
    textInput.value = sample;
    loadTextFromInput();
}

function updateWPM(value) {
    currentWPM = value;
    
    if (isPlaying && wordsArray.length > 0 && currentIndex < wordsArray.length) {
        stopTimer();
        // Clear any pending long display timer when changing speed
        if (longDisplayTimer) {
            clearTimeout(longDisplayTimer);
            longDisplayTimer = null;
        }
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
playBtn.addEventListener('click', startReading);
pauseBtn.addEventListener('click', pauseReading);
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
    
    const introText = "Welcome to Speed Reader! Paste any article, book excerpt, or story. The words will flash one at a time. Click ▶ to start. Adjust speed with +/-. This method boosts reading speed dramatically. Have fun and train your brain.";
    textInput.value = introText;
    loadTextFromInput();
    currentWPM = 300;
})();