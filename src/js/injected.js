/**
 * 对页面进行接口拦截，从而获得页面接口请求后返回的响应数据
 * @type {{originalFetch: any, myFetch: (function(...[*]): *)}}
 */
try {
    let fetch_interceptor = {
        originalFetch: window.fetch.bind(window),
        myFetch: function (...args) {
            return fetch_interceptor.originalFetch(...args).then((response) => {
                if (response.ok) {
                    let fetchResponse = response.clone();
                    fetchResponse.json().then(function (fetchData) {
                        fetchData.request = args;
                        this.sendData(fetchData)
                    }).catch(e => {
                    })
                }
                return response;
            })
        }
    };
    window.fetch = fetch_interceptor.myFetch;
    (function (open) {
        XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
            this.addEventListener('readystatechange', function () {
                if (this.readyState == 4 && this.response) {
                    try {
                        let ajaxData = JSON.parse(this.response);
                        ajaxData.request = {url: url, method: method};
                        sendData(ajaxData)
                    } catch (e) {
                    }
                }
            }, false);
            open.call(this, method, url, async, user, pass)
        }
    })(XMLHttpRequest.prototype.open);

}catch (e) {
    
}
function sendData(data) {
    console.log('=================')
    console.log(data)
    var requsetData = JSON.stringify({code: 'DCODE_01', data: data});
    window.postMessage(requsetData, '*')
};