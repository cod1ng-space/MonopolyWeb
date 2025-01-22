import React from "react";
import CardInformation from "./CardInformation";

import "./styles.scss";

export default function CardWindow(props) {

    const [update, setUpdate] = React.useState(0);
    const status = props.game.cardStatus(props.id);

    function makePledge(remove) {
        if (remove) {
            if (props.game.unpledgeCard(props.id)) {
                setUpdate(prev => prev + 1);
            }
        } else {
            if (props.game.pledgeCard(props.id)) {
                setUpdate(prev => prev + 1);
            }
        }
    }

    return (
        <div className="window card_preview_window">
            <div className="card_preview">
                <CardInformation card={props.card} />
            </div>
            {status != 'free' && status != 'house' &&
                <div className="actions">
                    {
                        status != 'pledge'
                            ? <button className="option-button danger" onClick={() => makePledge(false)}>Заложить</button>
                            : <button className="option-button success" onClick={() => makePledge(true)}>Разложить</button>
                    }
                </div>
            }
        </div>
    )
}