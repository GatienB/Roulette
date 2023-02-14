import { ReactElement } from "react";
import { ChipStakeEnum } from "../../helpers/constants";
import { PositionEnum } from "../../models/position.enum";
import './Chip.css';

type ChipProps = {
    stake: number,
    position: PositionEnum,
    isClickable?: boolean,
    onChipClick?: Function,
    stakeSelected?: number
}

type ChipAbsPos = {
    top: number,
    left: number
}

function getTopLeftFromPosition(position: PositionEnum) {
    let pos: ChipAbsPos = { top: 50, left: 50 };

    switch (position) {
        case PositionEnum.TOP:
            pos.top = 0;
            break;
        case PositionEnum.TOP_RIGHT:
            pos.top = 0;
            pos.left = 100;
            break;
        case PositionEnum.RIGHT:
            pos.left = 100;
            break;
        case PositionEnum.BOTTOM_RIGHT:
            pos.top = 100;
            pos.left = 100;
            break;
        case PositionEnum.BOTTOM:
            pos.top = 100;
            break;
        case PositionEnum.BOTTOM_LEFT:
            pos.top = 100;
            pos.left = 0;
            break;
        case PositionEnum.LEFT:
            pos.left = 0;
            break;
        case PositionEnum.TOP_LEFT:
            pos.top = 0;
            pos.left = 0;
            break;
        default:
            break;
    }

    return pos;
}

function getClassFromStake(stake: number): string {
    let c = "yellow";

    if (stake >= ChipStakeEnum.VALUE_6) {
        c = "purple";
    } else if (stake >= ChipStakeEnum.VALUE_5) {
        c = "black";
    } else if (stake >= ChipStakeEnum.VALUE_4) {
        c = "blue";
    } else if (stake >= ChipStakeEnum.VALUE_3) {
        c = "green";
    } else if (stake >= ChipStakeEnum.VALUE_2) {
        c = "red";
    }

    return c;
}

function Chip(props: ChipProps): ReactElement {
    let _classes = ["chip"]
    let pos = getTopLeftFromPosition(props.position);
    _classes.push(getClassFromStake(props.stake));
    if (props.isClickable) {
        _classes.push("clickable");
        if(props.stakeSelected && props.stakeSelected === props.stake) 
            _classes.push("selected");
    }
    return (
        <div className={`${_classes.join(" ")}`}
            style={{ top: `calc(${pos.top}% - 7.5px)`, left: `calc(${pos.left}% - 7.5px)` }}
            {...(props.isClickable && props.onChipClick && { onClick: () => props.onChipClick?.() })}>
            <div className="chip-border"></div>
            <div className="chip-circle"></div>
            {props.stake}
        </div>
    )
}

export default Chip;