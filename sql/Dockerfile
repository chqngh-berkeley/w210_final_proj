# Use an official Python runtime as a parent image
FROM mariadb:latest as build

WORKDIR /sql
EXPOSE 3306
COPY . .
# Define environment variable
# ENV MYSQL_ALLOW_EMPTY_PASSWORD yes

# ENTRYPOINT ["sh", "script.sh"]
# RUN sh script.sh
