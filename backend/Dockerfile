# Use an official Python runtime as a parent image
FROM continuumio/anaconda

# Set the working directory to /app
WORKDIR /backend

# Copy the current directory contents into the container at /app
ADD . /backend
RUN apt-get install libmysqlclient-dev
RUN pip install mysqlclient -Y -test123

# Install any needed packages specified in requirements.txt
RUN pip install  -r requirements.txt
# Make port 8090 available to the world outside this container
EXPOSE 8090

RUN conda install opencv

# Define environment variable
ENV PYTHONPATH /backend

# Run app.py when the container launches
CMD ["python", "/backend/endpoints/merged_api.py"]
