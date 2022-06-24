async function sleep(time){
    time *= 1000;
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

module.exports = { sleep };