package api

import (
	"fmt"
	"math/rand/v2"
	"monopoly-server/pkg/consts"
	"monopoly-server/pkg/vars"
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func (srv *Server) DeletePlayer(c echo.Context) error {
	gameId := c.Param("id")
	user := c.Param("username")

	err := srv.uc.DeletePlayerFromGame(gameId, user)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}

	return c.NoContent(http.StatusOK)
}

func (srv *Server) DeleteGame(c echo.Context) error {
	gameId := c.Param("id")

	err := srv.uc.DeleteGame(gameId)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}

	return c.NoContent(http.StatusOK)
}

func (srv *Server) PatchStartGame(c echo.Context) error {
	input := struct {
		GameId string `json:"game_id"`
	}{}
	err := c.Bind(&input)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}

	err = srv.uc.StartGame(input.GameId)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}
	return c.NoContent(http.StatusOK)
}

func (srv *Server) GetJoinGame(c echo.Context) error {
	gameId := c.QueryParam("game_id")
	claims, ok := srv.uc.JWTPayloadFromRequest(c)
	if !ok {
		return echo.ErrUnauthorized
	}
	name := claims["sub"].(string)

	err := srv.uc.AddPlayerToGame(gameId, name)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}
	return c.NoContent(http.StatusOK)
}

func (srv *Server) PostUpdatesForGame(c echo.Context) error {
	input := struct {
		GameId  *string `json:"game_id"`
		Verison *int    `json:"version"`
		Data    *string `json:"data"`
	}{}
	err := c.Bind(&input)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}
	if input.GameId == nil || input.Verison == nil || input.Data == nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": vars.ErrMissingField.Error(),
		})
	}

	err = srv.uc.SetUpdatesForGame(*input.Verison, *input.GameId, *input.Data)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}

	return nil
}

func (srv *Server) GetNewGameUpdates(c echo.Context) error {
	gameID := c.QueryParam("game_id")
	user := c.QueryParam("user")
	version, err := strconv.Atoi(c.QueryParam("version"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}

	latestVersion, data, err := srv.uc.GetUpdatesForGame(gameID, user, version)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"now_version": latestVersion,
		"updates":     data,
	})
}

func (srv *Server) GetWaitingRoomInfo(c echo.Context) error {
	gameId := c.Param("id")

	players, status, err := srv.uc.FetchWaitingRoomInfo(gameId)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"status":  status,
		"players": players,
	})
}

func (srv *Server) GetAccessToGameId(c echo.Context) error {
	gameId := c.Param("id")

	claims, ok := srv.uc.JWTPayloadFromRequest(c)
	if !ok {
		return echo.ErrUnauthorized
	}

	ok, err := srv.uc.CheckAccessUserToGame(claims["sub"].(string), gameId)
	if err != nil {
		return c.JSON(http.StatusNotAcceptable, echo.Map{
			"message": err.Error(),
		})
	}
	if !ok {
		return c.NoContent(http.StatusNotAcceptable)
	}
	return c.NoContent(http.StatusOK)
}

func (srv *Server) PostCreateGame(c echo.Context) error {

	var gameId string
	gameId = fmt.Sprintf("%d", rand.IntN(900000)+100000)

	claims, ok := srv.uc.JWTPayloadFromRequest(c)
	if !ok {
		return echo.ErrUnauthorized
	}

	err := srv.uc.CreateGame(gameId, claims["sub"].(string))
	for err == vars.ErrGameAlreadyExist {
		gameId = fmt.Sprintf("%d", rand.IntN(900000)+100000)
		err = srv.uc.CreateGame(gameId, claims["sub"].(string))
	}

	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": err.Error(),
		})
	}

	err = srv.uc.AddPlayerToGame(gameId, claims["sub"].(string))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"gameId": gameId,
	})
}

func (srv *Server) PostLogin(c echo.Context) error {
	username := c.FormValue("username")
	password := c.FormValue("password")

	if len(username) > 20 || len(password) > 255 {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": vars.ErrDataLimitExceeded.Error(),
		})
	}

	// Если данные неверные, отправляем пользователя подумать
	err := srv.uc.Login(username, password)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}

	// Полезная нагрузка
	claims := jwt.MapClaims{
		"sub": username,
		"exp": time.Now().Add(time.Hour * 72).Unix(),
	}

	// Создание токена с полезной нагрузкой
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Окончательная генерация токена с подписью
	t, err := token.SignedString([]byte(consts.SecretKey))
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"token": t,
	})
}

func (srv *Server) PostRegister(c echo.Context) error {
	c.Response().Header().Set("Access-Control-Allow-Origin", "*") // Люблю политику CORS :))
	username := c.FormValue("username")
	password := c.FormValue("password")

	if len(username) > 20 || len(password) > 255 {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": vars.ErrDataLimitExceeded.Error(),
		})
	}

	err := srv.uc.Register(username, password)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": err.Error(),
		})
	}

	return c.NoContent(http.StatusCreated)
}

func (srv *Server) GetProfile(c echo.Context) error {
	c.Response().Header().Set("Access-Control-Allow-Origin", "*") // Люблю политику CORS :))s
	claims, ok := srv.uc.JWTPayloadFromRequest(c)
	if !ok {
		return echo.ErrUnauthorized
	}
	name := claims["sub"].(string)
	return c.String(http.StatusOK, "Welcome "+name+"!")
}
