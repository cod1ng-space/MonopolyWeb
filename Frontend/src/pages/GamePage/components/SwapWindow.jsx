import React from "react";

function MiniCard(props) {

    const card = props.game.data.info[props.id];
    const cardInfo = props.game.data.cards[props.id];
    const owner = props.game.data.cards[props.id]?.owner;
    const canChoose = (owner?.name === props.me.name || owner?.name === props.player.name) && cardInfo?.houseCount == 0;
    const playerColor = owner?.color;

    const [selected, setSelected] = React.useState(
        owner?.name === props.me.name
            ? props.swap.toPlayer2.some(E => E.id === props.id)
            : props.swap.toPlayer1.some(E => E.id === props.id)
    );

    return (
        <div className="mini-card" style={{ opacity: !canChoose ? 0.1 : 1 }}>
            {card.typeCard <= 2 && <>
                <div className="mini-card-houses" style={{ opacity: cardInfo?.houseCount != 0 ? 1 : 0 }}></div>
                <div
                    className={`mini-card-body ${canChoose ? 'can-choose' : ''} ${selected ? 'selected-card' : ''}`}
                    style={{ outline: !canChoose ? "none" : undefined }}
                    onClick={() => {
                        if (selected) {
                            props.onUpdate({ id: props.id, destroy: true, isOwner: owner?.name === props.me.name });
                        } else {
                            props.onUpdate({
                                id: props.id,
                                type: card.typeCard,
                                color: card.color ?? "white",
                                name: card.name,
                                cost: card.startCost,
                                isOwner: owner?.name === props.me.name
                            });
                        }
                        setSelected(prev => !prev);
                    }}
                >
                    <div className="color" style={{ backgroundColor: card.color }}></div>
                    <div className="mini-empty-body">
                        {card.name}
                    </div>
                </div>
                <div className="mini-card-owner" style={{ backgroundColor: playerColor }}>
                </div>
            </>}
        </div >
    )
}

export default function SwapWindow(props) {
    const [selectedPlayer, setSelectedPlayer] = React.useState(null);
    const [swapObject, setSwapObjects] = React.useState({
        money: 0,
        toPlayer1: [],
        toPlayer2: []
    });

    const [showMoneyInput, setShowMoneyInput] = React.useState(false);
    const [showCardInput, setShowCardInput] = React.useState(false);
    const [moneyInputValue, setMoneyInputValue] = React.useState("");

    function changeMoney(ev) {
        setMoneyInputValue(ev.target.value);
    }

    function successChangeMoney() {
        if (/^-{0,1}\d+$/.test(moneyInputValue)) {
            let value = parseInt(moneyInputValue);

            if (value > 0 && value <= selectedPlayer.money || value < 0 && -value <= props.player.money) {
                setShowMoneyInput(false);
                setSwapObjects(prev => (
                    {
                        ...prev,
                        money: parseInt(moneyInputValue)
                    }
                ));
            }
        }
    }

    function changeList(card) {
        if (card.destroy) {
            if (!card.isOwner) {
                setSwapObjects(prev => ({
                    ...prev,
                    toPlayer1: prev.toPlayer1.filter(O => O.id !== card.id),
                }));
            } else {
                setSwapObjects(prev => ({
                    ...prev,
                    toPlayer2: prev.toPlayer2.filter(O => O.id !== card.id),
                }));
            }
        } else {
            if (!card.isOwner) {
                swapObject.toPlayer1.push(card);
                swapObject.toPlayer1.sort((a, b) => {
                    if (a.type > b.type) {
                        return 1;
                    } else if (a.type < b.type) {
                        return -1;
                    } else {
                        return a.id > b.id ? 1 : -1;
                    }
                })
                setSwapObjects(prev => ({
                    ...prev,
                }));
            } else {
                swapObject.toPlayer2.push(card);
                swapObject.toPlayer2.sort((a, b) => {
                    if (a.type > b.type) {
                        return 1;
                    } else if (a.type < b.type) {
                        return -1;
                    } else {
                        return a.id > b.id ? 1 : -1;
                    }
                })
                setSwapObjects(prev => ({
                    ...prev,
                }));
            }
        }
    }

    return (
        <div className="window swap-window">
            {
                !selectedPlayer
                    ? <div className="player-select">
                        <div className="title">
                            Выберите игрока для обмена:
                        </div>
                        <div className="players-list">
                            {props.players.filter((E) => E.name != props.player.name).map((P) => (
                                <div className="player-card" onClick={() => setSelectedPlayer(P)}>
                                    <div className="avatar" style={{ backgroundColor: P.color }} />
                                    <div className="name">
                                        {P.displayName}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    : showCardInput
                        ? <div className="choose-cards-dialog">
                            <div className="cards">
                                {Array(40).fill(0).map((_, I) => I).filter((v) => v % 10 != 0).map((I) => (
                                    <MiniCard
                                        id={I}
                                        game={props.game}
                                        swap={swapObject}
                                        me={props.player}
                                        player={selectedPlayer}
                                        onUpdate={changeList}
                                    />
                                ))}
                            </div>
                            <div className="actions">
                                <button className="option-button primary" onClick={() => setShowCardInput(false)}>ОК</button>
                            </div>
                        </div>
                        : <div className="swap-dialog">
                            <span className="player">
                                <div className="avatar" style={{ backgroundColor: props.player.color }} />
                                <div className="info">
                                    <div>Игрок <b>{props.player.displayName}</b></div>
                                    <div>Состояние: <b>{props.player.money} $</b></div>
                                </div>
                            </span>
                            <span className="player">
                                <div className="avatar" style={{ backgroundColor: selectedPlayer.color }} />
                                <div className="info">
                                    <div>Игрок <b>{selectedPlayer.displayName}</b></div>
                                    <div>Состояние: <b>{selectedPlayer.money} $</b></div>
                                </div>
                            </span>
                            <hr className="vertical-swap-list-hr" />
                            <div className="swap-list">
                                <div className="head">Вы получите:</div>
                                <div className="list">
                                    {swapObject.toPlayer1.map((card) => (
                                        <div className="list-item">
                                            <div className={`card-color`} style={{ backgroundColor: card.color }}></div>
                                            <div className="card-name">
                                                {card.name}
                                            </div>
                                            <hr />
                                            <div className="card-cost">
                                                {card.cost} $
                                            </div>
                                        </div>
                                    ))}
                                    {swapObject.money > 0 && <div className="list-item">
                                        <div>
                                            <b>Денежная сумма</b>
                                        </div>
                                        <hr />
                                        <div>
                                            <b>{swapObject.money} $</b>
                                        </div>
                                    </div>}
                                </div>
                                {showMoneyInput && <div className="money-input">
                                    <input type='number' defaultValue={moneyInputValue} onChange={(ev) => changeMoney(ev)} />
                                    <button className="option-button default" onClick={() => successChangeMoney()}>OK</button>
                                </div>}
                            </div>
                            <div className="swap-list">
                                <div className="head">Вы отдадите:</div>
                                <div className="list">
                                    {swapObject.toPlayer2.map((card) => (
                                        <div className="list-item">
                                            <div className="card-color" style={{ backgroundColor: card.color }}></div>
                                            <div className="card-name">
                                                {card.name}
                                            </div>
                                            <hr />
                                            <div className="card-cost">
                                                {card.cost} $
                                            </div>
                                        </div>
                                    ))}
                                    {swapObject.money < 0 && <div className="list-item">
                                        <div className="card-name">
                                            <b>Денежная сумма</b>
                                        </div>
                                        <hr />
                                        <div>
                                            <b>{-swapObject.money} $</b>
                                        </div>
                                    </div>}
                                </div>
                            </div>
                            <div className="actions">
                                <button className="option-button default" onClick={() => setShowCardInput(true)}>Добавить карточку</button>
                                <button className="option-button default" onClick={() => setShowMoneyInput(prev => !prev)}>Денежная сумма</button>
                                <button className="option-button primary" style={{ marginLeft: "auto" }}>Отправить</button>
                            </div>
                        </div>
            }
        </div>
    )
}