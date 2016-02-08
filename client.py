import zmq


port = "5555"
context = zmq.Context()
socket = context.socket(zmq.REQ)
socket.connect ("tcp://localhost:%s" % port)
port2 = "5556"
context2 = zmq.Context()
socket2 = context2.socket(zmq.SUB)
socket2.connect ("tcp://localhost:%s" % port2)


degree, N,M,x0,x1,y0,y1 = 10,1200,1200,-1.7,1.7,-1.7,1.7
msg = str(degree) + " " + str(N) + " " + str(M)  + " " + str(x0) + " " + str(x1) + " " + str(y0)  + " " + str(y1)

socket.send(msg)
# socket2.setsockopt_string(zmq.SUBSCRIBE, u"hello")
socket2.setsockopt_string(zmq.SUBSCRIBE, u"")
i = 0
while i < M:
    s2 = socket2.recv()
    # a = s2.split()[1]
    a = s2
    # i = int(a.rstrip("\x00"))
    # print("{0}%".format(100.0*i/M))
    i = int(a.split()[0])
    print i

s1 = socket.recv()
print s1[0:30]



# s2 = socket2.recv()

# if isinstance(zip_filter, bytes):
# with open('rgb.txt', 'r+') as f:
#     f.write(s1)
# print socket2.getsockopt()

# zip_filter = "10001"
# if isinstance(zip_filter, bytes):
#     zip_filter = zip_filter.decode('ascii')
    
# socket2.setsockopt_string(zmq.SUBSCRIBE, zip_filter)

# s2 = socket2.recv()
# print s2
