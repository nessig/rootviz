serve_roots: serve_roots.cpp
	g++-5 -lzmq -fopenmp -ffast-math -O3 -Wall serve_roots.cpp -o build/serve_roots
clean:
	rm -rf build/*
