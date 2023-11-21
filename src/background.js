chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.greeting === "Hello from popup!") {
    // 在这里执行您的响应操作
    console.log("Received message from popup.js:", request);
    // 作出响应（可选）
    const responseMessage = "Message received in background.js";
    sendResponse({greeting : responseMessage})
  }
});