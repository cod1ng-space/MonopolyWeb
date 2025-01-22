import * as CANNON from "cannon-es";

/**
 * Init physics world for game
 * @param {3DContent} game Main game object
 */

export async function initPhysicsWorld(game) {
    let world = new CANNON.World({ gravity: new CANNON.Vec3(0, -0.982, 0) });
    game.physicsWorld = world;

    // Добавляем пол (чтобы кубики не таранили насквозь игровое поле)
    const groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    groundBody.position.set(0, 2.7, 0);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);
}

/**
 * Create collision for cub for adding physics to it.
 * @param {3DContent} game 
 * @param {any} position Init position of collision ({ x, y, z })
 * @param {any} size Size of collision (side) ({ x, y, z })
 * @returns Collision object
 */

export function createCubCollision(game, position, size) {
    const cubBody = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)),
    });
    cubBody.position.set(position.x, position.y, position.z);
    game.physicsWorld.addBody(cubBody);
    return cubBody;
}

/**
 * Copy position and rotation of model from physics model to virtual model
 * @param {any} physicsModel CANNON Object (Collision)
 * @param {any} model THREE Mesh (Model)
 */

export function copyStateFromPhysicsToModel(physicsModel, model) {
    model.position.copy(physicsModel.position);
    model.quaternion.copy(physicsModel.quaternion);
}

/**
 * Generate random velocity 
 * @param {number} minValue Min value of velocity for axis
 * @param {number} maxValue Max value of velocity for axis
 * @returns CANNON.Vec3
 */

export function randomVelocity(minValue, maxValue) {
    return new CANNON.Vec3(
        Math.random() * (maxValue - minValue) + minValue,
        Math.random() * (maxValue - minValue) + minValue,
        Math.random() * (maxValue - minValue) + minValue
    );
}