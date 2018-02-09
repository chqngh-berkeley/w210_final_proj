import os
from setuptools import setup

# Utility function to read the README file.
# Used for the long_description.  It's nice, because now 1) we have a top level
# README file and 2) it's easier to type in the README file than to put a raw
# string in below ...
def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

setup(
    name = "Consumer Receipt OCR",
    version = "0.0.1",
    author = "Chuqing He",
    author_email = "chqngh@ischool.berkeley.edu",
    description = (""),
    license = "BSD",
    keywords = "example documentation tutorial",
    packages=['consumer_module', 'retailer_module','ocr','endpoints'],

    classifiers=[
        "Development Status :: 3 - Alpha",
        "License :: OSI Approved :: BSD License",
    ],
)
