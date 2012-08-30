

var controller = (function(){

  console.log("DMX INICIALIZADO!");


  var red = 0;
  var green = 0;
  var blue = 0;

  var btnOpen=document.querySelector(".open");
  var btnClose=document.querySelector(".close");
  var logArea=document.querySelector(".log");

  var btnAcende=document.querySelector(".acende");
  var btnApaga=document.querySelector(".apaga");

  
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


    dmx_open();
    geral.acende();

    initListeners();

  };

  var initListeners=function() {

    console.log("init listeners");

    btnOpen.addEventListener("click", dmx_open);
    btnClose.addEventListener("click", dmx_close);

    btnAcende.addEventListener("click", geral.acende);
    btnApaga.addEventListener("click", geral.apaga);

    //document.querySelector(".refresh").addEventListener("click", refreshPorts);

    addEventToElements("change", "input[type='range']", function(e, c) {
        this.nextSibling.textContent=this.value;

        switch(this.className) {
          case "r": red = this.value; break;
          case "g": green = this.value; break;
          case "b": blue = this.value; break;
        }

        geral.setColor(red, green, blue);

        var cor = decimalToHex(red, 2) + decimalToHex(green, 2) + decimalToHex(blue, 2);
        document.querySelector("#sample").style.backgroundColor = "#" + cor;

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

  

  //TODO: descomentar para funcionar ilumiChrome
  init();

})();



