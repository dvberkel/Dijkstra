;(function(dijkstra){
    function extend(){
        var result = {};
        Array.prototype.slice.call(arguments, 0).forEach(function(argument){
            for (var key in argument) {
                if (!result[key]) {
                    result[key] = argument[key];
                }
            }
        });
        return result;
    };

    var Vertex = function(x, y, id, name){
        this.x = x;
        this.y = y;
        this.id = id;
        this.name = name;
    };

    var Edge = function(u, v, id){
        this.tail = u;
        this.head = v;
        this.id = id;
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
    Graph.prototype.addEdge = function(u, v) {
        var e = new Edge(u, v, this.edgeId++);
        this.edges.push(e);
        return e;
    };
    Graph.prototype.neighbourhood = function(v) {
        return this.edges
            .filter(function(e){ return e.incidentTo(v); })
            .map(function(e){ return e.neighbour(v); });
    }

    var GraphView = dijkstra.GraphView = function(graph, container, options){
        this.options = extend(options || {},
                              { 'radius': 1 },
                              { 'placement': function(position){ return position; } });
        this.graph = graph;
        this.container = container;
        this.placement = this.options.placement || function(position){ return position; }
        this.vertices = {};
        this.update();
    };
    GraphView.prototype.update = function(){
        this.graph.vertices.forEach(function(v){
            var vertex = this.findVertex(v.id);
            var position = this.placement(v);
            vertex.setAttribute('cx', position.x);
            vertex.setAttribute('cy', position.y);
        }.bind(this));
    };
    GraphView.prototype.findVertex = function(id){
        if (!this.vertices[id]) {
            var v = this.vertices[id] = document.createElementNS('http://www.w3.org/2000/svg','circle');
            v.setAttribute('r', this.options.radius)
            this.container.appendChild(v);
        }
        return this.vertices[id];
    };
})(window.dijkstra = window.dijkstra || {})
