ch = 150                # Длина карточки
cw = int(ch * 0.6)      # Ширина карточки
border = 2              # Отступ карты
mw = 2 * ch + 9 * cw    # Длина карты
cnw = int(ch * 0.25)    # Отступ для цвета карточки
cno = int(cnw / 3)      # Отступ для надписей в карточки

bg = "rgb(201, 220, 201)"
cbg = "#fefefe"

result_line = []

result_line += [
    (border, border, border + mw, border),
    (border + mw, border, border + mw, border + mw),
    (border + mw, border + mw, border, border + mw),
    (border, border + mw, border, border),
    (border, border, border + 5, border),
    (border, border + ch, border + mw, border + ch),
    (border, border + mw - ch, border + mw, border + mw - ch),
    (border + ch, border, border + ch, border + mw),
    (border + mw - ch, border, border + mw - ch, border + mw),
]

# Верхняя сторона

for i in range(4):
    result_line += [
        (
            border + ch + cw * (1 + i * 2), border, 
            border + ch + cw * (1 + i * 2), border + ch
        ),
        (
            border + ch + cw * (2 + i * 2), border + ch, 
            border + ch + cw * (2 + i * 2), border
        ),
    ]

# Правая сторона

for i in range(4):
    result_line += [
        (
            border + mw - ch, border + ch + cw * (1 + 2 * i), 
            border + mw, border + ch + cw * (1 + 2 * i),
        ),
        (
            border + mw, border + ch + cw * (2 + 2 * i),
            border + mw - ch, border + ch + cw * (2 + 2 * i),
        ),
    ]

# Нижняя сторона

for i in range(4):
    result_line += [
        (
            border + mw - ch - cw * (1 + i * 2), border + mw - ch, 
            border + mw - ch - cw * (1 + i * 2), border + mw,
        ),
        (
            border + mw - ch - cw * (2 + i * 2), border + mw,
            border + mw - ch - cw * (2 + i * 2), border + mw - ch, 
        ),
    ]

# Левая сторона

for i in range(4):
    result_line += [
        (
            border + ch, border + mw - ch - cw * (1 + 2 * i), 
            border, border + mw - ch - cw * (1 + 2 * i), 
        ),
        (
            border, border + mw - ch - cw * (2 + 2 * i), 
            border + ch, border + mw - ch - cw * (2 + 2 * i), 
        ),
    ]

result_rects = [
    #(border, border, border + mw, border + mw, cbg),
    #(border + ch, border + ch, border + mw - ch, border + mw - ch, bg)
]
result_texts = []

cards = [
    ("Москва", 60, "W", ""),
    ("Общественная\nказна", 0, "", ""),
    ("Санкт-\nПетербург", 60, "W", ""),
    ("Подоходный\nналог", 200, "", ""),
    ("Транссиб\nмагистраль", 200, "", ""),
    ("Новосибирск\n", 100, "L", ""),
    ("Шанс", 0, "", ""),
    ("Екатеринбург", 100, "L", ""),
    ("Челябинск", 120, "L", ""),
    ("", 0, "", ""),

    ("Красноярск", 140, "P", ""),
    ("Энергосбыт", 150, "", ""),
    ("Нижний\nНовгород", 140, "P", ""),
    ("Казань\n", 160, "P", ""),
    ("Московская\nЖ/Д", 200, "", ""),
    ("Самара", 180, "O", ""),
    ("Общественная\nказна", 0, "", ""),
    ("Омск", 180, "O", ""),
    ("Ростов-на-Дону", 200, "O", ""),
    ("", 0, "", ""),

    ("Краснодар", 220, "R", ""),
    ("Шанс", 0, "", ""),
    ("Волгоград", 220, "R", ""),
    ("Пермь", 240, "R", ""),
    ("Cеверо-\nКавказская Ж/Д", 200, "", ""),
    ("Воронеж", 260, "Y", ""),
    ("Уфа", 260, "Y", ""),
    ("Водоканал", 150, "", ""),
    ("Ярославль", 280, "Y", ""),
    ("", 0, "", ""),

    ("Саратов", 300, "G", ""),
    ("Тюмень", 300, "G", ""),
    ("Общественная\nказна", 0, "", ""),
    ("Ижевск", 320, "G", ""),
    ("Западно-\nСибирская Ж/Д", 200, "", ""),
    ("Шанс", 0, "", ""),
    ("Барнаул", 350, "B", ""),
    ("Сверхналог", 100, "", ""),
    ("Владивосток", 400, "B", ""),
    ("", 0, "", ""),
]

sides   = "X X  X XXRX XX X XXRX XX XX XRXX X  X XR"
colors  = "W W  L LL P PP O OO R RR YY Y GG G  B B "

colorsMap = {
    "W": "#6c3c0c",
    "L": "lightblue",
    "P": "#f94279",
    "O": "orange",
    "R": "red",
    "Y": "yellow",
    "G": "green",
    "B": "blue",
}

direction = [-1, 0]
direction_a = 0
now = [border + mw - ch, border + mw - ch + cnw]
countX = 0
nowC = ""

for i in range(len(cards)):

    ps_direction = [-direction[1], direction[0]]

    if cards[i][0] != "":
        result_texts += [
            (
                "start", cards[i][0], direction_a,
                now[0] + direction[0] * (cw // 2 + cw * countX) - ps_direction[0] * (cno - (0 if cards[i][2] != "" else cnw)),
                now[1] + direction[1] * (cw // 2 + cw * countX) - ps_direction[1] * (cno - (0 if cards[i][2] != "" else cnw)),
            )
        ]

    if cards[i][1] != 0:
        result_texts += [
            (
                "end", f"{cards[i][1]}", direction_a,
                now[0] + direction[0] * (cw // 2 + cw * countX) - ps_direction[0] * (ch - cnw - cno),
                now[1] + direction[1] * (cw // 2 + cw * countX) - ps_direction[1] * (ch - cnw - cno),
            )
        ]  

    e = "X" if cards[i][2] != "" else ("R" if cards[i][0] == "" else " ")
    c = cards[i][2]
    if e == "X":
        countX += 1
        nowC = c
    else:
        if countX != 0:

            result_rects += [
                (
                    now[0], now[1],
                    now[0] + direction[0] * cw * countX + ps_direction[0] * cnw,
                    now[1] + direction[1] * cw * countX + ps_direction[1] * cnw,
                    colorsMap[nowC]
                )
            ]

            result_line += [
                (now[0], now[1], now[0] + direction[0] * cw * countX, now[1] + direction[1] * cw * countX)
            ]

        now[0] += direction[0] * (cw * countX + (cw if e == " " else cnw))
        now[1] += direction[1] * (cw * countX + (cw if e == " " else cnw))

        if e == "R":
            direction = [-direction[1], direction[0]]
            direction_a += 90
            now[0] += direction[0] * cnw
            now[1] += direction[1] * cnw
        
        countX = 0

result_size = 2 * border + mw