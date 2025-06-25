#!/bin/bash
FILE=/setupComplete.txt

if ! [ -f "$FILE" ]; then
	sleep 30s 
  	touch $FILE
else 
	sleep 10s 
fi

/entrypoint.sh /etc/sync_gateway/config.json & 

tail -f /dev/null