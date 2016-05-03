/**
 * Created by User on 2016-04-23.
 */
window.onload = (function() {

    var camera, controls, scene, renderer;
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

function onResize(element, callback) {
        var height = element.clientHeight;
        var width  = element.clientWidth;
        
        return setInterval(function() {
            if (element.clientHeight != height || element.clientWidth != width) {
              height = element.clientHeight;
              width  = element.clientWidth;
              callback();
            }
        }, 500);
      }


    function init() {

        var container = document.getElementById("canvas");

console.log(container.offsetWidth);
console.log(container.offsetHeight);
console.log(container);



        camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
        camera.position.z = 5;

        camera = new THREE.PerspectiveCamera(70, 1, 1, 1000);
        camera.position.y = 150;
        camera.position.z = 500;
        camera.aspect = 1;

        scene = new THREE.Scene();

        // Cube

        var boxGeometry = new THREE.BoxGeometry(300, 300, 300);

        for (var i = 0; i < boxGeometry.faces.length; i += 2) {

            var color = {
                h: (1 / (boxGeometry.faces.length)) * i,
                s: 0.5,
                l: 0.5
            };

            boxGeometry.faces[i].color.setHSL(color.h, color.s, color.l);
            boxGeometry.faces[i + 1].color.setHSL(color.h, color.s, color.l);

        }

        var cubeMaterial = new THREE.MeshBasicMaterial(
            {
                vertexColors: THREE.FaceColors,
                overdraw: 0.5
            });

        cube = new THREE.Mesh(boxGeometry, cubeMaterial);
        cube.position.y = 150;
        scene.add(cube);

/*
        // Plane

        var planeGeometry = new THREE.PlaneGeometry(300, 300);
        planeGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

        var planeMaterial = new THREE.MeshBasicMaterial(
            {
                color: 0xe0e0e0,
                overdraw: 0.5
            });

        plane = new THREE.Mesh(planeGeometry, planeMaterial);
        scene.add(plane);
*/
        //renderer = new THREE.WebGLRenderer( { alpha: true } );
        //renderer = new THREE.CanvasRenderer({ alpha: true }); /*transparent background*/
        //renderer = new THREE.CanvasRenderer();
        renderer = new THREE.WebGLRenderer({canvas: container});
        container.width = container.clientWidth;
        container.height = container.clientHeight;
        renderer.setClearColor(0xf0f0f0);
        //renderer.setClearColor(0x000000, 0);
        //renderer.setSize(500, 500);
        //renderer.setSize(container.offsetWidth, container.offsetHeight);

        //container.appendChild(renderer.domElement);



        window.addEventListener('resize', function() {
        container.width = container.clientWidth;
        container.height = container.clientHeight;
        var WIDTH = container.width,
        HEIGHT = container.height;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
        });

        onResize(canvas, function () {
          canvas.width  = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
          renderer.setViewport(0, 0, canvas.clientWidth, canvas.clientHeight);
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
      });

        //document.getElementById("canvas").addEventListener('mousedown', onDocumentMouseDown, false);
        container.addEventListener('mousedown', onDocumentMouseDown, false);
        //window.addEventListener('resize', onWindowResize, false);

        animate();
    }

    function onDocumentMouseDown(event) {
        event.preventDefault();

        document.getElementById("canvas").addEventListener('mousemove', onDocumentMouseMove, false);
        document.getElementById("canvas").addEventListener('mouseup', onDocumentMouseUp, false);

        mouseDown = true;

        startPoint = {
            x: event.clientX,
            y: event.clientY
        };

        rotateStartPoint = rotateEndPoint = projectOnTrackball(0, 0);
    }

    function onDocumentMouseMove(event) {
        deltaX = event.x - startPoint.x;
        deltaY = event.y - startPoint.y;

        handleRotation();

        startPoint.x = event.x;
        startPoint.y = event.y;

        lastMoveTimestamp = new Date();
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

    init();
})







