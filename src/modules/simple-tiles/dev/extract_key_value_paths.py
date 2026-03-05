def extract_key_value_paths(data, path=None):
    """Recursively extract all key-value paths in a nested JSON structure."""
    if path is None:
        path = []

    paths_dict = {}

    if isinstance(data, dict):
        for key, value in data.items():
            paths_dict.update(extract_key_value_paths(value, path + [key]))

    elif isinstance(data, list):
        for i, item in enumerate(data):
            paths_dict.update(extract_key_value_paths(item, path + [i]))  # Use index for lists

    else:
        paths_dict[data] = path  # Base case: leaf node (actual value)

    return paths_dict
