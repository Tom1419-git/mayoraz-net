import os
import re
from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.texts = set()
        self.ignore_tags = ['script', 'style', 'title']
        self.current_tag = []

    def handle_starttag(self, tag, attrs):
        self.current_tag.append(tag)

    def handle_endtag(self, tag):
        if self.current_tag and self.current_tag[-1] == tag:
            self.current_tag.pop()

    def handle_data(self, data):
        if self.current_tag and self.current_tag[-1] in self.ignore_tags:
            return
        text = data.strip()
        if len(text) > 2 and not text.isdigit() and not re.match(r'^[^\w]+$', text):
            text = re.sub(r'\s+', ' ', text)
            if text:
                self.texts.add(text)

def get_frToEn_keys(lang_js_path):
    keys = set()
    try:
        with open(lang_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'const frToEn\s*=\s*{(.*?)\};', content, re.DOTALL)
            if match:
                dict_content = match.group(1)
                for line in dict_content.split('\n'):
                    if ':' in line:
                        key_match = re.search(r'["\'](.*?)["\']\s*:', line)
                        if key_match:
                            keys.add(key_match.group(1))
    except Exception as e:
        print(f"Error reading lang.js: {e}")
    return keys

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    lang_js_path = os.path.join(root_dir, "media", "js", "lang.js")
    
    frToEn_keys = get_frToEn_keys(lang_js_path)
    print(f"Found {len(frToEn_keys)} keys in lang.js")
    
    all_html_texts = set()
    for root, dirs, files in os.walk(root_dir):
        if 'ctt_montriond_version_club' in root:
            continue
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        parser = MyHTMLParser()
                        parser.feed(f.read())
                        all_html_texts.update(parser.texts)
                except Exception as e:
                    print(f"Error parsing {path}: {e}")
                
    missing_keys = all_html_texts - frToEn_keys
    # Ignore English texts that might already be translations
    missing_keys = {k for k in missing_keys if re.search(r'[a-zA-Z]', k)}
    print(f"Found {len(missing_keys)} potentially missing translations. Sample:")
    for key in sorted(list(missing_keys))[:100]:
        print(f"  - {key}")

if __name__ == '__main__':
    main()
