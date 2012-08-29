

/*
//SAMPLE:

serial_lib.getPorts(function(ports) {
  for (var i=0; i<ports.length; i++) {
     if (/usb/i.test(ports[i]) && /tty/i.test(ports[i])) {
      var serial_port = ports[i];

      dmx.openSerial(serial_port, 28800, function(){
        dmx.setBrightness(255);
        dmx.setColor(255, 0, 0);
      });

      return;
    }
  }
});

dmx.closeSerial();


dmx.setColor(dmx_map.geral, 0, 0, 255);


*/




//const SENSOR_REFRESH_INTERVAL=200;

var serialPort = null;
var bitrate = 28800; //57600;
var modo = "arduino"; //arduino|xbee

var start_channel = 1;



var controller = (function(){

  console.log("DMX INICIALIZADO!");

  var btnOpen=document.querySelector(".open");
  var btnClose=document.querySelector(".close");
  var logArea=document.querySelector(".log");
  
  var serial_devices=document.querySelector(".serial_devices");
  
  var logObj=function(obj) {
    console.log(obj);
  }
  var logSuccess=function(msg) {
    log("<span style='color: green;'>"+msg+"</span>");
  };
  var logError=function(msg) {
    log("<span style='color: red;'>"+msg+"</span>");
  };
  var log=function(msg) {
    console.log(msg);
    logArea.innerHTML=msg+"<br/>"+logArea.innerHTML;
  };
  

  var init=function() {

    serial_lib.getPorts(function(ports) {
      for (var i=0; i<ports.length; i++) {
         if (/usb/i.test(ports[i]) && /tty/i.test(ports[i])) {
          console.log("opening port " + ports[i]);
          dmx.openSerial(ports[i], bitrate);
          return;
        }
      }
    });

    initListeners();
    //refreshPorts();

  };

  var initListeners=function() {

    console.log("init listeners");

    //btnOpen.addEventListener("click", openSerial);
    btnClose.addEventListener("click", closeSerial);
    document.querySelector(".refresh").addEventListener("click", refreshPorts);

    addEventToElements("change", "input[type='range']", function(e, c) {
        this.nextSibling.textContent=this.value;

        switch(this.className) {
          case "r": red = this.value; break;
          case "g": green = this.value; break;
          case "b": blue = this.value; break;
        }

        dmx.setColor(red, green, blue);

    });
  };



  var flipState=function(deviceLocated) {
    btnOpen.disabled=!deviceLocated;
    btnClose.disabled=deviceLocated;
  };

  
  var addEventToElements=function(eventType, selector, listener) {
    var elems=document.querySelectorAll(selector);
    
    for (var i=0; i<elems.length; i++) {
      (function() {
        var c=i;
        elems[i].addEventListener(eventType, function(e) {
          listener.apply(this, [e, c]);
        });
      })();
    }
  };

  
  var refreshPorts=function() {

    serial_lib.getPorts(function(items) {
      logSuccess("got "+items.length+" ports");
      for (var i=0; i<items.length; i++) {
         if (/usb/i.test(items[i]) && /tty/i.test(items[i])) {
            serialPort = items[i];
            logSuccess("auto-selected "+items[i]);

            //connect
            dmx.openSerial(serialPort, bitrate, function(){
              flipState(true);
            });
            return;
         }
      }
    });
  };


  var openSerial = function() {
    dmx.openSerial(serialPort, bitrate);

  };

  var closeSerial = function() {
    dmx.closeSerial();
  };

  //TODO: descomentar para funcionar ilumiChrome
  //init();

})();





serial_lib.getPorts(function(ports) {
  for (var i=0; i<ports.length; i++) {
     if (/usb/i.test(ports[i]) && /tty/i.test(ports[i])) {
      var serial_port = ports[i];

      dmx.openSerial(serial_port, 28800, function(){
        console.log("openned!");
        dmx.setBrightness(255);
        dmx.setColor(255, 0, 0);
      });

      return;
    }
  }
});






/*
  mapa da rede DMX
*/

var dmx_map = {
  /*
  "teste": {
    "dimmer": 1,
    "red": 2,
    "green": 3,
    "blue": 4
  },
  */

  "geral": {
    "dimmer": 131,
    "red": 128,
    "green": 129,
    "blue": 130
  },


  "pulpito" : { // na frente, centralizado no pulpito
    "canal_1": 28,
    "canal_2": 33,
    "canal_3": 39
  },



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



  var setColorGeral = function(red, green, blue) {

    if (red > 255 || red < 0) red = 0;
    if (green > 255 || green < 0) green = 0;
    if (blue > 255 || blue < 0) blue = 0;

    var default_key = keys(dmx_map)[0];
    writeSerial(dmx_map[default_key].red + "c" + red + "w\n");
    writeSerial(dmx_map[default_key].green + "c" + green + "w\n");
    writeSerial(dmx_map[default_key].blue + "c" + blue + "w\n");

  };

  var setColor = function(controller, red, green, blue) {

    if (red > 255 || red < 0) red = 0;
    if (green > 255 || green < 0) green = 0;
    if (blue > 255 || blue < 0) blue = 0;

    writeSerial(controller.red + "c" + red + "w\n");
    writeSerial(controller.green + "c" + green + "w\n");
    writeSerial(controller.blue + "c" + blue + "w\n");

  };

  var setBrightnessGeral = function(value) {
    if (value > 255 || value < 0) value = 0;

    var default_key = keys(dmx_map)[0];
    writeSerial(dmx_map[default_key].dimmer + "c" + value + "w\n");
  }

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



  /*

  var getChannel = function(channel) {
    return channel + start_channel;
  }


  var setColor = function(r, g, b) {
        red = r;
        green = g;
        blue = b;

        var cor = decimalToHex(red, 2) + decimalToHex(green, 2) + decimalToHex(blue, 2);
        document.querySelector("#sample").style.backgroundColor = "#" + cor;

        switch(modo) {
          case "arduino": 
            writeSerial(getChannel(1) + "c" + red + "w\n");
            writeSerial(getChannel(2) + "c" + green + "w\n");
            writeSerial(getChannel(3) + "c" + blue + "w\n");
            break;

          case "xbee": writeSerial(cor + "\n"); break;
        }

  };
  */







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
    //flipState(false);
    serial_lib.startListening(onRead);

    if (modo == "arduino") {
      writeSerial((start_channel + 0) + "c255w");
      setColor(0, 0, 0);
    }

    if (open_callback) open_callback();

  };
  
  var writeSerial=function(writeString) {
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
    "setColorGeral": setColorGeral,
    "setDimmer": setDimmer,
    "setBrightness": setBrightness,
    "setBrightnessGeral": setBrightnessGeral,
    "setBrightnessAllChannels": setBrightnessAllChannels

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




