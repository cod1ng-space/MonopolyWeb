package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type CardInfo struct {
	TypeCard       int    `json:"typeCard"`
	StartCost      int    `json:"startCost,omitempty"`
	HouseCost      int    `json:"houseCost,omitempty"`
	HotelCost      int    `json:"hotelCost,omitempty"`
	DepositCost    int    `json:"depositCost,omitempty"`
	RedemptionCost int    `json:"redemptionCost,omitempty"`
	Rent           []int  `json:"rent,omitempty"`
	Color          string `json:"color,omitempty"`
	Name           string `json:"name"`
}

type CardInfoForGeneration struct {
	typeCard int // 0 - улица, 1 - железные дороги,
	// 2 - коммунальные услуги, 3 - шанс, 4 - общественная казна, 5 - начало, тюрьма, стоянка,
	// 6 - отправляйтесь в тюрьму, 7 - подоходный налог, 8 сверхналог
	name      string
	startCost int
}

type dataJSON struct {
	CardInfo []CardInfo `json:"cardInfo"`
}

func getHouseCost(index int) int {
	if index < 10 {
		return 50
	} else if index < 20 {
		return 100
	} else if index < 30 {
		return 150
	} else {
		return 200
	}
}

func getColorCard(index int) string {
	switch index {
	case 1, 3:
		return "#6c3c0c"
	case 6, 8, 9:
		return "lightblue"
	case 11, 13, 14:
		return "#f94279"
	case 16, 18, 19:
		return "orange"
	case 21, 23, 24:
		return "red"
	case 26, 27, 29:
		return "yellow"
	case 31, 32, 34:
		return "green"
	case 37, 39:
		return "blue"
	default:
		fmt.Errorf("%s", "Error in getColorCard!")
		return "not found"
	}
}

/* Цвета
"W": "#6c3c0c",
"L": "lightblue",
"P": "#f94279",
"O": "orange",
"R": "red",
"Y": "yellow",
"G": "green",
"B": "blue",
*/

func main() {
	const mulOneHouse, mulTwoHouse, mulThreeHouse, mulFourHouse, mulHotel int = 5, 15, 40, 50, 60
	cardInfoForGeneration := [...]CardInfoForGeneration{
		// Города
		{5, "Начало", 0},
		{0, "Москва", 60},
		{4, "Общественная казна", 0},
		{0, "Санкт-Петербург", 60},
		{7, "Подоходный налог", 0},
		{1, "Транссиб магистраль", 200},
		{0, "Новосибирск", 100},
		{3, "Шанс", 0},
		{0, "Екатеринбург", 100},
		{0, "Челябинск", 120},

		{5, "Тюрьма", 0},
		{0, "Красноярск", 140},
		{2, "Энергосбыт", 150},
		{0, "Нижний Новгород", 140},
		{0, "Казань", 160},
		{1, "Московская Ж/Д", 200},
		{0, "Самара", 180},
		{4, "Общественная казна", 0},
		{0, "Омск", 180},
		{0, "Ростов-на-Дону", 200},

		{5, "Стоянка", 0},
		{0, "Краснодар", 220},
		{3, "Шанс", 0},
		{0, "Волгоград", 220},
		{0, "Пермь", 240},
		{1, "Северо-Кавказская Ж/Д", 200},
		{0, "Воронеж", 260},
		{0, "Уфа", 260},
		{2, "Водоканал", 150},
		{0, "Ярославль", 280},

		{6, "Отправляйтесь в тюрьму", 0},
		{0, "Саратов", 300},
		{0, "Тюмень", 300},
		{4, "Общественная казна", 0},
		{0, "Ижевск", 320},
		{1, "Западно-Сибирская Ж/Д", 200},
		{3, "Шанс", 0},
		{0, "Барнаул", 350},
		{8, "Сверхналог", 0},
		{0, "Владивосток", 400},
	}
	arrayCardInfo := make([]CardInfo, 40)
	for index, value := range cardInfoForGeneration {
		card := &arrayCardInfo[index]
		card.TypeCard = value.typeCard
		card.Name = value.name
		if value.typeCard == 0 {
			card.StartCost = value.startCost
			card.HouseCost = getHouseCost(index)
			card.HotelCost = getHouseCost(index)
			card.DepositCost = card.StartCost / 2
			card.RedemptionCost = card.DepositCost + card.StartCost/10
			var startRent int = (card.StartCost + 11) / 12
			card.Rent = []int{startRent, startRent * mulOneHouse, startRent * mulTwoHouse, startRent * mulThreeHouse, startRent * mulFourHouse, startRent * mulHotel}
			card.Color = getColorCard(index)
		}
		if value.typeCard == 1 {
			card.StartCost = value.startCost
		}
		if value.typeCard == 2 {
			card.StartCost = value.startCost
		}
	}
	data := &dataJSON{arrayCardInfo}
	file, err := os.Create("assets/card_info_generator/cards.json")
	defer file.Close()
	if err != nil {
		fmt.Println("Unable to open file:", err)
		os.Exit(1)
	}
	datajson, err := json.Marshal(data)
	if err != nil {
		fmt.Println("Unable to code file:", err)
		os.Exit(1)
	}
	file.Write(datajson)
	fmt.Println("Ok")
}
