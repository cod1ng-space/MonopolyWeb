package usecase

import (
	"database/sql"
	"log"
	"monopoly-server/pkg/consts"
	"monopoly-server/pkg/vars"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func (u *Usecase) DeletePlayerFromGame(gameId, login string) error {
	err := u.p.DeletePlayerFromGame(gameId, login)

	if err != nil {
		return err
	}

	return u.p.UpdatePlayerCountInGame(gameId)
}

func (u *Usecase) DeleteGame(gameId string) error {
	err := u.p.CheckGameExist(gameId)
	if err != nil {
		return err
	}
	return u.p.DeleteGameCascade(gameId)
}

func (u *Usecase) FetchWaitingRoomInfo(gameId string) (players []string, status string, err error) {
	status, err = u.p.SelectStatusOfGame(gameId)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, "ended", nil
		}
		return nil, "", err
	}

	players, err = u.p.SelectPlayersOfGame(gameId)
	return players, status, err
}

func (u *Usecase) CheckAccessUserToGame(user, gameId string) (bool, error) {
	return u.p.CheckAccessToGame(user, gameId)
}

func (u *Usecase) SetUpdatesForGame(version int, gameId, data string) error {

	err := u.p.InsertUpdateGameData(version, gameId, data)
	if err != nil {
		return err
	}
	return nil
}

func (u *Usecase) GetUpdatesForGame(gameID, user string, version int) (int, []string, error) {

	return u.p.SelectNewUpdatesGameData(version, gameID)

}

func (u *Usecase) AddPlayerToGame(gameId, login string) error {
	err := u.p.CheckGameExist(gameId)
	if err != nil {
		return err
	}

	ok, err := u.p.CheckAccessToGame(login, gameId)
	if ok {
		return vars.ErrUserAlredyInGame
	}

	playerIndex, err := u.p.GetIndexToAddPlayer(gameId)
	if err != nil {
		return err
	}

	err = u.p.InsertPlayerData(login, gameId, playerIndex)
	if err != nil {
		return err
	}

	err = u.p.UpdatePlayerCountInGame(gameId)
	if err != nil {
		return err
	}

	return nil
}

func (u *Usecase) StartGame(gameId string) error {
	err := u.p.CheckGameExist(gameId)
	if err != nil {
		return err
	}

	err = u.p.UpdateGameStatus(gameId)
	if err != nil {
		return err
	}
	return nil
}

func (u *Usecase) CreateGame(id, playerCreator string) error {

	// Протестировать
	err := u.p.CheckGameExist(id)
	if err != vars.ErrGameNotFound {
		if err == nil {
			return vars.ErrGameAlreadyExist
		}
		return err
	}
	//

	err = u.p.InsertGameData(id, "created", playerCreator, 0)
	if err != nil {
		return err
	}
	return nil
}

func (u *Usecase) Login(username, password string) error {
	// Проверка на существование логина
	ok, err := u.p.CheckLoginExit(username)
	if err != nil {
		return err
	}
	if !ok {
		return vars.ErrWrongUserData
	}

	// Проверка пароля
	ok, err = u.p.CheckUserData(username, password)
	if err != nil {
		return err
	}
	if !ok {
		return vars.ErrWrongUserData
	}

	return nil
}

func (u *Usecase) Register(username, password string) error {

	// Проверка на существование логина
	ok, err := u.p.CheckLoginExit(username)
	if err != nil {
		return err
	}
	if ok {
		return vars.ErrUserAlreadyExist
	}

	// Запись в базу данных
	err = u.p.InsertUserData(username, password)
	if err != nil {
		return err
	}

	return nil
}

func (u *Usecase) JWTPayloadFromRequest(c echo.Context) (jwt.MapClaims, bool) { // Возвращаем полезную нагрузку токена из запроса
	token, ok := c.Get(consts.ContextKeyUser).(*jwt.Token) // по умолчанию токен хранится под ключом `user`. Этот ключ мы храним в contextKeyUser
	if !ok {
		log.Println("JWT token missing or invalid")
		return nil, false
	}
	claims, ok := token.Claims.(jwt.MapClaims) // по умолчанию тип полезной нагрузки `jwt.MapClaims`
	if !ok {
		log.Println("Failed to cast claims as jwt.MapClaims")
		return nil, false
	}
	return claims, true
}
