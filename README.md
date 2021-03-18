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

![image](https://labs.ripe.net/Members/becha/ScreenShot20150401at11.17.35.png)

## Usage

From the root of the project:

	python -m SimpleHTTPServer 8000

Then visit:

	localhost:8000

Wait a bit and enjoy!


## known bugs

* Asterisks in the path are aggregated into a single node
* After some time, the graph may become tangled..
