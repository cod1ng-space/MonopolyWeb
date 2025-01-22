import React, { useState } from 'react';
import './styles.scss';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";


function FindGamePage() {
    const navigate = useNavigate();
    const [messageToUser, setMessageToUser] = useState("")
    const [gameId, setGameId] = useState("")

    React.useEffect(checkAuthorization, [])

    function checkAuthorization() {
        if (Cookies.get("login") == undefined) {
            navigate("/");
        }
    }

    function handleClickFind() {
        setMessageToUser("")
        if (isNaN(gameId)) {
            setMessageToUser("Номер игры должен содержать только цифры!");
            return;
        }
        else if (gameId.length != 6) {
            setMessageToUser("Номер игры должен состоять из 6 цифр!");
            return;
        }
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${Cookies.get("token")}`);

        const requestOptions = {
            method: "GET",
            headers: myHeaders
        };

        fetch(`http://localhost:8080/find-game?game_id=${gameId}`, requestOptions)
            .then(async (response) => {
                if (response.ok){
                    navigate(`/waiting-room/${gameId}`)
                }
                else{
                    setMessageToUser((await response.json()).message);
                }
            })
            .catch((error) => console.error(error));
    }


    function handleChangeGameId(event) {
        setGameId(event.target.value);
    }

    return (
        <div className='find-game-page'>
            <div className="container">
                <div className="card">
                    <div style={{ fontSize: 24, fontWeight: 600, textAlign: 'center' }}>Найти игру</div>
                    <div className='box'>
                        <div className="text">Номер игры</div>
                        <input className="input_game_id" value={gameId} onChange={handleChangeGameId} />
                    </div>
                    {messageToUser != "" && <div className='message_to_user'>{messageToUser}</div>}
                    <button className='button_find' onClick={handleClickFind}>Начать игру</button>
                </div>
            </div>
        </div>
    )
}

export default FindGamePage;