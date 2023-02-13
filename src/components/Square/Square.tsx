import React from 'react';
import Constants from './../../constants';
import './Square.css'

type SquareProps = {
    value: string,
    colspan?: number
}

class Square extends React.Component<SquareProps> {
    width: string;

    constructor(props: SquareProps) {
        super(props);
        if (props.colspan && props.colspan > 0) {
            // this.width = `${+Constants.widthSquare.replace("px", "") * +props.colspan}px`;
            this.width = `calc(${props.colspan / 13 * 100}% - (${Constants.borderWidthSquare} * 2))`;
        }
        else {
            this.width = Constants.widthSquare;
        }
    }

    render(): React.ReactNode {
        if (this.props.value !== "0") {
            let valueToDisplay: string;
            if (!isNaN(+this.props.value)) {
                if (+this.props.value <= 36) {
                    valueToDisplay = this.props.value;
                }
                else {
                    valueToDisplay = `line ${+this.props.value - 36}`
                }
            }
            else {
                valueToDisplay = this.props.value;
            }

            return (
                <div className="square" style={{ width: this.width }}>
                    {valueToDisplay}
                </div>
            )
        }
        else {
            return (
                <div className="square square0">
                    0
                    <span className="arrow"></span>
                </div>
            )
        }
    }
}

export default Square;