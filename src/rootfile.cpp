#include <algorithm>
#include <complex>
#include <float.h>
#include <fstream>
#include <iostream>
#include <math.h>
#include <sstream>

typedef std::complex<double> complex;

template <typename T>
inline T abs2(std::complex<T> z) {
    T x = real(z), y = imag(z);
    return x * x + y * y;
}
inline double myabs( const std::complex<double>& x ) { return norm(x); }

// static void colormap(double x, float& r, float& g, float& b)
// {
//     x = std::min(std::max(0.0, x), 1.0); // clamp
//     r = std::min(1.0, x/0.7);
//     g = std::max(0.0, (x - 0.477)/(1 - 0.477));
//     b = std::max(0.0, (x - 0.75)/(1 - 0.75));
// }
// colormap(1 - (pow(minP[j*N + i], 0.01) - 0.95)/0.1, r,g,b);
//  colormap(x) {
//     var r, g, b;
//     // x = Math.min(Math.max(0.0, val), 1.0); // clamp
//     // x = Math.min(Math.max(0.0, (1 - (Math.pow(val, 0.01) - 0.95) / 0.1)),
//     1.0); // clamp
//     r = Math.min(1.0, x / 0.7);
//     g = Math.max(0.0, (x - 0.477) / (1 - 0.477));
//     b = Math.max(0.0, (x - 0.75) / (1 - 0.75));
//     // var c = qRgb(Math.floor(r * 255), Math.floor(g * 255), Math.floor(b *
//     255));
//     return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];

// }

double evaluate(complex poly, double* bounds, complex* zpows, int n) {
    using std::min;
    //    if(n < 0)
    //        return abs2(poly);
    // Unrolled a few times for speed.
    if (n < 3) {
        return min(min(min(abs2(poly + zpows[0] + zpows[1] + zpows[2]),
                           abs2(poly + zpows[0] + zpows[1] - zpows[2])),
                       min(abs2(poly + zpows[0] - zpows[1] + zpows[2]),
                           abs2(poly + zpows[0] - zpows[1] - zpows[2]))),
                   min(min(abs2(poly - zpows[0] + zpows[1] + zpows[2]),
                           abs2(poly - zpows[0] + zpows[1] - zpows[2])),
                       min(abs2(poly - zpows[0] - zpows[1] + zpows[2]),
                           abs2(poly - zpows[0] - zpows[1] - zpows[2]))));
    } else {
        // Check bound on partial sum of current terms and prune if there can
        // be no roots in this region.
        //
        // The fudge factor determines how closely to a root we can cut off
        // the search.  A value of 1 can be used, but a larger value gives
        // better looking results.
        const double fudge = 10;
        if (abs2(poly) > fudge * (*bounds))
            return FLT_MAX;
        return min(evaluate(poly + *zpows, bounds + 1, zpows + 1, n - 1),
                   evaluate(poly - *zpows, bounds + 1, zpows + 1, n - 1));
    }
}

void writeFile(const char* name, int N, int M, const float* data) {
    std::ofstream outFile(name, std::ios::out | std::ios::binary);
    outFile << N << " " << M << "\n";
    outFile.write(reinterpret_cast<const char*>(data), sizeof(float) * N * M);
}

void minPolys(float* result, int N, int M, double x0, double x1, double y0,
              double y1, int degree) {
    int linesdone = 0;

#pragma omp parallel for schedule(dynamic, 1)
    for (int j = 0; j < M; ++j) {
        for (int i = 0; i < N; i += 1) {
            // Calculate powers of z for current point
            double x = x0 + (x1 - x0) * (i + 0.5) / N;
            double y = y0 + (y1 - y0) * (j + 0.5) / M;
            complex z(x, y);
            // Remap z using symmetry to improve bounding performance.
            if (abs(z) > 1)
                z = 1.0 / z;
            // complex zpowers[degree];
            complex* zpowers = new complex[degree];
            for (int k = 0; k < degree; ++k)
                zpowers[k] = pow(z, k + 1);
            // Precompute bounds on the absolute value of partial sum of last
            // k terms, via the triangle inequality.
            double bounds[degree];
            bounds[degree - 1] = abs(zpowers[degree - 1]);
            for (int k = degree - 2; k >= 0; --k)
                bounds[k] = bounds[k + 1] + abs(zpowers[k]);
            for (int k = 0; k < degree; ++k)
                bounds[k] *= bounds[k];
            // Find minimum absolute value of all terms; there are 2^(degree+1)
            // polynomials, but we reduce that by a factor of two by making use
            // of symmetry [for every P(z) there is a -P(z) in the set]
            double minpoly = evaluate(1.0, bounds, zpowers, degree - 1);
            // Weight of 1/|z|^degree implies z <--> 1/z symmetry
            result[N * j + i] = sqrt(minpoly / pow(abs(z), degree));
            delete[] zpowers;
        }
#pragma omp critical
        {
            ++linesdone;
            std::cout << 100.0 * linesdone / M << "%   \r" << std::flush;
        }
    }

}

int main(int argc, char* argv[]) {
    // writeFile("app/static/minpoly.dat", N, M, result);
    int degree = 16;
    int N = 300;
    // double R = 1.7;
    // double x = 1.0, y = 0.0;
    double x0 = 0.0, x1 = 1.7, y0 = 0.0, y1 = 1.7;
    std::string name = "minpoly2.dat";
    if (argc > 1) {
        degree = atoi(argv[1]);
        // x = atof(argv[2]);
        // y = atof(argv[3]);
        // R = atof(argv[4]);
        N = atoi(argv[2]);
        x0 = atof(argv[3]);
        x1 = atof(argv[4]);
        y0 = atof(argv[5]);
        y1 = atof(argv[6]);
        name = argv[7];
    }
    int M = N;
    float* result = new float[N * M];
    // std::cout << "" << std::endl;
    minPolys(result, N, M, x0, x1, y0, y1, degree);
    // minPolys(result, N, M, x - R, x + R, y - R, y + R, degree);
    writeFile(name.c_str(), N, M, result);
    // std::cout << "Done" << std::endl;
    delete[] result;

    return 0;
}
