#!/bin/bash

dir_html = "/var/www/html/"
dir_node = "/var/node_apps/node_printer/"

sudo mkdir -p "$dir_html" && cp -fr html/* "$dir_html"
sudo mkdir -p "$dir_node" && cp -fr node/* "$dir_node"
