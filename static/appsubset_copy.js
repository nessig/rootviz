(function() {

    var N = document.getElementById("box").clientWidth;
    var canvas = document.getElementById('canvas');

    var ctx = canvas.getContext('2d');

    canvas.width = N;
    canvas.height = N;

    var x0 = document.getElementById("x0");
    var y0 = document.getElementById("y0");
    var x1 = document.getElementById("x1");
    var y1 = document.getElementById("y1");
    var degree = document.getElementById("degree");



    // function init() {
    //     canvas.addEventListener('mousedown', mouseDown, false);
    //     canvas.addEventListener('mouseup', mouseUp, false);
    //     canvas.addEventListener('mousemove', mouseMove, false);
    // }

    // var dst;
    // var rect = {},
    //     drag = false;

    // function mouseDown(e) {
    //     dst = ctx.getImageData(0, 0, N, N); //x,y,w,h
    //     var bcr = canvas.getBoundingClientRect();
    //     rect.startX = e.clientX - bcr.left;
    //     rect.startY = e.clientY - bcr.top;
    //     drag = true;
    // }

    // function mouseUp() {
    //     drag = false;
    //     var values = {};

    //     values.degree = degree.value;

    //     var x0p = Math.min(rect.startX, rect.startX + rect.w);
    //     var x1p = Math.max(rect.startX, rect.startX + rect.w);
    //     var y0p = Math.min(rect.startY, rect.startY + rect.h);
    //     var y1p = Math.max(rect.startY, rect.startY + rect.h);

    //     var xlen = (Number(x1.value) - Number(x0.value));
    //     var ylen = (Number(y1.value) - Number(y0.value));
    //     values.x0 = Number(x0.value) + xlen * x0p / N;
    //     values.x1 = Number(x0.value) + xlen * x1p / N;
    //     values.y0 = Number(y0.value) + ylen * y0p / N;
    //     values.y1 = Number(y0.value) + ylen * y1p / N;

    //     x0.value = values.x0;
    //     y0.value = values.y0;
    //     x1.value = values.x1;
    //     y1.value = values.y1;

    //     var url = makeUrl(values);
    //     loadDoc(url, renderResponse, ctx);

    // }

    // function mouseMove(e) {
    //     var bcr = canvas.getBoundingClientRect();
    //     if (drag) {
    //         rect.w = (e.clientX - bcr.left) - rect.startX;
    //         rect.h = (e.clientY - bcr.top) - rect.startY;
    //         ctx.putImageData(dst, 0, 0);
    //         draw();
    //     }
    // }

    // function draw() {
    //     ctx.setLineDash([5, 10]);
    //     ctx.strokeStyle = '#ffffff';
    //     ctx.lineWidth = 3;

    //     ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
    // }

    // init();

    // var form = document.getElementById("frm");
    // form.addEventListener("submit", function(e) {
    //     e.preventDefault();
    //     var values = {};
    //     for (var i = 0; i < this.length; i++) {
    //         var name = this.elements[i].name;
    //         var value = this.elements[i].value;
    //         values[name] = value;
    //     };
    //     var url = makeUrl(values);
    //     loadDoc(url, renderResponse, ctx);
    // });


    // document.getElementById("reset").addEventListener("click", function() {
    //     var params = {};
    //     params.x0 = -1.7;
    //     params.x1 = 1.7;
    //     params.y0 = -1.7;
    //     params.y1 = 1.7;
    //     params.degree = 10;

    //     x0.value = params.x0;
    //     y0.value = params.y0;
    //     x1.value = params.x1;
    //     y1.value = params.y1;
    //     degree.value = params.degree;

    //     var url = makeUrl(params);
    //     loadDoc(url, renderResponse, ctx);
    // }, false);


    function makeUrl(params) {
        var N, M, x0, x1, y0, y1, degree, R, urlBase, url, x, y;
        urlBase = "http://localhost:5000/api";

        // N = document.getElementById("box").clientWidth;
        N = canvas.width;

        M = N;
        degree = params.degree;
        x0 = params.x0;
        x1 = params.x1;
        y0 = params.y0;
        y1 = params.y1;

        url = urlBase + "/" + N + "/" + M + "/" + x0 + "/" + x1 + "/" + y0 + "/" + y1 + "/" + degree;
        return url;
    }


    var addAnimation = function() {
        this.children[0].className += " glyphicon-refresh glyphicon-refresh-animate";
    };
    var buttons = document.getElementsByClassName("btn");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', addAnimation, false);
    }


    // $(document).ready(function() {
    //connect to the socket server.
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
    // var numbers_received = [];

    socket.on('newnumber', function(msg) {
        $('#log').html("<p>" + msg.number.toString() + "</p>");
    });

    $('form#emit').submit(function(event) {
        event.preventDefault();
        // console.log( $( this ).serialize() );
        var ajax_data = {};
        $('.user_input').each(function() {
            ajax_data[$(this).attr('name')] = $(this).val();
        });
        ajax_data["N"] = 1200;
        ajax_data["M"] = 1200;
        socket.emit('roots', {
            data: ajax_data
        });
        return false;
    });
    // });


    // function loadDoc(url, cFunc, ctx) {
    //     var xhttp = new XMLHttpRequest();
    //     xhttp.onreadystatechange = function() {
    //         if (xhttp.readyState == 4) {
    //             if (xhttp.status == 200) {
    //                 cFunc(xhttp, ctx);
    //             } else {
    //                 console.log("ERROR", xhttp.status);
    //             }
    //             var glyphs = document.getElementsByClassName("glyphicon-refresh");
    //             for (var i = 0; i < glyphs.length; i++) {
    //                 glyphs[i].className = "glyphcon";
    //             }
    //         }
    //     };
    //     xhttp.open("GET", url, true);
    //     xhttp.send();
    // }


    // function loadDoc(url, cFunc, ctx) {
    //     var xhttp = new XMLHttpRequest();
    //     xhttp.onreadystatechange = function() {
    //         if (xhttp.readyState == 4) {
    //             if (xhttp.status == 200) {
    //                 cFunc(xhttp, ctx);
    //             } else {
    //                 console.log("ERROR", xhttp.status);
    //             }
    //             var glyphs = document.getElementsByClassName("glyphicon-refresh");
    //             for (var i = 0; i < glyphs.length; i++) {
    //                 glyphs[i].className = "glyphcon";
    //             }
    //         }
    //     };
    //     xhttp.open("GET", url, true);
    //     xhttp.send();
    // }


    function renderResponse(xmlhttp, ctx) {
        var arr = JSON.parse(xmlhttp.responseText);
        var N = arr.N;
        var M = arr.M;

        var palette = ctx.getImageData(0, 0, N, M); //x,y,w,h
        palette.data.set(new Uint8ClampedArray(arr.roots));
        ctx.putImageData(palette, 0, 0);
        // draw axes
        styleImage(ctx, N);
    }


    function styleImage(ctx, N) {
        ctx.setLineDash([5, 10]);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, N / 2);
        ctx.lineTo(N, N / 2);
        ctx.moveTo(N / 2, 0);
        ctx.lineTo(N / 2, N);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";

        var numTicks = 5;
        var yOff = 11;
        var xOff = 38;

        for (var i = 0; i < numTicks; i++) {
            var xtick = (Number(x0.value) + (Number(x1.value) - Number(x0.value)) * i / numTicks).toPrecision(4);
            var ytick = (Number(y0.value) + (Number(y1.value) - Number(y0.value)) * i / numTicks).toPrecision(4);
            ctx.fillText(xtick, i * N / numTicks, N / 2 + yOff);
            if (i != numTicks / 2) {
                ctx.fillText(xtick, N / 2 - xOff, i * N / numTicks);
            }
        }
    }

})();
