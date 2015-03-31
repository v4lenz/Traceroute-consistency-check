# Traceroute-consistency-check

This tool was initiated at the first RIPE Atlas Hackathon in March 2015 and shared the third prize with another participant :).

## Background
A traceroute path changes over time due to many reasons:

* BGP Changes
* Load balancing within provider networks
* Router failures
* Link failures
* ...

The objective is to visually understand how consistent traceroute paths are.
To do so this tool draws a traceroute path and color-codes each node based on its consistency over time. The path gets updated through the new [RIPE Atlas Streaming API](https://atlas.ripe.net/docs/result-streaming/).

This is an example

![Example](http://www.vdidonato.it/images/Traceroute-stability-check.png)

## Usage

From the root of the project:

	python -m SimpleHTTPServer 8000

Then visit:

	localhost:8000

Wait a bit and enjoy!
