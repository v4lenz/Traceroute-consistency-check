
var netfork = netfork || {};

netfork.circleConvexHull = function() {

    var debug = function() {}; //net.skype.flowcliqr.debug;

    var pointDistance = function(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    var findRightTangent = function(circle, parallelLine) {
        var lineEndpointDistance = pointDistance(parallelLine[0], parallelLine[1]);
        var dx = (parallelLine[1].x - parallelLine[0].x) / lineEndpointDistance;
        var dy = (parallelLine[1].y - parallelLine[0].y) / lineEndpointDistance;
        var tangentPointX = circle.cx + circle.r * dy;
        var tangentPointY = circle.cy + circle.r * (-dx);
        return [
            {x: tangentPointX, y: tangentPointY},
            {x: (tangentPointX + dx), y: (tangentPointY + dy)}
        ];
    };

    var findRightTangentToCirclesSameRadius = function(c1, c2) {

        var centerDistance = pointDistance(
            {x: c1.cx, y: c1.cy},
            {x: c2.cx, y: c2.cy}
        );

        var sinAxis = (c2.cy - c1.cy) / centerDistance,
            cosAxis = (c2.cx - c1.cx) / centerDistance;

        return [
            { x: c1.cx + sinAxis * c1.r, y: c1.cy + (-cosAxis) * c1.r },
            { x: c2.cx + sinAxis * c1.r, y: c2.cy + (-cosAxis) * c1.r }
        ];

    };

    var findRightTangentToCircles = function(c1, c2) {

        if(Math.abs(c1.r - c2.r) <= 0.001)
            return findRightTangentToCirclesSameRadius(c1, c2);

        var externalHomotheticCenter = {
            x: (-c2.r)/(c1.r - c2.r)*c1.cx + c1.r/(c1.r - c2.r)*c2.cx,
            y: (-c2.r)/(c1.r - c2.r)*c1.cy + c1.r/(c1.r - c2.r)*c2.cy
        };

        var distanceC1 = pointDistance(externalHomotheticCenter, {x: c1.cx, y: c1.cy});
        var distanceC2 = pointDistance(externalHomotheticCenter, {x: c2.cx, y: c2.cy});

        var tangentDistanceC1 = Math.sqrt(Math.pow(distanceC1, 2) - Math.pow(c1.r, 2));
        var tangentDistanceC2 = Math.sqrt(Math.pow(distanceC2, 2) - Math.pow(c2.r, 2));

        var sinAlpha = c1.r / distanceC1;
        var cosAlpha = Math.sqrt(1 - sinAlpha * sinAlpha);

        var sinAxis = (c1.cy - externalHomotheticCenter.y) / distanceC1;
        var cosAxis = (c1.cx - externalHomotheticCenter.x) / distanceC1;

        var sinTangent = (c1.r < c2.r) ?
            sinAxis * cosAlpha - cosAxis * sinAlpha : // subtract
            sinAxis * cosAlpha + cosAxis * sinAlpha; // sum
        var cosTangent = (c1.r < c2.r) ?
            cosAxis * cosAlpha + sinAxis * sinAlpha : // subtract
            cosAxis * cosAlpha - sinAxis * sinAlpha; // sum

        return [
            {
                x: externalHomotheticCenter.x + tangentDistanceC1 * cosTangent,
                y: externalHomotheticCenter.y + tangentDistanceC1 * sinTangent
            },
            {
                x: externalHomotheticCenter.x + tangentDistanceC2 * cosTangent,
                y: externalHomotheticCenter.y + tangentDistanceC2 * sinTangent
            }
        ];

    };

    var pointLineDistanceWithSign = function(point, line) {
        return (  (line[1].x - line[0].x) * (line[0].y - point.y) - (line[1].y - line[0].y) * (line[0].x - point.x)  ) /
                pointDistance(line[0], line[1]);
    };

    var isCircleLeft = function(circle, line) {
        return pointLineDistanceWithSign({x: circle.cx, y: circle.cy}, line) <= -(circle.r - 0.001);
    };

    var findAngle = function(line1, line2) {
        var lineEndpointDistance1 = pointDistance(line1[0], line1[1]);
        var lineEndpointDistance2 = pointDistance(line2[0], line2[1]);
        var cosA = (line1[1].x - line1[0].x) / lineEndpointDistance1;
        var sinA = (line1[1].y - line1[0].y) / lineEndpointDistance1;
        var cosB = (line2[1].x - line2[0].x) / lineEndpointDistance2;
        var sinB = (line2[1].y - line2[0].y) / lineEndpointDistance2;
        var sinBminusA = sinB * cosA - cosB * sinA;
        var cosBminusA = cosB * cosA + sinB * sinA;
        cosBminusA = Math.max(-1, Math.min(1, cosBminusA)); // fixing precision issues ....
        return sinBminusA >= 0 ? Math.acos(cosBminusA) : (2 * Math.PI - Math.acos(cosBminusA));
    };

    var nextIndex = function(index, list) {
        if(list.length == (index + 1))
            return 0;
        if(list.length > (index + 1))
            return (index + 1);
        return null;
    };

    var properSubset = function(line1, line2, circles) {

        var circlesLeftToLine1 = circles.filter(function(circle) {
            return isCircleLeft(circle, line1);
        });
        var circlesLeftToLine2 = circles.filter(function(circle) {
            return isCircleLeft(circle, line2);
        });

        var isProperSubset = true;
        circles.forEach(function(circle) {
            var itIsInSet1 = false, itIsInSet2 = false;
            circlesLeftToLine1.forEach(function(circle1) {
                if(circle1.id == circle.id)
                    itIsInSet1 = true;
            });
            circlesLeftToLine2.forEach(function(circle2) {
                if(circle2.id == circle.id)
                    itIsInSet2 = true;
            });
            if(!itIsInSet1 && itIsInSet2)
                isProperSubset = false;
        });
        return isProperSubset;
    };

    var addIndexToList = function(index, list) {
        if(list.length == 0 || list[list.length - 1] != index)
            list.push(index);
        return list;
    };

    var addToList = function(element, list) {
        if(list.length == 0 || list[list.length - 1].id != element.id)
            list.push(element);
        return list;
    };

    var initTangent = function(lStar, hull) {

        var rightTangents = hull.map(function(circle, i) {
            return {
                index: i,
                line: findRightTangent(circle, lStar)
            };
        });

        var maxX = rightTangents[0].line[0].x;
        var bestTangent = rightTangents[0];
        rightTangents.forEach(function(tangent) {
            if(tangent.line[0].x > maxX) {
                bestTangent = tangent;
            }
        });

        return bestTangent;

    };

    var findSpacing = function(depth){
        //depth = depth || 0;
        var spacing = "";
        var i = depth;
        while(i > 0) {
            spacing += "----";
            i--;
        }
        return spacing;
    };

    var merge = function(hull1, hull2, depth) {

        var spacing = findSpacing(depth);

        var hull = [];
        var indexHull = [];

        var lStar = [{x: 0, y: 0}, {x: 0, y: 1}];
        var pTangent = initTangent(lStar, hull1),
            qTangent = initTangent(lStar, hull2);

        var pIndex = pTangent.index,
            qIndex = qTangent.index,
            pSupportLine = pTangent.line,
            qSupportLine = qTangent.line;

        var pCompleted = false;
        var qCompleted = false;

        var advance = function(pFirst) {

            var firstIndex = pFirst ? pIndex : qIndex,
                secondIndex = pFirst ? qIndex: pIndex;
            var first = pFirst ? hull1[pIndex] : hull2[qIndex],
                second = pFirst ? hull2[qIndex] : hull1[pIndex];
            var firstHull = pFirst ? hull1 : hull2;
            var secondHull = pFirst ? hull2 : hull1;
            debug(spacing + "  ", "advance:", "first", first, "second", second);

            var forwardBridge = findRightTangentToCircles(first, second);
            var firstToNextLine =
                firstHull.length == 1 ? null :
                findRightTangentToCircles(first, firstHull[nextIndex(firstIndex, firstHull)]);
            var secondToNextLine =
                secondHull.length == 1 ? null :
                findRightTangentToCircles(second, secondHull[nextIndex(secondIndex, secondHull)]);
            var reverseBridge = findRightTangentToCircles(second, first);

            var a1 = findAngle(lStar, forwardBridge),
                a2 = firstToNextLine == null ? 4 * Math.PI : findAngle(lStar, firstToNextLine),
                a3 = secondToNextLine == null ? 4 * Math.PI : findAngle(lStar, secondToNextLine),
                a4 = findAngle(lStar, reverseBridge);

            debug(spacing + "  ",
               "forward bridge", forwardBridge,
                "first to next line", firstToNextLine,
                "second to next line", secondToNextLine,
                "reverse bridge", reverseBridge
            );
            debug(spacing + "  ", "a1", a1, "a2", a2, "a3", a3, "a4", a4);

            if(a1 < a2 && a1 < a3) {
                debug(spacing, "adding to hull", second, "(forward bridge)");
                hull = addToList(second, hull);
                if(pFirst) {
                    indexHull = addIndexToList("q-" + secondIndex, indexHull);
                    if(indexHull.indexOf("q-"+secondIndex) != indexHull.lastIndexOf("q-"+secondIndex)) {
                        debug(spacing, "closed loop on", secondHull[secondIndex], "-- exiting");
                        qCompleted = true;
                    }
                }
                else {
                    indexHull = addIndexToList("p-" + secondIndex, indexHull);
                    if(indexHull.indexOf("p-"+secondIndex) != indexHull.lastIndexOf("p-"+secondIndex)) {
                        debug(spacing, "closed loop on", secondHull[secondIndex], "-- exiting");
                        pCompleted = true;
                    }
                }
            }
            if(a4 < a2 && a4 < a3) {
                debug(spacing, "adding to hull", first, "(reverse bridge)");
                hull = addToList(first, hull);
                if(pFirst) {
                    indexHull = addIndexToList("p-"+firstIndex, indexHull);
                    if(indexHull.indexOf("p-"+firstIndex) != indexHull.lastIndexOf("p-"+firstIndex)) {
                        debug(spacing, "closed loop on", firstHull[firstIndex], "-- exiting");
                        pCompleted = true;
                    }
                }
                else {
                    indexHull = addIndexToList("q-"+firstIndex, indexHull);
                    if(indexHull.indexOf("q-"+firstIndex) != indexHull.lastIndexOf("q-"+firstIndex)) {
                        debug(spacing, "closed loop on", firstHull[firstIndex], "-- exiting");
                        qCompleted = true;
                    }
                }
            }
            if(a2 < a3) {
                lStar = firstToNextLine;
                if(pFirst) {
                    pIndex = nextIndex(firstIndex, firstHull);
                }
                else {
                    qIndex = nextIndex(firstIndex, firstHull);
                }
            }
            else {
                lStar = secondToNextLine;
                if(pFirst) {
                    qIndex = nextIndex(secondIndex, secondHull);
                }
                else {
                    pIndex = nextIndex(secondIndex, secondHull);
                }
            }
        };

        var firstRound = true;

        while(firstRound || !(pCompleted || qCompleted)) {

            firstRound = false;
            debug(spacing + "  ", "lStar:", lStar, "p:", hull1[pIndex], "q:", hull2[qIndex]);
            debug(spacing + "  ", "p support line:", pSupportLine, "q support line:", qSupportLine);

            if(properSubset(pSupportLine, qSupportLine, hull1.concat(hull2))) {
                debug(spacing, "adding to hull", hull1[pIndex], "(proper subset)");
                hull = addToList(hull1[pIndex], hull);
                indexHull = addIndexToList("p-"+pIndex, indexHull);
                if(indexHull.indexOf("p-"+pIndex) != indexHull.lastIndexOf("p-"+pIndex)) {
                    debug(spacing, "closed loop on", hull1[pIndex], "-- exiting");
                    break;
                }
                advance(true);
            }
            else if(properSubset(qSupportLine, pSupportLine, hull1.concat(hull2))) {
                debug(spacing, "adding to hull", hull2[qIndex], "(proper subset)");
                hull = addToList(hull2[qIndex], hull);
                indexHull = addIndexToList("q-"+qIndex, indexHull);
                if(indexHull.indexOf("q-"+qIndex) != indexHull.lastIndexOf("q-"+qIndex)) {
                    debug(spacing, "closed loop on", hull2[qIndex], "-- exiting");
                    break;
                }
                advance(false);
            }

            if(pCompleted || qCompleted)
                break;

            debug(spacing, "update: p-index", pIndex, "q-index", qIndex, "lStar", lStar);

            pSupportLine = findRightTangent(hull1[pIndex], lStar);
            qSupportLine = findRightTangent(hull2[qIndex], lStar);
        }

        if(hull[0].id == hull[hull.length - 1].id)
            hull.pop();

        return hull;
    };

    var handleTwoCircles = function(c1, c2) {

        var contained = function(bigC, smallC) {
            return (pointDistance({x: bigC.cx, y: bigC.cy},{x: smallC.cx, y: smallC.cy}) + bigC.r + smallC.r) <= 2 * bigC.r;
        };
        var bigCircle = (c1.r > c2.r) ? c1 : c2;
        var smallCircle = (c1.r > c2.r) ? c2 : c1;
        if(contained(bigCircle, smallCircle))
            return [bigCircle];
        return [bigCircle, smallCircle];

    };

    var convexHull = function(circleList, depth) {

        var spacing = findSpacing(depth);

        debug(spacing, "find convex hull: ", circleList.map(function(circle) { return circle.id; }));
        var result;
        if(circleList.length < 2) {
            result = circleList;
        }
        else if(circleList.length == 2) {
            result = handleTwoCircles(circleList[0], circleList[1]);
        }
        else {
            var hull1 = convexHull(circleList.slice(0, Math.floor(circleList.length / 2)), depth+1);
            var hull2 = convexHull(circleList.slice(Math.floor(circleList.length / 2), circleList.length), depth+1);
            result = merge(hull1, hull2, depth);
        }
        debug(spacing, "result: ", result.map(function(circle) { return circle.id; }));
        return result;
    };

    var test = function() {

        debug("180-90:", findAngle([{x: 0, y: 0},{x: 0, y: 1}],[{x: 0, y: 0},{x: -1, y: 0}]));
        debug("270-90:", findAngle([{x: 0, y: 0},{x: 0, y: 1}],[{x: 0, y: 0},{x: 0, y: -1}]));

        debug("tangent:", findRightTangent({cx: 1, cy: 0, r: (1 / Math.sqrt(2))}, [{x: 2, y: 2}, {x: 3, y: 3}]));

        debug("point line distance: ", pointLineDistanceWithSign(
            {x: 0, y: 1},
            [{x: 0, y: 0}, {x: 1, y: 1}]
        ));

        debug("is circle left: ", isCircleLeft(
            {id: 1, cx: 2, cy: 0, r: 0.5},
            [{x: 3, y: 0}, {x: 3, y: 1}]
        ));

        debug("is proper subset:", properSubset(
            [{x: 3, y: 0}, {x: 3, y: 1}],
            [{x: 0, y: 0}, {x: 0, y: 1}],
            [
                {id: 0, cx: 5, cy: 0, r: 1},
                {id: 1, cx: 2, cy: 0, r: 0.5},
                {id: 2, cx: 1, cy: 0, r: 0.5}
            ]
        ));

    };

    var buildSvgPath = function(convexHull) {

        //console.log("convex hull of:", convexHull);
        var circle;
        var bridges = [];
        if(convexHull == null || convexHull.length == 0)
            return "M 0 0 z";
        if(convexHull.length == 1) {

            circle = convexHull[0];
            return "M " + (circle.cx + circle.r) + " " + circle.cy + " " +
                "A " + circle.r + " " + circle.r + " 0 0 1 " + (circle.cx - circle.r) + " " + circle.cy + " " +
                "A " + circle.r + " " + circle.r + " 0 0 1 " + (circle.cx + circle.r) + " " + circle.cy + " z ";
        }
        convexHull.forEach(function(circle, index) {
            var nextCircle = convexHull[(index + 1) % convexHull.length];
            bridges.push(findRightTangentToCircles(circle, nextCircle));
        });

        var startPoint = bridges[bridges.length - 1][1];
        var svgPath = "M " + startPoint.x + " " + startPoint.y + " ";
        convexHull.forEach(function(circle, index) {
            var arcEnd = bridges[index][0],
                lineEnd = bridges[index][1];
            svgPath +=
                "A " + circle.r + " " + circle.r + " 0 0 1 " + arcEnd.x + " " + arcEnd.y + " " +
                "L " + lineEnd.x + " " + lineEnd.y + " ";
        });
        svgPath += "z ";

        return svgPath;
    };

    var buildSvgMultiPath = function(convexHulls) {
        var svgMultiPath = "";
        convexHulls.forEach(function(convexHull) {
            svgMultiPath += buildSvgPath(convexHull);
        });
        return svgMultiPath;
    };

    var computeClusters = function(circles, maxDistance) {
        var clusterCount = 0;
        var circleIndex = {};
        var circleClusters = {};
        var clusters = [];
        if(circles.length == 0)
            return clusters;
        if(circles.length == 1)
            return [circles];
        circles.forEach(function(c1) {
            circleIndex[c1.id] = c1;
            circles.forEach(function(c2) {
                if(c1.id == c2.id)
                    return;
                if(pointDistance({x: c1.cx, y: c1.cy}, {x: c2.cx, y: c2.cy}) < maxDistance) {
                    if(circleClusters[c1.id] != undefined)
                        circleClusters[c2.id] = circleClusters[c1.id];
                    else if(circleClusters[c2.id] != undefined)
                        circleClusters[c1.id] = circleClusters[c2.id];
                    else {
                        circleClusters[c1.id] = clusterCount;
                        circleClusters[c2.id] = clusterCount;
                        clusters.push([]);
                        clusterCount++;
                    }
                }
                else {
                    if(circleClusters[c1.id] == undefined) {
                        circleClusters[c1.id] = clusterCount;
                        clusters.push([]);
                        clusterCount++;
                    }
                    if(circleClusters[c2.id] == undefined) {
                        circleClusters[c2.id] = clusterCount;
                        clusters.push([]);
                        clusterCount++;
                    }
                }
            })
        });
        var i;
        for(i in circleClusters) {
            if(circleClusters.hasOwnProperty(i)) {
                clusters[circleClusters[i]].push(circleIndex[i]);
            }
        }
        return clusters;
    };


    return {
        computeConvexHull: function(circles) {
            var theConvexHull =  convexHull(circles, 0);
            var svgPath = buildSvgPath(theConvexHull);
            return {
                circles: theConvexHull,
                path: svgPath
            };
        },
        computeConvexHullOfClusters: function(circles, maxDistance) {
            var clusters = computeClusters(circles, maxDistance);
            var hulls = clusters.map(function(cluster) {
                return convexHull(cluster, 0);
            });
            return {
                circles: hulls,
                path: buildSvgMultiPath(hulls)
            }
        },
        test: test
    }

}();
