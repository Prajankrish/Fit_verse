import csv
import json
import sqlite3
import random
import os

CSV_PATH = r'D:\style-fit-studio-main\Myntra dataset\myntra202305041052.csv'
DB_PATH = r'D:\style-fit-studio-main\backend\database\garments.db'

def map_category(url):
    url_lower = str(url).lower()
    if 'jeans' in url_lower or 'trousers' in url_lower or 'shorts' in url_lower or 'track-pants' in url_lower or 'legging' in url_lower:
        return 'bottoms'
    elif 'dresses' in url_lower or 'jumpsuits' in url_lower:
        return 'dresses'
    elif 'jackets' in url_lower or 'sweatshirts' in url_lower or 'sweaters' in url_lower or 'coats' in url_lower:
        return 'outerwear'
    else:
        return 'tops'

def extract_image(img_str):
    if not img_str: return ''
    images = img_str.replace(';', '\n').split('\n')
    for img in images:
        if img.strip().startswith('http') and 'default' not in img.lower():
            return img.strip()
    return ''

def generate_sizes(category):
    sizes_data = {}
    size_labels = ['XS', 'S', 'M', 'L', 'XL']
    # Advanced: Realistic adult garment flat measurements (width in cm)
    # Circumference = flat width * 2
    # XS Top ~88cm circ, M Top ~98cm circ, XL Top ~108cm circ
    base_dims = {
        'tops': {'chest_width': 44, 'length': 65},
        'bottoms': {'waist_width': 35, 'hip_width': 45, 'inseam': 75},
        'dresses': {'chest_width': 41, 'waist_width': 34, 'length': 90},
        'outerwear': {'chest_width': 48, 'length': 70}
    }
    cat_base = base_dims.get(category, base_dims['tops'])
    for i, size in enumerate(size_labels):
        dims = cat_base.copy()
        for k in dims.keys():
            # Typical grade between sizes is 2.5cm flat (5cm circumference)
            # Length grading is usually smaller (~1.25cm)
            if 'length' in k or 'inseam' in k:
                dims[k] = dims[k] + (i * 1.5)
            else:
                dims[k] = dims[k] + (i * 2.5)
        
        dims['fit_type'] = 'regular'
        sizes_data[size] = dims
    return sizes_data

def migrate():
    # Remove existing db if exists
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS garments (
        id TEXT PRIMARY KEY,
        name TEXT,
        brand TEXT,
        category TEXT,
        price REAL,
        image TEXT,
        fabric TEXT,
        stretch_percentage INTEGER,
        sizes_json TEXT
    )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_category ON garments(category)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_name ON garments(name)')
    
    print(f"Reading from {CSV_PATH}")
    
    chunk_size = 50000
    rows_to_insert = []
    total_inserted = 0
    
    try:
        with open(CSV_PATH, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            
            for i, row in enumerate(reader):
                if not row.get('name') or not row.get('img') or not row.get('purl'):
                    continue

                img_url = extract_image(row.get('img', ''))
                if not img_url:
                    continue

                category = map_category(row.get('purl', 'tshirts'))

                try:
                    price_inr = float(row.get('price', 1000).replace(',', ''))
                    price_usd = round(price_inr / 83.0, 2)
                    if price_usd < 5.0: price_usd = random.choice([15.99, 24.99, 34.50])
                except:
                    price_usd = 29.99
                
                fabric = "Cotton Blend" if 'cotton' in row.get('name', '').lower() else "Polyester"
                stretch = random.randint(2, 8)
                sizes = json.dumps({"sizes": generate_sizes(category)})
                
                g_id = f"myntra_{total_inserted}"
                
                rows_to_insert.append((
                    g_id,
                    row.get('name', 'Apparel').strip(),
                    row.get('seller', 'Generic').strip(),
                    category,
                    price_usd,
                    img_url,
                    fabric,
                    stretch,
                    sizes
                ))
                
                total_inserted += 1
                
                if len(rows_to_insert) >= chunk_size:
                    cursor.executemany('''
                        INSERT OR IGNORE INTO garments 
                        (id, name, brand, category, price, image, fabric, stretch_percentage, sizes_json)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', rows_to_insert)
                    conn.commit()
                    print(f"Inserted {total_inserted} rows...")
                    rows_to_insert = []
                    
                    # Optional: limit memory/time by stopping at 250,000 to keep it manageable.
                    # Or let it rip logic. Let's cap at 150,000 which is plenty and runs fast.
                    if total_inserted >= 150000:
                        break

            # Insert remaining
            if rows_to_insert:
                cursor.executemany('''
                    INSERT OR IGNORE INTO garments 
                    (id, name, brand, category, price, image, fabric, stretch_percentage, sizes_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', rows_to_insert)
                conn.commit()
                print(f"Inserted {total_inserted} rows total.")
                
    except Exception as e:
        print(f"Error: {e}")
        
    conn.close()
    print("Migration to SQLite complete.")

if __name__ == '__main__':
    migrate()
