import { createColoredPlane } from "./models";
import CardsSettings from "./settings.json";
import CardsInfo from "../cards.json";

const MAP_SIZE = CardsSettings["mapSize"];
const CARD_WIDTH = CardsSettings["cardWidth"];
const CARD_HEIGHT = CardsSettings["cardHeight"];
const MAP_BORDER = CardsSettings["mapBorder"];
const SCALE = CardsSettings["scale"];
const CARD_MARKER_OFFSET = CardsSettings["cardMarkerOffset"];

const CARD_MARKER_WIDTH = CARD_WIDTH * 0.8
const CARD_MARKER_HEIGHT = CardsSettings["cardMarkerWidth"];

const PLAYER_OFFSET = CardsSettings["playerOffset"];
const HOUSE_OFFSET = CardsSettings["houseOffset"];
const HOUSE_SPACE_BETWEEN = CardsSettings["houseSpaceBetween"];

/**
 * Get card index by cursor position
 * @param {number} px Cursor X position on map (in global coords)
 * @param {number} py Cursor Y position on map (in global coords)
 */

export function getCardCursorProperties(px, py) {
    const GAME_SIZE = MAP_SIZE - 2 * MAP_BORDER;

    px = (px + 1) / SCALE;
    py = (py + 1) / SCALE;

    px -= MAP_BORDER;
    py -= MAP_BORDER;
    let x = NaN, y = NaN, rotate = -1, cardIndex;

    if (px >= CARD_HEIGHT && py >= 0 && px <= GAME_SIZE - CARD_HEIGHT && py <= CARD_HEIGHT) {
        rotate = 0;
        x = parseInt((px - CARD_HEIGHT) / CARD_WIDTH) * CARD_WIDTH + CARD_HEIGHT + CARD_WIDTH / 2;
        y = CARD_HEIGHT / 2;
        cardIndex = 21 + parseInt((px - CARD_HEIGHT) / CARD_WIDTH);
    }
    if (px >= 0 && py >= CARD_HEIGHT && px <= CARD_HEIGHT && py <= GAME_SIZE - CARD_HEIGHT) {
        rotate = Math.PI / 2;
        x = CARD_HEIGHT / 2;
        y = parseInt((py - CARD_HEIGHT) / CARD_WIDTH + 1) * CARD_WIDTH + CARD_HEIGHT - CARD_WIDTH / 2;
        cardIndex = 19 - parseInt((py - CARD_HEIGHT) / CARD_WIDTH);
    }
    if (px >= CARD_HEIGHT && py >= GAME_SIZE - CARD_HEIGHT && px <= GAME_SIZE - CARD_HEIGHT && py <= GAME_SIZE) {
        rotate = Math.PI;
        x = parseInt((px - CARD_HEIGHT) / CARD_WIDTH + 1) * CARD_WIDTH + CARD_HEIGHT - CARD_WIDTH / 2;
        y = GAME_SIZE - CARD_HEIGHT / 2;
        cardIndex = 9 - parseInt((px - CARD_HEIGHT) / CARD_WIDTH);
    }
    if (px >= GAME_SIZE - CARD_HEIGHT && py >= CARD_HEIGHT && px <= GAME_SIZE && py <= GAME_SIZE - CARD_HEIGHT) {
        rotate = 3 * Math.PI / 2;
        x = GAME_SIZE - CARD_HEIGHT / 2;
        y = parseInt((py - CARD_HEIGHT) / CARD_WIDTH) * CARD_WIDTH + CARD_HEIGHT + CARD_WIDTH / 2;
        cardIndex = 31 + parseInt((py - CARD_HEIGHT) / CARD_WIDTH);
    }
    return {
        x: (x + MAP_BORDER) * SCALE - 1,
        y: (y + MAP_BORDER) * SCALE - 1,
        cSize: [CARD_WIDTH * SCALE, CARD_HEIGHT * SCALE],
        r: rotate != -1 && CardsInfo.cardInfo[cardIndex].typeCard <= 2 ? rotate : -1,
        index: cardIndex,
    }
}

export function getCardCenter(index) {
    let x = 0;
    let y = 0;
    let r = 0;

    if (index >= 0 && index < 10) {
        x = MAP_SIZE - MAP_BORDER - CARD_HEIGHT / 2 - (index > 0 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) - index * CARD_WIDTH;
        y = MAP_SIZE - MAP_BORDER - CARD_HEIGHT / 2;
        r = 0;
    }

    if (index >= 10 && index < 20) {
        x = MAP_BORDER + CARD_HEIGHT / 2;
        y = MAP_SIZE - MAP_BORDER - CARD_HEIGHT / 2 - (index > 10 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) - (index - 10) * CARD_WIDTH;
        r = -Math.PI / 2;
    }

    if (index >= 20 && index < 30) {
        x = MAP_BORDER + CARD_HEIGHT / 2 + (index > 20 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) + (index - 20) * CARD_WIDTH;
        y = MAP_BORDER + CARD_HEIGHT / 2;
        r = -Math.PI;
    }

    if (index >= 30 && index < 40) {
        x = MAP_SIZE - MAP_BORDER - CARD_HEIGHT / 2;
        y = MAP_BORDER + CARD_HEIGHT / 2 + (index > 30 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) + (index - 30) * CARD_WIDTH;
        r = -3 * Math.PI / 2;
    }

    return {
        x: x * SCALE - 1,
        y: y * SCALE - 1,
        r: r,
        size: [CARD_WIDTH * 0.9 * SCALE, CARD_WIDTH * 0.9 * SCALE]
    }
}

/**
 * Get center position of card by index
 * @param {number} index 
 * @returns x, y, z and rotation (axis Y) for figure (param r)
 */

export function getCardPositionById(index, playersPositions) {
    let x = 0;
    let y = 0;
    let r = -Math.PI / 2;
    let coordsVector = [];

    if (index >= 0 && index < 10) {
        x = MAP_SIZE - MAP_BORDER - CARD_HEIGHT / 2 - (index > 0 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) - index * CARD_WIDTH;
        y = MAP_SIZE - MAP_BORDER - CARD_HEIGHT / 2;
        r = -Math.PI / 2;
        coordsVector = [-1, -1];
    }

    if (index >= 10 && index < 20) {
        x = MAP_BORDER + CARD_HEIGHT / 2;
        y = MAP_SIZE - MAP_BORDER - CARD_HEIGHT / 2 - (index > 10 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) - (index - 10) * CARD_WIDTH;
        r = Math.PI;
        coordsVector = [1, -1];
    }

    if (index >= 20 && index < 30) {
        x = MAP_BORDER + CARD_HEIGHT / 2 + (index > 20 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) + (index - 20) * CARD_WIDTH;
        y = MAP_BORDER + CARD_HEIGHT / 2;
        r = Math.PI / 2;
        coordsVector = [1, 1];
    }

    if (index >= 30 && index < 40) {
        x = MAP_SIZE - MAP_BORDER - CARD_HEIGHT / 2;
        y = MAP_BORDER + CARD_HEIGHT / 2 + (index > 30 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) + (index - 30) * CARD_WIDTH;
        r = 0;
        coordsVector = [-1, 1];
    }

    let playerIndex = playersPositions[index] ?? 0;
    let offsetVector = [[0, 0], [1, 1], [1, 0], [0, 1]][playerIndex];

    let newX = x * SCALE + coordsVector[0] * PLAYER_OFFSET / 2 - PLAYER_OFFSET * offsetVector[0] * coordsVector[0];
    let newY = y * SCALE + coordsVector[1] * PLAYER_OFFSET / 2 - PLAYER_OFFSET * offsetVector[1] * coordsVector[1];

    return {
        x: newX - 1,
        y: 2.7,
        z: newY - 1,
        r: r,
    };
}

/**
 * Generate way as array of points
 * @param {number} fromIndex Start point for moving
 * @param {number} toIndex End point for moving
 * @returns 
 */

export function getWay(fromIndex, toIndex, playersPosition) {
    // fromIndex = fromIndex % 40;
    // toIndex = toIndex % 40;
    // let way = [];
    // while (parseInt(fromIndex / 10) != parseInt(toIndex / 10)) {
    //     fromIndex = (fromIndex + 10 - fromIndex % 10) % 40;
    //     way.push(getCardPositionById(fromIndex));
    // }
    // way.push(getCardPositionById(toIndex));
    // console.log(way)
    let way = [];
    for (let pos = fromIndex + 1; pos % 40 <= toIndex; pos += 1) {
        way.push(getCardPositionById(pos % 40, playersPosition(pos % 40)));
    }
    return way;
}

/**
 * Get center position of card marker by index
 * @param {number} index 
 * @returns x, y, z and rotation (axis Y) for card marker (param r)
 */

export function getCardMarkerPositionById(index) {
    let x = 0;
    let y = 0;
    let r = -Math.PI / 2;

    if (index >= 0 && index < 10) {
        x = MAP_SIZE - MAP_BORDER - CARD_HEIGHT / 2 - (index > 0 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) - index * CARD_WIDTH;
        y = MAP_SIZE - MAP_BORDER + CARD_MARKER_OFFSET;
        r = 0;
    }

    if (index >= 10 && index < 20) {
        x = MAP_BORDER - CARD_MARKER_OFFSET;
        y = MAP_SIZE - MAP_BORDER - CARD_HEIGHT / 2 - (index > 10 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) - (index - 10) * CARD_WIDTH;
        r = Math.PI / 2;
    }

    if (index >= 20 && index < 30) {
        x = MAP_BORDER + CARD_HEIGHT / 2 + (index > 20 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) + (index - 20) * CARD_WIDTH;
        y = MAP_BORDER - CARD_MARKER_OFFSET;
        r = 0;
    }

    if (index >= 30 && index < 40) {
        x = MAP_SIZE - MAP_BORDER + CARD_MARKER_OFFSET;
        y = MAP_BORDER + CARD_HEIGHT / 2 + (index > 30 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) + (index - 30) * CARD_WIDTH;
        r = Math.PI / 2;
    }

    return {
        x: x * SCALE - 1,
        y: 2.7,
        z: y * SCALE - 1,
        r: r,
        width: CARD_MARKER_WIDTH * SCALE,
        height: CARD_MARKER_HEIGHT * SCALE,
    };
}

export function getHotelPosition(index) {
    let x = 0;
    let y = 0;
    let r = -Math.PI / 2;
    let coordsVector = [];

    if (index >= 0 && index < 10) {
        x = MAP_SIZE - MAP_BORDER - CARD_HEIGHT / 2 - (index > 0 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) - index * CARD_WIDTH;
        y = MAP_SIZE - MAP_BORDER - CARD_HEIGHT * (1 - HOUSE_OFFSET);
        r = Math.PI / 2;
        coordsVector = [-1, 0];
    }

    if (index >= 10 && index < 20) {
        x = MAP_BORDER + CARD_HEIGHT * (1 - HOUSE_OFFSET);
        y = MAP_SIZE - MAP_BORDER - CARD_HEIGHT / 2 - (index > 10 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) - (index - 10) * CARD_WIDTH;
        r = 0;
        coordsVector = [0, -1];
    }

    if (index >= 20 && index < 30) {
        x = MAP_BORDER + CARD_HEIGHT / 2 + (index > 20 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) + (index - 20) * CARD_WIDTH;
        y = MAP_BORDER + CARD_HEIGHT * (1 - HOUSE_OFFSET);
        r = Math.PI / 2;
        coordsVector = [1, 0];
    }

    if (index >= 30 && index < 40) {
        x = MAP_SIZE - MAP_BORDER - CARD_HEIGHT * (1 - HOUSE_OFFSET);
        y = MAP_BORDER + CARD_HEIGHT / 2 + (index > 30 ? (CARD_HEIGHT - CARD_WIDTH) / 2 : 0) + (index - 30) * CARD_WIDTH;
        r = 0;
        coordsVector = [0, 1];
    }

    let houses = [];
    for (let i = 0; i < 4; i += 1) {
        houses.push({
            x: x * SCALE + 1.5 * coordsVector[0] * HOUSE_SPACE_BETWEEN * SCALE - i * coordsVector[0] * HOUSE_SPACE_BETWEEN * SCALE - 1,
            y: y * SCALE + 1.5 * coordsVector[1] * HOUSE_SPACE_BETWEEN * SCALE - i * coordsVector[1] * HOUSE_SPACE_BETWEEN * SCALE - 1,
            r: r,
        });
    }

    houses.push({
        x: x * SCALE - 1,
        y: y * SCALE - 1,
        r: r - Math.PI / 2
    });

    return houses;
}