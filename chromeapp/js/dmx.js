
/*


//SAMPLE:

//general use

  dmx_open();

  geral.acende();
  geral.setColor(255, 255, 0);

  pulpito.acende();
  pultipo.apaga();

  dmx_close();


//to define color to a specific controller

  dmx.setColor(dmx_map.geral, 0, 0, 255);



*/




var serialPort = null;
var BITRATE = 28800; //57600;
var modo = "arduino"; //arduino|xbee





var dmx_open = function() {
  serial_lib.getPorts(function(ports) {
    for (var i=0; i<ports.length; i++) {
       if (/usb/i.test(ports[i]) && /tty/i.test(ports[i])) {
        var serial_port = ports[i];

        dmx.openSerial(serial_port, BITRATE, function(){
          console.log("openned!");
          tudo.apaga();
        });

        return;
      }
    }
  });
};

var dmx_close = function() {
  dmx.closeSerial();
};






//definir iluminacao de cada mapa


var tudo = {
  "acende": function() {
    for (chave in dmx_map) {
      dmx.setBrightnessAllChannels(dmx_map[chave], 255);
    }
  },
  "apaga": function() {
    for (chave in dmx_map) {
      dmx.setBrightnessAllChannels(dmx_map[chave], 0);
    }
  }
}

var geral = {

  "setColor": function(red, green, blue) {
    dmx.setColor(dmx_map.geral, red, green, blue);
  },

  "setBrightness": function(red, green, blue) {
    dmx.setBrightness(dmx_map.geral.dimmer);
  },

  "apaga": function() {
    dmx.setBrightness(dmx_map.geral.dimmer, 0);
  },

  "acende": function() {
    dmx.setBrightness(dmx_map.geral.dimmer, 255);
  }

}

var pulpito = {
  "acende": function() { dmx.setBrightnessAllChannels(dmx_map.pulpito, 255); },
  "apaga": function() { dmx.setBrightnessAllChannels(dmx_map.pulpito, 0); }
}

var galera = {
  "acende": function() { dmx.setBrightnessAllChannels(dmx_map.mini_brut, 255); },
  "apaga": function() { dmx.setBrightnessAllChannels(dmx_map.mini_brut, 0); }
}

var pernas = {
  "acende": function() { dmx.setBrightnessAllChannels(dmx_map.pernas, 255); },
  "apaga": function() { dmx.setBrightnessAllChannels(dmx_map.pernas, 0); }
}

var logo = {
  "acende": function() { dmx.setBrightnessAllChannels(dmx_map.logo, 255); },
  "apaga": function() { dmx.setBrightnessAllChannels(dmx_map.logo, 0); }
}







/*
  mapa da rede DMX
*/

var dmx_map = {
  
  "teste": {
    "dimmer": 127,
    "red": 128,
    "green": 129,
    "blue": 130
  },
  

  "geral": {
    "dimmer": 127, //131, //TODO: mudar para 131 em producao
    "red": 128,
    "green": 129,
    "blue": 130
  },


  "pulpito" : { // na frente, centralizado no pulpito
    "canal_1": 28,
    "canal_2": 33,
    "canal_3": 39
  },


/*
  "bateria_6_frente" : { // mais geral, na frente do pulpito
    "canal_1": 15,
    "canal_2": 17,
    "canal_3": 19
  },

  "bateria_8_lateral" : { // mais geral, na frente do pulpito
    "canal_1": 10,
    "canal_2": 11,
    "canal_3": 16,
    "canal_4": 18
  },

  "bateria_frente_centro": {
    "canal_1": 41,
    "canal_2": 42,
    "canal_3": 44,
    "canal_4": 47
  },

  "bateria_traseira_lateral": {
    "canal_1": 26,
    "canal_2": 45,
    "canal_3": 46,
    "canal_4": 13,
    "canal_5": 1
  },
*/

  "baterias" : { 
    "canal_1": 15,
    "canal_2": 17,
    "canal_3": 19,
    "canal_4": 10,
    "canal_5": 11,
    "canal_6": 16,
    "canal_7": 18,
    "canal_8": 41,
    "canal_9": 42,
    "canal_10": 44,
    "canal_11": 47,
    "canal_12": 26,
    "canal_13": 45,
    "canal_14": 46,
    "canal_15": 13,
    "canal_16": 1
  },

  "mini_brut": {
    "canal_1": 3, 
    "canal_2": 4,
    "canal_3": 8,
    "canal_4": 7
  },

  "pernas": {
    "canal_1": 14,
    "canal_2": 21,
    "canal_3": 23,
    "canal_4": 37,
    "canal_5": 38,
    "canal_6": 43
  },

  "logo": {
    "dimmer": 48
  }

}







var dmx = (function() {

  var close_callback = null;
  var open_callback = null;
  var read_callback = null;
  
  var init=function() {
    if (!serial_lib) throw "You must include serial.js before";
  };




  var setColor = function(controller, red, green, blue) {

    if (red > 255 || red < 0) red = 0;
    if (green > 255 || green < 0) green = 0;
    if (blue > 255 || blue < 0) blue = 0;

    writeSerial(controller.red + "c" + red + "w\n");
    writeSerial(controller.green + "c" + green + "w\n");
    writeSerial(controller.blue + "c" + blue + "w\n");

  };


  var setBrightness = function(controller_port, value) {
    if (value > 255 || value < 0) value = 0;
    writeSerial(controller_port + "c" + value + "w\n");
  }

  var setDimmer = function(controller, value) {
    if (value > 255 || value < 0) value = 0;
    writeSerial(controller.dimmer + "c" + value + "w\n");
  }

  var setBrightnessAllChannels = function(controller, value) {
    for (chave in controller) {
      writeSerial(controller[chave] + "c" + value + "w\n");
    }

  };



  var openSerial=function(serialPort, bitrate, callback) {
    if (!serialPort) {
      logError("Invalid serialPort");
      return;
    }
    if (callback) open_callback = callback;
    //flipState(true);
    serial_lib.openSerial(serialPort, bitrate, onOpen);
  };
  
  var onOpen=function(cInfo) {
    console.log("Device found (connectionId="+cInfo.connectionId+")");
    serial_lib.startListening(onRead);
    if (open_callback) open_callback();

  };
  
  var writeSerial=function(writeString) {
    console.log(writeString);

    if (!serial_lib.isConnected()) {
      return;
    }
    if (!writeString) {
      logError("Nothing to write");
      return;
    }
    if (writeString.charAt(writeString.length-1)!=='\n') {
      writeString+="\n"; 
    }
    serial_lib.writeSerial(writeString); 
  }
  
  var onRead=function(readData) {
    //TODO: verify serial data received
    console.log("onRead");
    console.log(readData);

    if (read_callback) read_callback(readData);

  }


  var closeSerial=function() {
    serial_lib.closeSerial(onClose);
  };
  
  var onClose = function(result) {
    //flipState(true);
    if (close_callback) close_callback();
  }
  
  init();

  return {
    "openSerial": openSerial,
    "closeSerial": closeSerial,
    "onOpen": open_callback,
    "onClose": close_callback,
    "onRead": read_callback,

    "setColor": setColor,
    "setDimmer": setDimmer,
    "setBrightness": setBrightness,
    "setBrightnessAllChannels": setBrightnessAllChannels,

  }

})();



function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}




