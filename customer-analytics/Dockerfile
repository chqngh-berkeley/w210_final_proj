# Create app directory
FROM php:7.0-cli
WORKDIR /
COPY . .
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

EXPOSE 8065

CMD [ "php","-S","0.0.0.0:8065"]
