import json
import os
import time
from wordfreq import top_n_list
from deep_translator import GoogleTranslator

# Config
LANGS = ["fr", "de", "es", "it", "pt", "ru", "hi", "ja", "zh", "en"]
MAP_LANGS = {
    "fr": "fr", "de": "de", "es": "es", "it": "it", "pt": "pt",
    "ru": "ru", "hi": "hi", "ja": "ja", "zh": "zh-CN", "en": "en"
}

OUTPUT_DIR = "platform/src/data/dictation"
BATCH_SIZE = 40  # Safer batch size for free API

def generate_dictation_data():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    for src_lang in LANGS:
        output_path = os.path.join(OUTPUT_DIR, f"dict_{src_lang}.json")
        
        # Check if already fully done
        if os.path.exists(output_path):
            try:
                with open(output_path, "r", encoding="utf-8") as f:
                    existing_data = json.load(f)
                if len(existing_data) >= 3000 and all(all(l in item["translations"] for l in LANGS if l != src_lang) for item in existing_data[:3000]):
                    print(f">>> {src_lang.upper()} already complete. Skipping.")
                    continue
            except:
                pass

        print(f"\n>>> Processing Source Language: {src_lang.upper()}")
        
        try:
            source_words = top_n_list(src_lang, 3000)
            print(f"Loaded top 3000 words for {src_lang}")
        except Exception as e:
            print(f"Error getting words for {src_lang}: {e}")
            continue

        results = []
        if os.path.exists(output_path):
            try:
                with open(output_path, "r", encoding="utf-8") as f:
                    results = json.load(f)
            except:
                results = []
        
        # Ensure results list matches source_words length
        while len(results) < len(source_words):
            results.append({
                "term": source_words[len(results)],
                "translations": {}
            })

        target_langs = [l for l in LANGS if l != src_lang]
        
        for target in target_langs:
            # Check if this target is already done for all words
            if all(target in item["translations"] and item["translations"][target] for item in results):
                print(f"  -> {target.upper()} already translated. Skipping.")
                continue

            print(f"  -> Translating to {target.upper()}...")
            translator = GoogleTranslator(source=MAP_LANGS[src_lang], target=MAP_LANGS[target])
            
            for i in range(0, len(source_words), BATCH_SIZE):
                batch = source_words[i : i + BATCH_SIZE]
                
                # Skip if already translated in this batch
                if all(target in results[i+j]["translations"] and results[i+j]["translations"][target] for j in range(len(batch))):
                    continue

                try:
                    translated_batch = translator.translate_batch(batch)
                    for j, translation in enumerate(translated_batch):
                        results[i + j]["translations"][target] = translation
                    
                    percent = min(100, (i + len(batch)) / len(source_words) * 100)
                    print(f"     [{src_lang} -> {target}] Progress: {percent:.1f}%", flush=True)
                    
                    # Save every batch for maximum reliability
                    with open(output_path, "w", encoding="utf-8") as f:
                        json.dump(results, f, ensure_ascii=False, indent=2)
                            
                except Exception as e:
                    print(f"\nError translating batch {i} for {src_lang}->{target}: {e}", flush=True)
                    time.sleep(5) # Longer backoff
                
                time.sleep(0.3) # Increased safety delay
            print(f"  -> {target.upper()} complete.")

if __name__ == "__main__":
    generate_dictation_data()
