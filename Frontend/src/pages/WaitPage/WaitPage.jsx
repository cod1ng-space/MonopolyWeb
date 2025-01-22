import React, { useState } from 'react';
import './styles.scss';
import sha256 from 'sha256';
import { pass } from 'three/webgpu';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';
import Cookies from "js-cookie";

export function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function WaitPage() {
    const params = useParams();
    const navigate = useNavigate();
    const [messageToUser, setMessageToUser] = useState("")
    const [waitingData, setWaitingData] = useState({ players: [] });
    React.useEffect(checkAccess, [])

    // Отправка запросов каждые 2 секунды
    const getWaitingData = () => {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${Cookies.get("token")}`);

        const requestOptions = {
            method: "GET",
            headers: myHeaders
        };

        fetch(`http://localhost:8080/waiting-room/${params.id}`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                console.log(result)
                if (result.players == null || result.status == 'ended'){
                    navigate("/")
                }
                setWaitingData({ players: result.players });
                if (result.status == 'begin') {
                    startGame();
                }
            })
            .catch((error) => console.error(error));

    };

    React.useEffect(() => {
        const timer = setInterval(getWaitingData, 2000);
        getWaitingData()
        timer;
        return () => {
            clearInterval(timer);
        };
    }, []);


    function checkAccess() {
        setWaitingData({ login: Cookies.get("login"), players: waitingData.players })

        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${Cookies.get("token")}`);

        const requestOptions = {
            method: "GET",
            headers: myHeaders
        };
        fetch(`http://localhost:8080/access/${params.id}`, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    navigate("/")
                }
            })
            .catch((error) => console.error(error));
    }

    function startGame() {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${Cookies.get("token")}`);

        const raw = JSON.stringify({
            "game_id": params.id
        });

        const requestOptions = {
            method: "PATCH",
            headers: myHeaders,
            body: raw
        };

        fetch("http://localhost:8080/game/create", requestOptions)
            .then((response) => {
                if (response.ok) {
                    navigate(`/game/${params.id}`)
                }
            })
            .catch((error) => console.error(error));
    }

    function leaveGame(){
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${Cookies.get("token")}`);

        const requestOptions = {
            method: "DELETE",
            headers: myHeaders
        };

        fetch(`http://localhost:8080/game/${params.id}/players/${Cookies.get("login")}`, requestOptions)
            .then((response) => {
            })
            .catch((error) => console.error(error));
    }

    function deleteGame(){
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${Cookies.get("token")}`);


        const requestOptions = {
            method: "DELETE",
            headers: myHeaders
        };

        console.log(params.id)
        fetch(`http://localhost:8080/game/${params.id}`, requestOptions)
            .then((response) => {
            })
            .catch((error) => console.error(error));
    }

    function handleClickStart() {
        if (Cookies.get("login") != waitingData.players[0]) {
            setMessageToUser("Только создатель может начать игру!")
            return;
        }
        if (waitingData.players.length <= 1){
            setMessageToUser("Нельзя создать игру с одним игроком!")
            return
        }
        startGame()
    }

    function handleClickLeave(){
        if (Cookies.get("login") == waitingData.players[0]) {
            deleteGame();
            navigate("/")
            return;
        }
        leaveGame();
        navigate("/")
    }

    return (
        <div className='wait-page'>
            <div className="container">
                <div className="card">
                    <div style={{ fontSize: 24, fontWeight: 600, textAlign: 'center' }}>Комната ожидания №{params.id}</div>
                    <div>Игроки:</div>
                    <div className='box'>
                        <div>
                            {waitingData.players?.map((item, index) => (
                                <div key={index} className="player">
                                    <div className={`circle color-${index % 4}`}></div>
                                    {item} {index == 0 && <> - Создатель</>}
                                </div>
                            ))}
                        </div>
                    </div>
                    {messageToUser != "" && <div className='message_to_user'>{messageToUser}</div>}
                    <button className='button_start' onClick={handleClickStart}>Начать игру</button>
                    <button className='button_leave' onClick={handleClickLeave}>Выйти</button>
                </div>
            </div>
        </div>
    )
}

export default WaitPage;