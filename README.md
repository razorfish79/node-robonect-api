# node-robonect-api
[![GPL-3.0](https://img.shields.io/badge/license-GPL-blue.svg)]()

NodeJS Module for Robonect HTTP API 

## Status: Work in Progress

## Example:

In the example below, node-robonect-api has been set up to work with Domoticz.

Domoticz has 4 virtual text devices:

idx	Name

568	Mower Status

569	Mower Timer Status

570	Mower Battery Status

572	Mower Mode

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

#### Install on Raspberry Pi 

[ssh](https://www.raspberrypi.org/documentation/remote-access/ssh/) into your Raspberry, then:
* `sudo apt-get update && sudo apt-get dist-upgrade`
* install nodejs according to [this DaveJ guide](http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/). (You might want to jump to section **Install Node.js**)
* `sudo apt-get install git`
* `cd /home/pi;git clone https://github.com/allan-gam/node-robonect-api.git`
* `cd /home/pi/node-robonect-api`
