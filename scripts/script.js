// get canvas body
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const bgImg = document.getElementById("backgroundImg");
const birdImg = document.getElementById("birdImg");
const birdImgU = document.getElementById("birdImgU");
const birdImgD = document.getElementById("birdImgD");
const customFont = new FontFace(
    "myFont",
    "url(./assets/fonts/PressStart2P-Regular.ttf)"
);

// variables
let counterInterval;
let gameAnimation;
let jumpAnimation;
let isNewGame = true;
let isGameOver = true;
let passedPipe = false;
let isMobile;

// sets width for mobile
if (window.innerWidth <= 900) {
    isMobile = true;
    // console.log("Width managed");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // canvas.setAttribute("width", `${window.innerWidth}`);
    // canvas.setAttribute("height", `${window.innerHeight}`);
}

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
    width: isMobile ? 45 : 50,
    height: isMobile ? 35 : 40,
    color: "#f00",
    x: board.width / 3,
    y: board.height / 2,
    speed: 14,
    gravity : 0.75,
    isFalling : true,

};

//pipes
let pipe = {
    width: isMobile ? 80 : 100,
    speed: 2,
    color: "#73bf2e",
    gap: 250,
    minGap : 200,
    multi : 0.2, // by how much the speed should increase
    reducer: 1, // defines by how much the gap should decrease on every score.flag
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
// flag defines when to reduce pipe gap
// multi is score multiple when to increase speed
let score = { current: 0, x: 40, y: 80, flag:1, multi:5 };
let highScore = { value: retrieveHighScore(), x: board.width - 20, y: 80 };

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
    console.log(bird.speed);
    bird.y -= bird.speed;
    bird.speed = Number(bird.speed - bird.gravity).toFixed(2);
    bird.isFalling = bird.speed>0;
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
    // console.log(pipe.gap, pipe.speed);
    if (isMobile) {
        if (
            (bird.x - (pipe.first.x + pipe.width) < 2.5 &&
                bird.x - (pipe.first.x + pipe.width) > 0) ||
            (bird.x - (pipe.second.x + pipe.width) < 2.5 &&
                bird.x - (pipe.second.x + pipe.width) > 0)
        ) {
            // valid score point
            point.play();
            score.current++;
            // pipe gap changes
            if(score.current%score.flag==0) pipe.gap = pipe.gap <= pipe.minGap ? pipe.minGap : pipe.gap - pipe.reducer;
            // dynamic speed as to when increase game speed
            if(score.current%score.multi==0) pipe.speed = Number((pipe.speed + pipe.multi).toFixed(2));
        }
    }
    if (
        bird.x === pipe.first.x + pipe.width ||
        bird.x === pipe.second.x + pipe.width
    ) {
        point.play();
        score.current++;
    }
    if (score.current > highScore.value) {
        highScore.value = score.current;
        saveToStorage();
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
        bgImg.height - canvas.height,
        board.width,
        board.height,
        0,
        0,
        board.width,
        board.height
    );

    
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
    
    
    // flappy bird
    ctx.drawImage(bird.isFalling ? birdImgU : birdImgD, bird.x, bird.y, bird .width, bird.height);
};

// handles events
const eventHandler = () => {
    if(isGameOver) return;
    bird.speed = 14;
    wing.currentTime = 0;
    // if (isGameOver || isNewGame) {
    //     init();
    //     return;
    // }
    wing.play();
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
    bird.speed = 14;
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
    hit.play();
    console.log("Score : ", score.current);
    isGameOver = true;
    cancelAnimationFrame(gameAnimation);
    cancelAnimationFrame(jumpAnimation);
    addToDom();
};

// Listening to jump buttons
window.addEventListener("keydown", eventHandler);
window.addEventListener("touchstart", eventHandler);
// window.addEventListener("mousedown", eventHandler);

// Initial Screen Paint
renderCanvas();