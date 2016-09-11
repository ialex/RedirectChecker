"use strict";

var userAgents = require('./userAgents');
var system = require('system');
// var myurl="http://localhost:8000/";
var myurl = system.args[1];
var page;
var config = {
  apiKey: "AIzaSyDw8wl156Gd4IH9KB4WDoKU3qlKZO7-WBc",
  authDomain: "redirector-2a991.firebaseapp.com",
  databaseURL: "https://redirector-2a991.firebaseio.com",
  storageBucket: "redirector-2a991.appspot.com",
};
var spawn = require('child_process').spawn;

function getRandom(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
var agentRand = getRandom(0, 248);
var agent = userAgents[agentRand];
// var myurl = urls[getRandom(0,24)];
console.log('visiting: ', myurl);
console.log('ua: ', JSON.stringify(agent));
var renderPage = function (url, userAgent, size) {
  page = require('webpage').create();
  page.viewportSize = {
    width: agent.width,
    height: agent.height
  };

  page.settings.userAgent = agent.agent;

  page.onNavigationRequested = function(url, type, willNavigate, main) {
    if (main && url != myurl) {
      console.log("redirect caught to", url);
      var html = page.evaluate(function() {
        return document.body.innerHTML;
      });
      // console.log('getting iframes');
      var iframes = page.evaluate(function() {
        frames = document.getElementsByTagName("iframe");
        var results = [];
        for (i = 0; i < frames.length; ++i)
        {
          results.push(frames[i].contentDocument.documentElement.innerHTML);
        }
        return results;
      });
      // console.log(iframes);
      var data = {
        site: 'refugeforums.com',
        frames: iframes,
        redirectTo: url,
        url: myurl,
        pageHtml: html
      };
      // var child = spawn("curl", ["-X", "POST", "-d", "{}", "http://localhost:8000/post"]);
      var child = spawn("curl", ["-X", "POST", "-d", JSON.stringify(data), config.databaseURL + '/redirects.json']);

      // child.stdout.on("data", function (data) {
      //   console.log("spawnSTDOUT:", JSON.stringify(data))
      // })

      // child.stderr.on("data", function (data) {
      //   console.log("spawnSTDERR:", JSON.stringify(data))
      // })

      // child.on("exit", function (code) {
      //   console.log("spawnEXIT:", code)
      // })
      page.close();
    }
  };

  page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
      msgStack.push('TRACE:');
      trace.forEach(function(t) {
        msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
      });
    }
    console.error(msgStack.join('\n'));
  };

  page.open(url, function(status) {

    if (status === "success") {
      console.log("page success");
      //sleep(5000);
      setTimeout(function(){
        phantom.exit();
      }, 10000)

    } else {
      console.log('status: ', status);
      phantom.exit(1);
    }
  });
}

renderPage(myurl);

