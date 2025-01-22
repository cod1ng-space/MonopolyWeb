import { useState } from 'react';
import './styles.css';
import sha256 from 'sha256';
import { log, pass } from 'three/webgpu';
import { Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

function LoginPage() {
    const navigate = useNavigate();
    const [dataLogin, setDataLogin] = useState({logo: "Войти в аккаунт", typeCard: "log", buttonLoginText: "Войти", buttonSwitchText: "Нет аккаунта?"})

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [messageToUser, setMessageToUser] = useState("");

    function switchTypeCard() {
        if (dataLogin.typeCard == "log") {
            setDataLogin({logo: "Регистрация", typeCard: "reg", buttonLoginText: "Зарегистрироваться", buttonSwitchText: "Есть аккаунт?"})
        }
        else {
            setDataLogin({logo: "Войти в аккаунт", typeCard: "log", buttonLoginText: "Войти", buttonSwitchText: "Нет аккаунта?"})
        }
    }

    function handleChangeLogin(event) {
        setLogin(event.target.value);
    }

    function handleChangePassword(event) {
        setPassword(event.target.value)
    }

    function handleChangeRepeatPassword(event) {
        setRepeatPassword(event.target.value)
    }

    function successAuth(token) {
        Cookies.set("token", token);
        Cookies.set("login", login)
        navigate("/", { state: {login: login } })
    }

    function tryAuth() { // sha256(password)
        setMessageToUser("")
        const formdata = new FormData();
        formdata.append("username", login);
        formdata.append("password", password);
        const requestOptions = {
            method: "POST",
            body: formdata,
        };
        if (dataLogin.typeCard == "reg") {
            if (password !== repeatPassword) {
                setMessageToUser("Пароли не совпадают!");
                return;
            }
            else if (password.length < 5) {
                setMessageToUser("Пароль должен содержать как минимум 5 символов!");
                return;
            }
            else if (login.length < 5){
                setMessageToUser("Логин должен содержать как минимум 5 символов!");
                return;
            }
            else if (!isNaN(login)){
                setMessageToUser("Логин не может состоять только из цифр!");
                return;
            }

            fetchRegister(requestOptions)
        } else {

            fetchLogin(requestOptions)
        }



    }

    function fetchRegister(requestOptions) {
        fetch("http://localhost:8080/register", requestOptions)
            .then(async (response) => {
                if (response.ok) {
                    fetchLogin(requestOptions);
                }
                else {
                    const errorData = await response.json().catch(() => ({ message: "Ошибка сервера" })); // Обработка ошибок парсинга
                    setMessageToUser(errorData.message);
                }
            })
            .catch((error) => {
                console.error("Ошибка fetch:", error); // Выводим реальную ошибку fetch
                setMessageToUser("Ошибка соединения с сервером!");
            });
    }

    function fetchLogin(requestOptions) {
        fetch("http://localhost:8080/login", requestOptions)
            .then(async (response) => {
                if (response.ok) {
                    successAuth((await response.json()).token);
                }
                else {
                    const errorData = await response.json().catch(() => ({ message: "Ошибка сервера" })); // Обработка ошибок парсинга
                    setMessageToUser(errorData.message);
                }
            })
            .catch((error) => {
                console.error("Ошибка fetch:", error); // Выводим реальную ошибку fetch
                setMessageToUser("Ошибка соединения с сервером!");
            });
    }

    return (
        <div className="container">
            <div className="card">
                <div className="type_card">{dataLogin.logo}</div>
                <div className="login">
                    <div className="text">Имя пользователя</div>
                    <input className="input_login" value={login} onChange={handleChangeLogin} />
                </div>
                <div className="password">
                    <div className="text">Пароль</div>
                    <input type={dataLogin.typeCard == "reg" ? "" : "password"} className="input_password" value={password} onChange={handleChangePassword} />
                    {dataLogin.typeCard == "reg" && <>
                        <div className="text">Повторите пароль</div>
                        <input className="input_repeat_password" value={repeatPassword} onChange={handleChangeRepeatPassword}></input>
                    </>}
                    {messageToUser != "" && <div className='message_to_user'>{messageToUser}</div>}
                </div>
                <button className="button_login" onClick={tryAuth}>{dataLogin.buttonLoginText}</button>
                <button className="button_switch" onClick={switchTypeCard}>{dataLogin.buttonSwitchText}</button>
            </div>
        </div>
    )
}

export default LoginPage;