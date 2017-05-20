#!/usr/bin/nodejs
// robonect HTTP API Module

var net = require('net');
var events = require('events');
var util = require('util');
var request = require('request');

// Define Globals
var TRACE = true;
var BASEURI;

// Module Loader
var robonect = function(options) {
	events.EventEmitter.call(this);
	BASEURI = 'http://' + options.host + ':' + options.port;
	this.statusStatus = -1;
	this.timerStatus = -1;
	this.statusBattery = -1;
	this.statusMode = -1;
	this.client = this.connect(options);
	if (options.log) TRACE = options.log;
};

util.inherits(robonect, events.EventEmitter);

// Attach to lawn mower
robonect.prototype.connect = function(options) {
	var self = this;
	var auth = "Basic " + new Buffer(options.user + ":" + options.pass).toString("base64");
	var request = require('request');
	var url = BASEURI + '/json?cmd=status';

	function requeststatusStatus() {
		request.get( {url : url, headers : { "Authorization" : auth } }, function (error, response, body) {
			if ((!error) && (response.statusCode === 200)) {
				var jsonObject = JSON.parse(body);
				handleData(self, jsonObject);
			} else {
				self.emit("error", 'FAILED TO QUERY MOWER STATUS');
				if (TRACE) console.log('FAILED TO QUERY MOWER STATUS');
			}
		})
	}
	setInterval(function() {
		requeststatusStatus() // Do a request every 5 seconds
	}, 10000);

}

// Handle mower events
function handleData(self, jsonObject) {
	//if (TRACE) console.log(jsonObject);
	if(jsonObject.hasOwnProperty('successful')){
		if (jsonObject.successful){
			//console.log("Mower name:", jsonObject.name);
			if (this.timerStatus !== jsonObject.timer.status){
				this.timerStatus = jsonObject.timer.status;
				console.log(jsonObject.name, "New mower timer status: ", this.timerStatus);
				self.emit("mowerEvent", jsonObject.name, "timer",  "status", this.timerStatus);
			}
			if (this.statusStatus !== jsonObject.status.status){
				this.statusStatus = jsonObject.status.status;
				console.log(jsonObject.name, "New mower status status:", this.statusStatus);
				self.emit("mowerEvent", jsonObject.name, "status", "status", this.statusStatus);
			}
			if (this.statusBattery !== jsonObject.status.battery){
				this.statusBattery = jsonObject.status.battery;
				console.log(jsonObject.name, "New mower battery level: ", this.statusBattery);
				self.emit("mowerEvent", jsonObject.name, "status",  "battery", this.statusBattery);
			}
			if (this.statusMode !== jsonObject.status.mode){
				this.statusMode = jsonObject.status.mode;
				console.log(jsonObject.name, "New mode status: ", this.statusMode);
				self.emit("mowerEvent", jsonObject.name, "status",  "mode", this.statusMode);
			}
		}
	}
}

exports.robonect = robonect;
