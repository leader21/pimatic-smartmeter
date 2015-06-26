var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var util = require("util");
var events = require("events");


var openSerialPort = function (opts, callback) {
    console.log('serialport options ');
    console.log(opts);

    // Setup a SerialPort instance
    var sp = new SerialPort(opts.portName, {
        baudRate: opts.baudRate,
        dataBits: opts.dataBits,
        parity: opts.parity,
        stopBits: opts.stopBits,
        flowControl: opts.flowControl,
        parser: serialport.parsers.readline("!")
    }, false);

    sp.open(function () {
        console.log('- Serial port is open');
        sp.on('data', callback);
    });

    return sp;
};

//  Returns result from applying regex to data (string)
var returnRegExResult = function (data, regex) {
    var result = data.match(regex);

    if (result != undefined) {
        return result[1];
    } else {
        return undefined;
    }

}; // returnRegExResult

var P1DataStream = function (opts) {
  //  console.log('P1DataStream opts ');
  //  console.log(opts);

    var self = this;
    self.opts = opts;

    var listener = function (data) {

        var tariffOneTotalUsage = returnRegExResult(data, /^1-0:1\.8\.1\(0+(\d+\.\d+)\*kWh\)/m);
        var tariffTwoTotalUsage = returnRegExResult(data, /^1-0:1\.8\.2\(0+(\d+\.\d+)\*kWh\)/m);
        var currentTariff = returnRegExResult(data, /^0-0:96.14.0\(0+(.*?)\)/m);
        var currentUsage = returnRegExResult(data, /^1-0:1.7.0\((.*?)\*/m);

        var dataGram = {
            tariffOneTotalUsage: tariffOneTotalUsage * 1,
            tariffTwoTotalUsage: tariffTwoTotalUsage * 1,
            currentTariff: currentTariff * 1,
            currentUsage: currentUsage * 1000
        };

     //   console.log('Raw data received: ' + data);
     //   console.log('Parsed data: ');
     //   console.log(dataGram);

        self.emit("data", dataGram);
    };

    openSerialPort(self.opts, listener);
    events.EventEmitter.call(self);
};

util.inherits(P1DataStream, events.EventEmitter);

module.exports = P1DataStream;
