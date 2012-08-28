

/*
//SAMPLE:

dmx.openSerial("/dev/tty.usbmodem1421", 28800, function(){
  dmx.setBrightness(255);
  dmx.setColor(255, 0, 0);
});

dmx.closeSerial();

*/





//const SENSOR_REFRESH_INTERVAL=200;

var serialPort = null;
var red = 0;
var green = 0;
var blue = 0;

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

    //btnOpen.addEventListener("click", openSerial);
    btnClose.addEventListener("click", closeSerial);
    document.querySelector(".refresh").addEventListener("click", refreshPorts);
    initListeners();
    //refreshPorts();

  };

  var initListeners=function() {

    console.log("init listeners");

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


  //init();


})();











var dmx = (function() {

  var close_callback = null;
  var open_callback = null;
  var read_callback = null;
  
  var init=function() {
    if (!serial_lib) throw "You must include serial.js before";
  };

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

  var setBrightness = function(value) {
    if (value > 255 || value < 0) value = 0;
    writeSerial(getChannel(0) + "c" + value + "w\n");
  }





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
    "setColor": setColor,
    "setBrightness": setBrightness,
    "openSerial": openSerial,
    "closeSerial": closeSerial,
    "onOpen": open_callback,
    "onClose": close_callback,
    "onRead": read_callback,
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




