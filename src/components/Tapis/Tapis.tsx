import React from 'react'
import Square from '../Square/Square';
import './Tapis.css';
import { getNumberColor } from '../../helpers/roulette-helper';
import { ChipStakeEnum, SpecialBetsEnum } from '../../helpers/constants';
import { getSelectedSqrIds } from './Tapis-helper';
import Chip from '../Chip/Chip';
import { Bet } from "./../../models/bet.model";
import { PositionEnum } from "./../../models/position.enum";
import { connect } from 'react-redux';
import { StoreState } from '../../app/store.model';
import { createBet } from '../../helpers/bet-helper';

type TapisState = {
    selectedSqrIds: string[];
    // bets: Bet[],
    selectedStake: ChipStakeEnum;
}

type TapisProps = {
    isBettingLocked: boolean,
    addBet: Function,
    bets: Bet[],
    selectedStakeChanged: Function
}

class Tapis extends React.Component<TapisProps, TapisState> {

    constructor(props: TapisProps) {
        super(props);
        this.state = {
            selectedSqrIds: [],
            // bets: [],
            selectedStake: ChipStakeEnum.VALUE_2
        }

        this.props.selectedStakeChanged(this.state.selectedStake);
    }

    handleSquareMouseEvents(id: string, position: PositionEnum, event: any) {
        // console.log(id);
        if (event.type === "click" && !this.props.isBettingLocked) {
            // console.log("click", event);
            let squaresIdsAndNumbers = getSelectedSqrIds(id, position);
            let newBet: Bet = createBet(squaresIdsAndNumbers.betId, id, squaresIdsAndNumbers.numbers, this.state.selectedStake, {
                position: isNaN(+squaresIdsAndNumbers.ids[0]) && !squaresIdsAndNumbers.ids[0].startsWith(SpecialBetsEnum.LINE_X) ? PositionEnum.CENTER : position
            })

            this.props.addBet(newBet);
        }
        else if (event.type === "mousemove") {
            // console.log("mousemove", event);
            if (!isNaN(+id)) {
                this.setState({ selectedSqrIds: getSelectedSqrIds(id, position).ids });
            } else {
                this.setState({ selectedSqrIds: getSelectedSqrIds(id, position).ids });
            }
        }
        else if (event.type === "mouseleave") {
            this.setState({ selectedSqrIds: [] });
        }
    }

    onSelectedChipChanged(stake: ChipStakeEnum) {
        this.setState({ selectedStake: stake }, () => {
            this.props.selectedStakeChanged(this.state.selectedStake);
        });
    }

    renderSquare(value: string, colspan: number = 1): React.ReactNode {
        let color = "";
        if (!isNaN(+value) && value.match(/^\d{1,2}$/)) {
            color = getNumberColor(+value);
        }

        return (
            <Square key={value}
                id={value}
                value={value}
                colspan={colspan}
                color={color}
                onMouseEvents={this.handleSquareMouseEvents.bind(this)}
                isSelected={this.state.selectedSqrIds.indexOf(value) >= 0}
                children={this.props.bets.filter(b => b.sqrId === value).map(b => {
                    return <Chip key={b.id} stake={b.stake} position={b.chip.position}></Chip>
                })} />
        )
    }

    renderLineX(startNumber: number): React.ReactNode {
        let n: number;
        return new Array(13).fill(0).map((v, i) => {
            n = startNumber + (i * 3);
            if (n <= 36)
                return this.renderSquare(`${n}`);
            else
                return this.renderSquare(`line ${n - 36}`);
        });
    }

    renderChipChoices(): React.ReactNode {
        return Object.values(ChipStakeEnum).filter(v => !isNaN(+v)).map((v) => {
            let stakeValue = v as ChipStakeEnum;
            return <td key={stakeValue}>
                <Chip stake={stakeValue} position={PositionEnum.TOP}
                    isClickable={true} onChipClick={() => this.onSelectedChipChanged(stakeValue)}
                    stakeSelected={this.state.selectedStake} />
            </td>
        })
    }

    render(): React.ReactNode {
        return (
            <div id='tapis'>
                <div className="chips-list" style={{ position: "relative" }}>
                    <table>
                        <tbody>
                            <tr>
                                {this.renderChipChoices()}
                            </tr>
                        </tbody>
                    </table>
                </div>
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
                        {this.renderSquare(SpecialBetsEnum._1_TO_12, 4)}
                        {this.renderSquare(SpecialBetsEnum._13_TO_24, 4)}
                        {this.renderSquare(SpecialBetsEnum._25_TO_36, 4)}
                    </div>
                    <div className='row'>
                        {this.renderSquare(SpecialBetsEnum._1_TO_18, 2)}
                        {this.renderSquare(SpecialBetsEnum.EVEN, 2)}
                        {this.renderSquare(SpecialBetsEnum.RED, 2)}
                        {this.renderSquare(SpecialBetsEnum.BLACK, 2)}
                        {this.renderSquare(SpecialBetsEnum.ODD, 2)}
                        {this.renderSquare(SpecialBetsEnum._19_TO_36, 2)}
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: StoreState) {
  const bets = state.bets;
  return {
    bets
  };
}

export default connect(mapStateToProps)(Tapis);