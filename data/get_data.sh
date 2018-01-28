#!/bin/sh

# to upload data into the remote data repo, uncomment line below:
# rsync -avz ./ root@50.97.219.169:/data/
# use the same password as the login password

rsync -avz root@50.97.219.169:/data/ ./
