package api

import (
	"fmt"
	"monopoly-server/pkg/consts"

	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Server struct {
	maxSize int

	server  *echo.Echo
	address string

	uc Usecase
}

func NewServer(ip string, port int, maxSize int, uc Usecase) *Server {
	api := Server{
		maxSize: maxSize,
		uc:      uc,
	}

	api.server = echo.New()
	api.server.Use(middleware.CORS())

	api.server.POST("/login", api.PostLogin)
	api.server.POST("/register", api.PostRegister)

	api.address = fmt.Sprintf("%s:%d", ip, port)
	r := api.server.Group("")

	config := echojwt.Config{
		SigningKey: []byte(consts.SecretKey),
	}

	r.Use(echojwt.WithConfig(config))
	r.GET("/profile", api.GetProfile)
	r.GET("/access/:id", api.GetAccessToGameId)
	r.GET("/game/updates/new", api.GetNewGameUpdates)
	r.GET("/waiting-room/:id", api.GetWaitingRoomInfo)
	r.GET("/find-game", api.GetJoinGame)
	r.PATCH("/game/create", api.PatchStartGame)
	r.POST("/game/create", api.PostCreateGame)
	r.POST("/game/updates/send", api.PostUpdatesForGame)
	r.DELETE("/game/:id", api.DeleteGame)
	r.DELETE("game/:id/players/:username", api.DeletePlayer)

	return &api
}

func (api *Server) Run() {
	api.server.Logger.Fatal(api.server.Start(api.address))
}
