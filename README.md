# w210_final_proj

## Remote Servers
Master: `ssh root@50.97.219.169`
Slave1: `ssh root@50.97.219.173`
Master: `ssh root@50.97.219.174`

## Frontend
Install packages, install node and npm if it's not already available(https://nodejs.org/en/)

`npm install`

Serve the web page locally at port 8000:

`npm start`

## Backend
To activate w210venv:
`source w210venv/bin/activate`

To install everything in requirements:
`pip install -r requirements.txt`

Two folders: retailer_app and consumer_app

## models
TBD

## Data
when prompted, use the same password as the login password

run `sh get_data.sh` in the terminal to sync the data

to upload data into the remote data repo, run the following:
`rsync -avz ./ root@50.97.219.169:/data/`

currently the only data on the remote server is dunnhumby_The-Complete-Journey complete dataset

## notebook
sample jupyter notebook

`jupyter notebook` to run it

## SQL
MariaDB is setup on the master server
