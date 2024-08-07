import React, { ReactElement } from 'react';
import { Constants } from '../../helpers/constants';
import { getMousePosition } from '../../helpers/mouse-helper';
import './Square.css';

type SquareProps = {
    id: string,
    value: string,
    colspan: number,
    color: string,
    onMouseEvents: Function,
    isSelected: boolean,
    children: any
}
type SquareState = {
    children: ReactElement[]
}

class Square extends React.Component<SquareProps, SquareState> {
    width: string;

    constructor(props: SquareProps) {
        super(props);
        
        if (props.colspan && props.colspan > 1) {
            this.width = `${props.colspan / 12 * 100}%`;
        }
        else {
            this.width = Constants.widthSquare();
        }

        this.state = {
            children: []
        }
    }

    handleMouseEvents(event: any) {
        let position = getMousePosition(event);

        // console.log(`${this.props.id} --> ${position}`)
        this.props.onMouseEvents(this.props.id, position, event);
        // if(event.type == "click")
        //     this.setState({children: [<Chip key={1} stake={100} position={position}></Chip>]})
    }

    render(): React.ReactNode {
        let squareClass = "square";
        let style = {};
        if (this.props.isSelected) {
            squareClass += " selected";
        }

        if (this.props.value === "0") {
            squareClass += " square0";
        } else {
            style = { width: this.width, background: this.props.color };
        }

        return (
            <div onClick={(event) => this.handleMouseEvents(event)}
                onMouseMove={(event) => this.handleMouseEvents(event)}
                onMouseLeave={(event) => this.handleMouseEvents(event)}
                className={squareClass}
                style={style}>
                {this.props.value}
                {squareClass.includes("square0") && <span className="fill-arrow"></span>}
                {this.props.children}
            </div>
        )
    }
}

export default Square;