;(function(){
    var G = new dijkstra.Graph();
    var a = G.addVertex(0, 0, "A");
    var b = G.addVertex(1, 0, "B");
    var c = G.addVertex(0.5, Math.sqrt(3)/2, "c");

    var e = G.addEdge(a, b);

    new dijkstra.GraphView(G, document.getElementById('graph'), {
        placement: function(position){ return {
            'x': 100 * position.x,
            'y': 100 * position.y
        }},
        radius: 20

    });

    window.G = G;
})();
