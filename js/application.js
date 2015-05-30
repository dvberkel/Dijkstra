;(function(){
    var G = dijkstra.hexGrid(2);

    function nextWeight(weights) {
        return function(event){
            var id = this.getAttribute('data-edge');
            var e = G.findEdge(id);
            var weight = weights[e.weight] || 1;
            e.weight = weight;
            algorithm.reset();
        };
    }

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
        },
        edge: {
            events: {
                click: nextWeight({ 1: 3, 3: 5, 5: 10 })
            },
            color: {
                forWeight: {
                    1: 'black',
                    3: 'blue',
                    5: 'orange',
                    10: 'red'
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
        if (event.charCode == 32) { /* spacebar */
            algorithm.step();
        }
    });

    (function(){
        function save(){
            context.drawImage(image, 0, 0);
            var canvasData = canvas.toDataURL('image/png');
            link.href= canvasData;
            link.download = prefix + (n++) + '.png';
            link.click();
        }

        var prefix = 'dijkstra-';
        var n = 0;
        var container = document.getElementById('container');
        var image = new Image();
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var link = document.createElement('a');
        link.style = 'display: none'
        document.body.appendChild(link);
        image.onload = save;
        document.body.addEventListener('keypress', function(event){
            if (event.charCode == 112) { /* p */
                var imageSrc = 'data:image/svg+xml;base64,'+ btoa(container.innerHTML);
                image.src = imageSrc;
            }
        });
    })();

    window.G = G;
})();
