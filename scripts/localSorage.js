// retrieve data from local storage
const retrieveHighScore = () => {
    const retrievedScore = localStorage.getItem("highScore");
    return localStorage.getItem("highScore") ?
        JSON.parse(retrievedScore).value :
        0;
};

// saves highscore
const saveToStorage = () => {
    // Getting preferred date format
    let dateEl = new Date();
    const time = dateEl.toLocaleString("en-IN", { timeZone: "Asia/Calcutta" });

    // Making Local Storage
    const value = score.current;
    const highScoreObj = { time, value };
    localStorage.setItem("highScore", JSON.stringify(highScoreObj));
    // console.log("Saved");
};