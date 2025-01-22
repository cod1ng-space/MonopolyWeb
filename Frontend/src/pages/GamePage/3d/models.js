import * as THREE from "three";

import featureModelUrl from '/src/assets/models/metallic_garden_table.glb';
import floorTextureUrl from '/src/assets/textures/floor.jpg';
import wallTextureUrl from '/src/assets/textures/wall2.jpg';
import monopolyMapUrl from '/src/assets/textures/monopoly_map.svg';
import cursorMapUrl from '/src/assets/textures/cursor.svg';

import orangeFigure from '/src/assets/models/orange.glb';
import blueFigure from '/src/assets/models/blue.glb';
import redFigure from '/src/assets/models/red.glb';
import greenFigure from '/src/assets/models/green.glb';

import diceModelUrl from '/src/assets/models/dice.glb';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Dices, PlayerFigure } from "./objects";
import { getCardCursorProperties, getCardMarkerPositionById, getHotelPosition } from "./cards";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

/**
 * Function fetch model by URL
 * @param {String} url URL of model 
 * @returns Loaded scene
 */

export async function fetchModel(url) {
    return new Promise((resolve, reject) => {
        const modelLoader = new GLTFLoader();
        modelLoader.load(url, (gltf) => {
            resolve(gltf.scene);
        })
    })
}

/**
 * Function fetch STL mesh by URL
 * @param {String} url URL of model 
 * @returns Loaded scene
 */

export async function fetchSTLGeometry(url) {
    return new Promise((resolve, reject) => {
        const modelLoader = new STLLoader();
        modelLoader.load(url, (geometry) => {
            resolve(geometry);
        })
    })
}

/**
 * Function fetch texture by URL
 * @param {String} url URL of texture 
 * @returns Loaded texture
 */

export async function fetchTexture(url) {
    return new Promise((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(url, (texture) => {
            resolve(texture);
        })
    })
}

/**
 * Function fetch model and rotated, positioned and scaled it.
 * @param {String} name Name of model
 * @param {String} url URL of model
 * @param {Vector3} position Init position of model
 * @param {any} rotation Init roration of model
 * @param {any} scale Scale of model - object with one key (x, y or z) and size for this axis.
 * @returns Mesh
 */

export async function createModel(name, url, position, rotation, scale) {
    const model = await fetchModel(url);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());

    const k = Object.values(scale)[0] / size[Object.keys(scale)[0]];

    model.name = name;
    model.scale.set(k, k, k);
    model.position.copy(position ?? new THREE.Vector3(0, 0, 0));

    Object.keys(rotation).forEach((axis) => model.rotation[axis] = rotation[axis]);

    return model;
}

/**
 * Function fetch STL model and rotated, positioned and scaled it.
 * @param {String} name Name of model
 * @param {String} url URL of model
 * @param {Vector3} position Init position of model
 * @param {any} rotation Init roration of model
 * @param {any} scale Scale of model - object with one key (x, y or z) and size for this axis.
 * @returns Mesh
 */

export async function createSTLModel(name, url, position, rotation, scale, modelMaterial) {
    const geometry = await fetchSTLGeometry(url);
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(modelMaterial.color) });
    const model = new THREE.Mesh(geometry, material);

    model.castShadow = true;
    model.receiveShadow = true;

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());

    const k = Object.values(scale)[0] / size[Object.keys(scale)[0]];

    model.name = name;
    model.scale.set(k, k, k);
    model.position.copy(position ?? new THREE.Vector3(0, 0, 0));

    Object.keys(rotation).forEach((axis) => model.rotation[axis] = rotation[axis]);

    return model;
}

/**
 * Function fetch plane texture and rotated, positioned it.
 * @param {String} name Name of plane
 * @param {String} url URL of plane
 * @param {Vector3} position Init position of plane
 * @param {any} rotation Init roration of plane
 * @param {Array} size Init size of plane ([x, y])
 * @param {*} repeat Repeat of texture ([nx, ny])
 * @returns Mesh
 */

export async function createPlane(name, url, position, rotation, size, repeat, isTransparent) {
    const planeTexture = await fetchTexture(url);
    planeTexture.wrapS = THREE.RepeatWrapping;
    planeTexture.wrapT = THREE.RepeatWrapping;
    if (repeat) planeTexture.repeat.set(repeat[0], repeat[1]);
    const planeMaterial = new THREE.MeshBasicMaterial({ map: planeTexture, transparent: isTransparent ?? false });

    const planeGeometry = new THREE.PlaneGeometry(size[0], size[1]);
    planeMaterial.side = THREE.DoubleSide;

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.castShadow = true;
    plane.receiveShadow = true;

    plane.name = name;
    plane.position.copy(position ?? new THREE.Vector3(0, 0, 0));

    Object.keys(rotation).forEach((axis) => plane.rotation[axis] = rotation[axis]);

    return plane;
}

/**
 * Function create a colored plane and rotated, positioned it.
 * @param {String} name Name of plane
 * @param {String} url URL of plane
 * @param {Vector3} position Init position of plane
 * @param {any} rotation Init roration of plane
 * @param {Array} size Init size of plane ([x, y])
 * @param {*} color Color of plane
 * @returns 
 */

export function createColoredPlane(name, position, rotation, size, color) {
    const planeMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });

    const planeGeometry = new THREE.PlaneGeometry(size[0], size[1]);
    planeMaterial.side = THREE.DoubleSide;

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.name = name;
    plane.position.copy(position ?? new THREE.Vector3(0, 0, 0));

    Object.keys(rotation).forEach((axis) => plane.rotation[axis] = rotation[axis]);

    return plane;
}

/**
 * Create a owner card marker
 * @param {GameContent} game Game object
 * @param {PlayerFigure} player Card owner object
 * @param {number} cardIndex Index of card
 */

export function createCardMarker(game, player, cardIndex) {
    let markerPosition = getCardMarkerPositionById(cardIndex);
    let marker = createColoredPlane(`card_${cardIndex}`, new THREE.Vector3(
        markerPosition.x,
        markerPosition.y,
        markerPosition.z
    ), { x: Math.PI / 2, z: markerPosition.r }, [markerPosition.width, markerPosition.height], player.color);
    game.models.markers.push(marker);
    game.virtualWorld.scene.add(marker);
}

/**
 * Fetch and added all models to virtual world
 * @param {GameContent} game Game object
 */

export async function initModels(game) {
    const scene = game.virtualWorld.scene;

    // Внешнее окружение

    const floor = await createPlane("floor", floorTextureUrl, null, { x: Math.PI / 2 }, [10, 10], [4, 4]);

    const wall1 = await createPlane("wall1", wallTextureUrl, new THREE.Vector3(-5, 0, 0), { y: Math.PI / 2 }, [10, 15], [6, 9]);
    const wall2 = await createPlane("wall2", wallTextureUrl, new THREE.Vector3(5, 0, 0), { y: Math.PI / 2 }, [10, 15], [6, 9]);
    const wall3 = await createPlane("wall3", wallTextureUrl, new THREE.Vector3(0, 0, -5), {}, [10, 15], [6, 9]);
    const wall4 = await createPlane("wall4", wallTextureUrl, new THREE.Vector3(0, 0, 5), {}, [10, 15], [6, 9]);

    const table = await createModel("table", featureModelUrl, null, {}, { y: 3 });
    const map = await createPlane("map", monopolyMapUrl, new THREE.Vector3(0, 2.7, 0), { x: -Math.PI / 2 }, [2, 2]);

    const cursorDefault = getCardCursorProperties(10, 10);
    const cursor = await createPlane("cursor", cursorMapUrl, new THREE.Vector3(0, -1, 0), { x: Math.PI / 2 }, cursorDefault.cSize, [1, 1], true);

    game.virtualWorld.map = map;
    game.virtualWorld.cursor = cursor;

    scene.add(floor, wall1, wall2, wall3, wall4, table, map, cursor);

    // Фигурки
    for (let i = 0; i < 4; i += 1) {
        let figure1 = new PlayerFigure(game, i, ["blue", "red", "orange", "green"][i], 0, 2500);
        await figure1.loadFigure([blueFigure, redFigure, orangeFigure, greenFigure][i]);
        game.models.players.push(figure1);
    }

    let dices = new Dices(game);
    await dices.loadDices(diceModelUrl);
    game.models.dices = dices;
}