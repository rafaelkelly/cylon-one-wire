"use strict";

var Cylon = require("cylon");

var Driver = module.exports = function Driver(opts) {
  Driver.__super__.constructor.apply(this, arguments);

  this.device = null;

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

    this.device = devices[0];
  }.bind(this));

  callback();
};

Driver.prototype.halt = function(callback) {
  callback();
};

Driver.prototype.readTemperature = function(callback) {
  var connection = this.connection,
    pin = this.pin,
    device = this.device;

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

    callback(null, celsius);
  });
};
