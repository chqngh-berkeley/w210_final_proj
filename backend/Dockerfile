# Use an official Python runtime as a parent image
FROM continuumio/anaconda

# Set the working directory to /app
WORKDIR /backend

# Copy the current directory contents into the container at /app
ADD . /backend

# Install any needed packages specified in requirements.txt
RUN pip install  -r requirements.txt
# Make port 8090 available to the world outside this container
EXPOSE 8090

RUN conda install opencv


# RUN apt-get install -y python-dev
# RUN apt-get install -y python-pip
# RUN apt-get install -y python-openssl
# RUN apt-get install -y python-mysqldb
# RUN apt-get install -y libmysqlclient-dev
# RUN apt-get install -y python-mysql.connector
RUN conda install mysql-python
RUN pip install mysql-connector
# Define environment variable
ENV PYTHONPATH /backend

# Run app.py when the container launches
CMD ["python", "/backend/endpoints/merged_api.py"]
