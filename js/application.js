;(function(){
    var G = dijkstra.hexGrid(2);

    var view = new dijkstra.GraphView(G, document.getElementById('graph'), {
        placement: function(position){ return {
            'x': 100 * position.x,
            'y': 100 * position.y
        }},
        radius: 20,
        between: 0.3,
        vertex: {
            events : {
                mouseenter: function(event){
                    var id = this.getAttribute('data-vertex');
                    var v = G.findVertex(id);
                    algorithm.setPathFrom(v);
                }
            }
        }
    });

    var algorithm = new dijkstra.ShortestPath(G);
    algorithm.setSource(G.vertices[0]);
    algorithm.setTarget(G.vertices[G.vertices.length - 1]);
    algorithm.setPathFrom(G.vertices[G.vertices.length - 1]);

    view.visualize(algorithm);

    function loop(){
        view.update();
        requestAnimationFrame(loop);
    };
    loop();

    document.body.addEventListener('keypress', function(event){
        if (event.keyCode == 32) {
            algorithm.step();
        }
    });

    window.G = G;
})();
