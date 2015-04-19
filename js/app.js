var graph = new MyGraph("#svgdiv");
var consistency = {};

function MyGraph(el) {

    var randomColor = d3.scale.category20();
    var color = d3.scale.linear().range(["red", "yellow", "green"]);

    // set up the D3 visualisation in the specified element
    var w = window.innerWidth,
        h = window.innerHeight;
    var vis = d3.select(el)
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .attr("id", "svg")
        .append('svg:g');

    var force = d3.layout.force();

    var nodes = force.nodes(),
        links = force.links();


    this.addNode = function (params) {
        if (!findNode(params.id)) {
            nodes.push({
                "id": params.id,
                "probe": params.probe,
                "target": params.target,
                "fixed": params.fixed,
                "x": params.x,
                "y": params.y,
                "occurs": params.occurs
            });
        }
        else {
            findNode(params.id)["occurs"] = params["occurs"];
        }
    };

    this.addLink = function (source, target) {
        links.push({"source": findNode(source), "target": findNode(target)});
    };

    var findNode = function (id) {
        for (var i in nodes) {
            if (nodes.hasOwnProperty(i)) {
                if (nodes[i]["id"] === id) return nodes[i]
            }
        }

    };

    var findNodeIndex = function (id) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].id == id) {
                return i;
            }
        }
    };

    this.removeNode = function (id) {
        var i = 0;
        var n = findNode(id);
        while (i < links.length) {
            if ((links[i]['source'] == n) || (links[i]['target'] == n)) {
                links.splice(i, 1);
            }
            else i++;
        }
        nodes.splice(findNodeIndex(id), 1);
    };

    this.removeLink = function (source, target) {
        for (var i = 0; i < links.length; i++) {
            if (links[i].source.id == source && links[i].target.id == target) {
                links.splice(i, 1);
                break;
            }
        }
    };

    this.removeallLinks = function () {
        links.splice(0, links.length);
    };

    this.removeAllNodes = function () {
        nodes.splice(0, links.length);
    };

    // Because of the way the network is created, nodes are created first, and links second,
    // so the lines were on top of the nodes, this just reorders the DOM to put the svg:g on top.
    // The Node.appendChild() does not add a new child if the argument comes from a selection.
    // For more details visit: https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
    this.keepNodesOnTop = function () {
        d3.selectAll(".node").each(function (d, i) {
            this.parentNode.appendChild(this);
        });
    };

    var updateColorScaleDomain = function() {

        var max = d3.max(nodes, function(node) { return node["occurs"]});
        var min = d3.min(nodes, function(node) { return node["occurs"]});
        var mean = d3.mean(nodes, function(node) { return node["occurs"]});

        color.domain([min, mean, max])

    };

    this.update = function () {

        updateColorScaleDomain();
        var duration = 3000;

        // Links
        var link = vis.selectAll(".link")
            .data(links, function (d) {
                return d.source.id + "-" + d.target.id;
            });


        link.enter().append("line")
            .attr("id", function (d) {
                return d.source.id + "-" + d.target.id;
            })
            .attr("class", "link")
            .attr("opacity", 0)
            .transition().duration(duration).attr("opacity", 1);

        // Links: Enter + Update
        // TODO

        link.exit().remove();


        // Nodes
        var node = vis.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id;
            });

        // Nodes: Update
        var nodeUpdate = node.select(".hopColoredCircle")
            .filter(function(d) { return d["probe"] == false && d["target"] == false})
            .attr("fill", function(d) { return color(d["occurs"])});

        // Nodes: Enter
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .call(force.drag);

        // Nodes, Probe: Enter
        var probeEnter = nodeEnter.filter(function (node) {
            return node["probe"] == true
        });
        probeEnter
            .append("svg:circle")
            .attr("stroke", "black")
            .attr("r", 20)
            .attr("id", function (d) {
                return "Node;" + d.id
            })
            .attr("class", "probeColoredCircle")
            .attr("fill", "white");

        probeEnter.append("svg:text")
            .attr("class", "textClassBlack")
            .attr("x", -10)
            .attr("y", ".31em")
            .text(function (d) {
                return d.id
            });

        probeEnter
            .append("svg:circle")
            .attr("r", 18)
            .attr("id", function (d) {
                return "Node;" + d.id;
            })
            .attr("class", "probeTransparentCircle")
            .attr("opacity", 0)
            .append("svg:title")
            .text(function(d) { return d.id});



        // Nodes, Target: Enter
        var targetEnter = nodeEnter.filter(function (node) {
            return node["target"] == true
        });

        targetEnter
            .append("svg:circle")
            .attr("stroke", "black")
            .attr("r", 20)
            .attr("id", function (d) {
                return "Node;" + d.id;
            })
            .attr("class", "targetColoredCircle")
            .attr("fill", "white");

        targetEnter.append("svg:text")
            .attr("class", "textClassBlack")
            .attr("x", -10)
            .attr("y", ".31em")
            .text(function (d) {
                return lastByte(d.id)
            });

        targetEnter
            .append("svg:circle")
            .attr("r", 18)
            .attr("id", function (d) {
                return "Node;" + d.id;
            })
            .attr("class", "targetTransparentCircle")
            .attr("opacity", 0)
            .append("svg:title")
            .text(function(d) { return d.id});


        // Nodes, Hops: Enter
        var hopsEnter = nodeEnter.filter(function (node) {
            return node["target"] == false && node["probe"] == false
        });

        hopsEnter
            .append("svg:circle")
            .attr("r", 18)
            .attr("id", function (d) {
                return "Node;" + d.id;
            })
            .attr("class", "hopColoredCircle")
            .attr("stroke", "black")
            .attr("fill", function (d) {
                return color(d.occurs);
            })
            .attr("opacity", 0)
            .transition().duration(duration).attr("opacity", 1);

        hopsEnter
            .append("svg:text")
            .attr("class", "textClass")
            .attr("x", -10)
            .attr("y", ".31em")
            .text(function (d) {
                return lastByte(d.id)
            })
            .attr("opacity", 0)
            .transition().duration(duration).attr("opacity", 1);


        hopsEnter
            .append("svg:circle")
            .attr("r", 18)
            .attr("id", function (d) {
                return "Node;" + d.id;
            })
            .attr("class", "hopTransparentCircle")
            .attr("opacity", 0)
            .append("svg:title")
            .text(function(d) { return "ip: " + d.id + "\n" + "occurs: " + d.occurs + " times"})


        // Nodes: Exit
        node.exit().remove();
        force.on("tick", function () {

            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

            link.attr("x1", function (d) {
                return d.source.x;
            })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

        });

        // Restart the force layout
        force
            //.gravity(0)
            //.linkDistance(5) // Target length: Defaults to 20
            //.linkStrength() // Rigidity: Defaults to 1
            //.chargeDistance() // Defaults to Infinity
            .charge(-2000)
            .size([w, h])
            .start();
    };
}

function updateGraph(data) {

    //TODO: This should consider other packets too. I'm only using the first one out of three
    var path = data["result"].map(function (hop) {
        return hop["result"][0]["from"]
    });

    // Add nodes and links

    // First hop
    var prbId = data["prb_id"].toString();
    var firstHop = path[0];

    graph.addNode({
        "id": prbId,
        "probe": true,
        "target": false,
        "fixed": true,
        "x": 100,
        "y": window.innerHeight / 2
    });

    graph.addNode({
        "id": firstHop,
        "probe": false,
        "target": false,
        "fixed": false
    });
    graph.addLink(prbId, firstHop);

    // Other nodes along the path
    for (var i = 0; i < path.length - 2; i++) {

        consistency[path[i]] = consistency[path[i]] ? consistency[path[i]] + 1 : 1;
        graph.addNode({
            "id": path[i],
            "probe": false,
            "target": false,
            "fixed": false,
            "occurs": consistency[path[i]]
        });

        graph.addNode({
            "id": path[i + 1],
            "probe": false,
            "target": false,
            "fixed": false
        });
        graph.addLink(path[i], path[i + 1]);
    }

    // Last hop
    var penultimate = path[path.length - 2];
    var target = path[path.length - 1];

    consistency[penultimate] = consistency[penultimate] ? consistency[penultimate] + 1 : 1;
    graph.addNode({
        "id": penultimate,
        "probe": false,
        "target": false,
        "fixed": false,
        "occurs": consistency[penultimate]
    });

    graph.addNode({
        "id": target,
        "probe": false,
        "target": true,
        "fixed": true,
        "x": window.innerWidth - 100,
        "y": window.innerHeight / 2
    });
    graph.addLink(penultimate, target);


    graph.update();
    graph.keepNodesOnTop();

}

// Collect measurement variables
var get_params = function(search_string) {
  var parse = function(params, pairs) {
    var pair = pairs[0];
    var parts = pair.split('=');
    var key = decodeURIComponent(parts[0]);
    var value = decodeURIComponent(parts.slice(1).join('='));
    // Handle multiple parameters of the same name
    if (typeof params[key] === "undefined") {
      params[key] = value;
    } else {
      params[key] = [].concat(params[key], value);
    }
    return pairs.length == 1 ? params : parse(params, pairs.slice(1))
  };
  // Get rid of leading ?
  return search_string.length == 0 ? {} : parse({}, search_string.substr(1).split('&'));
};


var params = get_params(location.search);
// Main
var msm, prb, start;

// Build variables
if (params.msm) {
    msm = removeTrailingSlash(params.msm);
} else { 
    msm = 1663314;
}

if (params.prb) {
	prb = removeTrailingSlash(params.prb);
} else { 
    prb = 726;
}

if (params.start) {
	start = removeTrailingSlash(params.start);
} else { 
    start = 1399035600;
}

// Create a socket and connect to the streaming service
var socket = io("https://atlas-stream.ripe.net:443", {path: "/stream/socket.io"});

socket.on("connect", function () {

    socket.emit("atlas_subscribe", {
        stream_type: "result",
        msm: msm,
        prb: prb,
        startTime: start,
        speed: 100
    });
});

socket.on("atlas_result", function (result) {
    console.log("Received result: ", result);
    updateGraph(result)
});

socket.on("atlas_error", function (err) {
    console.log("Error: ", err);
});