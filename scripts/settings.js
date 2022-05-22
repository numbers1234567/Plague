
function getBaseGameSettings() {
    const biasOffset = 0;
    const biasCoef=1/100;

    let bias = parseFloat(document.getElementById("base-game-bias").value)*biasCoef+biasOffset;
    let numHoles = parseInt(document.getElementById("base-game-holes").value);
    let rows = parseInt(document.getElementById("base-game-rows").value);
    let columns = parseInt(document.getElementById("base-game-columns").value);

    return {bias : bias, numHoles : numHoles, rows : rows, columns : columns};
}

export {getBaseGameSettings};