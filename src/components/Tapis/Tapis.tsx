import React, { useState } from 'react'
import Square from '../Square/Square';
import './Tapis.css';
import { getNumberColor } from '../../helpers/roulette-helper';
import { ChipStakeEnum, SpecialBetsEnum } from '../../helpers/constants';
import { getSelectedSqrIds } from './Tapis-helper';
import Chip from '../Chip/Chip';
import { Bet } from "./../../models/bet.model";
import { PositionEnum } from "./../../models/position.enum";
import { useSelector } from 'react-redux';
import { StoreState } from '../../app/store.model';
import { createBet } from '../../helpers/bet-helper';

type TapisProps = {
    isBettingLocked: boolean,
    addBet: Function
}

export default function Tapis(props: TapisProps): React.ReactElement {
    const [selectedSqrIds, setSelectedSqrIds] = useState<string[]>([]);
    const bets = useSelector((state: StoreState) => state.bets);
    const selectedStake = useSelector((state: StoreState) => state.selectedStake);
    
    const handleSquareMouseEvents = (id: string, position: PositionEnum, event: any) => {
        // console.log(id);
        if (event.type === "click" && !props.isBettingLocked) {
            // console.log("click", event);
            let squaresIdsAndNumbers = getSelectedSqrIds(id, position);
            let newBet: Bet = createBet(squaresIdsAndNumbers.betId, id, squaresIdsAndNumbers.numbers, selectedStake, {
                position: isNaN(+squaresIdsAndNumbers.ids[0])
                    && !squaresIdsAndNumbers.ids[0].startsWith(SpecialBetsEnum.LINE_X)
                    && !squaresIdsAndNumbers.ids[0].match(/^\d{1,2} to \d{2}$/)
                    ? PositionEnum.CENTER : position
            })

            props.addBet(newBet);
        }
        else if (event.type === "mousemove") {
            setSelectedSqrIds(getSelectedSqrIds(id, position).ids);
        }
        else if (event.type === "mouseleave") {
            setSelectedSqrIds([]);
        }
    }

    const renderSquare = (value: string, colspan: number = 1): React.ReactNode => {
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
                onMouseEvents={handleSquareMouseEvents}
                isSelected={selectedSqrIds.indexOf(value) >= 0}
                children={bets.filter(b => b.sqrId === value).map(b => {
                    return <Chip key={b.id} stake={b.stake} position={b.chip.position}></Chip>
                })} />
        )
    }

    const renderLineX = (startNumber: number): React.ReactNode => {
        let n: number;
        return new Array(13).fill(0).map((v, i) => {
            n = startNumber + (i * 3);
            if (n <= 36)
                return renderSquare(`${n}`);
            else
                return renderSquare(`line ${n - 36}`);
        });
    }

    const renderChipChoices = (): React.ReactNode => {
        return Object.values(ChipStakeEnum).filter(v => !isNaN(+v)).map((v) => {
            let stakeValue = v as ChipStakeEnum;
            return <td key={stakeValue}>
                <Chip stake={stakeValue} position={PositionEnum.TOP}
                    isClickable={true} />
            </td>
        })
    }

    return (
        <div id='tapis'>
            <div className="chips-list" style={{ position: "relative" }}>
                <table>
                    <tbody>
                        <tr>
                            {renderChipChoices()}
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className='row'>
                <div>
                    {renderSquare('0')}
                </div>
                <div>
                    <div className='row'>
                        {renderLineX(3)}
                    </div>
                    <div className='row'>
                        {renderLineX(2)}
                    </div>
                    <div className='row'>
                        {renderLineX(1)}
                    </div>
                </div>
            </div>
            <div className='big-squares-row'>
                <div className='row'>
                    {renderSquare(SpecialBetsEnum._1_TO_12, 4)}
                    {renderSquare(SpecialBetsEnum._13_TO_24, 4)}
                    {renderSquare(SpecialBetsEnum._25_TO_36, 4)}
                </div>
                <div className='row'>
                    {renderSquare(SpecialBetsEnum._1_TO_18, 2)}
                    {renderSquare(SpecialBetsEnum.EVEN, 2)}
                    {renderSquare(SpecialBetsEnum.RED, 2)}
                    {renderSquare(SpecialBetsEnum.BLACK, 2)}
                    {renderSquare(SpecialBetsEnum.ODD, 2)}
                    {renderSquare(SpecialBetsEnum._19_TO_36, 2)}
                </div>
            </div>
        </div>
    )
}
