import easyocr

reader = easyocr.Reader(['en'], gpu=False)

def extract_text_from_image(path: str) -> str:
    results = reader.readtext(path, detail=0)
    return "\n".join(results)
