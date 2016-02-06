from flask import Flask, render_template, jsonify, send_file, abort
import zmq

app = Flask(__name__)

port = "5555"
context = zmq.Context()
socket = context.socket(zmq.REQ)
socket.connect ("tcp://localhost:%s" % port)


@app.route("/api/<N>/<M>/<x0>/<x1>/<y0>/<y1>/<degree>")
def rootAPI(N, M, x0, x1, y0, y1, degree):
    msg = str(degree) + " " + str(N) + " " + str(M)  + " " + str(x0) + " " + str(x1) + " " + str(y0)  + " " + str(y1)
    socket.send(msg)
    s = socket.recv()
    return s

@app.route("/api/rootList/<N>/<M>/<x0>/<x1>/<y0>/<y1>/<degree>")
def rootListAPI(N, M, x0, x1, y0, y1, degree):
    msg = str(degree) + " " + str(N) + " " + str(M)  + " " + str(x0) + " " + str(x1) + " " + str(y0)  + " " + str(y1)
    socket.send(msg)
    s = socket.recv()
    return jsonify(roots=s.split())

    
# I like the subset view better as default
@app.route("/")
def index():
    return render_template("subset.html")


# @app.route("/")
# def index():
#     return render_template("index.html")

@app.route("/roots")
def roots():
    return render_template("roots.html")

@app.route("/box")
def box():
    return render_template("box.html")

@app.route("/subset")
def subset():
    return render_template("subset.html")

@app.route("/rgb")
def rgb():
    return render_template("rgb.html")


if __name__ == "__main__":
    app.run(debug=True)
