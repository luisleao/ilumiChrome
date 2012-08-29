

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



