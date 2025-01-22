import { initVirtualWorld } from './world';
import { initPhysicsWorld } from './physics';
import { Card } from './objects';
import { createCardMarker } from './models';

const COLOR_GROUPS = [
    [1, 3],
    [6, 8, 9],
    [11, 13, 14],
    [16, 18, 19],
    [21, 23, 24],
    [26, 27, 29],
    [31, 32, 34],
    [37, 39],
    [12, 28]
];

export class GameContent {

    initSuccess = false;
    myPlayer = null;

    virtualWorld = {
        scene: null,
        renderer: null,
        camera: null,
        controls: null,
        timer: null,
        cursor: null,
        map: null,
    }

    physicsWorld = null;

    models = {
        markers: [],
        tasks: [],
        players: [],
    }

    data = {
        cards: {},
        info: {},
        playerIndex: 0,
        selectedCardIndex: 0,
    }

    eventListener = (n, v) => { };

    constructor(cardsList) {
        this.data.info = cardsList;
    }

    async initGame(container, eventListener) {
        this.initSuccess = true;
        this.eventListener = eventListener;
        initPhysicsWorld(this);
        await initVirtualWorld(this, container);

        this.myPlayer = this.models.players[0];

        /*for (let i = 0; i < 40; i++) {
            if (this.data.info[i].typeCard <= 2) {
                this.buyCard(this.models.players[0], i)
                this.data.cards[i].buildHouses(parseInt(Math.random() * 5), false)
            }
        }*/

        this.buyCard(this.models.players[0], 1);
        this.buyCard(this.models.players[0], 3);

        this.buildHouse(1, 5);
        this.buildHouse(3, 5);
    }

    tossDices() {
        this.models.dices.toss((result, isDouble) => {
            this.eventListener("dice", [result, isDouble]);
            this.models.players[this.data.playerIndex].moveOn(result, (nowPosition) => {
                this.processPosition(this.models.players[this.data.playerIndex], nowPosition, result);
            });
        });
    }

    processPosition(player, cardIndex, dicesResult) {
        if (this.data.cards[cardIndex]) {
            let action = this.data.cards[cardIndex].getPlayerAction(player, dicesResult);
            if (action.action != "none") {
                this.eventListener("rent", {
                    from: action.fromPlayer,
                    to: action.toPlayer,
                    cost: action.cost
                });
            }
            this.nextPlayer();
        } else {
            if (this.data.info[cardIndex].typeCard <= 2) {
                this.eventListener("buy", {
                    player: player,
                    cardIndex: cardIndex,
                    onSelect: (result) => {
                        if (result) {
                            this.buyCard(player, cardIndex);
                        }
                        this.nextPlayer();
                    }
                });
            } else {
                this.nextPlayer();
            }
        }
    }

    buyCard(player, cardIndex) {
        let card = this.data.info[cardIndex];
        this.data.cards[cardIndex] = new Card(cardIndex, card, player, this);

        if (!player.transferMoney(-[card.startCost, 200, 150][card.typeCard])) {
            return;
        }
        createCardMarker(this, player, cardIndex);

        this.cardColorGroup(cardIndex);

        this.eventListener("moneyUpdate", {
            player: player,
            money: player.money,
        });
    }

    buildHouse(cardIndex, houseCount) {
        if (this.data.cards[cardIndex]) {
            let card = this.data.cards[cardIndex];
            card.buildHouses(houseCount, false);
        }
        return false;
    }

    buildGroupHouse(player, total, groupValue) {
        if (player.transferMoney(-total)) {
            this.eventListener("moneyUpdate", {
                player: player,
                money: player.money,
            });
            groupValue.forEach((H) => {
                this.buildHouse(H.id, H.houses);
            });
            return true;
        } else {
            return false;
        }
    }

    nextPlayer() {
        this.data.playerIndex = (this.data.playerIndex + 1) % this.models.players.length;
    }

    pledgeCard(id) {
        if (this.data.cards[id]) {
            let card = this.data.cards[id];
            let player = card.owner;
            player.transferMoney(card.moveToPledge());
            this.eventListener("moneyUpdate", {
                player: player,
                money: player.money,
            });
            return true;
        }
        return false;
    }

    unpledgeCard(id) {
        if (this.data.cards[id]) {
            let card = this.data.cards[id];
            let player = card.owner;
            if (player.transferMoney(-card.moveToUnpledgeCard(true))) {
                card.moveToUnpledgeCard();
                this.eventListener("moneyUpdate", {
                    player: player,
                    money: player.money,
                });
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    cardStatus(id) {
        if (this.data.cards[id]) {
            return this.data.cards[id].getStatus();
        } else {
            return "free";
        }
    }

    cardColorGroup(id) {
        if (id % 5 == 0 && parseInt(id / 5) % 2 == 1) {
            let players = {};
            let cards = {};

            for (let i = 5; i <= 35; i += 10) {
                let card = this.data.cards[i];
                if (card) {
                    let owner = card.owner;
                    if (players[owner.name]) {
                        players[owner.name].push(i);
                    } else {
                        players[owner.name] = [i];
                    }
                    cards[i] = [card, owner.name];
                }
            }

            // console.log(players, cards);

            for (let i = 5; i <= 35; i += 10) {
                let card = cards[i];
                if (card) {
                    card[0].houseCount = players[card[1]].length;
                }
            }
        } else {
            const colorGroup = parseInt(id / 5);
            let isMonopoly = true;

            COLOR_GROUPS[colorGroup].forEach((I) => {
                if (this.data.cards[I]) {
                    if (this.data.cards[I].owner.name != this.myPlayer.name) {
                        isMonopoly = false;
                    }
                } else {
                    isMonopoly = false;
                }
            });

            COLOR_GROUPS[colorGroup].forEach((I) => {
                if (this.data.cards[I]) {
                    this.data.cards[I].isMonopoly = isMonopoly;
                }
            });

            if (isMonopoly) {
                // // console.log("MONOPOLY:")
                // COLOR_GROUPS[colorGroup].forEach((I) => {
                //     console.log(this.data.cards[I]);
                // });
            }
        }
    }

    nextColorGroup(nowIndex, defaultValue, reverse) {
        let first = true;
        for (let i = nowIndex + (defaultValue != null ? (reverse ? -1 : 1) : 0); i != nowIndex || first; i = (i + (reverse ? -1 : 1) + 8) % 8) {
            let cards = [];
            COLOR_GROUPS[i].forEach((C) => {
                if (this.data.cards[C] && this.data.cards[C].owner.name == this.myPlayer.name) {
                    cards.push({
                        id: C,
                        houses: this.data.cards[C].houseCount,
                        init: this.data.cards[C].houseCount,
                    })
                }
            });
            if (cards.length == COLOR_GROUPS[i].length) {
                return [cards, i];
            }
            first = false;
        }
        return defaultValue;
    }
}