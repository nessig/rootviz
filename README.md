TODO
* Replace OpenMP with MPI/something else
* Determine the number of points (N,M) using the client's screen size
* Use modulus instead of cutting off high counts
* SPEED UP JS!
* Initially compute very high resolution version of image,
   then pass that to the client, which only plots a subset of the points.
   The client can just replot from this dataset upon resizing as long
   as the original data sent contains high enough resolution.
   Otherwise, just resend the request for higher res data, and clear the old
   data once you've received it.
* Redirect progress output from std::cout to zeromq then somehow to the client
* Add content explaining how to use/conceptual background.
	
