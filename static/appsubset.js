$(document).ready(function() {

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



    function init() {
        canvas.addEventListener('mousedown', mouseDown, false);
        canvas.addEventListener('mouseup', mouseUp, false);
        canvas.addEventListener('mousemove', mouseMove, false);
    }

    var dst;
    var rect = {},
        drag = false;

    function mouseDown(e) {
        dst = ctx.getImageData(0, 0, N, N); //x,y,w,h
        var bcr = canvas.getBoundingClientRect();
        rect.startX = e.clientX - bcr.left;
        rect.startY = e.clientY - bcr.top;
        drag = true;
    }

    function mouseUp() {
        drag = false;
        var values = {};

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

        x0.value = values.x0;
        y0.value = values.y0;
        x1.value = values.x1;
        y1.value = values.y1;

        var ajax_data = {};
        $('.user_input').each(function() {
            ajax_data[$(this).attr('name')] = values[$(this).attr('name')];
        });
        ajax_data["N"] = canvas.width;
        ajax_data["M"] = canvas.width;
        socket.emit('getRoots', {
            data: ajax_data
        });
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
        var ajax_data = {};
        $('.user_input').each(function() {
            ajax_data[$(this).attr('name')] = $(this).val();
        });
        ajax_data["N"] = canvas.width;
        ajax_data["M"] = canvas.width;
        socket.emit('getRoots', {
            data: ajax_data
        });
        return false;
    });

	var defaultParams = {};
	defaultParams.x0 = -1.7;
	defaultParams.x1 = 1.7;
	defaultParams.y0 = -1.7;
	defaultParams.y1 = 1.7;
	defaultParams.degree = 10;

    $('button#reset').click(function(event) {
        var ajax_data = {};
        $('.user_input').each(function() {
            ajax_data[$(this).attr('name')] = defaultParams[$(this).attr('name')];
			$(this).val(defaultParams[$(this).attr('name')]);
        });
        ajax_data["N"] = canvas.width;
        ajax_data["M"] = canvas.width;
        socket.emit('getRoots', {
            data: ajax_data
        });
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
    }

});
