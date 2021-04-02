var surface;
var context;
var data = [];

var minX = 99999.0;
var maxX = -99999.0;
var minY = 99999.0;
var maxY = -99999.0;

var w = 0;
var h = 0;
var padding = 0.05;
var padX = 0;
var padY = 0;
var renderW = 0;
var renderH = 0;

var hoveredPointIndex = -1;

var lineColor = 'white';
var pointColor = 'white';
var textColor = 'black';
var textBackdropColor = 'white';
var textBackdropPadding = 2;
var textFont = '12pt Arial';
var lineWidth = 2;
var pointRadius = 3;
var pointFilled = true;

var textFormat = '({x}, {y}): "{a}"';

class Point {
    constructor(x, y, annotation = '') {
        this.x = x;
        this.y = y;
        this.annotation = annotation;

        //update min and max x
        if (x < minX)
            minX = x;
        if (x > maxX)
            maxX = x;
        if (y < minY)
            minY = y;
        if (y > maxY)
            maxY = y;

    }
}

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function assignCanvas(canvas) {
    surface = canvas;
    context = surface.getContext('2d');

    //calculate width, height, and padding
    w = surface.getBoundingClientRect().width;
    h = surface.getBoundingClientRect().height;
    padX = w * padding;
    padY = h * padding;
    renderW = w - (padX * 2);
    renderH = h - (padY * 2);

    //set font
    context.font = textFont;

    //add mousemove listener
    surface.addEventListener('mousemove', e => { mouseMove(e); });
}

function addPoint(x, y, annotation = '') {
    data.push(new Point(x, y, annotation));
    draw();
}

//customization
function setTooltipTextFormat(format) { textFormat = format; }
function setLineColor(color) { lineColor = color; }
function setPointColor(color) { pointColor = color; }
function setTextColor(color) { textColor = color; }
function setTextFont(fontInfo) { textFont = fontInfo; }
function setTooltipColor(color) { textBackdropColor = color; }
function setTooltipPadding(padding) { textBackdropPadding = padding; }
function setLineWidth(width) { lineWidth = width; }
function setPointRadius(rad) { pointRadius = rad; }
function setPointFill(filled) { pointFilled = filled; }

var mousePos = new Vector2(0, 0);
function mouseMove(e) {
    mousePos.x = e.offsetX;
    mousePos.y = e.offsetY;
    
    var closestIndex = getClosestPointIndex(mousePos);
    if (hoveredPointIndex != closestIndex) {
        hoveredPointIndex = closestIndex;
        draw();
    }
}

function draw() {

    context.clearRect(0, 0, surface.width, surface.height);

    context.fillStyle = pointColor;
    context.strokeStyle = lineColor;
    context.lineWidth = 2;
    for (var i = 0; i < data.length; i++) {
        var p = data[i];

        var drawV = getDrawPos(p);

        //draw connecting line if there's another point
        if (i < data.length - 1) {
            var pNext = data[i + 1];
            
            var nextDrawV = getDrawPos(pNext);

            context.beginPath();
            context.moveTo(drawV.x, drawV.y);
            context.lineTo(nextDrawV.x, nextDrawV.y);
            context.stroke();
            context.closePath();

        }
    }

    //draw highlighted point
    if (hoveredPointIndex != -1) {
        var p = data[hoveredPointIndex];
        var drawV = getDrawPos(p);

        context.beginPath();
        context.arc(
            drawV.x,
            drawV.y,
            pointRadius,
            0,
            2 * Math.PI
            );
        
        if (pointFilled) {
            context.fill();
            context.closePath();
        } else {
            context.stroke();
        }

        //draw textbox
        //build text content
        context.font = textFont;
        var renderString = textFormat;
        renderString = renderString.replace('{x}', p.x);
        renderString = renderString.replace('{y}', p.y);
        renderString = renderString.replace('{a}', p.annotation);

        var textSize = context.measureText(renderString);
        var textWidth = textSize.width;
        var textHeight = textSize.fontBoundingBoxAscent + textSize.fontBoundingBoxDescent;

        //get preliminary text position
        var textX = drawV.x - (textWidth + textBackdropPadding * 2) / 2;
        var textY = drawV.y - (textHeight + textBackdropPadding * 2);

        //reposition pop-up to avoid clipping
        if (textX < 0)
            textX = 0;
        if (textY < 0)
            textY = drawV.y + (textHeight + textBackdropPadding * 2);
        if (textX + textWidth > w)
            textX = w - textWidth - textBackdropPadding * 2;
        if (textY + textHeight > h)
            textY = h - textHeight - textBackdropPadding * 2;

        //draw backdrop
        context.fillStyle = textBackdropColor;
        context.fillRect(
            textX - textBackdropPadding,
            textY - textBackdropPadding,
            textWidth + textBackdropPadding * 2,
            textHeight + textBackdropPadding * 2,
            );

        //draw text
        context.fillStyle = textColor;
        context.fillText(renderString, textX, textY + textSize.fontBoundingBoxAscent);

    }

}

function getClosestPointIndex(v) {
    var widthPercent = (v.x - padX) / renderW; //find horizontal proportion of mouse x to box render w

    //if out of bounds, turn off hover
    if (widthPercent < 0)
        return -1;
    if (widthPercent > 1)
        return -1;

    return Math.round(widthPercent * data.length);
}

function getDrawPos(p) {
    //find x
    var dataWidth = maxX - minX;
    if (dataWidth == 0)
        dataWidth = 1;
    var widthScale = renderW / dataWidth;
    var drawX = (p.x - minX) * widthScale + padX;

    //find y
    var dataHeight = maxY - minY;
    if (dataHeight == 0)
        dataHeight = 1;
    var heightScale = renderH / dataHeight;
    var drawY = h - padY - ((p.y - minY) * heightScale);

    return new Vector2(drawX, drawY);
}