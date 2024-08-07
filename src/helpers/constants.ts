
export const Constants = {
    widthSquare: () => (getStyle("--width-square") || "60px"),
    borderWidthSquare: () => (getStyle("--border-width-square") || "1px"),
    colorSquareRed: () => (getStyle("--color-square-red") || "rgb(186, 10, 3)"),
    colorSquareBlack: () => (getStyle("--color-square-black") || "rgb(3, 11, 3)"),
    colorSquare0: () => (getStyle("--color-square-0") || "rgb(37, 165, 37)"),

    // In px
    offsetBetweenSqr: 6,

}

function getStyle(propName: string) {
    return getComputedStyle(document.body).getPropertyValue(propName);
}

export enum SpecialBetsEnum {
    LINE_X = "line ",
    _1_TO_12 = "1 to 12",
    _13_TO_24 = "13 to 24",
    _25_TO_36 = "25 to 36",
    _1_TO_18 = "1-18",
    EVEN = "EVEN",
    RED = "RED",
    BLACK = "BLACK",
    ODD = "ODD",
    _19_TO_36 = "19-36",
}

// 1 5 25 50 100 500
export enum ChipStakeEnum {
    VALUE_1 = 1,
    VALUE_2 = 5,
    VALUE_3 = 25,
    VALUE_4 = 50,
    VALUE_5 = 100,
    VALUE_6 = 500
}

