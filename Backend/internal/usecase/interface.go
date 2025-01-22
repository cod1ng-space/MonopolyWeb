package usecase

type Provider interface {
	CheckLoginExit(string) (bool, error)
	InsertUserData(string, string) error
	CheckUserData(string, string) (bool, error)
	InsertGameData(string, string, string, int) error
	GetIndexToAddPlayer(gameId string) (int, error)
	InsertPlayerData(login, gameId string, index int) error
	UpdatePlayerCountInGame(gameId string) error
	InsertUpdateGameData(version int, gameId, data string) error
	SelectNewUpdatesGameData(version int, gameId string) (int, []string, error)
	CheckAccessToGame(user, gameId string) (bool, error)
	SelectPlayersOfGame(gameId string) (players []string, err error)
	SelectStatusOfGame(gameId string) (status string, err error)
	CheckGameExist(gameId string) error
	UpdateGameStatus(gameId string) error
	DeleteGameCascade(gameId string) error
	DeletePlayerFromGame(gameId, login string) error
}
