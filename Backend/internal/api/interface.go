package api

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type Usecase interface {
	Login(string, string) error
	Register(string, string) error
	JWTPayloadFromRequest(echo.Context) (jwt.MapClaims, bool)
	CreateGame(string, string) error
	StartGame(gameId string) error
	AddPlayerToGame(gameId, login string) error
	GetUpdatesForGame(gameID, user string, version int) (int, []string, error)
	SetUpdatesForGame(version int, gameId, data string) error
	CheckAccessUserToGame(user, gameId string) (bool, error)
	FetchWaitingRoomInfo(gameId string) (players []string, status string, err error)
	DeleteGame(gameId string) error
	DeletePlayerFromGame(gameId, login string) error
}
