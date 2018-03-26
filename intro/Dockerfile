FROM python:2.7-slim

# Create app directory
WORKDIR /intro

# Bundle app source
COPY . .

EXPOSE 8585
CMD [ "python","-m","SimpleHTTPServer","8586"]
