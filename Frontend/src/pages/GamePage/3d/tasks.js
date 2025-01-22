import * as THREE from "three";

/**
 * Tasks loop. This function must be called in render function.
 * @param {GameContent} game
 */

export function runTasks(game, tasks) {
    if (tasks.length !== 0) {

        let activeTask = tasks[0];
        let firstRender = !activeTask.started;
        activeTask.started = true;

        // Движение по траектории, заданной параметрически
        if (activeTask.name === "moving") {
            if (firstRender) {
                let motionVector = activeTask.dest.clone().add(activeTask.scene.position.clone().negate());

                Object.keys(activeTask.params ?? {}).forEach(axis => {
                    motionVector[axis] = 0;
                });

                let runtime = motionVector.length() / activeTask.vel;

                activeTask.velocity = motionVector.multiplyScalar(1 / runtime);

                activeTask.init = activeTask.scene.position.clone();

                activeTask.runtime = runtime;
                activeTask.timestamp = game.virtualWorld.timer.getElapsed();
            }

            let nowTimestamp = game.virtualWorld.timer.getElapsed();

            let nowX = activeTask.params?.x
                ? activeTask.params.x(nowTimestamp - activeTask.timestamp, activeTask.runtime)
                : activeTask.init.x + (nowTimestamp - activeTask.timestamp) * activeTask.velocity.x;

            let nowY = activeTask.params?.y
                ? activeTask.params.y(nowTimestamp - activeTask.timestamp, activeTask.runtime)
                : activeTask.init.y + (nowTimestamp - activeTask.timestamp) * activeTask.velocity.y;

            let nowZ = activeTask.params?.z
                ? activeTask.params.z(nowTimestamp - activeTask.timestamp, activeTask.runtime)
                : activeTask.init.z + (nowTimestamp - activeTask.timestamp) * activeTask.velocity.z;

            if (nowTimestamp - activeTask.timestamp >= activeTask.runtime) {
                activeTask.onFinish();
                tasks.shift();
                nowX = activeTask.dest.x ?? nowX;
                nowY = activeTask.dest.y ?? nowY;
                nowZ = activeTask.dest.z ?? nowZ;
            }

            activeTask.scene.position.set(nowX, nowY, nowZ);

            activeTask.onTick();
        }

        // Вращение по круговой траектории вокруг определённой точки
        if (activeTask.name === "rotation") {
            let around = activeTask.target;
            if (firstRender) {

                let initOffset = new THREE.Vector3();
                initOffset.addVectors(activeTask.scene.position, around.clone().negate());

                let initPolarAngle = Math.atan(
                    Math.sqrt(initOffset.x * initOffset.x + initOffset.z * initOffset.z) / initOffset.y
                );

                let initAzimutAngle = Math.acos(initOffset.z / (Math.sqrt(initOffset.z * initOffset.z + initOffset.x * initOffset.x)));
                if (initOffset.x < 0) {
                    initAzimutAngle = 2 * Math.PI - initAzimutAngle;
                }

                let initDistance = initOffset.length();
                let azimutRotation = 2;

                let normalRotate =
                    (activeTask.dest.a - initAzimutAngle + 2 * Math.PI) % (2 * Math.PI) <
                    (initAzimutAngle - activeTask.dest.a + 2 * Math.PI) % (2 * Math.PI);

                let rotation = Math.min(
                    (activeTask.dest.a - initAzimutAngle + 2 * Math.PI) % (2 * Math.PI),
                    (initAzimutAngle - activeTask.dest.a + 2 * Math.PI) % (2 * Math.PI),
                );

                activeTask.velocity = {
                    p: 0,
                    a: normalRotate ? azimutRotation : -azimutRotation,
                    r: 0,
                };

                activeTask.init = {
                    p: initPolarAngle,
                    a: initAzimutAngle,
                    r: initDistance,
                }

                console.log(rotation, azimutRotation);

                activeTask.runtime = rotation / azimutRotation;
                activeTask.timestamp = game.virtualWorld.timer.getElapsed();
            }

            let nowTimestamp = game.virtualWorld.timer.getElapsed();

            let nowP = activeTask.init.p + (nowTimestamp - activeTask.timestamp) * activeTask.velocity.p;
            let nowA = activeTask.init.a + (nowTimestamp - activeTask.timestamp) * activeTask.velocity.a;
            let nowR = activeTask.init.r + (nowTimestamp - activeTask.timestamp) * activeTask.velocity.r;

            if (nowTimestamp - activeTask.timestamp >= activeTask.runtime) {
                activeTask.onFinish();
                tasks.shift();
                nowP = activeTask.dest.p ?? nowP;
                nowA = activeTask.dest.a ?? nowA;
                nowR = activeTask.dest.r ?? nowR;
            }

            activeTask.scene.position.set(
                nowR * Math.sin(nowP) * Math.sin(nowA) + activeTask.target.x,
                nowR * Math.cos(nowP) + activeTask.target.y,
                nowR * Math.sin(nowP) * Math.cos(nowA) + activeTask.target.z,
            );

            activeTask.onTick();
        }
    }
}

/**
 * Сreates an task for linear movement to **target**. **onFinish** will be called, when movement finished.
 * @param {THREE.Mesh} target Object for moving
 * @param {THREE.Vector3} destination Movement destination
 * @param {THREE.Vector3} velocity Movement velocity
 * @param {Object} params Functions for each axis: { function(nowT, maxT) }
 * @param {() => {}} onFinish Call after each render tick
 * @param {() => {}?} onTick Call after task completed
 * @returns task for linear movement **target** to **destination**
 */

export function newMovingTask(target, destination, velocity, params, onFinish, onTick) {
    return {
        name: "moving",
        scene: target,
        dest: destination,
        vel: velocity,
        params: params ?? {},
        onTick: onTick ?? (() => { }),
        onFinish,
    }
}

export function newRotationTask(target, rotationAround, destination, onFinish, onTick) {
    return {
        name: "rotation",
        scene: target,
        target: rotationAround,
        dest: destination,
        onTick: onTick ?? (() => { }),
        onFinish,
    };
}

/**
 * Add new task to tasks' queue
 * @param {any} game Game object
 * @param {any} task Task object
 */

export function addTask(game, task) {
    game.models.tasks.push(task);
}