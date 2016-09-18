# Version can probably be much lower...
cmake_minimum_required(VERSION 3.6.2)

project(rootviz)
# set(CMAKE_VERBOSE_MAKEFILE TRUE)
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_BINARY_DIR}/bin)
set(CMAKE_CXX_COMPILER /usr/local/bin/gcc-6)
set(CMAKE_CXX_COMPILER /usr/local/bin/g++-6)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fopenmp -lzmq -ffast-math -O3 -Wall")

add_executable(rootfile ${PROJECT_SOURCE_DIR}/src/rootfile.cpp)
add_executable(serve_roots ${PROJECT_SOURCE_DIR}/src/serve_roots.cpp)

add_custom_target(build-time-make-directory ALL
      COMMAND ${CMAKE_COMMAND} -E make_directory data)
