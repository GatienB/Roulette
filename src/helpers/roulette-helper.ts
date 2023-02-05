
export function getNumberColor(number: number) {
    const indexNb0 = getNumberIndex(0);
    let indexNb = getNumberIndex(number);
    if (indexNb > indexNb0) {
        indexNb -= 1;
    }
    return number === 0 ? "green" : (indexNb % 2 == 1 ? "red" : "black");
}

export function getRouletteNumberFrom0To2piCounterclockwise(): Array<number> {
    return [6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25, 17, 34];
}

export function getAngleFromNumberIndex(index: number, offset = 0) {
    return ((index * Math.PI * 2) / 37) + offset;
}

export function getNumberIndex(number: number) {
    return getRouletteNumberFrom0To2piCounterclockwise().indexOf(number);
}
