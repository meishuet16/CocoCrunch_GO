import os
import glob
from PIL import Image
from collections import deque

def identify_character(im):
    im_rgb = im.convert('RGB')
    w, h = im_rgb.size
    pixels = im_rgb.load()
    
    color_scores = {
        'judge': 0,
        'boy_yellow': 0,
        'boy_green': 0,
        'girl_redhat': 0,
        'girl_blonde': 0,
    }
    
    for y in range(0, h, 8):
        for x in range(0, w, 8):
            r, g, b = pixels[x, y]
            if r > 240 and g > 240 and b > 240:
                continue
            
            # Red hat / jacket
            if r > 180 and g < 70 and b < 70:
                color_scores['girl_redhat'] += 3
            # Green hoodie / cap
            elif g > 130 and r < 80 and b < 100:
                color_scores['boy_green'] += 3
            # Yellow shirt / floral
            elif r > 220 and g > 180 and b < 80:
                color_scores['boy_yellow'] += 2
            # Lilac / lavender sweater
            elif 130 < r < 210 and 110 < g < 180 and b > 180 and b > r:
                color_scores['girl_blonde'] += 3
            # Blonde hair (golden / soft yellow)
            elif r > 230 and 190 < g < 235 and 100 < b < 160:
                color_scores['girl_blonde'] += 1
            # Judge robe (very dark black/charcoal)
            elif r < 60 and g < 60 and b < 65:
                color_scores['judge'] += 2

    best_char = max(color_scores, key=color_scores.get)
    print(f"Scores for image: {color_scores} -> Identified as: {best_char}")
    return best_char

def make_background_transparent(im_cell):
    im_rgba = im_cell.convert('RGBA')
    w, h = im_rgba.size
    pix = im_rgba.load()
    
    visited = [[False]*h for _ in range(w)]
    queue = deque()
    
    def is_bg(r, g, b):
        return r >= 242 and g >= 242 and b >= 242
    
    # Add all border pixels that are near-white
    for x in range(w):
        for y in [0, h - 1]:
            r, g, b, a = pix[x, y]
            if is_bg(r, g, b):
                visited[x][y] = True
                queue.append((x, y))
    for y in range(h):
        for x in [0, w - 1]:
            r, g, b, a = pix[x, y]
            if is_bg(r, g, b) and not visited[x][y]:
                visited[x][y] = True
                queue.append((x, y))
                
    # BFS
    while queue:
        cx, cy = queue.popleft()
        pix[cx, cy] = (255, 255, 255, 0)
        
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                r, g, b, a = pix[nx, ny]
                if is_bg(r, g, b):
                    visited[nx][ny] = True
                    queue.append((nx, ny))
                elif r >= 225 and g >= 225 and b >= 225:
                    visited[nx][ny] = True
                    alpha = max(0, int(255 - ((min(r, g, b) - 225) / 20.0) * 255))
                    pix[nx, ny] = (r, g, b, alpha)
                    
    # Auto-crop transparent borders with balanced padding
    bbox = im_rgba.getbbox()
    if bbox:
        cropped = im_rgba.crop(bbox)
        pad = 16
        padded = Image.new('RGBA', (cropped.width + pad * 2, cropped.height + pad * 2), (0, 0, 0, 0))
        padded.paste(cropped, (pad, pad))
        return padded
    return im_rgba

def process_all():
    files = sorted(glob.glob("Codex Image*.png"))
    print("Found files:", files)
    
    output_dir = os.path.join("public", "characters")
    os.makedirs(output_dir, exist_ok=True)
    
    processed_chars = {}
    
    for f in files:
        im = Image.open(f)
        char_name = identify_character(im)
        processed_chars[char_name] = f
        
        char_dir = os.path.join(output_dir, char_name)
        os.makedirs(char_dir, exist_ok=True)
        
        w, h = im.size
        cell_w = w // 3
        cell_h = h // 2
        
        poses = [
            (0, 0, "idle"),
            (0, 1, "blink"),
            (0, 2, "action"),
            (1, 0, "correct"),
            (1, 1, "wrong"),
            (1, 2, "celebrate"),
        ]
        
        if char_name == 'judge':
            poses = [
                (0, 0, "idle"),
                (0, 1, "blink"),
                (0, 2, "action"),
                (1, 0, "thinking"),
                (1, 1, "correct"),
                (1, 2, "celebrate"),
            ]
        
        for r, c, pose_name in poses:
            box = (c * cell_w, r * cell_h, (c + 1) * cell_w, (r + 1) * cell_h)
            cell = im.crop(box)
            transparent_cell = make_background_transparent(cell)
            out_path = os.path.join(char_dir, f"{pose_name}.png")
            transparent_cell.save(out_path, format="PNG")
            print(f"Saved: {out_path} ({transparent_cell.size})")
            
        if char_name == 'judge':
            thinking_path = os.path.join(char_dir, "thinking.png")
            wrong_path = os.path.join(char_dir, "wrong.png")
            if os.path.exists(thinking_path) and not os.path.exists(wrong_path):
                img = Image.open(thinking_path)
                img.save(wrong_path)
                print(f"Saved judge alias: {wrong_path}")
                
        if char_name == 'girl_blonde':
            action_path = os.path.join(char_dir, "action.png")
            thinking_path = os.path.join(char_dir, "thinking.png")
            img = Image.open(action_path)
            img.save(thinking_path)

    print("All characters processed:", processed_chars)

if __name__ == "__main__":
    process_all()
