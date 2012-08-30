/*
Copyright 2012 Luis Fernando de Oliveira Leao.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Luis Leao (luisleao@gmail.com)
*/


var controller = (function(){

  console.log("DMX INICIALIZADO!");


  //var current_dimmer = null;

  var red = 0;
  var green = 0;
  var blue = 0;

  var btnOpen=document.querySelector(".open");
  var btnClose=document.querySelector(".close");
  var logArea=document.querySelector(".log");



  var btnRgbStatus=document.querySelector(".rgb_liga");



  //var btnApaga=document.querySelector(".apaga");






  
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

    if (!serial_lib.isConnected())
      dmx_open(function(){
        console.log("openned!");
        tudo.apaga();
        geral.acende();

      });

    initListeners();

  };

  var initListeners=function() {

    console.log("init listeners");


    var btns = document.querySelectorAll(".dimmers button");

    // define actions for dimmers
    for (var indice=0; indice<btns.length; indice++) {
      btns[indice].addEventListener("click", function(e){
        e.preventDefault();

        var current_dimmer = this.className.replace("active", "").trim();
        this.className = current_dimmer + " active";
        console.log(current_dimmer);

        var active_btns = document.querySelectorAll(".dimmers button.active");

        for (var idx2=0; idx2<active_btns.length; idx2++) {
          if (active_btns[idx2].className.replace("active", "").trim() != current_dimmer) {
            active_btns[idx2].className = active_btns[idx2].className.replace("active", "").trim();
          }
        }

      });
    }


    //define actions for serial buttons
    btnOpen.addEventListener("click", dmx_open);
    btnClose.addEventListener("click", dmx_close);


    //rgb status button
    btnRgbStatus.addEventListener("click", function(e){
      e.preventDefault();

      var status = this.className.replace("active", "").trim();

      if (/active/i.test(this.className)) {
        this.className = status;
        geral.apaga();
      } else {
        this.className = status + " active";
        geral.acende();
      }



    });
    

    addEventToElements("change", "input[type='range']", function(e, c) {
        this.nextSibling.textContent=this.value;

        if (this.className == "gray") {
          dmx.setBrightnessAllChannels(dmx_map[this.id], this.value);


        } else {

          switch(this.className) {
            case "r": red = this.value; break;
            case "g": green = this.value; break;
            case "b": blue = this.value; break;
          }

          geral.setColor(red, green, blue);

          var cor = decimalToHex(red, 2) + decimalToHex(green, 2) + decimalToHex(blue, 2);
          document.querySelector("#sample").style.backgroundColor = "#" + cor;

        }


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



