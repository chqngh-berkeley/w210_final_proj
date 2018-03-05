FROM python:2.7-slim

# Create app directory
WORKDIR /informational_analytics

# Bundle app source
COPY . .

EXPOSE 8585
CMD [ "python","-m","SimpleHTTPServer","8585"]
