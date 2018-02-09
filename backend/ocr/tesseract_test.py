from pytesseract import image_to_string
from PIL import Image

text = Image.open('walmartreceipt1.png')
#file = open('parsing.txt', 'a')
#file.write(image_to_string(text))
#file.close()
print(image_to_string(text))
