# Traceroute-consistency-check

This tool was initiated at the first RIPE Atlas Hackathon in March 2015 ([blog post](https://labs.ripe.net/Members/becha/ripe-atlas-hackathon-results)) and won the third prize.

## Background
A traceroute path can change over time due to many reasons:

* BGP Changes
* Load balancing
* Router failures
* Link failures
* ...

Therefore it may be interesting to understand which nodes have been traversed more frequently over time.
To do so this tool draws a path using a force-directed layout and color-codes each node based on its consistency.
The path gets updated through the new [RIPE Atlas Streaming API](https://atlas.ripe.net/docs/result-streaming/).

## Example

![Screen_Shot_2015-04-01_at_11 17 35 width-800](https://user-images.githubusercontent.com/4520928/135593791-f9220c2f-2e63-4fda-8c01-471e0bb8e07b.png)


## Usage

From the root of the project:

	python -m SimpleHTTPServer 8000

Then visit:

	localhost:8000

Wait a bit and enjoy!


## known bugs

* Asterisks in the path are aggregated into a single node
* After some time, the graph may become tangled..
