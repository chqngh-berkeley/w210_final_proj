# import the necessary packages
from PIL import Image
import pytesseract
import argparse
import cv2
import os
import pandas as pd
import requests
import json
import difflib
import re
from operator import itemgetter
from itertools import groupby

# walmart api key
key = '4vdmcj2gwqvd7fg74ddu7e99'


def ocr(args):
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
    category_group = []
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
    					category = items[0]['categoryPath']
    					row_grouping.append(food_name)
    					row_grouping.append(category)
    				else:
    					row_grouping.append(food)
    					row_grouping.append(food) # Can be marked as unknown category as well
    				row_grouping.append(upc_final)
    				row_grouping.append(food_code)
    				row_grouping.append(price)
    				row_grouping.append(tax_code)
    				food_items.append(row_grouping)

    # put into pandas dataframe
    columns = ['food_name', 'category', 'upc', 'food_code', 'price', 'tax_code']
    receipt_df = pd.DataFrame(data = food_items, columns = columns)

    food_categories = pd.read_csv('./ocr_module/food_categories.csv')

    categories = food_categories['DURATION CATEGORY'].tolist()

    closest_category = []
    stop_words = ['Food', 'Baking', 'Meal', 'Meals', 'Fresh', 'Bakery', 'Breakfast']
    for index, row in receipt_df.iterrows():
    	words = row['category'].rsplit('/', 2)[-2:]
    	words = ' '.join(words)
    	words = re.sub("[^\w]", " ",  words).split()
    	words = [x for x in words if x not in stop_words]
    	original_words = re.sub("[^\w]", " ",  row['food_name']).split()
    	word_score = []
    	if words == ['Unknown', 'Category']:
    		for word in original_words:
    			if not difflib.get_close_matches(word.upper(), categories, cutoff = 0.6):
    				pass
    			else:
    				best_match = difflib.get_close_matches(word.upper(), categories, cutoff = 0.6)[0]
    				score = difflib.SequenceMatcher(None, word, best_match).ratio()
    				word_score.append([best_match, score])
    	else:
    		for word in words:
    			if not difflib.get_close_matches(word.upper(), categories, cutoff = 0.6):
    				pass
    			else:
    				best_match = difflib.get_close_matches(word.upper(), categories, cutoff = 0.6)[0]
    				score = difflib.SequenceMatcher(None, word, best_match).ratio()
    				word_score.append([best_match, score])
    	if not sorted(word_score, key=lambda x: x[1]):
    		closest_category.append('UNKNOWN')
    	else:
    		closest_category.append(sorted(word_score, key=lambda x: x[1], reverse = True)[0][0])

    receipt_df['closest_category'] = closest_category

    pd.set_option('display.expand_frame_repr', False)
    print(receipt_df)
    print(receipt_df.to_json(orient='records'))
    return receipt_df
# show the output images
#cv2.imshow("Image", image)
#cv2.imshow("Output", gray)
#cv2.waitKey(0)


if __name__ == '__main__':
    
    # construct the argument parse and parse the arguments
    ap = argparse.ArgumentParser()
    ap.add_argument("-i", "--image", required=True,
        help="path to input image to be OCR'd")
    ap.add_argument("-p", "--preprocess", type=str, default="thresh",
        help="type of preprocessing to be done")
    args = vars(ap.parse_args())
    ocr(args)