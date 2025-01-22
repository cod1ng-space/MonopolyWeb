import CardInformation from "./CardInformation";

export default function BuyWindow(props) {
    return (
        <div className="window buy-window">
            <CardInformation card={props.card} />
            <div className="buy-question">
                <div className="question">
                    <div className="message">
                        <p>
                            Хотите ли вы купить данную карточку?
                        </p>
                        <p>
                            Цена составит <b>{props.card.startCost ?? 200} М</b>
                        </p>
                    </div>
                </div>
                <div className="actions">
                    <button className="option-button default" onClick={() => props.onAction(false)}>Отмена</button>
                    <button className="option-button primary" onClick={() => props.onAction(true)}>Купить</button>
                </div>
            </div>
        </div>
    )
}