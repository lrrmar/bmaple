import zlib
import sys

path = sys.argv[1]

# Read the compressed file
with open(path, "rb") as f:
    compressed_data = f.read()

# Decompress the data
decompressed_data = zlib.decompress(compressed_data)

# Save the decompressed data to a file
with open(path.replace('.zlib', ''), "wb") as f:
    f.write(decompressed_data)

print("Decompression complete!")
