window.onload = (function() {

//Initializing global variables
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

var completed = 0;
// Language
sessionStorage.setItem("lang", "english");
translate(sessionStorage.lang);
// Sound Variables
var soundOn = 1;
var tada = new Audio("audio/tada.mp3");
var no = new Audio("audio/Computer Error Alert.mp3");
var congrats = new Audio("audio/congrats.mp3");
//Tutorial Variables
var tutorialOn = 1;
var tutorialBlink = 1;
var tutorialJump = 0;
var tutorialDrop = 0;
//Cube and Raycaster.js variables
var cubeColor = [];
var bigCubeFace = null;
var bigCubeRay = null;
var raycaster2 = new THREE.Raycaster();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
INTERSECTED, SELECTED, selectedColor;
// Scene, camera and canvas variables
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

//function for adding scene & figures

function init() {

var canvas = document.getElementById("canvas");

//console.log(canvas.childNodes);
//console.log(canvas);
//Initialize render and add it to our canvas
renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setClearColor(0x000000, 0);
//renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setSize( canvas.offsetWidth, canvas.offsetHeight );
canvas.appendChild( renderer.domElement );
//Window resizing
window.addEventListener('resize', function() {
      var WIDTH = canvas.offsetWidth,
          HEIGHT = canvas.offsetHeight;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
    });


//Initializing main Cube

var geometry = new THREE.BoxGeometry( 2.5, 2.5, 2.5 );
//Randomly assign colors to the cube faces. The colors are taken from a palette of 6 different colors
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
// Standard mesh for cube
var cubeMaterial = new THREE.MeshBasicMaterial(
            {
                vertexColors: THREE.FaceColors,
                overdraw: 0.5
            });

//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
//Put togheter the final cube, with its geometry and the material put onto the geometry.
cube = new THREE.Mesh( geometry, cubeMaterial );

cube.name = "Big cube";
cube.geometry.faces[0].materialIndex = 6;
cube.geometry.faces[1].materialIndex = 6;
//Add the cube to our scene

scene.add( cube );


createSmallCubes();

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
//Initialize plane, it is not visible but needed for our objects to move correctly. Also add it to scene.
plane = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
                    new THREE.MeshBasicMaterial( { visible: false } )
                    );
plane.name = "plane";
scene.add( plane );
//Set camera position, higher value indicates looking at our scene from further distance
camera.position.z = 8;

/*
//reder function from before adding rotationBox code.
 render = function () {
	requestAnimationFrame( render );

	renderer.render(scene, camera);
	};

render();
*/

//console.log(canvas.childNodes);

//Adding event listeners, in initialize phase only mousedown event is needed, the other events are triggered after a mousedown
canvas.addEventListener('mouseup', onDocumentMouseUp, false);
canvas.addEventListener('mousedown', onDocumentMouseDown, false);
//canvas.addEventListener('mousemove', onDocumentMouseMove, false);
//canvas.addEventListener('mouseup', onDocumentMouseUp2, false);
// Call to our animation function which builds our game. Also our render function is inside animate, causing rotations and move to be updated in real time.
animate();

}

function createSmallCubes(){
  //small cubes
//Initializing the creation of the smaller figures, different geometry but same mesh
var smallBox = new THREE.BoxGeometry( 1, 1, 1 );
//var smallSphere = new THREE.SphereGeometry( 1, 6.2, 6.2 );
var smallCylinder = new THREE.CylinderGeometry( 0.7, 0.7, 0.7, 0.3 );
var smallTorus = new THREE.TorusGeometry( 0.7, 0.3, 2, 7 );

var figures = [smallBox, smallCylinder, smallTorus];

//var colors = [ 0xBF4040, 0xBFBF40, 0x40BF40, 0x40BFBF, 0x4040BF, 0xBF40BF];
//Give the smaller figures 1 of the given colors at random.
for (var i = 0; i < 3; i++){

    var smallCubeMaterial = new THREE.MeshBasicMaterial(
    {
        //color: colors[i],
        //color: colors[Math.floor(Math.random() * colors.length)],
        color: cubeColor[Math.floor(Math.random() * cubeColor.length)],
        overdraw: 0.5,
        wireframe: true,
        wireframeLinewidth: 10
    });
  //Put togheter the smaller figures with the created geometry and material
  smallCube = new THREE.Mesh( figures[Math.floor(Math.random() * figures.length)], smallCubeMaterial );
  //smallCube = new THREE.Mesh( smallTorus, smallCubeMaterial );
  //Assign the smaller figures position to be slightly below the bigger cube.
  smallCube.position.y = -3;
  smallCube.position.x = i*3 - 3;
  smallCube.position.z = 1;

      //console.log(cube);
  //cube.rotation.x = 0;
    //  cube.rotation.y = 0;
      //cube.rotation.z = 0;
  //Assign a non-unique name to the smaller cubes, this to distinguish them from the larger cube.
  smallCube.name = 'Small cubes';

  // Add the small cubes to the scene


  scene.add( smallCube );
/*  try {
    glow = new THREEx.GeometricGlowMesh(smallCube);
    smallCube.add(glow.object3d);
  } catch(e) {
    console.log("feeeel")
  }

  var insideUniforms  = glow.insideMesh.material.uniforms
  insideUniforms.glowColor.value.set(smallCubeMaterial.color);
  var outsideUniforms = glow.outsideMesh.material.uniforms
  outsideUniforms.glowColor.value.set('black') */
}
}

//Our function triggered by a mousedown event.
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
    //Take mouse positions in relation to the current size of our window.
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // Initialize a ray via raycaster.js
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);
    // the ray follows our mouse pointer. If the mouse pointer is over some of our objects, the return value is of length > 0
    if (intersects.length > 0) {
        //var TESTI = intersects[0].face.materialIndex;
        //Whatever object we had our mouse over on mousedown is set to variable SELECTED. this variable inherits all from the object array.
        SELECTED = intersects[0].object;
        //console.log(TESTI);

        // Checks if the selected object was the big cube and any mouse event from there triggers the appropiate functions relating to the big cube
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
        // Checks if the mousedown was on one of the smaller figures. Triggers the appropiate mouse functions for small figures.
        }else if(SELECTED.name == 'Small cubes'){
            startPoint = {
                x: event.clientX,
                y: event.clientY
            };
            //if (SELECTED.material.color)
            // For the removal of small figure if it is the same color, we must know the color of the face, this function returns the color of the small figure.
            console.log('Mouse Down IF Small Cubes');
            selectedColor = intersects[ 0 ].face.materialIndex;
            //console.log(selectedColor);
            mouseDown = true;
        //console.log(startPoint);
        //console.log(SELECTED);
        // Small figure mouse functions
        document.getElementById("canvas").addEventListener('mousemove', MoveCube, false);
        document.getElementById("canvas").addEventListener('mouseup', onDocumentMouseUp2, false);

    };
  }
}
    // This function along with its subfunctions handle the rotation of the big cube.
    function onDocumentMouseMove(event) {
        deltaX = event.x - startPoint.x;
        deltaY = event.y - startPoint.y;
        console.log('Mouse Move Big Cube')
        handleRotation();

        if (tutorialOn & tutorialBlink) {
          hideBlinkElements();
          tutorialJump = 1;
          tutorialBlink = 0;
          showJumpingElements();
        }

        startPoint.x = event.x;
        startPoint.y = event.y;

        lastMoveTimestamp = new Date();
    }
    // MoveCube function is for small figures. Moves it around the canvas.
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

                    if (SELECTED.name == 'Small cubes') {
                        var intersects = raycaster.intersectObject(plane, cube);
                        if (intersects.length > 0) {
                            SELECTED.position.copy(intersects[0].point.sub(offset));
                            //matchNRemove(SELECTED, cube);

                            if (tutorialOn & tutorialJump) {
                              hideJumpingElements();
                              showDropElements();
                              tutorialDrop = 1;
                              tutorialJump = 0;
                            }
                            console.log('Mouse Move Small Cubes');
                            document.getElementById("canvas").addEventListener('mouseup', onDocumentMouseUp2, false);

                        }


                    }


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
        bigCubeFace = null;
       // console.log(bigCubeCurrent);
        //console.log(bigCubeFace);
        //console.log(selectedColor);

        if ( SELECTED.name == 'Small cubes') {
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
            console.log(SELECTED);
            console.log(bigCubeFace);

            raycaster2.setFromCamera(mouse, camera);
            console.log(raycaster2);
            bigCubeRay = raycaster2.intersectObjects(scene.children);
            console.log(bigCubeRay);
            bigCubeFace = bigCubeRay[ 0 ].face.materialIndex;

            if ((bigCubeFace >= 1 && bigCubeFace <= 6) && SELECTED != null && SELECTED.name == "Small cubes") {

                //xyPos.x > -1 && xyPos.x < 1 && xyPos.y > -1 && xyPos.y < 1
                console.log('we are in xyPos IF');
                console.log(bigCubeFace);
                matchSmallWithBig(bigCubeFace, SELECTED);
                //xyPos.x > -1 && xyPos.x < 1 && xyPos.y > -1 && xyPos.y < 1
                //matchNRemove(SELECTED, cube);


               // console.log("WE HAVE LIFTOFF");
                //scene.remove(SELECTED);


            }
            else {
                SELECTED = null;
                bigCubeFace = null;
            }
        }
    }

    //Switch to swedish
    $('#swedish').click(function() {
      sessionStorage.setItem("lang", "svenska");
      translate(sessionStorage.lang);
    })

    //Switch to english
    $('#english').click(function() {
      sessionStorage.setItem("lang", "english");
      translate(sessionStorage.lang);
    })

    // Disable or enable sound
    $('#soundToggle').click(function() {
        var $sound = $('#soundToggle')
        if ($sound.hasClass("active")) {
          soundOn = 0;
          $('#soundToggleText').attr('langKey', 'soundOff');
          translate(sessionStorage.lang);
        }
        else {
          soundOn = 1;
          $('#soundToggleText').attr('langKey', 'soundOn');
          translate(sessionStorage.lang);
        }
    })


    // Disable or enable tutorial
    $('#tutorialToggle').click(function() {
      var $tut = $('#tutorialToggle')
      if ($tut.hasClass("active")) {
        tutorialOn = 0;
        $('#tutorialToggleText').attr('langKey', 'tutorialOff');
        translate(sessionStorage.lang);
        hideBlinkElements();
        hideJumpingElements();
        hideDropElements();
      }
      else {
        tutorialOn = 1;
        $('#tutorialToggleText').attr('langKey', 'tutorialOn');
        translate(sessionStorage.lang);
        if (tutorialBlink) {
          showBlinkElements();
        }
        else if (tutorialJump) {
          showJumpingElements();
        }
        else if (tutorialDrop) {
          showDropElements();
        }
      }
    })

    // Show first step in tutorial
    function showBlinkElements() {
      $('#blink-arrow').show();
      $('#rotate-text').show();
    }

    // Hide first step in tutorial
    function hideBlinkElements() {
      $('#blink-arrow').hide();
      $('#rotate-text').hide();
    }

    // Show second step in tutorial
    function showJumpingElements() {
      $('#jumping-text').show();
      $('#jumping-arrow').show();
    }

    // Hide second step in tutorial
    function hideJumpingElements() {
      $('#jumping-text').hide();
      $('#jumping-arrow').hide();
    }

    // Show third step in tutorial
    function showDropElements() {
      $('#drop-arrow').show();
      $('#drop-text').show();
    }

    // Hide third step in tutoral
    function hideDropElements() {
      $('#drop-arrow').hide();
      $('#drop-text').hide();
    }

    //
    function finishGame() {
      console.log(completed);
      if (completed == 3) {
        $('#finish').show();
        if(soundOn){
        congrats.play();
        }
      }
    }
    $('#playAgain').click(function() {
      $('#finish').hide();
      createSmallCubes();
      completed = 0;
  })

    function matchSmallWithBig (bigCubeFace, SELECTED) {
        var smallR = Math.round(SELECTED.material.color.r *10);
        var smallG = Math.round(SELECTED.material.color.g *10);
        var smallB = Math.round(SELECTED.material.color.b *10);
        console.log('matchSmall but not in IF');
        console.log(smallR);
        console.log(smallG);
        console.log(smallB);
        console.log(SELECTED);
        if (SELECTED.name == 'Small cubes' && SELECTED != null) {
            if (smallR == 7 && smallG == 2 && smallB == 2) {
                if (bigCubeFace == 6) {
                    scene.remove(SELECTED);
                    if (soundOn){
                      tada.play();
                    }
                    if (tutorialOn) {
                      hideDropElements();
                      tutorialDrop = 0;
                    }
                    console.log('Small Cube Removed');
                    SELECTED = null;
                    bigCubeFace = null;
                    completed += 1;
                    finishGame();
                }
                else {
                  SELECTED = null;
                  bigCubeFace = null;
                  if (soundOn){
                    no.play();
                  }
                }
            }
            if (smallR == 7 && smallG == 7 && smallB == 2) {
                if (bigCubeFace == 1) {
                    scene.remove(SELECTED);
                    if (soundOn){
                      tada.play();
                    }
                    if (tutorialOn) {
                      hideDropElements();
                      tutorialDrop = 0;
                    }
                    console.log('Small Cube Removed');
                    SELECTED = null;
                    bigCubeFace = null;
                    completed += 1;
                    finishGame();
                }
                else {
                  if (soundOn){
                    no.play();
                  }
                  SELECTED = null;
                  bigCubeFace = null;
                }
            }
            if (smallR == 2 && smallG == 7 && smallB == 2) {
                if (bigCubeFace == 2) {
                    scene.remove(SELECTED);
                    if (soundOn){
                      tada.play();
                    }
                    if (tutorialOn) {
                      hideDropElements();
                      tutorialDrop = 0;
                    }
                    console.log('Small Cube Removed');
                    SELECTED = null;
                    bigCubeFace = null;
                    completed += 1;
                    finishGame();
                }
                else {
                  if (soundOn){
                    no.play();
                  }
                  SELECTED = null;
                  bigCubeFace = null;
                }
            }
            if (smallR == 2 && smallG == 7 && smallB == 7) {
                if (bigCubeFace == 3) {
                    scene.remove(SELECTED);
                    if (soundOn){
                      tada.play();
                    }
                    if (tutorialOn) {
                      hideDropElements();
                      tutorialDrop = 0;
                    }
                    console.log('Small Cube Removed');
                    SELECTED = null;
                    bigCubeFace = null;
                    completed += 1;
                    finishGame();
                }
                else {
                  if (soundOn){
                    no.play();
                  }
                  SELECTED = null;
                  bigCubeFace = null;
                }
            }
            if (smallR == 2 && smallG == 2 && smallB == 7) {
                if (bigCubeFace == 4) {
                    scene.remove(SELECTED);
                    if (soundOn){
                      tada.play();
                    }
                    if (tutorialOn) {
                      hideDropElements();
                      tutorialDrop = 0;
                    }
                    console.log('Small Cube Removed');
                    SELECTED = null;
                    bigCubeFace = null;
                    completed += 1;
                    finishGame();
                }
                else {
                  if (soundOn){
                    no.play();
                  }
                  SELECTED = null;
                  bigCubeFace = null;
                }
            }
            if (smallR == 7 && smallG == 2 && smallB == 7) {
                if (bigCubeFace == 5) {
                    scene.remove(SELECTED);
                    if (soundOn){
                      tada.play();
                    }
                    if (tutorialOn) {
                      hideDropElements();
                      tutorialDrop = 0;
                    }
                    console.log('Small Cube Removed');
                    SELECTED = null;
                    bigCubeFace = null;
                    completed += 1;
                    finishGame();
                }
                else {
                  if (soundOn){
                    no.play();
                  }
                  SELECTED = null;
                  bigCubeFace = null;
                }
            }
        }
    console.log("removed box");
    SELECTED = null;
    bigCubeFace = null;
    mouseDown = false;
    return;
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
