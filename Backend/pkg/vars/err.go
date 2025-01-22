package vars

import "errors"

var (
	//ErrAlreadyExist     = errors.New("already exist")
	ErrDBNotInitialized  = errors.New("База данных неинициализирована!")
	ErrUserNotExist      = errors.New("Пользователя не существует!")
	ErrWrongUserData     = errors.New("Неверный логин или пароль!")
	ErrUserAlreadyExist  = errors.New("Пользватель уже существует!")
	ErrDataLimitExceeded = errors.New("Превышен максимальный размер данных!")
	ErrMissingField      = errors.New("Missing at least one field in request!")
	ErrGameNotFound      = errors.New("Игра не найдена!")
	ErrNotEnoughPlace    = errors.New("Недостаточно места в комнате")
	ErrGameIsActive      = errors.New("Игра уже началась!")
	ErrUserAlredyInGame  = errors.New("Пользователь уже в игре!")
	ErrGameAlreadyExist  = errors.New("Игра уже существует!")
	ErrPlayerNotFound    = errors.New("Игрок с таким логином и игрой не найден!")
)
