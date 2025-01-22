import * as THREE from "three";
import Settings from "./settings.json";

import { getCardCenter, getCardPositionById, getHotelPosition, getWay } from "./cards";
import { createModel, createPlane, createSTLModel, fetchModel } from "./models";
import { addTask, newMovingTask } from "./tasks";
import { copyStateFromPhysicsToModel, createCubCollision, randomVelocity } from "./physics";
import { getDiceSide } from "./math";

import pledgeTexture from '/src/assets/textures/pledge.png';
import houseModelUrl from '/src/assets/models/house.stl';

export class PlayerFigure {
    name = 0;
    color = "";
    game = null;
    figure = null;
    position = 0;
    money = 0;

    moveOnCallback = null;

    constructor(game, name, color, initPosition, initMoney) {
        this.game = game;
        this.position = initPosition;
        this.name = name;
        this.money = initMoney;
        this.color = color;
    }

    async loadFigure(url) {
        const playersPosition = this.calculatePlayersPosition();
        const playerPosition = getCardPositionById(this.position, playersPosition);
        this.figure = await createModel(this.name, url, new THREE.Vector3(
            playerPosition.x,
            playerPosition.y,
            playerPosition.z
        ), { y: playerPosition.r }, { y: 0.08 });
        this.game.virtualWorld.scene.add(this.figure);
    }

    calculatePlayersPosition() {
        let positions = {};
        this.game.models.players.forEach((player) => {
            positions[player.position] = (positions[player.position] ?? 0) + 1;
        });
        return positions;
    }

    moveOn(points, callback) {
        this.moveOnCallback = callback;
        const way = getWay(this.position, this.position + points, (I) => this.calculatePlayersPosition(I));
        for (let i = 0; i < way.length; i += 1) {
            let point = way[i];
            addTask(this.game, newMovingTask(this.figure, new THREE.Vector3(point.x, point.y, point.z), 0.3, {
                y: (t, maxT) => {
                    let y0 = 2.7;
                    let hmax = 0.2;
                    let a = 8 * hmax / maxT / maxT;
                    let vy = maxT * a / 2;
                    return y0 + vy * t - a * t * t / 2;
                }
            }, () => {
                this.figure.rotation.y = point.r;
                if (i == way.length - 1) {
                    setTimeout(() => this.moveOnCallback(this.position), 200);
                }
            }));
        }
        this.position = (this.position + points) % 40;
    }

    transferMoney(total) {
        if (this.money + total >= 0) {
            this.money += total;
        }
        return this.money >= 0;
    }
}

export class Dices {
    game = null;
    dice1 = null;
    dice2 = null;
    physicsDice1 = null;
    physicsDice2 = null;

    inFlight = false;
    tossCallback = null;

    constructor(game) {
        this.game = game;
        this.game.models.dices = this;
    }

    async loadDices(url) {
        this.dice1 = await createModel("dice1", url, new THREE.Vector3(
            0, -1, -Settings.diceBetween / 2
        ), {}, { y: Settings.diceSize });

        this.dice1.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshBasicMaterial({ map: child.material.map });
            }
        });

        this.dice2 = await createModel("dice2", url, new THREE.Vector3(
            0, -1, Settings.diceBetween / 2
        ), {}, { y: Settings.diceSize });

        this.dice2.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshBasicMaterial({ map: child.material.map });
            }
        });

        this.game.virtualWorld.scene.add(this.dice1, this.dice2);

        this.physicsDice1 = createCubCollision(this.game, { x: 0, y: 2.8, z: 0 }, {
            x: Settings.diceSize,
            y: Settings.diceSize,
            z: Settings.diceSize,
        });

        this.physicsDice2 = createCubCollision(this.game, { x: 0, y: 2.8, z: 0 }, {
            x: Settings.diceSize,
            y: Settings.diceSize,
            z: Settings.diceSize,
        });
    }

    toss(callback) {
        if (!this.inFlight) {
            this.physicsDice1.angularVelocity = randomVelocity(8, 10);
            this.physicsDice1.position.set(0, Settings.diceInitHeight, -Settings.diceBetween / 2);
            this.physicsDice2.angularVelocity = randomVelocity(8, 10);
            this.physicsDice2.position.set(0, Settings.diceInitHeight, Settings.diceBetween / 2);

            this.inFlight = true;
            this.tossCallback = callback;
        }
    }

    render() {
        if (this.inFlight) {
            copyStateFromPhysicsToModel(this.physicsDice1, this.dice1);
            copyStateFromPhysicsToModel(this.physicsDice2, this.dice2);

            if (this.physicsDice1.angularVelocity.length() < 0.001 && this.physicsDice2.angularVelocity.length() < 0.001) {
                this.inFlight = false;
                let v1 = getDiceSide(this.physicsDice1.quaternion);
                let v2 = getDiceSide(this.physicsDice2.quaternion);
                this.tossCallback(v1 + v2, v1 == v2);
            }
        }
    }
}

export class Card {
    game = null;
    id = null;
    cardInfo = null;
    owner = null;
    type = null;
    pledgeMarker = null;
    houses = null;
    housesPositions = null;

    isActive = false;
    isMonopoly = false;
    isPledge = false;
    houseCount = 0;

    constructor(id, cardInfo, owner, game) {
        this.id = id;
        this.owner = owner;
        this.cardInfo = cardInfo;
        this.type = cardInfo.typeCard;
        this.game = game;

        this.housesPositions = getHotelPosition(this.id);
        this.houses = [];
    }

    async addPledgeMarker() {
        const pledgePosition = getCardCenter(this.id);
        this.pledgeMarker = await createPlane(
            `pledge_${this.id}`,
            pledgeTexture,
            new THREE.Vector3(pledgePosition.x, 2.7001, pledgePosition.y),
            { x: -Math.PI / 2, z: pledgePosition.r },
            pledgePosition.size,
            [1, 1],
            true
        );
        this.game.virtualWorld.scene.add(this.pledgeMarker);
    }

    async addHouses(need) {
        let initHouseCount = this.houseCount;
        this.houseCount = need;
        if (initHouseCount < need) {
            if (need == 5) {
                this.houses.forEach((E) => {
                    this.game.virtualWorld.scene.remove(E);
                })
                this.houses = [];
                const hotelPosition = this.housesPositions[4];
                const hotel = await createSTLModel(
                    `hotel_${this.id}`, houseModelUrl, new THREE.Vector3(hotelPosition.x, 2.7001, hotelPosition.y),
                    { x: -Math.PI / 2, z: hotelPosition.r }, { x: 0.06 }, { color: "#dd0000" }
                );
                this.game.virtualWorld.scene.add(hotel);
                this.houses.push(hotel);
            } else {
                for (let i = initHouseCount; i < need; i += 1) {
                    const housesPosition = this.housesPositions[i];
                    console.log(housesPosition);
                    const house = await createSTLModel(
                        `house_${this.id}_${i}`, houseModelUrl, new THREE.Vector3(housesPosition.x, 2.7001, housesPosition.y),
                        { x: -Math.PI / 2, z: housesPosition.r }, { x: 0.04 }, { color: "green" }
                    );
                    this.game.virtualWorld.scene.add(house);
                    this.houses.push(house);
                }
            }
        } else if (initHouseCount > need) {
            if (initHouseCount == 5) {
                this.game.virtualWorld.scene.remove(this.houses[0]);
                this.houses = [];
                for (let i = 0; i < need; i += 1) {
                    const housesPosition = this.housesPositions[i];
                    const house = await createSTLModel(
                        `house_${this.id}_${i}`, houseModelUrl, new THREE.Vector3(housesPosition.x, 2.7001, housesPosition.y),
                        { x: -Math.PI / 2, z: housesPosition.r }, { x: 0.04 }, { color: "green" }
                    );
                    this.game.virtualWorld.scene.add(house);
                    this.houses.push(house);
                }
            } else {
                for (let i = initHouseCount - 1; i > need - 1; i -= 1) {
                    this.game.virtualWorld.scene.remove(this.houses[i]);
                    this.houses.pop();
                }
            }
        }
        console.log("END BUILD HOUSES", need, this.houseCount, this.houses.length);
    }

    buildHouses(count, checkMode) {
        if (!checkMode) this.addHouses(count);
        if (count >= this.houseCount) {
            return -this.cardInfo["houseCost"] * (count - this.houseCount);
        } else {
            return this.cardInfo["houseCost"] * 0.5 * (this.houseCount - count);
        }
    }

    moveToPledge(checkMode) {
        if (!checkMode) {
            this.addPledgeMarker();
            this.isPledge = true;
        }
        return this.cardInfo["startCost"] / 2;
    }

    moveToUnpledgeCard(checkMode) {
        if (!checkMode) {
            this.isPledge = false;
            this.game.virtualWorld.scene.remove(this.pledgeMarker);
        }
        return this.cardInfo["startCost"] * 0.6;
    }

    getStatus() {
        if (this.isPledge) {
            return 'pledge';
        } else {
            if (this.houseCount > 0) {
                return 'house';
            } else {
                return 'buy';
            }
        }
    }

    getPlayerAction(player, dicesResult) {
        if (this.owner.name != player.name && !this.isPledge) {
            let rent = 0;
            if (this.type == 0) {
                if (this.houseCount != 0) {
                    rent = this.cardInfo.rent[this.houseCount];
                } else {
                    rent = this.isMonopoly ? this.cardInfo.rent[this.houseCount] : this.cardInfo.rent[this.houseCount];
                }
            }
            if (this.type == 1) {
                rent = parseInt(25 * Math.pow(2, this.houseCount));
            }
            if (this.type == 2) {
                rent = this.isMonopoly ? 10 * dicesResult : 4 * dicesResult;
            }
            if (rent != 0) {
                return { action: "pay", fromPlayer: player, toPlayer: this.owner, cost: rent };
            }
        }
        return { action: "none" }
    }
}
