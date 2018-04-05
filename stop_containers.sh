#!/bin/bash
docker rm $(docker ps -aq)
sudo rm /var/lib/docker/network/files/local-kv.db
docker ps -aq --no-trunc | xargs docker rm

