/**
 * 说明：
 *      utils.js文件属于一个工具类
 *      实现了将injected.js脚本注入到页面上， 进行页面接口请求拦截，实现拦截到接口请求后的参数
 * @type {HTMLScriptElement}
 */
var s = document.createElement('script');
s.src = chrome.runtime.getURL('src/js/injected.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

var s = document.createElement('script');
s.src = chrome.runtime.getURL('src/js/jquery-1.8.3.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

/**
 * 监听injected.js脚本拦截的接口后发送过来的内容
 */
let _this = this;
window.addEventListener('message', function (e) {
    function handler(url, resultData) {
      // if(url.includes('_action/v2/categoryChildV3')){
      //   const options = {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify(resultData.data)
      //   };
      //   fetch('http://127.0.0.1:7001/category', options)
      //   .then(res => res.json())
      //   .then(json => {
      //     console.log(json);
      //   });
      // }
    }
    try {
        if (JSON.parse(event.data).code == 'DCODE_01') {
            // 通过不同接口请求进行参数分发
            handler(JSON.parse(event.data).data.request[0],JSON.parse(event.data))
        }
    } catch (e) {
        e.toString()
    }
}, false);




