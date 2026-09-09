import os
import sys
from PIL import Image

src_path = r"C:\Users\Zi Shan\.gemini\antigravity\brain\71e627ff-267e-44a2-8745-727076792f89\.user_uploaded\media_1788973795609.jpg"
if not os.path.exists(src_path):
    print("Source not found:", src_path)
    sys.exit(1)

img = Image.open(src_path)
print(f"Image format: {img.format}, size: {img.size}, mode: {img.mode}")
