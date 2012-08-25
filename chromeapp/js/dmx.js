



//const SENSOR_REFRESH_INTERVAL=200;

var serialPort = null;
var red = 0;
var green = 0;
var blue = 0;

var bitrate = 9600; //57600;
var modo = "arduino"; //arduino|xbee



(function() {
  

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

    if (!serial_lib) throw "You must include serial.js before";

    btnOpen.addEventListener("click", openSerial);
    btnClose.addEventListener("click", closeSerial);
    document.querySelector(".refresh").addEventListener("click", refreshPorts);
    initListeners();
    refreshPorts();
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

        var cor = decimalToHex(red, 2) + decimalToHex(green, 2) + decimalToHex(blue, 2);
        document.querySelector("#sample").style.backgroundColor = "#" + cor;

        var comando = "";
        switch(this.className) {
          case "r": comando += "2c"; break;
          case "g": comando += "3c"; break;
          case "b": comando += "4c"; break;
        }
        comando += this.value + "w\n";

        switch(modo) {
          case "arduino": writeSerial(comando); break;
          case "xbee": writeSerial(cor); break;
        }
    });
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

  var flipState=function(deviceLocated) {
    btnOpen.disabled=!deviceLocated;
    btnClose.disabled=deviceLocated;
  };
  
  var refreshPorts=function() {

    serial_lib.getPorts(function(items) {
      logSuccess("got "+items.length+" ports");
      for (var i=0; i<items.length; i++) {
         if (/usb/i.test(items[i]) && /tty/i.test(items[i])) {
           serialPort = items[i];
           logSuccess("auto-selected "+items[i]);
           //connect
           openSerial();
           return;
         }
      }
    });
  };
  
  var openSerial=function() {
    if (!serialPort) {
      logError("Invalid serialPort");
      return;
    }
    flipState(true);
    serial_lib.openSerial(serialPort, bitrate, onOpen);
  };
  
  var onOpen=function(cInfo) {
    logSuccess("Device found (connectionId="+cInfo.connectionId+")");
    flipState(false);
    serial_lib.startListening(onRead);

    if (modo == "arduino") {
      writeSerial("1c255w");
      writeSerial("2c0w");
      writeSerial("3c0w");
      writeSerial("4c0w");
    }



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
    

    if (readData.indexOf("log:")>=0) {
      return;
    }


  }


  var closeSerial=function() {
   serial_lib.closeSerial(onClose);
  };
  
  var onClose = function(result) {
   flipState(true);
  }
  
  
  init();
})();



function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

