# Version can probably be much lower...
cmake_minimum_required(VERSION 3.6.2)

project(rootviz)
set(CMAKE_VERBOSE_MAKEFILE TRUE)


set(EXECUTABLE_OUTPUT_PATH ${PROJECT_BINARY_DIR}/bin)
file(MAKE_DIRECTORY "${PROJECT_BINARY_DIR}/data")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -ffast-math -O3 -Wall -pg")

find_package(OpenMP)
if (OPENMP_FOUND)
  set (CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${OpenMP_C_FLAGS}")
  set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${OpenMP_CXX_FLAGS}")
endif()

add_executable(rootfile ${PROJECT_SOURCE_DIR}/src/rootfile.cpp)
add_executable(serve_roots ${PROJECT_SOURCE_DIR}/src/serve_roots.cpp)
target_link_libraries(serve_roots zmq)
