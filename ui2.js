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

var Y = 0,
    X = 0;

var tada = new Audio("audio/tada.mp3");
var no = new Audio("audio/no.mp3");

var tutorialSpin = 1;
var tutorialDrag = 1;

var cubeColor = [];
var raycaster2 = new THREE.Raycaster();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
INTERSECTED, SELECTED, selectedColor;

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

//function for adding scen & figures

function init() {

var canvas = document.getElementById("canvas");

//console.log(canvas.childNodes);
//console.log(canvas);

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

var geometry = new THREE.BoxGeometry( 2.5, 2.5, 2.5 );

for (var i = 0; i < geometry.faces.length; i += 2) {

            var color =

            {
                h: (1 / (geometry.faces.length)) * i,
                s: 0.5,
                l: 0.5
            };

            geometry.faces[i].color.setHSL(color.h, color.s, color.l);
            geometry.faces[i + 1].color.setHSL(color.h, color.s, color.l);

            geometry.faces.id = i;


            cubeColor.push(geometry.faces[i].color.getStyle());
            //console.log(cubeColor);
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


var smallBox = new THREE.BoxGeometry( 1, 1, 1 );
var smallSphere = new THREE.SphereGeometry( 1, 6.2, 6.2 );
var smallTorus = new THREE.TorusGeometry( 0.7, 0.3, 2, 7 );

var figures = [smallBox, smallSphere, smallTorus];

//var colors = [ 0xBF4040, 0xBFBF40, 0x40BF40, 0x40BFBF, 0x4040BF, 0xBF40BF];

for (var i = 0; i < 3; i++){

    var smallCubeMaterial = new THREE.MeshBasicMaterial(
    {
        //color: colors[i],
        //color: colors[Math.floor(Math.random() * colors.length)],
        color: cubeColor[Math.floor(Math.random() * cubeColor.length)],
        overdraw: 0.5
    });

smallCube = new THREE.Mesh( figures[Math.floor(Math.random() * figures.length)], smallCubeMaterial );
//smallCube = new THREE.Mesh( smallTorus, smallCubeMaterial );

smallCube.position.y = -3;
smallCube.position.x = i*3 - 3;
    //console.log(cube);
//cube.rotation.x = 0;
  //  cube.rotation.y = 0;
    //cube.rotation.z = 0;

smallCube.name = 'Small cubes';
scene.add( smallCube );

//console.log(smallCube.material.color);
//console.log(cube.geometry.faces[1].color);

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

plane = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
                    new THREE.MeshBasicMaterial( { visible: false } )
                    );
scene.add( plane );

camera.position.z = 7;

/*
//reder function from before adding rotationBox code.
 render = function () {
	requestAnimationFrame( render );

	renderer.render(scene, camera);
	};

render();
*/

//console.log(canvas.childNodes);


canvas.addEventListener('mousedown', onDocumentMouseDown, false);
//canvas.addEventListener('mousemove', onDocumentMouseMove, false);
//canvas.addEventListener('mouseup', onDocumentMouseUp2, false);
animate();

}



//copy of mouse move from rotationbox with configs
function onDocumentMouseDown(event) {
    /*var cubeVector = (new THREE.Vector3( 0, 0, 1 )).applyQuaternion(cube.quaternion);
    var cameraVector = (new THREE.Vector3( 0, 0, -1 )).applyQuaternion(camera.quaternion );
    console.log(cubeVector);

    if (cubeVector.angleTo(cameraVector) > Math.PI/4 && cubeVector.angleTo(cameraVector) < 0.75 *Math.PI  )  {
    console.log('facing front');
}

    //else 'facing back'
    */
    event.preventDefault();

    //console.log(scene.children);
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        //var TESTI = intersects[0].face.materialIndex;
        SELECTED = intersects[0].object;
        //console.log(TESTI);


        if (SELECTED.name == 'Big cube') {

            console.log('Mouse Down IF Big Cube');
            document.getElementById("canvas").addEventListener('mousemove', onDocumentMouseMove, false);
            document.getElementById("canvas").addEventListener('mouseup', onDocumentMouseUp, false);

            mouseDown = true;

            startPoint = {
                x: event.clientX,
                y: event.clientY
            };

            rotateStartPoint = rotateEndPoint = projectOnTrackball(0, 0);

        }else if(SELECTED.name == 'Small cubes'){
            startPoint = {
                x: event.clientX,
                y: event.clientY
            };
            //if (SELECTED.material.color)

            console.log('Mouse Down IF Small Cubes');
            selectedColor = intersects[ 0 ].face.materialIndex;
            //console.log(selectedColor);
            mouseDown = true;
        //console.log(startPoint);
        //console.log(SELECTED);

        document.getElementById("canvas").addEventListener('mousemove', MoveCube, false);
        document.getElementById("canvas").addEventListener('mouseup', onDocumentMouseUp2, false);

    };
  }
}

    function onDocumentMouseMove(event) {
        deltaX = event.x - startPoint.x;
        deltaY = event.y - startPoint.y;
        console.log('Mouse Move Big Cube')
        handleRotation();

        $('#blink-arrow').hide();
        $('#rotate-text').hide();
        if (tutorialSpin) {
          $('#jumping-text').show();
          $('#jumping-arrow').show();
          tutorialSpin = 0;
        }

        startPoint.x = event.x;
        startPoint.y = event.y;

        lastMoveTimestamp = new Date();
    }

    function MoveCube(event) {

        //if (SELECTED.name == "Small cubes") {
            //X = (event.x - startPoint.x /50);
            //Y = (event.y - startPoint.y /50);
            //SELECTED.position.x = X;
            //SELECTED.position.y = Y;
            /*
            var intersects = raycaster.intersectObjects(scene.children);
            SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
            console.log(X);
            console.log(Y);
            console.log(mouse.x);
            console.log(mouse.y);
            console.log(offset);
            */
            //lastMoveTimestamp = new Date();
            event.preventDefault();
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                //
                raycaster.setFromCamera( mouse, camera );

                if (SELECTED != null) {

                    if (SELECTED.name != 'Big cube') {
                        var intersects = raycaster.intersectObject(plane, cube);
                        if (intersects.length > 0) {
                            SELECTED.position.copy(intersects[0].point.sub(offset));
                            //matchNRemove(SELECTED, cube);
                            $('#jumping-text').hide();
                            $('#jumping-arrow').hide();
                            if(tutorialDrag) {
                              $('#drop-text').show();
                              $('#drop-arrow').show();
                              tutorialDrag = 0;
                            }
                            console.log('Mouse Move Small Cubes');

                        }

                        return;

                    }
                    return;
                }
                /*var intersects = raycaster.intersectObjects( scene.children, true );

                if ( intersects.length > 0) {
                    //console.log('nu krockar grjer');


                    if ( INTERSECTED != intersects[ 0 ].object ) {
                        if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
                        INTERSECTED = intersects[ 0 ].object;
                        INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                        plane.position.copy( INTERSECTED.position );
                        plane.lookAt( camera.position );
                    }

                    canvas.style.cursor = 'pointer';
                } else {
                    if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
                    INTERSECTED = null;
                    canvas.style.cursor = 'auto';
                }
            } */
            //}
    }

    function onDocumentMouseUp2( event ) {
        event.preventDefault();
        raycaster2.setFromCamera(mouse, camera);
        var bigCubeCurrent = raycaster2.intersectObjects(scene.children);
        var bigCubeFace = bigCubeCurrent[ 0 ].face.materialIndex;
       // console.log(bigCubeCurrent);
        //console.log(bigCubeFace);
        //console.log(selectedColor);

        if ( SELECTED.name != 'Big cube' ) {
            var xyPos = {
                x: SELECTED.position.x,
                y: SELECTED.position.y
            };
            console.log('Mouse Up Small Cubes');
            /*
             controls.enabled = true;
             if ( INTERSECTED ) {
             plane.position.copy( INTERSECTED.position );
             SELECTED = null;
             }
             //container.style.cursor = 'auto';
             */
            //SELECTED = null;
            if (bigCubeFace != 0 ) {
                //xyPos.x > -1 && xyPos.x < 1 && xyPos.y > -1 && xyPos.y < 1
                console.log('we are in xyPos IF');
                matchSmallWithBig(bigCubeFace, SELECTED);
                //xyPos.x > -1 && xyPos.x < 1 && xyPos.y > -1 && xyPos.y < 1
                //matchNRemove(SELECTED, cube);


               // console.log("WE HAVE LIFTOFF");
                //scene.remove(SELECTED);


            }

        }
    }

    function hideDropElements() {
      $('#drop-arrow').hide();
      $('#drop-text').hide();
    }

    function matchSmallWithBig (bigCubeFace, SELECTED) {
        var smallR = Math.round(SELECTED.material.color.r *10);
        var smallG = Math.round(SELECTED.material.color.g *10);
        var smallB = Math.round(SELECTED.material.color.b *10);
        console.log('matchSmall but not in IF');

        if (SELECTED.name != 'Big cube') {
            if (smallR == 7 && smallG == 2 && smallB == 2) {
                if (bigCubeFace == 0) {
                    scene.remove(SELECTED);
                    tada.play();
                    hideDropElements();
                    console.log('Small Cube Removed');
                    SELECTED = null;
                }
                else {
                  no.play();
                }
            }
            if (smallR == 7 && smallG == 7 && smallB == 2) {
                if (bigCubeFace == 1) {
                    scene.remove(SELECTED);
                    tada.play();
                    hideDropElements();
                    console.log('Small Cube Removed');
                    SELECTED = null;
                }
                else {
                  no.play();
                }
            }
            if (smallR == 2 && smallG == 7 && smallB == 2) {
                if (bigCubeFace == 2) {
                    scene.remove(SELECTED);
                    tada.play();
                    hideDropElements();
                    console.log('Small Cube Removed');
                    SELECTED = null;
                }
                else {
                  no.play();
                }
            }
            if (smallR == 2 && smallG == 7 && smallB == 7) {
                if (bigCubeFace == 3) {
                    scene.remove(SELECTED);
                    tada.play();
                    hideDropElements();
                    console.log('Small Cube Removed');
                    SELECTED = null;
                }
                else {
                  no.play();
                }
            }
            if (smallR == 2 && smallG == 2 && smallB == 7) {
                if (bigCubeFace == 4) {
                    scene.remove(SELECTED);
                    tada.play();
                    hideDropElements();
                    console.log('Small Cube Removed');
                    SELECTED = null;
                }
                else {
                  no.play();
                }
            }
            if (smallR == 7 && smallG == 2 && smallB == 7) {
                if (bigCubeFace == 5) {
                    scene.remove(SELECTED);
                    tada.play();
                    hideDropElements();
                    console.log('Small Cube Removed');
                    SELECTED = null;
                }
                else {
                  no.play();
                }
            }
        }


    }

    function newCubePosition(event) {
        if (new Date().getTime() - lastMoveTimestamp.getTime() > moveReleaseTimeDelta) {
            deltaX = event.x - startPoint.x;
            deltaY = event.y - startPoint.y;
        }

        mouseDown = false;

        document.getElementById("canvas").removeEventListener('mousemove', MoveCube, false);
        document.getElementById("canvas").removeEventListener('mouseup', newCubePosition, false);
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

    function matchNRemove( SELECTED, cube ) {

        if (SELECTED != null){

        if (SELECTED.name != 'Big cube') {

            var sR = Math.round(SELECTED.material.color.r * 255);
            var sB = Math.round(SELECTED.material.color.b * 255);
            var sG = Math.round(SELECTED.material.color.g * 255);

            var sColor = {r: sR, b: sB, g: sG};

            //console.log('s');
            //console.log(sColor);

        for (var i = 0; i < 12; i++){

            var cR = Math.round(cube.geometry.faces[i].color.r * 255);
            var cB = Math.round(cube.geometry.faces[i].color.b * 255);
            var cG = Math.round(cube.geometry.faces[i].color.g * 255);

            var cColor = {r: cR, b: cB, g: cG};

            //console.log('c');
            //console.log(cColor);


        if ((cR - 1 <= sR && sR <= cR + 1) && (cB - 1 <= sB && sB <= cB + 1) && (cG - 1 <= sG && sG <= cG + 1)) {
            //console.log('Sant!');
            scene.remove(SELECTED);
        }
        }
    }
}
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
