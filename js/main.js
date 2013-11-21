(function($){
  var initialNode
  var currentNode
  var visitedNodes
  var unvisitedNodes
  var phase

  var Renderer = function(canvas){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var particleSystem
    var message = ""
    var message2 = ""
    var phaseCalculatedNodes = []
    var phaseNeededNodes = []
    var w = 10
        // -2 : Intro to Dijkstra's
        // -1 : Setting up graph
        // 0 : Select the initial node
        // 1 : Find new tentative weights
        // 2 : Select the new known node and go to step 0

    var that = {
      init:function(system){
        //
        // the particle system will call the init function once, right before the
        // first frame is to be drawn. it's a good place to set up the canvas and
        // to pass the canvas size to the particle system
        //
        // save a reference to the particle system for use in the .redraw() loop
        particleSystem = system

        // inform the system of the screen dimensions so it can map coords for us.
        // if the canvas is ever resized, screenSize should be called again with
        // the new dimensions
        particleSystem.screenSize(canvas.width, canvas.height) 
        particleSystem.screenPadding(80) // leave an extra 80px of whitespace per side
        
        // set up some event handlers to allow for node-dragging
        that.initMouseHandling()
      },

      edgeExistsBetween:function(node1, node2){
        var edges = particleSystem.getEdges(node1,node2)
        if (edges.length == 0) {
          edges = particleSystem.getEdges(node2,node1)
        }
        if (edges.length == 0) {
          return false
        }
        return true
      },

      getEdgeWeightBetween:function(node1, node2){
        var edges = particleSystem.getEdges(node1,node2)
        if (edges.length == 0) {
          edges = particleSystem.getEdges(node2,node1)
        }
        if (edges.length == 0) {
          return -1
        }
        return edges[0].data.weight
      },

      nextStep:function(){
        switch(phase){
          case -2:
          phase = -1
          message = "Each point is named by its letter. Each path has a numeric length written near its midpoint. Click to continue."
          break;

          case -1:
          phase = 0
          message = "The red numbers by each point is its tentative distance from our initial point (point A). INF represent infinity."
          message2 = "Until we find a path to each point, the distance is infinite. The distance from point A to point A is 0. Select point A to begin."
          break;

          case 0:
          phase = 1
          message = "Find the new tentative distances to each point connected to your current point if its shortest path has not already been found."
          message2 = "Calculate this distance by summing the shortest distance to your current point with the length of the path to each point."
          phaseCalculatedNodes = []
          phaseNeededNodes = []
          particleSystem.getEdgesFrom(currentNode).forEach(function(e) {
            if (!e.target.data.visited && ((currentNode.data.tw + that.getEdgeWeightBetween(currentNode, e.target)) < e.target.data.tw || e.target.data.tw == -1)) phaseNeededNodes.push(e.target);
          })
          particleSystem.getEdgesTo(currentNode).forEach(function(e) {
            if (!e.source.data.visited && ((currentNode.data.tw + that.getEdgeWeightBetween(currentNode, e.source)) < e.source.data.tw || e.source.data.tw == -1)) phaseNeededNodes.push(e.source);
          })
          if (phaseNeededNodes.length == 0) {
            phase = 3;
            that.nextStep();
          }
          break;

          case 1:
          phase = 2
          // var edges = particleSystem.getEdgesFrom(currentNode).concat(particleSystem.getEdgesTo(currentNode))
          var shortest = unvisitedNodes[0]
          unvisitedNodes.forEach(function(e){
            if (e.data.tw != -1 && e.data.tw < shortest.data.tw) {
              shortest = e
            }
          })
          shortest.data.isNextShortest = true
          message = "Now select the point with the shortest tentative length from all of your unsolved points."
          message2 = "We know that this number will be that point's shortest possible distance because all other paths will be longer."
          break;

          case 2:
          phase = 0
          that.nextStep()
          break;

          case 3:
          message = "We have now found the shortest distance from point A to each point."
          message2 = "Click to start over."
          break;

        }
      },
      
      redraw:function(){
        // 
        // redraw will be called repeatedly during the run whenever the node positions
        // change. the new positions for the nodes can be accessed by looking at the
        // .p attribute of a given node. however the p.x & p.y values are in the coordinates
        // of the particle system rather than the screen. you can either map them to
        // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
        // which allow you to step through the actual node objects but also pass an
        // x,y point in the screen's coordinate system
        // 
        ctx.fillStyle = "white"
        ctx.fillRect(0,0, canvas.width, canvas.height)

        if (phase == -2) {
          ctx.font = "20px Helvetica"
          ctx.fillStyle="#000000"
          ctx.fillText("Dijkstra's Algorithm:", 40, 40)
          ctx.font = "18px Helvetica"
          ctx.fillStyle="#000000"
          ctx.fillText("A method to find the shortest path between two points in a graph", 40, 80)
          ctx.font = "16px Helvetica"
          ctx.fillStyle="#000000"
          ctx.fillText("This interactive tutorial will explain to you how Dijkstra's Algorithm works.", 40, 140)
          ctx.fillText("The algorithm is used to find the shortest path between a starting point and the rest of the points in a graph.", 40, 160)
          ctx.fillText("Graphs consists of points (or nodes) that are connected by paths (or edges).", 40, 180)
          ctx.fillText("Not every point has to be directly connected to every other point. However, each point can be reached from any other point", 40, 200)
          ctx.fillText("by taking a connected path from point to point. Each of these paths has a known numeric length.", 40, 220)
          ctx.fillText("Click to continue.", 40, 260)
        } else {

          // write instructions
          ctx.font = "16px Helvetica"
          ctx.fillStyle="#000000"
          ctx.fillText(message, 0, canvas.height-100)
          ctx.fillText(message2, 0, canvas.height-80)

          
          particleSystem.eachEdge(function(edge, pt1, pt2){
            // edge: {source:Node, target:Node, length:#, data:{}}
            // pt1:  {x:#, y:#}  source position in screen coords
            // pt2:  {x:#, y:#}  target position in screen coords

            // draw a line from pt1 to pt2
            ctx.strokeStyle = "rgba(125,20,150, .333)"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(pt1.x, pt1.y)
            ctx.lineTo(pt2.x, pt2.y)
            ctx.stroke()

            ctx.font = "16px Helvetica"
            ctx.fillStyle="#000000";
            ctx.fillText(edge.data.weight, (pt1.x + pt2.x)/2, (pt1.y + pt2.y)/2)
        })

        particleSystem.eachNode(function(node, pt){
          // node: {mass:#, p:{x,y}, name:"", data:{}}
          // pt:   {x:#, y:#}  node position in screen coords

          // draw a rectangle centered at pt
          var width = (node.data.radius != null) ? node.data.radius : w
          ctx.fillStyle = (node.data.color != null) ? node.data.color : "black"
          if (node.data.visited) ctx.fillStyle = "red"
          if (node == currentNode && node.data.visited) {
            ctx.strokeStyle = "red"
            ctx.strokeRect(pt.x-width/2, pt.y-width/2, width,width)
          } else {
            ctx.fillRect(pt.x-width/2, pt.y-width/2, width,width)
          }

          ctx.font = "16px Helvetica"
          ctx.fillStyle="#000000"
          ctx.fillText(node.name, pt.x-width/2, pt.y-width/2 - 5)

          if (phase >= 0) {
            tw = (node.data.tw)==-1 ? "INF" : node.data.tw

            ctx.font = "14px Helvetica"
            ctx.fillStyle="#FF0000"
            ctx.fillText(tw, pt.x-width/2, pt.y + width + 10)
          }

        }) 
        }                           
      },
      
      initMouseHandling:function(){
        // no-nonsense drag and drop (thanks springy.js)
        var dragged = null;

        // set up a handler object that will initially listen for mousedowns then
        // for moves and mouseups while dragging
        var handler = {
          clicked:function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
            nearest = particleSystem.nearest(_mouseP);
            if (phase == -2) {
              that.nextStep()
              return
            } else if (phase == -1) {
              that.nextStep()
              return
            } else if (phase == 3) {
              phase = -2;
              currentNode = initialNode;
              location.reload();
              return;
            }

            if (nearest.node.data.hovered) {
              var node = nearest.node
              console.log(phase)
              switch(phase){
                case 0:
                if (node == initialNode) {
                  node.data.visited = true
                  that.nextStep()
                } else {
                  alert("Start by visiting our initial node A")
                }
                break;

                case 1:
                if (that.edgeExistsBetween(currentNode, node)){
                  if (node.data.visited) {
                    alert("You've already determined the final length to this point.")
                  } else if (phaseCalculatedNodes.indexOf(node) == -1) {
                    var userTentativeWeight = prompt("What is the new distance from Point A to Point " + node.name + "?")
                    if (userTentativeWeight == currentNode.data.tw + that.getEdgeWeightBetween(currentNode, node)) {
                      if (userTentativeWeight < node.data.tw || node.data.tw == -1) {
                        alert("Correct!")
                        node.data.tw = parseInt(userTentativeWeight)
                        phaseCalculatedNodes.push(node)
                        if(phaseCalculatedNodes.length == phaseNeededNodes.length){
                          that.nextStep()
                        }
                      }
                      else {
                        alert("That's right, but you've already found a shorter path to this point so we will not update the tentative distance.")
                      }

                    } else if (userTentativeWeight != null) {
                      alert("That's not right. Add the length of the path to this point to the shortest distance you found to point " +currentNode.name + ".")
                    }
                  } else {
                    alert("You've already calculated this tentative distance.")
                  }
                } else if (visitedNodes.indexOf(node) != -1) {
                  alert("You do not need to calculate the distance to nodes you've already found the shortest path to.")
                } else {
                  alert("This point doesn't connect to a point that you've found the shortest distance to.\nYou can only calculate the distance to a point that is connected to one of the red points.")
                }
                break;

                case 2:
                if (node.data.visited) {
                  alert("You have already solved the shortest distance to this point!")
                }else if (node.data.isNextShortest) {
                  alert("That's right! Now we know that this tentative distance is the correct shortest distance because every other path you have will sum to a greater distance.")
                  node.data.visited = true
                  visitedNodes.push(node)
                  var i = unvisitedNodes.indexOf(node)
                  if (i != -1) unvisitedNodes.splice(i, 1)
                  currentNode = node
                  that.nextStep()
                } else {
                  alert("That's not right. Look at all your unsolved points (black). Which has the least tentative distance (red number)?")
                }
                break;
              }
            }

            return false
          },
            moved:function(e){
              particleSystem.start()
              if (phase < 0) return

              var pos = $(canvas).offset();
             _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
             nearest = particleSystem.nearest(_mouseP);

             particleSystem.eachNode(function(node, pt){
             if (node.data.hovered) {
                if (nearest.distance > nearest.node.data.radius || node != nearest.node) {
                 particleSystem.tweenNode(node, .25, {color:"#000000", radius:10})
                 node.data.hovered = false
                }
              }
            });
             if (nearest.distance < nearest.node.data.radius) {
               e.target.style.cursor = 'pointer'
               if (!nearest.node.data.hovered) {
                 particleSystem.tweenNode(nearest.node, .25, {color:"#ffa500",radius:20})
                 nearest.node.data.hovered = true
               }
             } else {
               e.target.style.cursor = 'default'
             }
            }
        }
        
        // start listening
        $(canvas).mousedown(handler.clicked);
        $(canvas).mousemove(handler.moved);

      },
      
    }
    return that
  }    

  $(document).ready(function(){
    var sys = arbor.ParticleSystem(1000, 600, 0.5) // create the system with sensible repulsion/stiffness/friction
    sys.parameters({gravity:false}) // use center-gravity to make the graph settle nicely (ymmv)
    sys.renderer = Renderer("#viewport") // our newly created renderer will have its .init() method called shortly by sys...

    // add some nodes to the graph and watch it go...

    var nodeA = sys.addNode('A', {fixed:true, radius:10, color:"#000000", hovered:false, visited:false, isNextShortest:false, x:0, y:1.20, tw:0})
    var nodeB = sys.addNode('B', {fixed:true, radius:10, color:"#000000", hovered:false, visited:false, isNextShortest:false, x:0, y:.40, tw:-1})
    var nodeC = sys.addNode('C', {fixed:true, radius:10, color:"#000000", hovered:false, visited:false, isNextShortest:false, x:.5, y:.80, tw:-1})
    var nodeD = sys.addNode('D', {fixed:true, radius:10, color:"#000000", hovered:false, visited:false, isNextShortest:false, x:1, y:.40, tw:-1})
    var nodeE = sys.addNode('E', {fixed:true, radius:10, color:"#000000", hovered:false, visited:false, isNextShortest:false, x:1, y:1.20, tw:-1})
    var nodeF = sys.addNode('F', {fixed:true, radius:10, color:"#000000", hovered:false, visited:false, isNextShortest:false, x:1.4, y:0, tw:-1})
    var nodeG = sys.addNode('G', {fixed:true, radius:10, color:"#000000", hovered:false, visited:false, isNextShortest:false, x:1.6, y:.80, tw:-1})

    sys.addEdge(nodeA,nodeB, {weight:4})
    sys.addEdge(nodeA,nodeC, {weight:3})
    sys.addEdge(nodeA,nodeE, {weight:7})
    sys.addEdge(nodeB,nodeC, {weight:6})
    sys.addEdge(nodeB,nodeD, {weight:5})
    sys.addEdge(nodeC,nodeD, {weight:11})
    sys.addEdge(nodeC,nodeE, {weight:8})
    sys.addEdge(nodeD,nodeE, {weight:2})
    sys.addEdge(nodeD,nodeF, {weight:2})
    sys.addEdge(nodeD,nodeG, {weight:10})
    sys.addEdge(nodeE,nodeG, {weight:5})
    sys.addEdge(nodeF,nodeG, {weight:3})

    initialNode = nodeA
    currentNode = initialNode
    visitedNodes = [initialNode]
    unvisitedNodes = [nodeB,nodeC,nodeD,nodeE,nodeF,nodeG]

    // initialNode.data.visited = true

    var edgesFromA = sys.getEdgesFrom(nodeA)
    var edgesToA = sys.getEdgesTo(nodeA)

    // var edgesFromB = sys.getEdgesFrom(nodeB)
    // var edgesToB = sys.getEdgesTo(nodeB)
    // console.log(edgesFromB)
    // console.log(edgesToB)
    // console.log(edgesToB.concat(edgesFromB))

    var shortest = edgesFromA[0]
    edgesFromA.forEach(function(e){
      if (e.data.weight < shortest.data.weight) {
        shortest = e
      }
    })
    shortest.target.data.isNextShortest = true

    phase = -2

    // or, equivalently:
    //
    // sys.graft({
    //   nodes:{
    //     f:{alone:true, mass:.25}
    //   }, 
    //   edges:{
    //     a:{ b:{},
    //         c:{},
    //         d:{},
    //         e:{}
    //     }
    //   }
    // })
    
  })

})(this.jQuery)