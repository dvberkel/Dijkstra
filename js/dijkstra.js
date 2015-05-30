;(function(dijkstra){
    var extend = dijkstra.extend = function extend(){
        var result = {};
        Array.prototype.slice.call(arguments, 0).forEach(function(argument){
            for (var key in argument) {
                if (!result[key]) {
                    result[key] = argument[key];
                }
                if (typeof result[key] === 'object') {
                    result[key] = extend(result[key], argument[key]);
                }
            }
        });
        return result;
    };

    function between(u, v, t){
        return {
            'x': (1 - t) * u.x + t * v.x,
            'y': (1 - t) * u.y + t * v.y
        };
    };

    function contains(collection, target) {
        return collection.reduce(function(found, element){ return found || element === target }, false);
    }

    var Vertex = function(x, y, id, name){
        this.x = x;
        this.y = y;
        this.id = id;
        this.name = name;
    };

    var Edge = function(u, v, id, weight){
        this.tail = u;
        this.head = v;
        this.id = id;
        this.weight = weight || 1;
    };
    Edge.prototype.incidentTo = function(v){
        return this.tail === v || this.head === v;
    };
    Edge.prototype.neighbour = function(v){
        if (!this.incidentTo(v)) { throw new Error("vertex not incident to edge"); }
        return this.head === v ? this.tail: this.head;
    };

    var Graph = dijkstra.Graph = function(){
        this.vertexId = 0;
        this.vertices = [];
        this.edgeId = 0;
        this.edges = [];
    };
    Graph.prototype.addVertex = function(x, y, name) {
        var v = new Vertex(x, y, this.vertexId++, name || "");
        this.vertices.push(v);
        return v;
    };
    Graph.prototype.addEdge = function(u, v, weight) {
        var e = new Edge(u, v, this.edgeId++, weight);
        this.edges.push(e);
        return e;
    };
    Graph.prototype.neighbourhood = function(v) {
        return this.edges
            .filter(function(e){ return e.incidentTo(v); })
            .map(function(e){ return e.neighbour(v); });
    };
    Graph.prototype.findVertex = function(id){
        return this.vertices.reduce(function(vertex, candidate){
            return candidate.id == id ? candidate: vertex;
        }, undefined);
    };
    Graph.prototype.findEdge = function(id){
        return this.edges.reduce(function(edge, candidate){
            return candidate.id == id ? candidate: edge;
        }, undefined);
    };
    Graph.prototype.findEdgeBetween = function(u, v){
        var candidates = this.edges.filter(function(edge){
            return edge.incidentTo(u) && edge.incidentTo(v);
        });
        if (candidates.length > 0){
            return candidates[0];
        }
        return undefined;
    };

    var GraphView = dijkstra.GraphView = function(graph, container, options){
        this.options = extend(options || {},
                              { 'radius': 1 },
                              { 'placement': function(position){ return position; } },
                              { 'between': 0 },
                              { 'color': {
                                  'default': 'lightcyan',
                                  'visited': 'gray',
                                  'frontier': 'pink',
                                  'source': 'red',
                                  'target': 'green',
                                  'current': 'blue',
                                  'neighbour': 'yellow',
                                  'path': 'white'

                              }},
                              { 'vertex': { 'events': {} } });
        this.graph = graph;
        this.container = container;
        this.placement = this.options.placement || function(position){ return position; }
        this.vertices = {};
        this.edges = {};
        this.update();
    };
    GraphView.prototype.update = function(){
        this.graph.vertices.forEach(function(v){
            var vertex = this.findVertex(v.id);
            var position = this.placement(v);
            vertex.setAttribute('cx', position.x);
            vertex.setAttribute('cy', position.y);
            vertex.setAttribute('fill', this.options.color.default);
            vertex.setAttribute('stroke', 'black');
        }.bind(this));
        this.graph.edges.forEach(function(e){
            var edge = this.findEdge(e.id);
            var head = this.placement(between(e.head, e.tail, this.options.between));
            var tail = this.placement(between(e.tail, e.head, this.options.between));
            edge.setAttribute('x1', head.x);
            edge.setAttribute('y1', head.y);
            edge.setAttribute('x2', tail.x);
            edge.setAttribute('y2', tail.y);
        }.bind(this));
        if (this.algorithm){
            this.algorithm.visited.forEach(function(v){
                var visited = this.findVertex(v.id);
                visited.setAttribute('fill', this.options.color.visited);
            }.bind(this));
            this.algorithm.candidates.forEach(function(v){
                var candidate = this.findVertex(v.id);
                candidate.setAttribute('fill', this.options.color.frontier);
            }.bind(this));
            var source = this.findVertex(this.algorithm.source.id);
            var target = this.findVertex(this.algorithm.target.id);
            source.setAttribute('fill', this.options.color.source);
            target.setAttribute('fill', this.options.color.target);
            if (this.algorithm.current){
                var current = this.findVertex(this.algorithm.current.id);
                current.setAttribute('fill', this.options.color.current);
            }
            this.algorithm.neighbourhood.forEach(function(v){
                var neighbour = this.findVertex(v.id);
                neighbour.setAttribute('fill', this.options.color.neighbour);

            }.bind(this));
            if (this.algorithm.pathFrom){
                var v = this.algorithm.pathFrom;
                while (v) {
                    var vertex = this.findVertex(v.id);
                    vertex.setAttribute('stroke', this.options.color.path);
                    v = this.graph.findVertex(this.algorithm.direction[v.id]);
                }
            }
        }
    };
    GraphView.prototype.findVertex = function(id){
        if (!this.vertices[id]) {
            var v = this.vertices[id] = document.createElementNS('http://www.w3.org/2000/svg','circle');
            v.setAttribute('r', this.options.radius)
            v.setAttribute('data-vertex', id);
            for (var event in this.options.vertex.events) {
                v.addEventListener(event, this.options.vertex.events[event]);
            }
            this.findVerticesContainer().appendChild(v);
        }
        return this.vertices[id];
    };
    GraphView.prototype.findVerticesContainer = function(){
        if (!this.verticesContainer) {
            this.verticesContainer = this.container.querySelector('#vertices');
        }
        return this.verticesContainer;
    };
    GraphView.prototype.findEdge = function(id){
        if (!this.edges[id]) {
            var e = this.edges[id] = document.createElementNS('http://www.w3.org/2000/svg','line');
            e.setAttribute('data-edge', id);
            this.findEdgesContainer().appendChild(e);
        }
        return this.edges[id];
    };
    GraphView.prototype.findEdgesContainer = function(){
        if (!this.edgesContainer) {
            this.edgesContainer = this.container.querySelector('#edges');
        }
        return this.edgesContainer;
    };
    GraphView.prototype.visualize = function(algorithm){
        this.algorithm = algorithm;
    };

    dijkstra.hexGrid = function(n){
        var G = new Graph();
        var h = Math.sqrt(3)/2;
        var vertices = {};
        for (var y = -n; y <= n; y++) {
            vertices[y] = {};
            var Y = Math.abs(y);
            var m = 2 * n + 1 - Y
            for (var x = 0; x < m; x++) {
                vertices[y][x] = G.addVertex(x - n + 0.5 * Y, y * h);
            }
        }
        for (var y in vertices) {
            var Y = parseInt(y);
            for (var x in vertices[Y]) {
                var X = parseInt(x);
                var u = vertices[Y][X];
                if (vertices[Y][X + 1]) { G.addEdge(u, vertices[Y][X + 1]); }
                if (vertices[Y+1] && vertices[Y+1][X]) { G.addEdge(u, vertices[Y + 1][X]); }
                if (Y < 0 && vertices[Y+1] && vertices[Y+1][X + 1]) { G.addEdge(u, vertices[Y + 1][X + 1]); }
                if (Y >= 0 && vertices[Y+1] && vertices[Y+1][X - 1]) { G.addEdge(u, vertices[Y + 1][X - 1]); }
            }
        }
        return G;
    };

    var states = {
        'PICK'     : { 'next': function(){ return states.NEIGHBOUR; } },
        'NEIGHBOUR': { 'next': function(){ return states.FRONTIER; } },
        'FRONTIER': { 'next': function(){ return states.PICK; } }
    };
    var ShortestPath = dijkstra.ShortestPath = function(graph){
        this.graph = graph;
        this.reset();
    };
    ShortestPath.prototype.reset = function(){
        this.distance = {};
        this.graph.vertices.forEach(function(vertex){
            this.distance[vertex.id] = Number.POSITIVE_INFINITY;
        }.bind(this));
        this.candidates = [];
        this.current = undefined;
        this.neighbourhood = [];
        this.visited = [];
        this.state = states.PICK;
        this.direction = {};
        if (this.source) {
            this.candidates.push(this.source);
            this.distance[this.source.id] = 0;
        }
    };
    ShortestPath.prototype.setSource = function(u){
        this.source = u;
        this.reset();
    };
    ShortestPath.prototype.setTarget = function(v){
        this.target = v;
        this.reset();
    };
    ShortestPath.prototype.setPathFrom = function(w){
        this.pathFrom = w;
    }
    ShortestPath.prototype.step = function(){
        if (this.state === states.PICK) {
            this.current = this.candidates.reduce(function(best, candidate){
                return this.distance[candidate.id] < this.distance[best.id] ? candidate: best;
            }.bind(this));
            this.candidates = this.candidates.filter(function(candidate){
                return candidate !== this.current;
            }.bind(this));
        }
        if (this.state == states.NEIGHBOUR){
            var neighbourhood = this.graph.neighbourhood(this.current).filter(function(v){ return !contains(this.visited, v); }.bind(this));
            neighbourhood.forEach(function(neighbour){
                var edge = this.graph.findEdgeBetween(this.current, neighbour);
                var d = this.distance[this.current.id] + edge.weight;
                if (this.direction[neighbour.id] == undefined || this.distance[neighbour.id] > d) {
                    this.direction[neighbour.id] = this.current.id;
                }
                this.distance[neighbour.id] = Math.min(this.distance[neighbour.id], d);
                this.candidates.push(neighbour);
            }.bind(this));
            this.neighbourhood = neighbourhood;
            this.visited.push(this.current);
        }
        if (this.state == states.FRONTIER){
            this.neighbourhood = [];
        }
        this.state = this.state.next();
    }
})(window.dijkstra = window.dijkstra || {})
