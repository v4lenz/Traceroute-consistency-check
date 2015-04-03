# Traceroute-consistency-check

This tool was initiated at the first RIPE Atlas Hackathon in March 2015 and won the third prize.

## Background
A traceroute path can change over time due to many reasons:

* BGP Changes
* Load balancing
* Router failures
* Link failures
* ...

Therefore it may be interesting to better understand when/where changes happen.
To do so this tool draws a path using a force-directed layout and color-codes each node based on its consistency over time.
The path gets updated through the new [RIPE Atlas Streaming API](https://atlas.ripe.net/docs/result-streaming/).

This is an example

![Example](http://www.vdidonato.it/images/Traceroute-stability-check.png)

## Usage

From the root of the project:

	python -m SimpleHTTPServer 8000

Then visit:

	localhost:8000

Wait a bit and enjoy!


## known bugs

* Asterisks in the path are aggregated into a single node
* After some time, the graph may become tangled..