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

//Initialize render and add it to our canvas
renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setClearColor(0x000000, 0);

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

//Assign colors to the cube faces. The colors are taken from a palette of 6 different colors
for (var i = 0; i < geometry.faces.length; i += 2) {
    var color =
  {
    h: (1 / (geometry.faces.length)) * i,
    s: 0.5,
    l: 0.5
  };
  geometry.faces[i].color.setHSL(color.h, color.s, color.l);
  geometry.faces[i + 1].color.setHSL(color.h, color.s, color.l);
  
  //Setting an ID to each face of the main cube.
  geometry.faces.id = i;

  //pushing the colors of the main cube to an array.
  cubeColor.push(geometry.faces[i].color.getStyle());
}

// Standard mesh for cube
var cubeMaterial = new THREE.MeshBasicMaterial(
            {
                vertexColors: THREE.FaceColors,
                overdraw: 0.5
            });

//Put togheter the final cube, with its geometry and the material put onto the geometry.
cube = new THREE.Mesh( geometry, cubeMaterial );

cube.name = "Big cube";

//Setting cube face 0 and 1 (because one face consists of two triangles) to material index 6, to avoid both the plane and cube face having the same material index.
cube.geometry.faces[0].materialIndex = 6;
cube.geometry.faces[1].materialIndex = 6;

//Add the cube to our scene
scene.add( cube );

//Add small cubes to our scene
createSmallCubes();

//Initialize plane, it is not visible but needed for our objects to move correctly. Also add it to scene.
plane = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
                    new THREE.MeshBasicMaterial( { visible: false } )
                    );
plane.name = "plane";
scene.add( plane );

//Set camera position, higher value indicates looking at our scene from further distance.
camera.position.z = 8;

//Adding event listeners, in initialize phase only mousedown and mouseup event is needed, the other events are triggered after a mousedown or mouseup.
canvas.addEventListener('mouseup', onDocumentMouseUp, false);
canvas.addEventListener('mousedown', onDocumentMouseDown, false);

// Call to our animation function which builds our game. Also our render function is inside animate, causing rotations and move to be updated in real time.
animate();

}

//function to create three small cubes/figures.
function createSmallCubes(){

//Initializing the creation of the smaller figures, different geometry but same mesh
var smallBox = new THREE.BoxGeometry( 1, 1, 1 );
var smallCylinder = new THREE.CylinderGeometry( 0.7, 0.7, 0.7, 0.3 );
var smallTorus = new THREE.TorusGeometry( 0.7, 0.3, 2, 7 );

//createing a list containing different types of figures.
var figures = [smallBox, smallCylinder, smallTorus];

//Give the smaller figures, one of the given colors (within the cubeColor array) at random.
for (var i = 0; i < 3; i++){
    var smallCubeMaterial = new THREE.MeshBasicMaterial(
    {
      color: cubeColor[Math.floor(Math.random() * cubeColor.length)],
      overdraw: 0.5,
      wireframe: true,
      wireframeLinewidth: 10
    });

  //Put togheter the smaller figures with the created geometry and material
  smallCube = new THREE.Mesh( figures[Math.floor(Math.random() * figures.length)], smallCubeMaterial );

  //Assign the smaller figures position to be slightly below the bigger cube.
  smallCube.position.y = -3;
  smallCube.position.x = i*3 - 3;
  smallCube.position.z = 1;

  //Assign a non-unique name to the smaller cubes, this to distinguish them from the larger cube.
  smallCube.name = 'Small cubes';

  // Add the small cubes to the scene
  scene.add( smallCube );
  }
}

//Our function triggered by a mousedown event.
function onDocumentMouseDown(event) {
    event.preventDefault();

    //Take mouse positions in relation to the current size of our window.
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Initialize a ray via raycaster.js
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);

    // the ray follows our mouse pointer. If the mouse pointer is over some of our objects, the return value is of length > 0.
    if (intersects.length > 0) {
        
        //Whatever object we had our mouse over on mousedown is set to variable SELECTED. this variable inherits all from the object array.
        SELECTED = intersects[0].object;

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
           
            // For the removal of small figure if it is the same color, we must know the color of the face, this function returns the color of the small figure.
            console.log('Mouse Down IF Small Cubes');
            selectedColor = intersects[ 0 ].face.materialIndex;
            
            mouseDown = true;
     
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
}

//Function for releasing a small cube and evaluate where it has been droped.
function onDocumentMouseUp2( event ) {
    event.preventDefault();
    bigCubeFace = null;
    if ( SELECTED.name == 'Small cubes') {
        var xyPos = {
        x: SELECTED.position.x,
        y: SELECTED.position.y
    };
    console.log('Mouse Up Small Cubes');
    console.log(SELECTED);
    console.log(bigCubeFace);

    raycaster2.setFromCamera(mouse, camera);
    console.log(raycaster2);
    bigCubeRay = raycaster2.intersectObjects(scene.children);
    console.log(bigCubeRay);
    bigCubeFace = bigCubeRay[ 0 ].face.materialIndex;
        if ((bigCubeFace >= 1 && bigCubeFace <= 6) && SELECTED != null && SELECTED.name == "Small cubes") {
            console.log('we are in xyPos IF');
            console.log(bigCubeFace);
            matchSmallWithBig(bigCubeFace, SELECTED);
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

//Play again or not
$('#playAgain').click(function() {
  $('#finish').hide();
    createSmallCubes();
    completed = 0;
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

//Showing when the game is finished
function finishGame() {
  console.log(completed);
  if (completed == 3) {
      $('#finish').show();
        if(soundOn){
            congrats.play();
        }
  }
}

//function for matching small cube/figure with side of the big/main cube. If they match, the small cube will be removed.
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

//function for calculating a new cube position.
function newCubePosition(event) {
  if (new Date().getTime() - lastMoveTimestamp.getTime() > moveReleaseTimeDelta) {
      deltaX = event.x - startPoint.x;
      deltaY = event.y - startPoint.y;
  }
  mouseDown = false;
  document.getElementById("canvas").removeEventListener('mousemove', MoveCube, false);
  document.getElementById("canvas").removeEventListener('mouseup', newCubePosition, false);
}

//Function for evaluate when the big cube has been droped (mouseup). 
function onDocumentMouseUp(event) {
  if (new Date().getTime() - lastMoveTimestamp.getTime() > moveReleaseTimeDelta) {
      deltaX = event.x - startPoint.x;
      deltaY = event.y - startPoint.y;
  }
  mouseDown = false;
  document.getElementById("canvas").removeEventListener('mousemove', onDocumentMouseMove, false);
  document.getElementById("canvas").removeEventListener('mouseup', onDocumentMouseUp, false);
}

//Function for tracking the cubes, a help function to handlerotation. 
function projectOnTrackball(touchX, touchY) {
  var mouseOnBall = new THREE.Vector3();
  mouseOnBall.set(clamp(touchX / windowHalfX, -1, 1), clamp(-touchY / windowHalfY, -1, 1), 0.0);
  var length = mouseOnBall.length();
  if (length > 1.0) {
      mouseOnBall.normalize();
  }
  else {
      mouseOnBall.z = Math.sqrt(1.0 - length * length);
  }
  return mouseOnBall;
}

//Function for calculating the rotation of the big/main cube, help function to handlerotation.
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

//Function for return the clamp value.
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

//Function for animate.
function animate() {
  requestAnimationFrame(animate);
  render();
}

//Render function.
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

//Running the init() function.
init();

})
