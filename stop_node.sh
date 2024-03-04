#!/bin/bash
docker ps | grep node | awk '{system("docker stop " $1)}'
