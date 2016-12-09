"use strict";

var Cylon = require("cylon");

var Driver = module.exports = function Driver(opts) {
  Driver.__super__.constructor.apply(this, arguments);

  this.device = null;
  this.many_devices = [];

  if (this.pin == null) {
    throw new Error("No pin specified");
  }

  this.setupCommands(["readTemperature"]);
};

Cylon.Utils.subclass(Driver, Cylon.Driver);

Driver.prototype.start = function(callback) {
  this.connection.sendOneWireConfig(this.pin, true);
  this.connection.sendOneWireSearch(this.pin, function (error, devices) {
    if(error) {
      console.error(error);
      return;
    }
    //console.log('Found',devices.length,'devices on the 1-wire bus');
    this.device = devices[0];
    for (var i in devices) {
        this.many_devices.push(devices[i]);
        //console.log('device found:', devices[i]);
    }
  }.bind(this));

  callback();
};

Driver.prototype.halt = function(callback) {
  callback();
};

Driver.prototype.readTemperature = function(callback) {
  var connection = this.connection,
    pin = this.pin;
    var devices_local = Object.assign([], this.many_devices);
    readit(devices_local, readit);
    function readit(dvss, cb) {
      var device = dvss.shift();
      connection.sendOneWireReset(pin);
      connection.sendOneWireWrite(pin, device, 0x44);
      connection.sendOneWireDelay(pin, 1000);
      connection.sendOneWireReset(pin);
      connection.sendOneWireWriteAndRead(pin, device, 0xBE, 9, function(error, data) {
        if (error) {
          callback(error);
          return;
        }

        var raw = (data[1] << 8) | data[0],
          celsius = raw / 16.0;

        callback(null, {device:device, temp:celsius});
      });
      if (dvss.length>0) {
        setTimeout(function () {
          cb(dvss, cb);
        }, 1000);
      }
    }


};
