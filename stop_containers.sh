#!/bin/bash
docker rm $(docker ps -aq)
sudo rm /var/lib/docker/network/files/local-kv.db

