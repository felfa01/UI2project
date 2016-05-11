window.onload = (function() {

//global var
var plane;
var mouseDown = false;
var rotateStartPoint = new THREE.Vector3(0, 0, 1);
var rotateEndPoint = new THREE.Vector3(0, 0, 1);

var curQuaternion;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var rotationSpeed = 2;
var lastMoveTimestamp,
    moveReleaseTimeDelta = 50;

var startPoint = {
    x: 0,
    y: 0
};
var deltaX = 0,
	deltaY = 0;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(), 
offset = new THREE.Vector3(),
INTERSECTED, SELECTED;

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

//function for adding scen & figures

function init() { 

var canvas = document.getElementById("canvas");

console.log(canvas.childNodes);
console.log(canvas);

renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setClearColor(0x000000, 0);
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


//Main cube

var geometry = new THREE.BoxGeometry( 2, 2, 2 );

for (var i = 0; i < geometry.faces.length; i += 2) {

            var color = {
                h: (1 / (geometry.faces.length)) * i,
                s: 0.5,
                l: 0.5
            };

            geometry.faces[i].color.setHSL(color.h, color.s, color.l);
            geometry.faces[i + 1].color.setHSL(color.h, color.s, color.l);

        }

var cubeMaterial = new THREE.MeshBasicMaterial(
            {
                vertexColors: THREE.FaceColors,
                overdraw: 0.5
            });


//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

cube = new THREE.Mesh( geometry, cubeMaterial );
cube.name = "Big cube";
scene.add( cube );

//small cubes

var colors = [ 0x0000CD, 0xB22222, 0x32CD32 ];

var smallGeometry = new THREE.BoxGeometry( 1, 1, 1 );

for (var i = 0; i < 3; i++){

    var smallCubeMaterial = new THREE.MeshBasicMaterial( 
    { 
        color: colors[i],
        overdraw: 0.5 
    });

smallCube = new THREE.Mesh( smallGeometry, smallCubeMaterial );

smallCube.position.y = -3;
smallCube.position.x = i*3 - 3;

smallCube.name = 'Small cubes';
scene.add( smallCube );

}


/*                
                for ( var i = 0; i < 3; i ++ ) {
                    var object = new THREE.Mesh( smallGeometry, cubeMaterial );
                    //object.position.x = 0;
                    //object.position.y = 100;
                    //object.position.z = 0;
                    console.log(object);
                    console.log(cube);
                    scene.add( object );
                }
*/


camera.position.z = 5;

/*
//reder function from before adding rotationBox code. 
 render = function () {
	requestAnimationFrame( render );

	renderer.render(scene, camera);
	};

render();
*/

console.log(canvas.childNodes);


canvas.addEventListener('mousedown', onDocumentMouseDown, false);

animate();

}


//copy of mouse move from rotationbox with configs
function onDocumentMouseDown(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {

        SELECTED = intersects[0].object;

        if (SELECTED.name == 'Big cube') {

            console.log(SELECTED);
            document.getElementById("canvas").addEventListener('mousemove', onDocumentMouseMove, false);
            document.getElementById("canvas").addEventListener('mouseup', onDocumentMouseUp, false);

            mouseDown = true;

            startPoint = {
                x: event.clientX,
                y: event.clientY
            };

            rotateStartPoint = rotateEndPoint = projectOnTrackball(0, 0);

        }else if(SELECTED.name == 'Small cubes'){

        console.log(SELECTED);
        document.getElementById("canvas").addEventListener('mousemove', MoveCube, false);
        //document.getElementById("canvas").addEventListener('mouseup', onDocumentMouseUp, false);

    };
  }
}

    function onDocumentMouseMove(event) {
        deltaX = event.x - startPoint.x;
        deltaY = event.y - startPoint.y;

        handleRotation();

        startPoint.x = event.x;
        startPoint.y = event.y;

        lastMoveTimestamp = new Date();
    }

    function MoveCube(event) {
       

    }


    function onDocumentMouseUp(event) {
        if (new Date().getTime() - lastMoveTimestamp.getTime() > moveReleaseTimeDelta) {
            deltaX = event.x - startPoint.x;
            deltaY = event.y - startPoint.y;
        }

        mouseDown = false;

        document.getElementById("canvas").removeEventListener('mousemove', onDocumentMouseMove, false);
        document.getElementById("canvas").removeEventListener('mouseup', onDocumentMouseUp, false);
    }

    function projectOnTrackball(touchX, touchY) {
        var mouseOnBall = new THREE.Vector3();

        mouseOnBall.set(
            clamp(touchX / windowHalfX, -1, 1), clamp(-touchY / windowHalfY, -1, 1),
            0.0
        );

        var length = mouseOnBall.length();

        if (length > 1.0) {
            mouseOnBall.normalize();
        }
        else {
            mouseOnBall.z = Math.sqrt(1.0 - length * length);
        }

        return mouseOnBall;
    }

    function rotateMatrix(rotateStart, rotateEnd) {
        var axis = new THREE.Vector3(),
            quaternion = new THREE.Quaternion();

        var angle = Math.acos(rotateStart.dot(rotateEnd) / rotateStart.length() / rotateEnd.length());

        if (angle) {
            axis.crossVectors(rotateStart, rotateEnd).normalize();
            angle *= rotationSpeed;
            quaternion.setFromAxisAngle(axis, angle);
        }
        return quaternion;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
       if (!mouseDown) {
            var drag = 0.95;
            var minDelta = 0.05;

            if (deltaX < -minDelta || deltaX > minDelta) {
                deltaX *= drag;
            }
            else {
                deltaX = 0;
            }

            if (deltaY < -minDelta || deltaY > minDelta) {
                deltaY *= drag;
            }
            else {
                deltaY = 0;
            }

            handleRotation();
        }

        renderer.render(scene, camera);
    }

    var handleRotation = function () {
        rotateEndPoint = projectOnTrackball(deltaX, deltaY);

        var rotateQuaternion = rotateMatrix(rotateStartPoint, rotateEndPoint);
        curQuaternion = cube.quaternion;
        curQuaternion.multiplyQuaternions(rotateQuaternion, curQuaternion);
        curQuaternion.normalize();
        cube.setRotationFromQuaternion(curQuaternion);

        rotateEndPoint = rotateStartPoint;
    }
//end of copy

    init();

})