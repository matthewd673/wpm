var surface;
var context;
var data = [];

var min_x = 99999.0;
var max_x = -99999.0;
var min_y = 99999.0;
var max_y = -99999.0;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        //update min and max x
        if (x < min_x)
            min_x = x;
        if (x > max_x)
            max_x = x;
        if (y < min_y)
            min_y = y;
        if (y > max_y)
            max_y = y;

    }
}

function add_point(x, y) {
    data.push(new Point(x, y));
    draw();
}

function draw_something() {
    context.fillStyle = "red";
    context.fillRect(20, 20, 50, 50);
}

function assign_canvas(canvas) {
    surface = canvas;
    context = surface.getContext('2d');
}

function draw() {

    context.clearRect(0, 0, surface.width, surface.height);

    var width_scale = surface.getBoundingClientRect().width / (max_x - min_x);
    var height_scale = surface.getBoundingClientRect().height / (max_y - min_y);

    context.strokeStyle = "#4e4e4e";
    for (var i = 0; i < data.length - 1; i++) {
        var p = data[i];
        var p_next = data[i + 1];

        var draw_x = (p.x - min_x) * width_scale;
        var draw_y = (p.y - min_y) * height_scale;

        var next_draw_x = (p_next.x - min_x) * width_scale;
        var next_draw_y = (p_next.y - min_y) * height_scale;

        context.beginPath();
        context.moveTo(draw_x, draw_y);
        context.lineTo(next_draw_x, next_draw_y);
        context.stroke();
    }

}