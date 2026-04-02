import csv
import json
import os
import random

CSV_PATH = r'D:\style-fit-studio-main\Myntra dataset\myntra202305041052.csv'
DB_PATH = r'D:\style-fit-studio-main\backend\database\garments_db.json'

def map_category(url):
    url_lower = str(url).lower()
    if 'jeans' in url_lower or 'trousers' in url_lower or 'shorts' in url_lower or 'track-pants' in url_lower:
        return 'bottoms'
    elif 'dresses' in url_lower or 'jumpsuits' in url_lower:
        return 'dresses'
    elif 'jackets' in url_lower or 'sweatshirts' in url_lower or 'sweaters' in url_lower or 'coats' in url_lower:
        return 'outerwear'
    else:
        # Default fallback is tops for tshirts, shirts, kurtas, etc.
        return 'tops'

def extract_image(img_str):
    if not img_str: return ''
    # Some images are separated by ;, some by newlines
    images = img_str.replace(';', '\n').split('\n')
    for img in images:
        if img.strip().startswith('http'):
            return img.strip()
    return ''

def generate_sizes(category):
    sizes_data = {}
    size_labels = ['XS', 'S', 'M', 'L', 'XL']
    
    # Base dimensions roughly based on category
    base_dims = {
        'tops': {'chest_width': 35, 'length': 60},
        'bottoms': {'waist': 30, 'hip': 40, 'length': 90},
        'dresses': {'chest_width': 35, 'waist': 32, 'length': 85},
        'outerwear': {'chest_width': 40, 'length': 65}
    }
    
    cat_base = base_dims.get(category, base_dims['tops'])
    
    for i, size in enumerate(size_labels):
        dims = cat_base.copy()
        # Scale up the dimensions for larger sizes
        for k in dims.keys():
            dims[k] = dims[k] + (i * 2.5) # Increase by 2.5cm per size
            
        dims['fit_type'] = 'regular'
        sizes_data[size] = dims
        
    return sizes_data

def migrate():
    print(f"Reading from {CSV_PATH}")
    garments = []
    
    try:
        with open(CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            count = 0
            
            for row in reader:
                if count >= 100:  # Take first 100 items to keep DB size manageable
                    break
                    
                # Filter out garbage rows
                if not row.get('name') or not row.get('img') or not row.get('purl'):
                    continue
                    
                category = map_category(row.get('purl', 'tshirts'))
                img_url = extract_image(row.get('img', ''))
                
                if not img_url:
                    continue
                
                # Convert price from INR to USD roughly for UI coherence (or keep as is, we'll convert to USD)
                try:
                    price_inr = float(row.get('price', 1000).replace(',', ''))
                    price_usd = round(price_inr / 83.0, 2)
                    if price_usd < 5.0: price_usd = random.choice([15.99, 24.99, 34.50])
                except:
                    price_usd = 29.99
                
                garment = {
                    "id": f"myntra_{row.get('id', count)}",
                    "name": row.get('name', 'Apparel').strip(),
                    "brand": row.get('seller', 'Generic').strip(),
                    "category": category,
                    "price": price_usd,
                    "image": img_url,
                    "fabric": "Cotton Blend" if 'cotton' in row.get('name', '').lower() else "Polyester",
                    "stretch_percentage": random.randint(2, 8),
                    "specifications": {
                        "sizes": generate_sizes(category)
                    }
                }
                
                garments.append(garment)
                count += 1
                
    except Exception as e:
        print(f"Error parsing CSV: {e}")
        return
        
    # Read existing DB just to keep existing predefined ones if any, or overwrite. We will overwrite for demo clarity.
    db_obj = {"garments": garments}
    
    print(f"Writing {len(garments)} garments to {DB_PATH}")
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db_obj, f, indent=2)
        
    print("Migration complete!")

if __name__ == '__main__':
    migrate()
