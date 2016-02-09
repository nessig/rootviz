from flask import Flask, render_template, url_for, copy_current_request_context
from flask.ext.socketio import SocketIO, emit
import zmq
from time import sleep



app = Flask(__name__)
# app.config['SECRET_KEY'] = 'secret!'
app.config['DEBUG'] = True

# #turn the flask app into a socketio app
socketio = SocketIO(app)


port = "5555"
context = zmq.Context()
socket = context.socket(zmq.REQ)
socket.connect ("tcp://localhost:%s" % port)
port2 = "5556"
context2 = zmq.Context()
socket2 = context2.socket(zmq.SUB)
socket2.connect ("tcp://localhost:%s" % port2)

# portAbort = "5557"
# contextAbort = zmq.Context()
# socketAbort = contextAbort.socket(zmq.REP)
# socketAbort.connect ("tcp://localhost:%s" % portAbort)


@app.route("/api/<N>/<M>/<x0>/<x1>/<y0>/<y1>/<degree>")
def progressAPI(N, M, x0, x1, y0, y1, degree):
    msg = str(degree) + " " + str(N) + " " + str(M)  + " " + str(x0) + " " + str(x1) + " " + str(y0)  + " " + str(y1)
    socket.send(msg)
    socket2.setsockopt_string(zmq.SUBSCRIBE, u"")
    i = 0.0
    while i < 100.0:
        s2 = socket2.recv()
        a = s2.split()[0]
        i = 100.0*float(a)/int(M)
        print(i)

    s1 = socket.recv()
    return s1


@app.route("/")
def index():
    return render_template("index.html")

@socketio.on('connect', namespace='/test')
def connect():
    print("connected")

# @socketio.on('abort', namespace='/test')
# def abort(abort):
#     socketAbort.send("abort")


@socketio.on('getRoots', namespace='/test')
def send_roots(getRoots):
    data = getRoots[u'data']
    M = float(data[u'M'])
    msg = str(data[u"degree"]) + " " + str(data[u"N"]) + " " + str(data[u"M"]) + " " + str(data[u"x0"]) + " " + str(data[u"x1"]) + " " + str(data[u"y0"])  + " " + str(data[u"y1"])
    socket.send(msg)
    socket2.setsockopt_string(zmq.SUBSCRIBE, u"")
    i = 0.0
    while i < 100.0:
        s2 = socket2.recv()
        a = s2
        old_i = i
        i = 100.0*float(a.split()[0])/M
        if int(old_i) != int(i):
            socketio.emit('newnumber', {'number': int(i)}, namespace='/test')
        sleep(0.00001)
        
    s1 = socket.recv()
    socketio.emit("roots", {"roots": s1}, namespace='/test')


if __name__ == '__main__':
   socketio.run(app)

