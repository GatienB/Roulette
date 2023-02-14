import { PositionEnum } from '../models/position.enum';
import { getMousePosition } from './mouse-helper';

test('test mouse position', () => {
    let event = {
        clientX: 102,
        clientY: 105,
        target: {
            offsetLeft: 100,
            offsetTop: 100,
            clientHeight: 56,
            clientWidth: 56,
        }
    };

    expect(getMousePosition(event)).toBe(PositionEnum.TOP_LEFT);
    Object.assign(event, { clientX: 150, clientY: 105 });
    expect(getMousePosition(event)).toBe(PositionEnum.TOP);
    Object.assign(event, { clientX: 155, clientY: 105 });
    expect(getMousePosition(event)).toBe(PositionEnum.TOP_RIGHT);
    Object.assign(event, { clientX: 151, clientY: 150 });
    expect(getMousePosition(event)).toBe(PositionEnum.RIGHT);
    Object.assign(event, { clientX: 153, clientY: 155 });
    expect(getMousePosition(event)).toBe(PositionEnum.BOTTOM_RIGHT);
    Object.assign(event, { clientX: 120, clientY: 154 });
    expect(getMousePosition(event)).toBe(PositionEnum.BOTTOM);
    Object.assign(event, { clientX: 103, clientY: 153 });
    expect(getMousePosition(event)).toBe(PositionEnum.BOTTOM_LEFT);
});

