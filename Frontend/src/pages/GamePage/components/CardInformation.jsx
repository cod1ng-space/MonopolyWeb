import "./styles.scss";

export default function CardInformation(props) {
    return (
        <div className="card_preview">
            {props.card != null && <div className="card_color" style={{ height: props.card.typeCard != 0 ? 0 : undefined, border: props.card.typeCard != 0 ? "none" : undefined, backgroundColor: props.card.color }} />}
            {props.card != null && props.card.typeCard == 0 && <div className="card_city">
                <div className="card_name">
                    {props.card.name}
                </div>
                <hr className="card_seperator" />
                <div className="card_costs">
                    <div className="card_rent">
                        <div className="card_rent_name">Рента</div>
                        <div className="card_rent_cost">{props.card.rent[0]}$</div>
                    </div>
                    <div className="card_rent">
                        <div className="card_rent_name">При полном комплекте этой цветойвой группы</div>
                        <div className="card_rent_cost">{props.card.rent[0] * 2}$</div>
                    </div>
                    <div className="card_rent">
                        <div className="card_rent_name">C 1 домом</div>
                        <div className="card_rent_cost">{props.card.rent[1]}$</div>
                    </div>
                    <div className="card_rent">
                        <div className="card_rent_name">C 2 домами</div>
                        <div className="card_rent_cost">{props.card.rent[2]}$</div>
                    </div>
                    <div className="card_rent">
                        <div className="card_rent_name">C 3 домами</div>
                        <div className="card_rent_cost">{props.card.rent[3]}$</div>
                    </div>
                    <div className="card_rent">
                        <div className="card_rent_name">C 4 домами</div>
                        <div className="card_rent_cost">{props.card.rent[4]}$</div>
                    </div>
                    <div className="card_rent">
                        <div className="card_rent_name">C отелем</div>
                        <div className="card_rent_cost">{props.card.rent[5]}$</div>
                    </div>
                </div>
                <hr className="card_seperator" />
                <div className="card_property">
                    <div>Цена одного дома</div>
                    <div className="card_property_cost">{props.card.houseCost}$</div>
                </div>
                <div className="card_property">
                    <div>Цена отеля</div>
                    <div className="card_property_cost">{props.card.hotelCost}$</div>
                </div>
                <hr className="card_seperator" />
                <div className="card_bottom">
                    <div>Цена залога - {props.card.depositCost}$</div>
                    <div>Цена выкупа - {props.card.redemptionCost}$</div>
                </div>
            </div>}
            {props.card != null && props.card.typeCard == 1 && <div className="card_body">
                <img src="src/assets/resources/image2.webp" style={{ height: "260px", objectFit: "contain" }}></img>
                <div className="card_name">
                    {props.card.name}
                </div>
                <div className="card_costs">
                    <div className="card_rent">
                        <div className="card_rent_name">Рента</div>
                        <div className="card_rent_cost">50$</div>
                    </div>
                    <div className="card_rent">
                        <div className="card_rent_name">C 2 станциями</div>
                        <div className="card_rent_cost">100$</div>
                    </div>
                    <div className="card_rent">
                        <div className="card_rent_name">C 3 станциями</div>
                        <div className="card_rent_cost">150$</div>
                    </div>
                    <div className="card_rent">
                        <div className="card_rent_name">C 4 станциями</div>
                        <div className="card_rent_cost">200$</div>
                    </div>
                    <hr className="card_seperator" />
                    <div className="card_bottom">
                        <div>Цена залога - 100$</div>
                        <div>Цена выкупа - 120$</div>
                    </div>
                </div>
            </div>
            }
            {props.card != null && props.card.typeCard == 2 && <div className="card_body" style={{ display: "flex" }}>
                <img src="src/assets/resources/image3.jpg" style={{ height: "250px", flex: "1 1 auto", objectFit: "contain" }}></img>
                <div style={{ flex: "0 1 auto" }}>
                    <div className="card_name">
                        {props.card.name}
                    </div>
                    <hr className="card_seperator" />
                    <div style={{ marginBlock: 5 }}>Если игрок владеет одним видом коммунального предприятия, Рента равна сумме выпавших очков, умноженных на 4.</div>
                    <div>Если игрок владеет обоими видами коммунальных предприятий, Рента равна сумме выпавших очков, умноженных на 10</div>
                </div>
            </div>
            }
            {props.card != null && props.card.typeCard == 3 && <div className="card_body">
                <div className="card_name">
                    {props.card.name}
                </div>
                <img src="src/assets/resources/image4.jpg" style={{ height: "330px" }}></img>
            </div>}
            {props.card != null && props.card.typeCard == 4 && <div className="card_body">
                <div className="card_name">
                    {props.card.name}
                </div>
                <img src="src/assets/resources/image5.png" style={{ height: "300px" }}></img>
            </div>}
            {props.card != null && (props.card.typeCard == 7 || props.card.typeCard == 8) && <div className="card_body">
                <div className="card_name">
                    {props.card.name}
                </div>
                <hr className="card_seperator" />
                <div className="card_bottom">
                    {props.card.typeCard == 7 &&
                        <div>Заплатите 200$</div>
                    }
                    {props.card.typeCard == 8 &&
                        <div>Заплатите 100$</div>
                    }
                </div>
            </div>}
        </div>
    )
}