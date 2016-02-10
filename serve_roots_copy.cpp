#include <stdio.h>
#include <stdlib.h>
#include <zmq.hpp>
#include <complex>
#include <algorithm>
#include <iostream>
#include <fstream>
#include <float.h>
#include <math.h>
#include <sstream>



typedef std::complex<double> complex;

template<typename T>
inline T abs2(std::complex<T> z)
{
    T x = real(z), y = imag(z);
    return x*x + y*y;
}

// colormap similar to matplotlib's gist_heat
static void colormap(double x, float& r, float& g, float& b)
{
    x = std::min(std::max(0.0, x), 1.0); // clamp
    r = std::min(1.0, x/0.7);
    g = std::max(0.0, (x - 0.477)/(1 - 0.477));
    b = std::max(0.0, (x - 0.75)/(1 - 0.75));
}

double evaluate(complex poly, double* bounds, complex* zpows, int n)
{
    using std::min;
//    if(n < 0)
//        return abs2(poly);
    // Unrolled a few times for speed.
    if(n < 3)
    {
        return min(min(min(abs2(poly + zpows[0] + zpows[1] + zpows[2]),
                           abs2(poly + zpows[0] + zpows[1] - zpows[2])),
                       min(abs2(poly + zpows[0] - zpows[1] + zpows[2]),
                           abs2(poly + zpows[0] - zpows[1] - zpows[2]))),
                   min(min(abs2(poly - zpows[0] + zpows[1] + zpows[2]),
                           abs2(poly - zpows[0] + zpows[1] - zpows[2])),
                       min(abs2(poly - zpows[0] - zpows[1] + zpows[2]),
                           abs2(poly - zpows[0] - zpows[1] - zpows[2]))));
    }
    else
    {
        // Check bound on partial sum of current terms and prune if there can
        // be no roots in this region.
        //
        // The fudge factor determines how closely to a root we can cut off
        // the search.  A value of 1 can be used, but a larger value gives
        // better looking results.
        const double fudge = 100;
        if(abs2(poly) > fudge*(*bounds))
            return FLT_MAX;
        return min(evaluate(poly + *zpows, bounds+1, zpows+1, n-1),
                   evaluate(poly - *zpows, bounds+1, zpows+1, n-1));
    }
}


void writeFile(const char* name, int N, int M, const float* data)
{
    std::ofstream outFile(name, std::ios::out | std::ios::binary);
	outFile << N << " " << M << "\n";
    outFile.write(reinterpret_cast<const char*>(data), sizeof(float)*N*M);
}


void minPolys(float* result, int N, int M,
              double x0, double x1, double y0, double y1,
              int degree)
{
	zmq::context_t context2 (1);
    zmq::socket_t publisher (context2, ZMQ_PUB);
    publisher.bind("tcp://*:5556");
    // publisher.bind("ipc://weather.ipc");
    int linesdone = 0;
#   pragma omp parallel for schedule(dynamic, 1)
    for(int j = 0; j < M; ++j)
    {
        for(int i = 0; i < N; i+=1)
        {
            // Calculate powers of z for current point
            double x = x0 + (x1-x0) * (i + 0.5)/N;
            double y = y0 + (y1-y0) * (j + 0.5)/M;
            complex z(x,y);
            // Remap z using symmetry to improve bounding performance.
            if(abs(z) > 1)
                z = 1.0/z;
            // complex zpowers[degree];
			complex * zpowers = new complex[degree];
            for(int k = 0; k < degree; ++k)
                zpowers[k] = pow(z, k+1);
            // Precompute bounds on the absolute value of partial sum of last
            // k terms, via the triangle inequality.
            double bounds[degree];
            bounds[degree-1] = abs(zpowers[degree-1]);
            for(int k = degree-2; k >= 0; --k)
                bounds[k] = bounds[k+1] + abs(zpowers[k]);
            for(int k = 0; k < degree; ++k)
                bounds[k] *= bounds[k];
            // Find minimum absolute value of all terms; there are 2^(degree+1)
            // polynomials, but we reduce that by a factor of two by making use
            // of symmetry [for every P(z) there is a -P(z) in the set]
            double minpoly = evaluate(1.0, bounds, zpowers, degree-1);
			delete[] zpowers;
            // Weight of 1/|z|^degree implies z <--> 1/z symmetry
			
            result[N*j + i] = sqrt(minpoly / pow(abs(z),degree));
			
        }
#       pragma omp critical
        {
            ++linesdone;
            std::cout << 100.0*linesdone/M << "%   \r" << std::flush;

			std::stringstream progress;
			progress << linesdone << " ";
			std::string ans = progress.str();

			zmq::message_t message(15);
			// snprintf ((char *) message.data(), 15, "%s", ans.data());
			// snprintf ((char *) message.data(), 15, "%d", linesdone);
			// snprintf ((char *) message.data(), 15, "%s %s", "hello", ans.data());

			// snprintf ((char *) message.data(), 15, "%s", ans.data());
			// send values through zmq socket
			// zmq::message_t replyProgress (ans.size());
			memcpy ((void *) message.data(), ans.data(), ans.size());
			publisher.send (message);

        }
    }
}

int main() {
	// connect to zmq socket
    zmq::context_t context (1);
    zmq::socket_t socket (context, ZMQ_REP);
    socket.bind ("tcp://*:5555");
	// std::string ans = "hello hello";
	// zmq::context_t context2 (1);
	// // std::stringstream progress;
    // zmq::socket_t publisher (context2, ZMQ_PUB);
    // publisher.bind("tcp://*:5556");
    // publisher.bind("ipc://weather.ipc");

    while (true) {
		// wait for requests...
		zmq::message_t request;

		socket.recv (&request);
		std::string rpl = std::string(static_cast<char*>(request.data()), request.size());
		// parse request for plotting parameters
		std::istringstream iss (rpl);
		int degree, N, M;

		iss >> degree;
		iss >> N;
		iss >> M;
		float x0, x1, y0, y1;

		iss >> x0;
		iss >> x1;
		iss >> y0;
		iss >> y1;

		std::cout << degree << " " << N << " " << M << " " << " " << x0 << " " << x1 << " " << y0 << " " << y1 << std::endl;
      
		float* result = new float[N*M];
		// find zeros

		minPolys(result, N, M, x0, x1, y0, y1, degree);
		// writeFile("app/static/minpoly.dat", N, M, result);

		std::stringstream ss;
		
		std::string ans;


		// write rgba values encoding the distribution into a string stream in JSON format
		ss << "{\"N\":" << N << "," << "\"M\":" <<  M << "," << "\"roots\":[";
		const char* separator = "";
		for (int j=0; j < M; ++j) {
			for (int i=0; i < N; i+=1) {
				// ss << result[N*j + i] << " ";
				float r,g,b;
				colormap(1 - (pow(result[N*j + i], 0.01) - 0.95)/0.1, r,g,b);
				// colormap(1 - result[N*j + i], r,g,b);
			    
				ss << separator << lround(r*255);
				separator = ",";
				ss << separator << lround(g*255);
				ss << separator << lround(b*255);
				ss << separator << lround(255);
			}
		}
		ss << "]}";

		// clean up and free the array
		delete[] result;

		// empty string stream into string
		ans = ss.str();

		// send values through zmq socket
		zmq::message_t reply (ans.size());
		memcpy ((void *) reply.data(), ans.data(), ans.size());
		socket.send (reply);
		

    }
    
    return 0;
}
