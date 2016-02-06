serve_roots: serve_roots.cpp
	g++-5 -I/usr/local/include -lzmq -std=c++11 -fopenmp -ffast-math -O3 -Wall serve_roots.cpp -L. -L/usr/local/lib -o build/serve_roots
pyroots: pyroots.cpp
	g++-5 -I/usr/local/include -lzmq -std=c++11 -fopenmp -ffast-math -O3 -Wall pyroots.cpp -L. -L/usr/local/lib -o build/pyroots
serve_rgb: serve_rgb.cpp
	g++-5 -I/usr/local/include -lzmq -std=c++11 -fopenmp -ffast-math -O3 -Wall serve_rgb.cpp -L. -L/usr/local/lib -o build/serve_rgb
rgb_good: rgb_good.cpp
	g++-5 -I/usr/local/include -lzmq -std=c++11 -fopenmp -ffast-math -O3 -Wall rgb_good.cpp -L. -L/usr/local/lib -o build/rgb_good
