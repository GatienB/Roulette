import React from 'react'
import Square from './../Square/Square';
import './Tapis.css';

class Tapis extends React.Component {
    constructor(props: any) {
        super(props)
    }

    renderSquare(value: string, colspan?: number): React.ReactNode {
        return (
            <Square key={value} value={value} colspan={colspan} />
        )
    }

    renderLineX(startNumber: number): React.ReactNode {
        return new Array(13).fill(0).map((v, i) => {
            return this.renderSquare(`${startNumber + (i * 3)}`);
        });
    }

    render(): React.ReactNode {
        return (
            <div id='tapis'>
                <div className='row'>
                    <div>
                        {this.renderSquare('0')}
                    </div>
                    <div>
                        <div className='row'>
                            {this.renderLineX(3)}
                        </div>
                        <div className='row'>
                            {this.renderLineX(2)}
                        </div>
                        <div className='row'>
                            {this.renderLineX(1)}
                        </div>
                    </div>
                </div>
                <div className='big-squares-row'>
                    <div className='row'>
                        {this.renderSquare('1 to 12', 4)}
                        {this.renderSquare('13 to 24', 4)}
                        {this.renderSquare('25 to 36', 4)}
                    </div>
                </div>
                <div className='big-squares-row'>
                    <div className='row'>
                        {this.renderSquare('1-18', 2)}
                        {this.renderSquare('EVEN', 2)}
                        {this.renderSquare('RED', 2)}
                        {this.renderSquare('BLACK', 2)}
                        {this.renderSquare('ODD', 2)}
                        {this.renderSquare('19-36', 2)}
                    </div>
                </div>
            </div>
        )
    }
}

export default Tapis;