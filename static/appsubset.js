$(document).ready(function() {

	var R = 1.5;
    var N = Math.floor(document.getElementById("box").clientWidth / 1.5);
    var canvas = document.getElementById('canvas');

    var ctx = canvas.getContext('2d');

    canvas.width = N;
    canvas.height = N;

    $(window).resize(function() {
        var N = Math.floor(document.getElementById("box").clientWidth / 1.5);
        var canvas = document.getElementById('canvas');
        canvas.width = N;
        canvas.height = N;

    });

    var x0 = document.getElementById("x0");
    var y0 = document.getElementById("y0");
    var x1 = document.getElementById("x1");
    var y1 = document.getElementById("y1");
    var degree = document.getElementById("degree");

    function isInt(n) {
        return Number(n) === n && n % 1 === 0;
    }

    function isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
    }

    function isNum(n) {
        return Number(n) === n;
    }

    var bootstrap_alert = function() {};
    bootstrap_alert.warning = function(message) {
        $('#error').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">×</a><span>' + message + '</span></div>');
    };

    function verifyInputs(inputs) {
        if (!(inputs["x0"])) throw "x0 is a required field";
        if (!(inputs["x1"])) throw "x1 is a required field";
        if (!(inputs["y0"])) throw "y0 is a required field";
        if (!(inputs["y1"])) throw "y1 is a required field";
        if (!(inputs["N"])) throw "Screen width error";
        if (!(inputs["M"])) throw "Screen height error";
        if (!(inputs["degree"])) throw "degree is a required field";
        if (!(isInt(inputs["N"]))) throw "Screen width must be an integer";
        if (!(isInt(inputs["M"]))) throw "Screen height must be an integer";

        if (!(isInt(inputs["degree"]))) throw "degree must be an integer";
        if (!(isNum(inputs["x0"]))) throw "x0 must be a number";
        if (!(isNum(inputs["x1"]))) throw "x1 must be a number";
        if (!(isNum(inputs["y0"]))) throw "y0 must be a number";
        if (!(isNum(inputs["y1"]))) throw "y1 must be a number";

        if ((inputs["x0"] >= inputs["x1"])) throw "Minimum x must be less than maximum x";
        if ((inputs["y0"] >= inputs["y1"])) throw "Minimum y must be less than maximum y";

    }

    function init() {
        canvas.addEventListener('mousedown', mouseDown, false);
        canvas.addEventListener('mouseup', mouseUp, false);
        canvas.addEventListener('mousemove', mouseMove, false);
    }

    var dst;
    var rect = {},
        drag = false;

    function mouseDown(e) {
        var N = Math.floor(document.getElementById("box").clientWidth / 1.5);
        dst = ctx.getImageData(0, 0, N, N); //x,y,w,h
        var bcr = canvas.getBoundingClientRect();
        rect.startX = e.clientX - bcr.left;
        rect.startY = e.clientY - bcr.top;
        drag = true;
    }

    function mouseUp() {
        drag = false;
        var values = {};
        var N = Math.floor(document.getElementById("box").clientWidth / 1.5);

        values.degree = degree.value;

        var x0p = Math.min(rect.startX, rect.startX + rect.w);
        var x1p = Math.max(rect.startX, rect.startX + rect.w);
        var y0p = Math.min(rect.startY, rect.startY + rect.h);
        var y1p = Math.max(rect.startY, rect.startY + rect.h);

        var xlen = (Number(x1.value) - Number(x0.value));
        var ylen = (Number(y1.value) - Number(y0.value));
        values.x0 = Number(x0.value) + xlen * x0p / N;
        values.x1 = Number(x0.value) + xlen * x1p / N;
        values.y0 = Number(y0.value) + ylen * y0p / N;
        values.y1 = Number(y0.value) + ylen * y1p / N;

        $('#error').html("");

        var ajax_data = {};
        $('.user_input').each(function() {
            ajax_data[$(this).attr('name')] = Number(values[$(this).attr('name')]);
        });
        ajax_data["N"] = canvas.width;
        ajax_data["M"] = canvas.width;
        try {
            verifyInputs(ajax_data);
            x0.value = values.x0;
            y0.value = values.y0;
            x1.value = values.x1;
            y1.value = values.y1;

            socket.emit('getRoots', {
                data: ajax_data
            });
        } catch (error) {
            bootstrap_alert.warning(error);
            // $('#error').html(error);
            ctx.putImageData(dst, 0, 0);
        }
        return false;
    }

    function mouseMove(e) {
        var bcr = canvas.getBoundingClientRect();
        if (drag) {
            rect.w = (e.clientX - bcr.left) - rect.startX;
            rect.h = (e.clientY - bcr.top) - rect.startY;
            ctx.putImageData(dst, 0, 0);
            draw();
        }
    }

    function draw() {
        ctx.setLineDash([5, 10]);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;

        ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
    }

    init();

    var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');

    socket.on('newnumber', function(msg) {
        $('#progress-bar').html(msg.number.toString() + "%");
        $('#progress-bar').attr("aria-valuenow", msg.number.toString());
        $('#progress-bar').css("width", msg.number.toString() + "%");
    });

    $('form#emit').submit(function(event) {
        event.preventDefault();
        // console.log( $( this ).serialize() );
        $('#error').html("");

        var ajax_data = {};
        $('.user_input').each(function() {
            ajax_data[$(this).attr('name')] = Number($(this).val());
        });
        ajax_data["N"] = canvas.width;
        ajax_data["M"] = canvas.width;
        try {
            verifyInputs(ajax_data);
            socket.emit('getRoots', {
                data: ajax_data
            });
        } catch (error) {
            // $('#error').html(error);
            bootstrap_alert.warning(error);
        }
        return false;
    });

    var defaultParams = {};
    defaultParams.x0 = -1.7;
    defaultParams.x1 = 1.7;
    defaultParams.y0 = -1.7;
    defaultParams.y1 = 1.7;
    defaultParams.degree = 10;

    $('button#reset').click(function(event) {
        $('#error').html("");

        var ajax_data = {};
        $('.user_input').each(function() {
            ajax_data[$(this).attr('name')] = defaultParams[$(this).attr('name')];
            $(this).val(defaultParams[$(this).attr('name')]);
        });
        ajax_data["N"] = canvas.width;
        ajax_data["M"] = canvas.width;

        try {
            verifyInputs(ajax_data);
            socket.emit('getRoots', {
                data: ajax_data
            });
        } catch (error) {
            bootstrap_alert.warning(error);
        }

        return false;
    });

    // $('button#abort').click(function(event) {
    //     // var ajax_data = {};
    //     // $('.user_input').each(function() {
    //     //     ajax_data[$(this).attr('name')] = defaultParams[$(this).attr('name')];
    // 	// 	$(this).val(defaultParams[$(this).attr('name')]);
    //     // });
    //     // ajax_data["N"] = canvas.width;
    //     // ajax_data["M"] = canvas.width;
    //     socket.emit('abort', {
    //         data: "abort"
    //     });
    //     return false;
    // });


    socket.on('roots', function(msg) {
        var arr = JSON.parse(msg.roots);
        renderResponse(arr, ctx);
        // var glyphs = document.getElementsByClassName("glyphicon-refresh");
        // for (var i = 0; i < glyphs.length; i++) {
        //     glyphs[i].className = "glyphcon";
        // }

    });


    function renderResponse(arr, ctx) {
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

        resetProgress();
    }

    function resetProgress() {
        $('#progress-bar').html("&nbsp;&nbsp;0%");
        $('#progress-bar').attr("aria-valuenow", "0");
        $('#progress-bar').css("width", "0%");
    }

});
