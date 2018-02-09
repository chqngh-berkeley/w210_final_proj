# import the necessary packages
from PIL import Image
import pytesseract
import argparse
import cv2
import os
import pandas as pd
import requests
import json

# walmart api key
key = '4vdmcj2gwqvd7fg74ddu7e99'

# construct the argument parse and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-i", "--image", required=True,
    help="path to input image to be OCR'd")
ap.add_argument("-p", "--preprocess", type=str, default="thresh",
    help="type of preprocessing to be done")
args = vars(ap.parse_args())

# load the example image and convert it to grayscale
image = cv2.imread(args["image"])
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
 
# check to see if we should apply thresholding to preprocess the
# image
if args["preprocess"] == "thresh":
    gray = cv2.threshold(gray, 0, 255,
        cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
# make a check to see if median blurring should be done to remove
# noise
elif args["preprocess"] == "blur":
    gray = cv2.medianBlur(gray, 3)
# write the grayscale image to disk as a temporary file so we can
# apply OCR to it
filename = "{}.png".format(os.getpid())
cv2.imwrite(filename, gray)

# load the image as a PIL/Pillow image, apply OCR, and then delete
# the temporary file
text = pytesseract.image_to_string(Image.open(filename))
os.remove(filename)


# split up text based on each row in the receipt
text_list = []
row = []
for letter in text:
	if letter != '\n':
		row.append(letter)
	else:
		row = ''.join(row)
		text_list.append(row)
		row = []

# filter for rows with a tax code
possible_last_letters = [' 0', ' A', ' B', ' C', ' D', ' E', ' F', ' G', ' H', ' I', ' J', ' K', ' L', ' M', ' N', ' O', ' P', ' Q', ' R', ' S', ' T', ' U', ' V', ' W', ' X', ' Y', ' Z']
items = []
for item in text_list:
	if item[-2:] in possible_last_letters:
		items.append(item)

# filter for food items and run walmart open api to get exact name of food item
food_items = []
for item in items:
	row_grouping = []
	for i in range(0, len(item) - 12):
		if item[i : i+12].isdigit():
			if item[i+12 : i+15] == ' F ':
				food = item[:i]
				upc = item[i: i+12]
				food_code = item[i+12 : i+15]
				price = item[i+15 : len(item) - 2]
				tax_code = item[-1:]
				# calculate check digit for upc code
				odd_num = []
				even_num = []
				for num in range(1, len(upc)):
					if num % 2 == 0:
						even_num.append(int(upc[num]))
					else:
						odd_num.append(int(upc[num]))
				remainder = ((sum(odd_num) * 3) + sum(even_num)) % 10
				check_digit = 10 - remainder
				upc_final = upc[1:] + str(check_digit)
				# call walmart open api
				url = 'http://api.walmartlabs.com/v1/items?apiKey=' + key + '&upc=' + upc_final
				request = requests.get(url)
				if request.status_code == 200:
					product = request.json()
					items = product['items']
					food_name = items[0]['name']
					row_grouping.append(food_name)
				else:
					row_grouping.append(food)
				row_grouping.append(upc_final)
				row_grouping.append(food_code)
				row_grouping.append(price)
				row_grouping.append(tax_code)
				food_items.append(row_grouping)

# put into pandas dataframe
columns = ['food_name', 'upc', 'food_code', 'price', 'tax_code']
receipt_df = pd.DataFrame(data = food_items, columns = columns)

print(receipt_df)

# show the output images
#cv2.imshow("Image", image)
#cv2.imshow("Output", gray)
#cv2.waitKey(0)