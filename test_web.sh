#!/bin/bash
pushd html
docker run -p 80:80 -v $(pwd):/usr/share/nginx/html nginx
popd html
