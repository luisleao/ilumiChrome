chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('comm.html', {frame: 'custom', height: 600, width: 800});
});

