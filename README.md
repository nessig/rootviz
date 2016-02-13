# rootviz
rootviz is a simple web app for visulizing the distribution of zeros of the family of Littlewood polynomials, which are polynomials with coefficents equal to either +1 or -1. This distribution has many interesting properties, but my favorites are the fractal-like beauty and detail it exhibits:
![Degree 16 family of roots](/images/github_rootviz_example.png "Degree 16 family of roots")

## Usage/What's going on?
The application has three main components:

1. serve_roots.cpp, which calculates the 2D distribution of roots, then applys a colormap to these values, outputting a 2D array of rgb values.
2. appsubset.js, which controls the client side requests for roots, and renders the array of rgb values using an HTML5 canvas element.
3. app.py, which is a typical flask application.

The information flow for a user request of data goes from the client through a websocket to the flask application. Then the flask app sends the request information to the program serve_roots, which is running alongside the flask app. serve_roots computes the requested root distribution, and simultaniously sends its % progress back to the flask app, which sends this progress back to the client over the websocket to be displayed as a progress bar. Finally, when serve_roots finishes computing the distribution it sends this array to the flask app, which sends it to the client for rendering in the browser.

Currently the web app uses ZeroMQ to pass messages (e.g. the parameters of the distribution to compute, the current percent of computation done, the final 2D array, etc...) between the flask app and serve_roots. It also currently uses websockets for two way communication over a single TCP connection, sending percent progress information to the client as the calculation runs. Similar functionality can be achived using Server-Sent Events (SSE), or Long Polling (was used in an earlier version).  This two way communication is very useful because some distributions (espically ones of large degree) can take a very long time to compute, causing the client to have to wait and wonder how much longer the response would take. With this websocket functionality the client knows exactly how much longer they have to wait. *Important!* as of yet I haven't been able to design a good mechanism for aborting requests once the calculation has started, which means the only way to stop a long calculation once serve_roots has started is to manually interrupt both the flask app and the serve_roots app.

Although the current serve_roots.cpp program computes the distribution roots for the family of degree n Littlewood polynomials, it wouldn't be very hard to substitute this out for any other 2D array of floating point numbers. This could be accomplished by writing another function that sets the values of an array of floats (for example calculating the absolute value of a complex function over some subset of the complex plane), and passing the array ```results``` to this instead.

## Installation
The flask app uses pyzmq, which can be installed using easy_install, pip, anaconda, etc...
Sometimes pyzmq can be a bit difficult to install and you might need to install zmq first (i.e. ```brew install zmq``` or something similar).

The following compiles using Homebrew installed gcc 5.3:
```
	g++-5 -lzmq serve_roots.cpp -o serve_roots
```
Check the Makefile for additional flags.

Then to run the flask app just run:
```
	python app.py
```

Then start up the root server run:
```
	./build/serve_roots
```

Then visit ```http://localhost:5000``` to see the app!


## TODO:
* Replace OpenMP with MPI/something else
* ~~Determine the number of points (N,M) using the client's screen size~~
* Use modulus instead of cutting off high counts
* ~~SPEED UP JS!~~
* Initially compute very high resolution version of image,
   then pass that to the client, which only plots a subset of the points.
   The client can just replot from this dataset upon resizing as long
   as the original data sent contains high enough resolution.
   Otherwise, just resend the request for higher res data, and clear the old
   data once you've received it.
* ~~Redirect progress output from std::cout to zeromq then somehow to the client~~
* Add more/better written usage/conceptual background!
	
