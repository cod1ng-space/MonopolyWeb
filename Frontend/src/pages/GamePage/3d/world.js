import * as THREE from "three";
import { Timer } from 'three/addons/misc/Timer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initModels } from "./models";
import { addTask, newRotationTask, runTasks } from "./tasks";
import { getCardCursorProperties } from "./cards";

/**
 * Init all THREE virtual world (camera, lights, models, etc)
 * @param {GameContent} game Game object
 * @param {Element} container HTML container
 */

export async function initVirtualWorld(game, container) {
    // Renderer init
    game.virtualWorld.renderer = new THREE.WebGLRenderer();
    game.virtualWorld.renderer.setPixelRatio(window.devicePixelRatio);
    game.virtualWorld.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(game.virtualWorld.renderer.domElement);

    // Window init
    window.addEventListener('resize', () => resizeVirtualGame(game));
    container.addEventListener('mousemove', (ev) => onPointerMove(game, ev))
    container.addEventListener('click', () => onClick(game))

    // Timer init
    game.virtualWorld.timer = new Timer();

    // Scene init
    game.virtualWorld.scene = new THREE.Scene();
    game.virtualWorld.scene.background = new THREE.Color(0x87CEEB);

    // Camera init
    game.virtualWorld.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    game.virtualWorld.camera.position.x = 1;
    game.virtualWorld.camera.position.y = 5;
    game.virtualWorld.camera.position.z = 1;
    game.virtualWorld.controls = new OrbitControls(game.virtualWorld.camera, game.virtualWorld.renderer.domElement);
    game.virtualWorld.controls.enablePan = false;
    game.virtualWorld.controls.target.set(0, 2.7, 0);
    game.virtualWorld.controls.minDistance = 1;
    game.virtualWorld.controls.maxDistance = 3.5;
    game.virtualWorld.controls.minPolarAngle = 0.01;
    game.virtualWorld.controls.maxPolarAngle = Math.PI / 3;
    game.virtualWorld.controls.update();
    game.virtualWorld.scene.add(game.virtualWorld.camera);

    // Lights init
    const ambientLight = new THREE.AmbientLight(0x404040, 10);

    const light1 = new THREE.DirectionalLight(0xffffff, 5);
    light1.position.set(1, 4, 1);
    light1.target.position.set(0, 2.7, 0);

    const light2 = new THREE.DirectionalLight(0xffffff, 5);
    light2.position.set(-1, 4, 1);
    light2.target.position.set(0, 2.7, 0);

    const light3 = new THREE.DirectionalLight(0xffffff, 5);
    light3.position.set(1, 4, -1);
    light3.target.position.set(0, 2.7, 0);

    const light4 = new THREE.DirectionalLight(0xffffff, 5);
    light4.position.set(-1, 4, -1);
    light4.target.position.set(0, 2.7, 0);

    game.virtualWorld.scene.add(ambientLight, light1, light2, light3, light4);

    // Models init
    await initModels(game);

    // Start render
    game.virtualWorld.renderer.setAnimationLoop(() => renderVirtualWorld(game));
    game.virtualWorld.removeObject = (obj) => {
        if (obj) {
            let object = game.virtualWorld.scene.getObjectById(obj.id);
            game.virtualWorld.scene.remove(object);
            renderVirtualWorld(game);
        } else {
            console.log("REMOVE NULL");
        }
    }
}

/**
 * Render tick of game
 * @param {GameContent} game Game object
 */

export function renderVirtualWorld(game) {
    game.virtualWorld.timer.update();
    game.physicsWorld.fixedStep();

    runTasks(game, game.models.tasks);

    game.models.dices.render();

    game.virtualWorld.renderer.render(game.virtualWorld.scene, game.virtualWorld.camera);
}

/**
 * Function, that calls when user resized window.
 * @param {GameContent} game Game object
 */

export function resizeVirtualGame(game) {
    game.virtualWorld.camera.aspect = window.innerWidth / window.innerHeight;
    game.virtualWorld.camera.updateProjectionMatrix();
    game.virtualWorld.renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Function, that calls when user move cursor.
 * @param {GameContent} game Game object
 * @param {MouseEvent} event Event
 */

export function onPointerMove(game, event) {

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(
        new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1),
        game.virtualWorld.camera
    );

    if (!game.virtualWorld.map) return;

    const intersects = raycaster.intersectObjects([game.virtualWorld.map], false);

    if (intersects.length > 0) {

        const intersect = intersects[0];
        const obj = intersect.object;
        const objName = obj.name;
        const pointPosition = intersect.point;

        if (objName == "map") {
            let position = getCardCursorProperties(pointPosition.x, pointPosition.z);
            if (position.r != -1) {
                document.body.style.cursor = "pointer";
                game.virtualWorld.cursor.position.set(position.x, pointPosition.y + 0.001, position.y);
                game.virtualWorld.cursor.rotation.z = position.r;
                game.data.selectedCardIndex = position.index;
                return;
            }
        }
    }

    document.body.style.cursor = "auto";
    game.virtualWorld.cursor.position.y = -100
    game.data.selectedCardIndex = -1;
}

/**
 * Function, that calls when user click on card.
 * @param {GameContent} game Game object
 */

export function onClick(game) {
    if (game.data.selectedCardIndex != -1) {
        let card = game.data.selectedCardIndex;
        addTask(game, newRotationTask(
            game.virtualWorld.camera, new THREE.Vector3(0, 2.7, 0),
            {
                a: parseInt((10 - card + 40) % 40 / 10) * Math.PI / 2,
            },
            () => game.eventListener("showCard", card),
            () => game.virtualWorld.controls.update()
        ));
        game.eventListener("closeCard");
    }
}