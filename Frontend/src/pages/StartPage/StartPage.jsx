import './styles.css';
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { getCookie } from '../WaitPage/WaitPage';
import Cookies from "js-cookie";

function StartPage() {
    const [login, setLogin] = useState(undefined);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Проверяем, существует ли location.state и содержит ли он необходимые свойства
        if (location.state && location.state.login !== undefined) {
            setLogin(location.state.login);
        }
    }, [location.state]); // Зависимость от location.state для перерисовки при изменении

    useEffect(() => {
        setLogin(Cookies.get("login"));
    }, []);

    function handleClickLogin(){
        navigate("/login");
    }

    function handleClickExit(){
        Cookies.remove("login")
        Cookies.remove("token")
        setLogin(undefined);
    }

    function handleClickCreate(){
        if (login === undefined){
            handleClickLogin();
            return;
        }

        const myHeaders = new Headers();
        const token = Cookies.get("token");
        myHeaders.append("Authorization", `Bearer ${token}`);

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
        };

        fetch("http://localhost:8080/game/create", requestOptions)
            .then((response) => response.json())
            .then((result) => {
                navigate(`/waiting-room/${result.gameId}`)
            })
            .catch((error) => console.log(error));
        
        
    }

    function handleClickFind(){
        if (login === undefined){
            handleClickLogin();
            return;
        }
        navigate('/find-game')
    }

    return (
        <div className="page">
            <div className="header">
                <nav className="menu">
                    <a href = "/" className="menu_logo">Монополия онлайн</a>
                    <div className = "panel_login">
                        {login === undefined && <button className = "menu_login" onClick={handleClickLogin}>Войти</button>}
                        {login !== undefined && <>
                            {login}
                            <button className = "menu_exit" onClick={handleClickExit}>Выйти</button>
                        </>}
                    </div>
                </nav>
            </div>
            <div className="body">
                <div className="body_text">
                    <p className="body_invite">Приглашаем в Монополию!</p>
                    <p className="body_good_info">Это отличное место, чтобы поиграть с друзьями в легендарную настольную игру!</p>
                </div>
                <button className="button_create" onClick={handleClickCreate}>Создать игру</button>
                <button className="button_find" onClick={handleClickFind}>Найти игру</button>
                <img className="body_image" src="src/assets/resources/image1.jpg" alt ="image"/>
            </div>
            <div className="footer">
                <p>© 2024 МОНОПОЛИЯ ОНЛАЙН Все Права Защищены.</p>
            </div>
        </div>
    )
}

export default StartPage;