serve_roots: serve_roots.cpp
	g++-5 -lzmq -fopenmp -ffast-math -O3 -Wall serve_roots.cpp -o build/serve_roots
rootfile: rootfile.cpp
	g++-5 -lzmq -fopenmp -ffast-math -O3 -Wall rootfile.cpp -o build/rootfile
clean:
	rm -rf build/*
