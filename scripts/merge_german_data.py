import json
import re

def parse_german_data():
    words_file = "top_3000_german_words.txt"
    output_file = "german output.txt"
    
    # 1. Parse top_3000_german_words.txt for English translations
    en_translations = {}
    try:
        with open(words_file, "r", encoding="utf-8") as f:
            for line in f:
                match = re.match(r"^\d+\.\s+([^-]+)\s*-\s*(.*)", line.strip())
                if match:
                    german_word = match.group(1).strip()
                    english_trans = match.group(2).strip()
                    en_translations[german_word] = english_trans
    except Exception as e:
        print(f"Error reading {words_file}: {e}")

    # 2. Parse german output.txt for other languages
    # Header: de zh fr hi it ja pt ru es
    results = []
    try:
        with open(output_file, "r", encoding="utf-8") as f:
            lines = f.readlines()
            if not lines:
                return
            
            header = lines[0].strip().split('\t')
            # The columns are: de (0), zh (1), fr (2), hi (3), it (4), ja (5), pt (6), ru (7), es (8)
            
            for line in lines[1:]:
                cols = line.strip().split('\t')
                if not cols:
                    continue
                
                # Column 0 usually has "german - english" or just "german"
                # We need to extract the clean german word
                col0 = cols[0]
                german_word_match = re.match(r"^([^-]+)", col0)
                if not german_word_match:
                    continue
                
                german_word = german_word_match.group(1).strip()
                
                translations = {}
                
                # Add English if we have it
                if german_word in en_translations:
                    translations["en"] = en_translations[german_word]
                
                # Extract other languages
                # We need to strip the "german - " part from each translation if present
                for i in range(1, len(cols)):
                    lang_code = header[i]
                    val = cols[i].strip()
                    
                    # Clean up the translation (remove "german - " prefix)
                    # Many entries look like "der - le (masculin)" or "die - the（阴性/复数）"
                    # We want just "le (masculin)" or "the（阴性/复数）"
                    clean_val_match = re.search(r"-\s*(.*)", val)
                    if clean_val_match:
                        translations[lang_code] = clean_val_match.group(1).strip()
                    else:
                        translations[lang_code] = val
                
                results.append({
                    "term": german_word,
                    "translations": translations
                })
    except Exception as e:
        print(f"Error reading {output_file}: {e}")

    # 3. Save to dict_de.json
    output_path = "platform/src/data/dictation/dict_de.json"
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"Successfully created {output_path} with {len(results)} words.")
    except Exception as e:
        print(f"Error saving {output_path}: {e}")

if __name__ == "__main__":
    parse_german_data()
