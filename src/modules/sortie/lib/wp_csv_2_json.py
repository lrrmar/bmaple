import json

wp = {}

with open('waypoints.csv', 'r') as f:
    for l in f.readlines():
        bits = l.replace('\n', '').split(',')
        entry = {}
        entry['id'] = bits[0]
        entry['latitude[DMS]'] = bits[1]
        entry['longitude[DMS]'] = bits[2]
        for coord in ['latitude', 'longitude']:
            [degree, minutes, direction] = entry[coord + '[DMS]'].replace('°',' ').replace('˚',' ').replace('´', ' ').replace('’', ' ').split(' ')
            entry[coord] = {
                'value': float(degree) + float(minutes) / 60 * -1 ** int(direction == 'S' or direction == 'W'),
                'units': 'degrees'
            }
        entry['name'] = bits[3]
        wp[bits[0]] = entry

with open('waypoints.json', 'w') as f:
    json.dump(wp, f)
