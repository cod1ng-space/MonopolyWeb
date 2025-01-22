import { Quaternion, Vec3 } from "cannon-es";

export function getDiceSide(quaternion) {
    var localUp = new Vec3();
    var inverseBodyOrientation = new Quaternion();
    var limit = Math.sin(Math.PI / 4);

    localUp.set(0, 1, 0);
    quaternion.inverse(inverseBodyOrientation);
    inverseBodyOrientation.vmult(localUp, localUp);

    if (localUp.x > limit) {
        return 3;
    } else if (localUp.x < -limit) {
        return 4;
    } else if (localUp.y > limit) {
        return 2;
    } else if (localUp.y < -limit) {
        return 6;
    } else if (localUp.z > limit) {
        return 1;
    } else if (localUp.z < -limit) {
        return 5;
    } else {
        return -1;
    }
}