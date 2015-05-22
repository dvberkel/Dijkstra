;(function(){
    var G = dijkstra.hexGrid(4);

    new dijkstra.GraphView(G, document.getElementById('graph'), {
        placement: function(position){ return {
            'x': 100 * position.x,
            'y': 100 * position.y
        }},
        radius: 20,
        between: 0.3

    });

    window.G = G;
})();
