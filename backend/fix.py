
import re

with open('app.py', 'r', encoding='utf-8') as f:
    text = f.read()

new_text = re.sub(
    r'elif hip_to_height < 0\.54 and bust_to_height < 0\.54:.*?(?=print\()',
    'elif hip_to_height < 0.54 and bust_to_height < 0.54:\n                  body_type = \'slim\'\n              else:\n                  body_type = \'average\'\n\n              ',
    text,
    flags=re.DOTALL
)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(new_text)

