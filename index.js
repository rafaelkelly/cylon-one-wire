"use strict";

var Drivers = {
  ds18b20: require("./lib/ds18b20")
};

module.exports = {
  drivers: Object.keys(Drivers),

  driver: function(opts) {
    if (Drivers[opts.driver]) {
      return new Drivers[opts.driver](opts);
    }

    return null;
  }
};
