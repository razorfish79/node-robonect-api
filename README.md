# node-robonect-api version 0.9.1
[![GPL-3.0](https://img.shields.io/badge/license-GPL-blue.svg)]()

NodeJS Module for Robonect HTTP API 

## Status: Work in Progress

## Example:

In the example below, node-robonect-api has been set up to work with [Domoticz using Domoticz API/JSON URL's](https://www.domoticz.com/wiki/Domoticz_API/JSON_URL's). It can easily be adapted to virtually any home automation system that has the ability to interact with external systems using http/https.

For this example, Domoticz has been set up with 4 virtual text devices:

idx	Name

568	Mower Status

569	Mower Timer Status

570	Mower Battery Status

572	Mower Mode

custom node-robonect-api script example, e.g. ~/domoticz/scripts/js/mymowerscript.js
```javascript
#!/usr/bin/nodejs

var STATUS = new Array();
STATUS[0] = "Status is determined";
STATUS[1] = "Parked";
STATUS[2] = "Moving";
STATUS[3] = "Looking";
STATUS[4] = "Loading";
STATUS[5] = "Searching";
STATUS[7] = "Error";
STATUS[8] = "Lost signal";
STATUS[16] = "Switched off";
STATUS[17] = "Sleeping";

var STATUSMODE = new Array();
STATUSMODE[0] = "Auto";
STATUSMODE[1] = "Manuell";
STATUSMODE[2] = "Home";
STATUSMODE[3] = "Demo";

var TIMERSTATUS = new Array();
TIMERSTATUS[0] = "Disabled";
TIMERSTATUS[1] = "Active";
TIMERSTATUS[2] = "Stand by";

var mower = require('node-robonect-api');
var request = require("request");

// Options:
var options = {
	host : '192.168.1.111',
	port : '80',
	user : 'john',
	pass : 'smith',
	log  : false,
};

var robonect = new mower.robonect(options);

// Monitor Glenn, the lawn mower
robonect.on('mowerEvent', function(mowerName, category, eventType, eventValue) {
	//console.log(mowerName, category, eventType, eventValue);
	if (category === 'status' && eventType === 'status') setDomoDevice(mowerName, eventType, 568, STATUS[eventValue])
	if (category === 'status' && eventType === 'mode') setDomoDevice(mowerName, eventType, 572, STATUSMODE[eventValue])
	if (category === 'timer' && eventType === 'status') setDomoDevice(mowerName, eventType, 569, TIMERSTATUS[eventValue])
	if (category === 'status' && eventType === 'battery') setDomoDevice(mowerName, eventType, 570, eventValue)
});

robonect.on('responseStatusCode', (statusCode) => {
	// Handle the response status code here
	if (statusCode != 200) {
		console.error(statusCode);
	}
});

robonect.on('error', (err) => {
	// Handle the error here.  
	console.error('whoops! there was an error');
});

function getDateTime() {
	var date = new Date();
	var hour = date.getHours();
	hour = (hour < 10 ? "0" : "") + hour;
	var min = date.getMinutes();
	min = (min < 10 ? "0" : "") + min;
	var sec = date.getSeconds();
	sec = (sec < 10 ? "0" : "") + sec;
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	month = (month < 10 ? "0" : "") + month;
	var day = date.getDate();
	day = (day < 10 ? "0" : "") + day;
	return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

function setDomoDevice(mowername, eventType, idx, sValue) {
	request("http://domoticzhost:8080/json.htm?type=command&param=udevice&nvalue=0&idx=" + idx + "&svalue=" + sValue, function(error, response, body) {
	console.log(getDateTime() + ' ' + mowername + ' ' + eventType + ' ' + idx + ' ' + sValue);
})
}

function printOut(mowername, eventType, idx, sValue) {
	console.log(getDateTime() + ' ' + mowername + ' ' + eventType + ' ' + idx + ' ' + sValue);
}

```

#### Prerequisits
* A Raspberry Pi 
* A backup so that You can restore everything in case something goes wrong.
* Basic linux knowledge.
* A user and a password must have been setup in the Robonect GUI, (Robonect->User).

#### Install node-robonect-api on a Raspberry Pi 

[ssh](https://www.raspberrypi.org/documentation/remote-access/ssh/) into your Raspberry, then:
* `sudo apt-get update && sudo apt-get dist-upgrade`
* install nodejs according to [this DaveJ guide](http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/). (You might want to directly jump to section **Install Node.js**)

* `npm install request`
* `sudo apt-get install git`
* `cd ~`
* `npm install git://github.com/allan-gam/node-robonect-api.git`

Now create your custom node-robonect-api script.
* `mkdir ~/domoticz/scripts/js`
* `touch ~/domoticz/scripts/js/mymowerscript.js`
* `chmod 755 ~/domoticz/scripts/js/mymowerscript.js`
Now, using your favourite editor, edit `~/domoticz/scripts/js/mymowerscript.js` using the above example script as a template. Change the options to reflect the IP address, username, password and the Domoticz device IDs that you use on your Domoticz installation.

Check that it works by issuing the following command:
* `~/domoticz/scripts/js/mymowerscript.js`
* (Press CTRL-C to exit the script)

Create a "watchdog" bash script and make it run every 10 minutes to check that your custom mower script is always up and running.
* `mkdir ~/domoticz/scripts/sh`
* `touch ~/domoticz/scripts/sh/robonectwatchdog.sh`
* `chmod 755 ~/domoticz/scripts/sh/robonectwatchdog.sh`
Using your favourite editor, edit `~/domoticz/scripts/sh/robonectwatchdog.sh` and add the following:
```
#!/bin/bash

if pidof -x "mymowerscript.js" >/dev/null; then
    echo "Robonect process already running"
		exit 0
fi

/home/pi/domoticz/scripts/js/mymowerscript.js &
```
Then add the following into your crontab (using `crontab -e`):
`*/10 * * * * /home/pi/domoticz/scripts/sh/robonectwatchdog.sh`
Save your crontab. Your watchdog script should start the mymowerscript.js to run in the background within 10 minutes.


#### Updating node-robonect-api to latest version on Raspberry Pi 

[ssh](https://www.raspberrypi.org/documentation/remote-access/ssh/) into your Raspberry, then:
* `killall mymowerscript.js`
* `cd ~/node_modules&&rm -rf node-robonect-api`
* `npm install git://github.com/allan-gam/node-robonect-api.git`

Wait for your watchdog script to start mymowerscript.js

You can check the new version of node-robonect-api by issuing

* `npm ls|grep node-robonect-api`

