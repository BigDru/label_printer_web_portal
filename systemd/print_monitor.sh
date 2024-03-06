#!/bin/bash

MONITOR_DIR="/var/www/html/printbox"

# Process existing files at startup
if [ -f "${MONITOR_DIR}/small.jpg" ]; then
    echo "Processing existing small.jpg" >> /var/log/print_monitor.log
    lp -d LeftHans2 "${MONITOR_DIR}/small.jpg" >> /var/log/print_monitor.log 2>&1
    rm "${MONITOR_DIR}/small.jpg"
fi

if [ -f "${MONITOR_DIR}/big.jpg" ]; then
    echo "Processing existing big.jpg" >> /var/log/print_monitor.log
    lp -d Jaden "${MONITOR_DIR}/big.jpg" >> /var/log/print_monitor.log 2>&1
    rm "${MONITOR_DIR}/big.jpg"
fi

# Now wait for new files
inotifywait -m -e create -e moved_to --format '%f' "${MONITOR_DIR}" | while read FILE
do
    if [ "$FILE" = "small.jpg" ]; then
        echo "Processing small.jpg" >> /var/log/print_monitor.log
        lp -d LeftHans2 "${MONITOR_DIR}/small.jpg" >> /var/log/print_monitor.log 2>&1
        rm "${MONITOR_DIR}/small.jpg"
    elif [ "$FILE" = "big.jpg" ]; then
        echo "Processing big.jpg" >> /var/log/print_monitor.log
        lp -d Jaden "${MONITOR_DIR}/big.jpg" >> /var/log/print_monitor.log 2>&1
        rm "${MONITOR_DIR}/big.jpg"
    fi
done
