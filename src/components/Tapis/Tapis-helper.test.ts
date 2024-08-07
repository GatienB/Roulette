import { Constants, SpecialBetsEnum } from "../../helpers/constants";
import { getNumberColor, getRouletteNumberFrom0To2piCounterclockwise } from "../../helpers/roulette-helper";
import { PositionEnum } from "../../models/position.enum";
import { getSelectedSqrIds } from "./Tapis-helper";

test('test tapis selected squares', () => {
    expect(getSelectedSqrIds("1", PositionEnum.TOP).ids).toStrictEqual(["1", "2"]);
    expect(getSelectedSqrIds("1", PositionEnum.BOTTOM).ids).toStrictEqual(["1", "2", "3"]);
    expect(getSelectedSqrIds("1", PositionEnum.TOP).numbers).toStrictEqual([1, 2]);
    expect(getSelectedSqrIds("1", PositionEnum.BOTTOM).numbers).toStrictEqual([1, 2, 3]);
});

test('test tapis selected special squares', () => {
    expect(getSelectedSqrIds(SpecialBetsEnum.BLACK, PositionEnum.TOP).ids)
        .toStrictEqual([SpecialBetsEnum.BLACK, ...getRouletteNumberFrom0To2piCounterclockwise().sort().filter(n => getNumberColor(n) === Constants.colorSquareBlack()).map(v => '' + v)]);
    expect(getSelectedSqrIds(SpecialBetsEnum.EVEN, PositionEnum.TOP).ids)
        .toStrictEqual([SpecialBetsEnum.EVEN, ...getRouletteNumberFrom0To2piCounterclockwise().sort().filter(n => n !== 0 && n % 2 === 0).map(v => '' + v)]);
    expect(getSelectedSqrIds(SpecialBetsEnum._13_TO_24, PositionEnum.LEFT).ids)
        .toStrictEqual([SpecialBetsEnum._1_TO_12, SpecialBetsEnum._13_TO_24, ...getRouletteNumberFrom0To2piCounterclockwise().sort().filter(n => n !== 0 && n < 25).map(v => '' + v)]);
});
