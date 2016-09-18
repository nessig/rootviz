import zmq
from time import sleep

port = "5555"
context = zmq.Context()
socket = context.socket(zmq.REQ)
socket.connect ("tcp://localhost:%s" % port)
port2 = "5556"
context2 = zmq.Context()
socket2 = context2.socket(zmq.SUB)
socket2.connect ("tcp://localhost:%s" % port2)

degree, N, M, x0, x1, y0, y1 = tuple("10 585 585 -1.7 1.7 -1.7 1.7".split())

msg = "16 1000 1000 0.0 1.7 0.0 1.7"
socket.send(msg)
socket2.setsockopt_string(zmq.SUBSCRIBE, u"")

i = 0.0
while i < 100.0:
    s2 = socket2.recv()
    a = s2.split()[0]
    old_i = i
    i = 100.0*float(a)/float(M)
    # if int(old_i) != int(i):
    #     socketio.emit('newnumber', {'number': int(i)}, namespace='/test')
    # sleep(0.00001)
    # print(i)

s1 = socket.recv()

