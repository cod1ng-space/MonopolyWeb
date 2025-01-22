from line import result_line, result_rects, result_texts, result_size, bg, cw, ch, border

# Чтение картинок в base64 из файла
def read_first_line(filepath):
    try:
        with open(filepath, 'r') as file:
            first_line = file.readline()
            return first_line.strip()  
    except FileNotFoundError:
        return None 

# Чтение картинок в формате base64
freeparkingBase64 = read_first_line("assets/map_generator/freeparking.txt")
gotojail = read_first_line("assets/map_generator/gotojail.txt")
jailsit = read_first_line("assets/map_generator/jailsit.txt")
start = read_first_line("assets/map_generator/start.txt")
chance = read_first_line("assets/map_generator/chance.txt")
publictreasure = read_first_line("assets/map_generator/publictreasure.txt")
train = read_first_line("assets/map_generator/train.txt")
excesstax = read_first_line("assets/map_generator/excesstax.txt")
income = read_first_line("assets/map_generator/incometax.txt")
kran = read_first_line("assets/map_generator/kran.txt")
electric = read_first_line("assets/map_generator/electric.txt")


K = 5

output = open("output.svg", "w")

print(f'<svg width="{result_size * K}" height="{result_size * K}" viewBox="0 0 {result_size * K} {result_size * K}" style="background-color: {bg}" version="1.1" xmlns="http://www.w3.org/2000/svg">', file=output)

print('<style>', file=output)
print('.mon-title { font-size: 100px; font-weight: 800; font-family: "Comic Sans MS"; text-align: center; dominant-baseline: middle; text-anchor: middle; }', file=output)
print('.mon-subtitle { font-size: 40px; font-weight: 400; font-family: "Comic Sans MS"; text-align: center; dominant-baseline: middle; text-anchor: middle; }', file=output)
print('.text-top { font-size: 10px; font-weight: 600; font-family: "Comic Sans MS"; text-align: center; dominant-baseline: text-before-edge; text-anchor: middle; }', file=output)
print('.text-bottom { font-size: 10px; font-weight: 400; font-family: "Comic Sans MS"; text-align: center; dominant-baseline: text-after-edge; text-anchor: middle; }', file=output)
print('</style>', file=output)

print(f'<g style="scale: {K}">', file=output)

for rect in result_rects:
    x = min(rect[0], rect[2])
    y = min(rect[1], rect[3])
    w = max(rect[0], rect[2]) - x
    h = max(rect[1], rect[3]) - y
    print(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{rect[4]}" />', file=output)

path = ""
last_point = [0, 0]

for e in result_line:
    if e[0] != last_point[0] or e[1] != last_point[1]:
        path += f"m{e[0] - last_point[0]} {e[1] - last_point[1]} "
    if e[0] != e[2] and e[1] == e[3]:
        path += f"h{e[2] - e[0]} "
    elif e[0] == e[2] and e[1] != e[3]: 
        path += f"v{e[3] - e[1]} "
    else:
        path += f"l{e[2] - e[0]} {e[3] - e[1]} "
    last_point[0] = e[2]
    last_point[1] = e[3]

print(f'<path d="{path}" fill="none" stroke="black" stroke-width="5" />', file=output)

tDx = 30
stDx = 30

print(f'<text x="{result_size // 2 - tDx}" y="{result_size // 2 - tDx}" class="mon-title" transform="rotate(-45, {result_size // 2 - tDx}, {result_size // 2 - tDx})">МОНОПОЛИЯ</text>', file=output)
print(f'<text x="{result_size // 2 + stDx}" y="{result_size // 2 + stDx}" class="mon-subtitle" transform="rotate(-45, {result_size // 2 + stDx}, {result_size // 2 + stDx})">Играй и выигрывай!</text>', file=output)

for e in result_texts:
    if (e[1] == 'Шанс'):
        print(f'<image x="{e[3]- cw/2 + 5}" y="{e[4]}" width = "{cw-10}" height = "{ch}" href="data:image/jpeg;charset=utf-8;base64,{chance}" alt="Description of the image" transform="rotate({e[2]}, {e[3]}, {e[4]})"/>', file=output)
    if (e[1] == "Общественная\nказна"):
        print(f'<image x="{e[3] - cw/2}" y="{e[4]}" width = "{cw}" height = "{ch}" href="data:image/jpeg;charset=utf-8;base64,{publictreasure}" alt="Description of the image" transform="rotate({e[2]}, {e[3]}, {e[4]})"/>', file=output)
    if ('Ж/Д' in e[1] or 'магистраль' in e[1]):
        print(f'<image x="{e[3] - cw/2 + 10}" y="{e[4] + 5}" width = "{cw - 20}" height = "{ch - 20}" href="data:image/jpeg;charset=utf-8;base64,{train}" alt="Description of the image" transform="rotate({e[2]}, {e[3]}, {e[4]})"/>', file=output)
    if (e[1] == "Сверхналог"):
        print(f'<image x="{e[3] - cw/2 + 10}" y="{e[4] - 10}" width = "{cw - 20}" height = "{ch - 20}" href="data:image/jpeg;charset=utf-8;base64,{excesstax}" alt="Description of the image" transform="rotate({e[2]}, {e[3]}, {e[4]})"/>', file=output)
    if (e[1] == "Подоходный\nналог"):
        print(f'<image x="{e[3] - cw/2 + 10}" y="{e[4] + 5}" width = "{cw - 20}" height = "{ch - 20}" href="data:image/jpeg;charset=utf-8;base64,{income}" alt="Description of the image" transform="rotate({e[2]}, {e[3]}, {e[4]})"/>', file=output)
    if (e[1] == "Энергосбыт"):
        print(f'<image x="{e[3] - cw/2 - 10}" y="{e[4] - 20}" width = "{cw + 20}" height = "{ch + 20}" href="data:image/jpeg;charset=utf-8;base64,{electric}" alt="Description of the image" transform="rotate({e[2]}, {e[3]}, {e[4]})"/>', file=output)
    if (e[1] == "Водоканал"):
        print(f'<image x="{e[3] - cw/2 + 10}" y="{e[4] + 5}" width = "{cw - 20}" height = "{ch - 20}" href="data:image/jpeg;charset=utf-8;base64,{kran}" alt="Description of the image" transform="rotate({e[2]}, {e[3]}, {e[4]})"/>', file=output)
    
    print(f'<text x="{e[3]}" y="{e[4]}" class="{"text-top" if e[0] == "start" else "text-bottom"}" transform="rotate({e[2]}, {e[3]}, {e[4]})">', file=output)
    if "\n" in e[1]:
        dx = 0
        for t in e[1].split("\n"):
            print(f'<tspan x="{e[3]}" dy="{dx}">{t}</tspan>', file=output)
            dx = 15 if e[0] == "start" else -15
    else:
        print(e[1], file=output)
    print('</text>', file=output)

# Вставка картинок для начала, тюрьмы, стоянки и отправляйтесь в тюрьму

# Парковка
print(f'<image x="-15" y="75" width = "130" height = "130" href="data:image/jpeg;charset=utf-8;base64,{freeparkingBase64}" alt="Description of the image" transform="rotate(-45 -15 75)"/>', file=output)

# Отправляйтесь в тюрьму
print(f'<image x="1050" y="-60" width = "200" height = "200" href="data:image/jpeg;charset=utf-8;base64,{gotojail}" alt="Description of the image" transform="rotate(45 1050 -60)"/>', file=output)

# Тюрьма
print(f'<image x="150" y="964" width = "145" height = "145" href="data:image/jpeg;charset=utf-8;base64,{jailsit}" alt="Description of the image" transform="rotate(90 150 964)"/>' ,  file=output)

# Начало
print(f'<image x="925" y="1025" width = "145" height = "145" href="data:image/jpeg;charset=utf-8;base64,{start}" alt="Description of the image" transform="rotate(-45 925 1025)"/>' ,  file=output)


print('</g>\n</svg>', file=output)

print(f"const MAP_SIZE =", result_size)
print(f"const CARD_WIDTH =", cw)
print(f"const CARD_HEIGHT =", ch)
print(f"const MAP_BORDER =", border)
print(f"const SCALE =", 2 / result_size)