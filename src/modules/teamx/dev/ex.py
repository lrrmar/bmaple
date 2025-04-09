from extract_key_value_paths import extract_key_value_paths
import json
import sys

#keys = ['Field(s)', 'Region', 'Level', 'Validity time', 'Lead time']
keys = ['field', 'region', 'level', 'validity_time', 'lead_time']

hash_tables = {}

with open(sys.argv[1], 'r') as f:
    j = json.load(f)
    hash_lists = extract_key_value_paths(j)
    for id in hash_lists:
        try:
            hash_table = {}
            for i in range(len(keys)):
                hash_table[keys[i]] = hash_lists[id][i]
            hash_tables[id] = hash_table
        except:
            print('fail')
            pass

with open('hashes.json', 'w') as f:
    json.dump(hash_tables, f)
