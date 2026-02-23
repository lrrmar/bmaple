import json

wp = {}

with open('waypoints.csv', 'r') as f:
    for l in f.readlines():
        bits = l.replace('\n', '').split(',')
        entry = {}
        dms = {}
        entry['id'] = 'PT' + bits[0]
        dms['latitude[DMS]'] = bits[1] # swap 'dms' for 'entry' to include DMS in json
        dms['longitude[DMS]'] = bits[2]
        for coord in ['latitude', 'longitude']:
            [degree, minutes, direction] = dms[coord + '[DMS]'].replace('°',' ').replace('˚',' ').replace('´', ' ').replace('’', ' ').split(' ')
            negative_factor = 1
            if (int(direction == 'S' or direction == 'W')):
                negative_factor = -1
            entry[coord] = {
                'value': (float(degree) + float(minutes) / 60) * negative_factor,
                'unit': 'dd'
            }
        entry['name'] = bits[3]
        wp[bits[0]] = entry

with open('waypoints.json', 'w') as f:
    json.dump(wp, f)
