import React, { useState } from "react";
import CardInformation from "./CardInformation";

const groups = [
    [1, 3],
    [6, 8, 9],
    [11, 13, 14],
    [16, 18, 19],
    [21, 23, 24],
    [26, 27, 29],
    [31, 32, 34],
    [37, 39],
];

export default function BuildingWindow(props) {

    const [cards, setCards] = useState({
        groupIndex: 0,
        cards: [
            { id: 6, houses: 3, init: 3 },
            { id: 8, houses: 2, init: 2 },
            { id: 9, houses: 1, init: 1 },
        ]
    });
    const [total, setTotal] = useState(0);

    function handleDecrement(cardIndex) {
        if (cards.cards[cardIndex].houses <= cards.cards[cardIndex].init) {
            setTotal(prev => prev - (parseInt(cards.groupIndex / 2) * 50 + 50) * 0.5);
        } else {
            setTotal(prev => prev - (parseInt(cards.groupIndex / 2) * 50 + 50));
        }
        setCards(prev => ({
            ...prev,
            cards: [
                ...prev.cards.slice(0, cardIndex),
                { ...prev.cards[cardIndex], houses: prev.cards[cardIndex].houses - 1 },
                ...prev.cards.slice(cardIndex + 1),
            ]
        }));
    }

    function handleIncrement(cardIndex) {
        if (cards.cards[cardIndex].houses >= cards.cards[cardIndex].init) {
            setTotal(prev => prev + (parseInt(cards.groupIndex / 2) * 50 + 50));
        } else {
            setTotal(prev => prev + (parseInt(cards.groupIndex / 2) * 50 + 50) * 0.5);
        }
        setCards(prev => ({
            ...prev,
            cards: [
                ...prev.cards.slice(0, cardIndex),
                { ...prev.cards[cardIndex], houses: prev.cards[cardIndex].houses + 1 },
                ...prev.cards.slice(cardIndex + 1),
            ]
        }));
    }

    function nextColorGroup() {
        let cardsNow = props.game.nextColorGroup(cards.groupIndex, [cards.cards, cards.groupIndex], false);
        setTotal(0);
        setCards(prev => ({
            groupIndex: cardsNow[1],
            cards: cardsNow[0]
        }));
    }

    function previousColorGroup() {
        let cardsNow = props.game.nextColorGroup(cards.groupIndex, [cards.cards, cards.groupIndex], true);
        setTotal(0);
        setCards(prev => ({
            groupIndex: cardsNow[1],
            cards: cardsNow[0]
        }));
    }

    function buyHouses() {
        if (props.game.buildGroupHouse(props.game.myPlayer, total, cards.cards)) {
            setCards(prev => ({
                ...prev,
                cards: prev.cards.map((C) => ({
                    ...C,
                    init: C.houses
                }))
            }));
            setTotal(0);
        }
    }

    React.useEffect(() => {
        setCards({
            groupIndex: props.default[1],
            cards: props.default[0]
        })
    }, []);

    return <div className="window buildings-window">
        <div style={{ display: "flex", columnGap: 32 }}>
            {cards.cards.map((E, I) =>
                <div className="building">
                    <div className="building-paginator">
                        <button className="decr" disabled={E.houses == 0} onClick={() => handleDecrement(I)}>-1</button>
                        <div className="value">{E.houses}</div>
                        <button className="incr" disabled={E.houses == 5} onClick={() => handleIncrement(I)}>+1</button>
                    </div>
                    <div style={{ display: "flex", columnGap: 16, minHeight: 16 }}>
                        {
                            E.houses == 5
                                ? <div className="hotel" />
                                : Array(E.houses).fill(0).map((H) => <div className="house" />)
                        }
                        {
                            E.houses == 0 && <div style={{ width: 35, height: 35 }}></div>
                        }
                    </div>
                    <div style={{ zoom: "0.7" }}>
                        <CardInformation card={props.cardsInfo[E.id]} />
                    </div>
                </div>
            )}
        </div>
        <div style={{ borderBlock: "2px solid gray", paddingBlock: 16, display: "flex", justifyContent: "space-between" }}>
            <span>
                Цена дома - <b>{parseInt(cards.groupIndex / 2) * 50 + 50} $</b>
            </span>
            <span>
                Итоговая сумма: <b>{total} $</b>
            </span>
        </div>
        <div className="actions">
            <button className="option-button default" onClick={() => previousColorGroup()}>Предыдущая</button>
            <span>
                <button className="option-button default" style={{ marginRight: 16 }} disabled={total == 0}>Отмена</button>
                <button className="option-button primary" onClick={() => buyHouses()}>Купить</button>
            </span>
            <button className="option-button default" onClick={() => nextColorGroup()}>Следующая</button>
        </div>
    </div>
}