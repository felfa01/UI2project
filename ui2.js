window.onload = (function() {


var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var canvas = document.getElementById("canvas");

console.log(canvas.width);
console.log(canvas.height);
console.log(canvas);

var renderer = new THREE.WebGLRenderer();
//renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setSize( canvas.offsetWidth, canvas.offsetHeight );
canvas.appendChild( renderer.domElement );

window.addEventListener('resize', function() {
      var WIDTH = canvas.offsetWidth,
          HEIGHT = canvas.offsetHeight;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
    });

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

var render = function () {
	requestAnimationFrame( render );

	renderer.render(scene, camera);
	};

render();
console.log(canvas.width);
console.log(canvas.height);

})