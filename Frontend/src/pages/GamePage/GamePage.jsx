import { useRef, useEffect, useState } from "react";
import { GameContent } from "./3d/game";

import DataCards from "./cards.json"
import BuyWindow from "./components/BuyWindow";

import './styles.scss';
import SwapWindow from "./components/SwapWindow";
import CardInformation from "./components/CardInformation";
import CardWindow from "./components/CardWindow";
import BuildingWindow from "./components/BuildingsWindow";

function GamePage() {
    const containerRef = useRef();
    const doubleResultRef = useRef();
    const [game, setGame] = useState(new GameContent(DataCards.cardInfo));
    const [infoWindow, setInfoWindow] = useState(null);

    const [players, setPlayers] = useState([
        { name: 0, displayName: "Leonid", money: 2500, color: "blue", _animation_version: 0, transfer: 0 },
        { name: 1, displayName: "Daniil", money: 2500, color: "red", _animation_version: 0, transfer: 0 },
        { name: 2, displayName: "Olesya", money: 2500, color: "orange", _animation_version: 0, transfer: 0 },
        { name: 3, displayName: "Leonid", money: 2500, color: "green", _animation_version: 0, transfer: 0 },
    ]);

    function updateGameBody(name, value) {
        // console.log("EVENT", name, value)
        if (name == "showCard") {
            setInfoWindow({ type: "card", cardIndex: value });
        }
        if (name == "closeCard") {
            setInfoWindow(null);
        }
        if (name == "dice") {
            // debugRef.current.innerText = `Выброшено: ${value[0]}`;
            if (value[1]) {
                // doubleResultRef.current.className = "double-text";
            }
        }
        if (name == "buy") {
            setInfoWindow({
                type: "buy",
                cardIndex: value.cardIndex,
                ...value,
            })
        }
        if (name == "moneyUpdate") {
            setPlayers(prev => [
                ...prev.slice(0, value.player.name),
                {
                    ...prev[value.player.name],
                    money: value.money,
                    _animation_version: prev[value.player.name]._animation_version + 1,
                    transfer: value.money - prev[value.player.name].money,
                },
                ...prev.slice(value.player.name + 1),
            ])
        }
        if (name == "rent") {
            setPlayers(prev => prev.map((player, index) => {
                if (index == value.from.name) {
                    return {
                        ...player,
                        money: player.money - value.cost,
                        _animation_version: player._animation_version + 1,
                        transfer: -value.cost,
                    }
                }
                if (index == value.to.name) {
                    return {
                        ...player,
                        money: player.money + value.cost,
                        _animation_version: player._animation_version + 1,
                        transfer: value.cost,
                    }
                }
                return player;
            }))
        }
    }

    function keyboardEvent(event, gameContent) {
        if (event.key === ' ') {
            gameContent.tossDices();
        }
        if (event.key === 'Escape') {
            setInfoWindow(null);
        }
    }

    function openBuildingDialog() {
        let group = game.nextColorGroup(0, null, false);
        if (group) {
            setInfoWindow({ type: "building", default: group });
        }
    }

    useEffect(() => {
        return () => {
            document.removeEventListener("keydown", keyboardEvent);
        }
    }, []);

    useEffect(() => {
        if (containerRef && containerRef.current && !game.initSuccess) {
            game.initGame(containerRef.current, updateGameBody).then(() => {
                openBuildingDialog();
            });
            document.addEventListener("keydown", (ev) => keyboardEvent(ev, game));
        }
    }, [containerRef]);

    return (
        <div>
            <div ref={containerRef} className="container" />
            <div className="game_body">
                <div className="players">
                    {players.map((player, index) => (
                        <div key={`player_${index}`} className="player">
                            <span className="color" style={{ backgroundColor: player.color }}></span>
                            <span className="name">{player.displayName}</span>
                            <span className="money">{player.money}</span>
                            <span
                                key={player._animation_version}
                                className={`transfer ${player.transfer > 0
                                    ? "inc"
                                    : (player.transfer == 0 ? "none" : "dec")
                                    }`}
                            >
                                {player.transfer > 0 && "+"}{player.transfer}
                            </span>
                        </div>
                    ))}
                </div>
                {/*<div ref={doubleResultRef} className="hidden">DOUBLE!</div>
                <div ref={debugRef} className="debug">Нажмите Enter</div>
                <div ref={infoRef} className="info"></div>*/}
                {
                    infoWindow && infoWindow.type == "card" &&
                    <CardWindow id={infoWindow.cardIndex} card={DataCards.cardInfo[infoWindow.cardIndex]} game={game} />
                }
                {
                    infoWindow && infoWindow.type == "buy" &&
                    <BuyWindow game={game} card={DataCards.cardInfo[infoWindow.cardIndex]} onAction={(success) => {
                        infoWindow.onSelect(success);
                        setInfoWindow(null);
                    }} />
                }
                {
                    infoWindow && infoWindow.type == "swap" &&
                    <SwapWindow game={game} player={players[0]} players={players} />
                }
                {
                    infoWindow && infoWindow.type == "building" &&
                    <BuildingWindow default={infoWindow.default} cardsInfo={DataCards.cardInfo} game={game} />
                }
            </div>
        </div >
    )
}

export default GamePage;