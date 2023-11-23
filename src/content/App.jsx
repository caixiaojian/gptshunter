import React, { useState ,useEffect,useRef } from 'react'
import json from './search.json'
import $ from 'jquery'


const App = () => {
  const [cate, setCate] = useState('开始爬取')
  const [esid, setEsid] = useState('')
  const [message, setMessage] = useState('')
  const [bmessage, setBmessage] = useState('')
  

  const isFirstRender = useRef(true);

  const waitRandomTime = (min ,max)=>{
    const randomTime = Math.floor(Math.random() * (max - min + 1) + min) // 生成随机等待时间
    return new Promise((resolve) => setTimeout(resolve, randomTime))
  }
  const pages = 50
  let spiderArr = []
  const hits = json.urls
  let idIndex = localStorage.getItem('idIndex') || 0
 
  const clearLocalStorageExcept = (exceptions)=> {
    // exceptions should be an array of keys that you don't want to remove
    for (let i = 0; i < localStorage.length; i++){
        let key = localStorage.key(i);
        if (!exceptions.includes(key)) {
            localStorage.removeItem(key);
            i--; // decrement the counter as the key index shifts after removal
        }
    }
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // 修改标记，以便下次渲染时不再进入这个分支
      (async ()=>{
        let idIndex = localStorage.getItem('idIndex')
        console.log('当前位置',idIndex)
      })()
    } 
  }, []);

  const saveToEs = async (text ,title ,url ,isBrand)=>{
    try {
      let options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: null
      };
      let products = $(text).find('div[id^="state-searchResultsV2-"][id$="default-1"]').data("state")
      console.log('保存的products===',products)
      if(!products){
        throw new Error('获取产品失败')
      }
      let body = {
        products,
        title,
        url
      }
      let esRest = await fetch(isBrand ? 'http://127.0.0.1:7001/product-brand': 'http://127.0.0.1:7001/product', {...options , body:JSON.stringify(body)})
      return await esRest.json()
    } catch (error) {
      throw new Error(error)
    }
  }

  for (let [hIndex, hitItem] of hits.entries()) {
    for (let i = 0; i < pages; i++) {
      let suffix = `${hitItem.url}&page=${i+1}`
      spiderArr.push(suffix)
    }
  }

  console.log(spiderArr.length)

  let csvArr = []
  const getColumn = async ()=>{
    setCate('开始抓取。。。')
    setMessage('')
    let index = localStorage.getItem('idIndex') || 0
    try {
      for (let [spiderIndex, spiderItem] of spiderArr.entries()) {
        if(spiderIndex < index) continue
        sessionStorage.clear()
        clearLocalStorageExcept(['idIndex' , 'idIndexUrl','detailIndex','detailUrl'])
        localStorage.setItem('idIndex' , spiderIndex)
        localStorage.setItem('idIndexUrl' , spiderItem)

        const res = await fetch(spiderItem);
        if(res.status != '200' ){
          throw new Error(`获取${spiderItem}出错`)
        }
        let resText = await res.json();
        let products = resText.length

        if(!products){
          console.log('没有gpt产品,跳过')
          continue
        }
        let detailIndex = localStorage.getItem('detailIndex') || 0

        for (let [index, item] of resText.entries()){
          if(index < detailIndex) continue
          if(!item.id) continue

          localStorage.setItem('detailIndex' , index)
          localStorage.setItem('detailUrl' , `/gpt-store/${item.id}`)

          const detailRes = await fetch(`/gpt-store/${item.id}`)
          let detailResText = await detailRes.text();
          let desc = $(detailResText).find("h2").filter(function() {
            return $(this).text().trim() === "Description"
          }).next().text();
          let welcome = $(detailResText).find("h2").filter(function() {
            return $(this).text().trim() === "Welcome Message"
          }).next().text();
          let prop = $(detailResText).find("h2").filter(function() {
            return $(this).text().trim() === "Prompt Starters";
          }).next().find('li').map(function() {
            return $(this).text().trim();
          }).get().join(',')
          let gptlink = $(detailResText).find('div.mt-3 a').attr('href')
          
          let fileInfo,cleanOuterHTML
          if($(detailResText).find('div.space-y-2').length){
            fileInfo = $(detailResText).find('div.space-y-2 > div').map(function() {
              // 获取每个子div中的文件名和文件大小
              var fileName = $(this).find('div.truncate').text().trim();
              var fileSize = $(this).find('div.shrink-0').text().trim();
              // 返回格式化后的字符串
              return fileName + '|' + fileSize;
            }).get().join(',')
            let fileInfoOuterHTML = $(detailResText).find('div.space-y-2 > div').get(0).outerHTML;
            // 使用正则表达式移除HTML注释
            cleanOuterHTML = fileInfoOuterHTML.replace(/<!--[\s\S]*?-->/g, '');
          }
          item['detail']={
            desc,welcome,prop,gptlink,
            ...(fileInfo ? { fileInfo: fileInfo } : {}),
            ...(cleanOuterHTML ? { cleanOuterHTML: cleanOuterHTML } : {})
          }
          csvArr.push(item)
          await waitRandomTime(3000,4000)
        }
        console.log('fetch success,save to esing....')
        // const esResult = await saveToEs(resText,spiderItem.title,spiderItem.suffix)
        // if(esResult.code !='0000'){
        //   throw new Error('保存es出错')
        // }
        
        // console.log(esResult)
        console.log('等待中。。。');
        await waitRandomTime(3000,4000)

      }
      console.log("抓取完毕，哈哈。。")
      let r=confirm("set idIndex 0?");
      if (r==true){
        clearLocalStorageExcept(['idIndex' , 'idIndexUrl' , 'brandIndex' , 'brandUrl'])
        sessionStorage.clear()
        localStorage.setItem('idIndex',0)
      }
    } catch (error) {
      setCate('出错了')
      let timout = setTimeout(()=>{
        clearTimeout(timout)
        setMessage('十秒后重试')
        getColumn()
      },10000)
      console.log(error)
    }
  }
  
  return (
    <div className="root">
      <button onClick={getColumn}>{cate}</button>
      <div id="columnState">{message}</div>
      <div id="brandState">{bmessage}</div>
    </div>
  );
};

export default App;