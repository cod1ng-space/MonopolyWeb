package provider

import (
	"database/sql"
	"errors"
	"monopoly-server/pkg/consts"
	"monopoly-server/pkg/vars"
)

func (p *Provider) DeletePlayerFromGame(gameId, login string) error {
	res, err := p.conn.Exec("DELETE FROM player WHERE game_id = $1 AND user_id = (SELECT user_id FROM user_data WHERE login = $2)", gameId, login)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return vars.ErrPlayerNotFound
	}

	return nil
}

func (p *Provider) DeleteGameCascade(gameId string) error {

	tx, err := p.conn.Begin()
	if err != nil {
		return err
	}

	_, err = tx.Exec("DELETE FROM update_game WHERE game_id = $1", gameId)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec("DELETE FROM player WHERE game_id = $1", gameId)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec("DELETE FROM game WHERE game_id = $1", gameId)
	if err != nil {
		tx.Rollback()
		return err
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

func (p *Provider) UpdateGameStatus(gameId string) error {
	_, err := p.conn.Exec("UPDATE game SET status = $1 WHERE game_id = $2", consts.GameStatusBegin, gameId)
	if err != nil {
		return err
	}
	return nil
}

func (p *Provider) SelectPlayersOfGame(gameId string) (players []string, err error) {
	players = make([]string, 0)
	rows, err := p.conn.Query("SELECT login FROM player, user_data WHERE player.user_id = user_data.user_id AND player.game_id = $1 ORDER BY(index)", gameId)
	if err != nil {
		if err == sql.ErrNoRows {
			return players, nil
		}
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var (
			str string
		)
		if err := rows.Scan(&str); err != nil {
			return players, err
		}
		players = append(players, str)
	}
	if err = rows.Err(); err != nil {
		return players, err
	}
	return players, nil
}

func (p *Provider) SelectStatusOfGame(gameId string) (status string, err error) {

	err = p.conn.QueryRow("SELECT status FROM game WHERE game_id = $1", gameId).Scan(&status)
	return status, err
}

func (p *Provider) UpdatePlayerCountInGame(gameId string) error {

	_, err := p.conn.Exec("UPDATE game SET player_count = (SELECT COUNT(*) FROM player WHERE game_id = $1)", gameId)

	if err != nil {
		return err
	}

	return nil
}

func (p *Provider) CheckAccessToGame(user, gameId string) (bool, error) {
	var msg string

	err := p.conn.QueryRow("SELECT 1 FROM player, user_data WHERE player.user_id = user_data.user_id AND user_data.login = $1 AND player.game_id = $2", user, gameId).Scan(&msg)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (p *Provider) SelectNewUpdatesGameData(version int, gameId string) (int, []string, error) {
	rows, err := p.conn.Query("SELECT version, update_data FROM update_game WHERE game_id = $1 AND version > $2 ORDER BY version ASC", gameId, version)
	if err != nil {
		return 0, nil, err
	}
	defer rows.Close()

	var (
		updatesData   []string
		latestVersion int = 0
	)

	for rows.Next() {
		var (
			str        string
			versionAdd int
		)
		if err := rows.Scan(&versionAdd, &str); err != nil {
			return latestVersion, updatesData, err
		}
		latestVersion = versionAdd
		updatesData = append(updatesData, str)
	}
	if err = rows.Err(); err != nil {
		return latestVersion, updatesData, err
	}
	return latestVersion, updatesData, nil
}

func (p *Provider) InsertUpdateGameData(version int, gameId, data string) error {
	_, err := p.conn.Exec("INSERT INTO update_game(game_id, version, update_data) VALUES($1, $2, $3)", gameId, version, data)
	if err != nil {
		return err
	}
	return nil
}

func (p *Provider) InsertPlayerData(login, gameId string, index int) error {
	_, err := p.conn.Exec("INSERT INTO player(user_id, game_id, index) VALUES((SELECT user_id FROM user_data WHERE login = $1), $2, $3)", login, gameId, index)
	if err != nil {
		return err
	}
	return nil
}

func (p *Provider) CheckGameExist(gameId string) error {
	var msg int

	err := p.conn.QueryRow("SELECT 1 FROM game WHERE game_id = $1", gameId).Scan(&msg)
	if err != nil {
		if err == sql.ErrNoRows {
			return vars.ErrGameNotFound
		}
		return err
	}
	return nil
}

func (p *Provider) GetIndexToAddPlayer(gameId string) (int, error) {
	var count int

	err := p.conn.QueryRow("SELECT COUNT(*) FROM player WHERE game_id = $1", gameId).Scan(&count)
	if err != nil {
		return 0, err
	}
	if count >= 4 {
		return 0, vars.ErrNotEnoughPlace
	}
	return count, nil
}

func (p *Provider) InsertGameData(id, status, creator string, playerCount int) error {
	_, err := p.conn.Exec("INSERT INTO game(game_id, player_count, status, creator) VALUES($1, $2, $3, $4)", id, playerCount, status, creator)
	if err != nil {
		return err
	}
	return nil
}

func (p *Provider) CheckLoginExit(login string) (bool, error) {
	var msg string
	// Получаем одно сообщение из таблицы login
	err := p.conn.QueryRow("SELECT login FROM user_data WHERE login = $1 LIMIT 1", login).Scan(&msg)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}

	return true, nil
}

func (p *Provider) InsertUserData(username, password string) error {
	_, err := p.conn.Exec("INSERT INTO user_data(login, password) VALUES($1, $2)", username, password)
	if err != nil {
		return err
	}
	return nil
}

func (p *Provider) CheckUserData(username, password string) (bool, error) {
	var msg string

	// Проверяем данные пользователя на корректность
	err := p.conn.QueryRow("SELECT login FROM user_data WHERE login = $1 AND password = $2 LIMIT 1", username, password).Scan(&msg)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}

	return true, nil
}
