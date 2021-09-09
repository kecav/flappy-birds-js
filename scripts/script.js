// get canvas body
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const bgImg = document.getElementById("backgroundImg");
const birdImg = document.getElementById("birdImg");
const customFont = new FontFace(
    "myFont",
    "url(./assets/fonts/PressStart2P-Regular.ttf)"
);

// load fonts
customFont.load().then((font) => {
    // Add font on the html page
    document.fonts.add(font);
    renderCanvas();
});

// canvas
let board = {
    width: canvas.width,
    height: canvas.height,
    background: "#70c5ce",
};

//bird
let bird = {
    width: 50,
    height: 40,
    color: "#f00",
    x: board.width / 3,
    y: board.height / 2,
    gravity: 14,
};

//pipes
let pipe = {
    width: 100,
    speed: 2,
    color: "#73bf2e",
    gap: 200,
    x: board.width,
    y: 0,
    first: {
        height: Math.floor((Math.random() * board.height) / 2),
        x: board.width * 1.25,
    },
    second: {
        height: Math.floor((Math.random() * board.height) / 2),
        x: board.width * 2,
    },
};

// ground
let ground = {
    width: board.width,
    height: 50,
    color: "#ded895",
    y: board.height - 50,
};

// backgrround
const background = { width: bgImg.width, height: bgImg.height, x: 0 };

// score
let score = { current: 0, x: 40, y: 80 };
let highScore = { value: score.current, x: board.width - 20, y: 80 };

// variables
let counterInterval;
let gameAnimation;
let jumpAnimation;
let isNewGame = true;
let isGameOver = true;
let passedPipe = false;

// generates gradient
const createGradient = (x) => {
    // gradient pipe
    let gradient = ctx.createLinearGradient(x, 0, x + pipe.width, 0);
    gradient.addColorStop(0, "#558022");
    gradient.addColorStop(0.3, "#9ce659");
    gradient.addColorStop(0.5, "#73bf2e");
    gradient.addColorStop(1, "#558022");
    return gradient;
};

// generates pipes
const createPipe = (x, y, h) => {
    ctx.fillStyle = createGradient(x);
    ctx.fillRect(x, y, pipe.width, h); // upper pipe
    ctx.fillRect(
        x,
        h + pipe.gap,
        pipe.width,
        board.height - ground.height - h - pipe.gap
    ); //bottom pipe

    // generates stroke around
    const lineWidth = 2;
    ctx.strokeStyle = "#666";
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y - lineWidth, pipe.width, h);
    ctx.strokeRect(
        x,
        h + pipe.gap,
        pipe.width,
        board.height - ground.height - h - pipe.gap + lineWidth
    );
};

// Algorithm to jump
const jump = () => {
    bird.y -= bird.gravity;
    bird.gravity -= 0.8;
    jumpAnimation = requestAnimationFrame(jump);
};

// pipes coming
const moveForward = () => {
    // maintains speed
    pipe.first.x -= pipe.speed;
    pipe.second.x -= pipe.speed;

    // moves ground
    background.x++;

    // renders background again after reaching end
    if (background.x + board.width >= background.width) {
        background.x = 0;
    }

    // spawns pipe1
    if (pipe.first.x + pipe.width <= 0) {
        pipe.first.height = Math.floor(
            Math.random() * (board.height - ground.height - pipe.gap)
        );
        pipe.first.x = board.width * 1.25;
    }
    // spawns pipe 2
    if (pipe.second.x + pipe.width <= 0) {
        pipe.second.height = Math.floor(
            Math.random() * (board.height - ground.height - pipe.gap)
        );
        pipe.second.x = board.width * 1.25;
    }
};

// detect collision
const checkCollision = () => {
    // top bottom canvas boundary check
    const verticalBoardBound = bird.y <= 0 || bird.y + bird.height >= ground.y;
    // pipe1
    const pipeBound1 =
        bird.x + bird.width >= pipe.first.x &&
        bird.x <= pipe.first.x + pipe.width &&
        (bird.y <= pipe.first.height ||
            bird.y + bird.height >= pipe.first.height + pipe.gap);

    const pipeBound2 =
        bird.x + bird.width >= pipe.second.x &&
        bird.x <= pipe.second.x + pipe.width &&
        (bird.y <= pipe.second.height ||
            bird.y + bird.height >= pipe.second.height + pipe.gap);

    if (verticalBoardBound || pipeBound1 || pipeBound2) {
        return true;
    }
    return false;
};

// score counter
const scoreCounter = () => {
    // console.log(pipe.first.x + pipe.width, bird.x);
    if (
        bird.x === pipe.first.x + pipe.width ||
        bird.x === pipe.second.x + pipe.width
    ) {
        score.current++;
    }
    if (score.current > highScore.value) {
        highScore.value = score.current;
    }
};

// render canvas
const renderCanvas = () => {
    // clears the previous frame
    ctx.clearRect(0, 0, board.width, board.height);

    // draws background Image
    ctx.drawImage(
        bgImg,
        background.x,
        0,
        board.width,
        board.height,
        0,
        0,
        board.width,
        board.height
    );

    // flappy bird
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // rendering both pipes
    createPipe(pipe.first.x, pipe.y, pipe.first.height);
    createPipe(pipe.second.x, pipe.y, pipe.second.height);

    // Ground
    ctx.fillStyle = ground.color;
    ctx.fillRect(0, board.height - ground.height, ground.width, ground.height);

    // current scores
    ctx.fillStyle = "#fff";
    ctx.font = "48px myFont";
    ctx.textAlign = "start";
    ctx.fillText(`${Math.floor(score.current)}`, score.x, score.y);
    ctx.strokeStyle = "#000";
    ctx.strokeText(`${Math.floor(score.current)}`, score.x, score.y);
};

// handles events
const eventHandler = (e) => {
    if (e.code != "Space") {
        return;
    }
    if ((isGameOver || isNewGame) && e.code === "Space") {
        init();
        return;
    }
    bird.gravity = 14;
    cancelAnimationFrame(jumpAnimation);
    jump();
};

// resets the game values to default
const resetValues = () => {
    bird.x = board.width / 3;
    bird.y = board.height / 2;
    pipe.first.x = board.width * 1.25;
    pipe.second.x = board.width * 2;
    passedPipe = false;
    score.current = 0;
    background.x = 0;
    bird.gravity = 14;
};

// initialize game
const init = () => {
    gameOverScreen.style.display = "none";
    newGameScreen.style.display = "none";
    isNewGame = false;
    isGameOver = false;
    resetValues();
    renderGame();
    jump();
};

// Renders game
const renderGame = () => {
    renderCanvas();
    moveForward();
    scoreCounter();
    if (checkCollision()) {
        terminate();
        return;
    }
    gameAnimation = requestAnimationFrame(renderGame);
};

// freezes the game
const terminate = () => {
    console.log("Score : ", score.current);
    isGameOver = true;
    cancelAnimationFrame(gameAnimation);
    cancelAnimationFrame(jumpAnimation);
    addToDom();
};

// Listening to jump buttons
window.addEventListener("keydown", eventHandler);
window.addEventListener("click", eventHandler);

// Initial Screen Paint
renderCanvas();