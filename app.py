from flask import Flask, render_template, url_for, copy_current_request_context
# from flask.ext.socketio import SocketIO, emit
import zmq
# from random import random
# from time import sleep
# from threading import Thread, Event



app = Flask(__name__)
# app.config['SECRET_KEY'] = 'secret!'
# app.config['DEBUG'] = True

# #turn the flask app into a socketio app
# socketio = SocketIO(app)

# #random number Generator Thread
# thread = Thread()
# thread_stop_event = Event()



port = "5555"
context = zmq.Context()
socket = context.socket(zmq.REQ)
socket.connect ("tcp://localhost:%s" % port)
port2 = "5556"
context2 = zmq.Context()
socket2 = context2.socket(zmq.SUB)
socket2.connect ("tcp://localhost:%s" % port2)



# @app.route("/api/<N>/<M>/<x0>/<x1>/<y0>/<y1>/<degree>")
# def rootAPI(N, M, x0, x1, y0, y1, degree):
#     msg = str(degree) + " " + str(N) + " " + str(M)  + " " + str(x0) + " " + str(x1) + " " + str(y0)  + " " + str(y1)
#     socket.send(msg)
#     s = socket.recv()
#     return s
    
# @app.route('/stream')
# def streamed_response():
#     @stream_with_context
#     def generate():
#         yield 'Hello '
#         yield "Nolan" #request.args['name']
#         yield '!'
#     return Response(generate())

@app.route("/api/<N>/<M>/<x0>/<x1>/<y0>/<y1>/<degree>")
def progressAPI(N, M, x0, x1, y0, y1, degree):
    msg = str(degree) + " " + str(N) + " " + str(M)  + " " + str(x0) + " " + str(x1) + " " + str(y0)  + " " + str(y1)
    socket.send(msg)
    socket2.setsockopt_string(zmq.SUBSCRIBE, u"")
    i = 0.0
    while i < 100.0:
        # i+=1
        s2 = socket2.recv()
        a = s2.split()[0]
#        i = 100.0*float(a.rstrip("\x00"))/int(M)
        i = 100.0*float(a)/int(M)
        # print("{0}%".format(100.0*i/int(M)))
        print(i)

    s1 = socket.recv()
    return s1


@app.route("/")
def index():
    return render_template("index.html")

# @app.route("/async")
# def async():
#     return render_template("async.html")

# class RandomThread(Thread):
#     def __init__(self):
#         self.delay = 1
#         super(RandomThread, self).__init__()

#     def randomNumberGenerator(self):
#         """
#         Generate a random number every 1 second and emit to a socketio instance (broadcast)
#         Ideally to be run in a separate thread?
#         """
#         #infinite loop of magical random numbers
#         print "Making random numbers"
#         while not thread_stop_event.isSet():
#             number = round(random()*10, 3)
#             print number
#             socketio.emit('newnumber', {'number': number}, namespace='/test')
#             sleep(self.delay)

#     def run(self):
#         self.randomNumberGenerator()


# @socketio.on('connect', namespace='/test')
# def test_connect():
#     # need visibility of the global thread object
#     global thread
#     print('Client connected')

#     #Start the random number generator thread only if the thread has not been started before.
#     if not thread.isAlive():
#         print "Starting Thread"
#         thread = RandomThread()
#         thread.start()

# @socketio.on('disconnect', namespace='/test')
# def test_disconnect():
#     print('Client disconnected')


if __name__ == '__main__':
#    socketio.run(app)
    app.run(debug=True)
