#!/bin/bash
docker run -it --rm -p 3000:3000 -v $(pwd)/html:/var/www/html -v $(pwd)/node:/usr/src/app -w /usr/src/app node sh -c 'npm install && node node_printer.js'
