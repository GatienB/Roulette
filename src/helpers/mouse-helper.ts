import { PositionEnum } from "../models/position.enum";
import { Constants } from "./constants";

function getMousePositionEnum(positions: PositionEnum[]) {
    let pos = positions.join("_");
    for (const e of Object.values(PositionEnum)) {
        if (pos === e) {
            return e;
        }
    }

    return PositionEnum.CENTER;
}

export function getMousePosition(event: any): PositionEnum {
    // target width = offsetLeft + clientWidth
    // target height = offsetHeight + clientHeight
    const offsetBetweenSqr = Constants.offsetBetweenSqr;

    let x = event.clientX,
        y = event.clientY,
        sqrX = event.target.offsetLeft,
        sqrY = event.target.offsetTop,
        sqrHeight = event.target.clientHeight,
        sqrWidth = event.target.clientWidth;

    let positions: PositionEnum[] = [];

    // console.log(`${x},${y} - ${sqrX},${sqrY} - ${sqrWidth},${sqrHeight}`)

    if (y < sqrY + offsetBetweenSqr) {
        // top
        positions.push(PositionEnum.TOP);
    } else if (y > sqrY + sqrHeight - offsetBetweenSqr) {
        // bottom
        positions.push(PositionEnum.BOTTOM);
    }

    if (x < sqrX + offsetBetweenSqr) {
        // left
        positions.push(PositionEnum.LEFT);
    } else if (x > sqrX + sqrWidth - offsetBetweenSqr) {
        // right
        positions.push(PositionEnum.RIGHT);
    }

    return getMousePositionEnum(positions);
}
