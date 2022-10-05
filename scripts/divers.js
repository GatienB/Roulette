
function displayCircle2() {
    const _splits = document.getElementById("input_splits").value;
    let c = document.getElementById("roulette");
    // let c = new HTMLCanvasElement()
    let ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 500, 500)
    let width = c.clientWidth, height = c.clientHeight;
    const radius = 100;
    console.log(c.clientWidth, c.clientHeight)
    // Method 1 >
    // ctx.beginPath()
    // ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI)
    // ctx.stroke()
    // <
    const _angle = 2 * Math.PI / _splits;
    for (let nbSplit = 0; nbSplit < _splits; nbSplit++) {
        let angle = _angle * nbSplit;
        ctx.beginPath()
        // Method 1 >
        // ctx.moveTo(width / 2, height / 2);
        // ctx.lineTo(Math.cos(angle) * radius + width / 2, Math.sin(angle) * radius + height / 2)
        // ctx.moveTo(width / 2, height / 2);
        // ctx.lineTo(Math.cos(angle+ _angle) * radius + width / 2, Math.sin(angle+_angle) * radius + height / 2)
        // <
        ctx.moveTo(width / 2, height / 2);
        ctx.arc(width / 2, height / 2, radius, angle, angle + _angle)
        ctx.lineTo(width / 2, height / 2);
        ctx.fillStyle = nbSplit % 2 == 0 ? "black" : "red";
        ctx.fill()
        ctx.stroke()
    }

    // ctx.moveTo(width / 2, height / 2);
    // let angle = _angle
    // ctx.moveTo(width / 2, height / 2)
    // ctx.lineTo(Math.cos(angle)*radius + width/2, Math.sin(angle)*radius + height/2)
    // ctx.stroke()
}



function rotation() {
    let canvas = document.getElementById("canvas")
    const width = 150,
        height = 20;

    // canvas center X and Y
    const centerX = canvas.width / 2,
        centerY = canvas.height / 2;

    const ctx = canvas.getContext('2d');

    // a red rectangle
    ctx.fillStyle = 'red';
    ctx.fillRect(centerX, centerY, width, height);

    // move the origin to the canvas' center
    ctx.translate(centerX, centerY);

    // add 45 degrees rotation
    // ctx.rotate(45 * Math.PI / 180);
    ctx.rotate(Math.PI / 2);

    // draw the second rectangle
    ctx.fillStyle = 'rgba(0,0,255,0.5)';
    ctx.fillRect(0, 0, width, height);

    ctx.rotate(Math.PI / 2);

    // draw the second rectangle
    ctx.fillStyle = 'rgba(0,50,255,0.5)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeText("12", 0, 0)
}

    // rotation()

    
// function draw() {
//     var ctx = document.getElementById('canvas').getContext('2d');
//     ctx.translate(75, 75);
//     for (i = 1; i < 6; i++) {
//         ctx.save();
//         ctx.fillStyle = 'rgb(' + (51 * i) + ',' + (255 - 51 * i) + ',255)';
//         for (j = 0; j < i * 6; j++) {
//             ctx.rotate(Math.PI * 2 / (i * 6));
//             ctx.beginPath();
//             ctx.arc(0, i * 12.5, 5, 0, Math.PI * 2, true);
//             ctx.fill();
//         }
//         ctx.restore();
//         break
//     }
// }