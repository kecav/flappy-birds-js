const screens = document.getElementById("screens");
const retryBtn = document.getElementById("retry-btn");
const currScoreDom = document.getElementById("current-score-value");
const highScoreDom = document.getElementById("highscore-value");
const startBtn = document.getElementById("start-btn");
const gameOverScreen = document.getElementById("game-over-screen");
const newGameScreen = document.getElementById("new-game-screen");
const message = document.getElementsByClassName("message")[0];

// for mobiles
if (isMobile) {
    message.innerHTML = "👆 to Jump.";
}
// function to add everything to dom after finish
const addToDom = () => {
    // displays game-over screen
    // screens.style.display = "block";
    gameOverScreen.style.display = "flex";
    currScoreDom.innerText = score.current;
    highScoreDom.innerText = highScore.value;
};

// event listeners for retry
retryBtn.addEventListener("click", init);
startBtn.addEventListener("click", init);

//sw;
window.addEventListener("load", () => {
    registerSW();
});

async function registerSW() {
    if ("serviceWorker" in navigator) {
        try {
            await navigator.serviceWorker.register("././sw.js");
        } catch (e) {
            console.log(`SW registration failed`);
        }
    }
}