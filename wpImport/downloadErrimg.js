(async () => {
  const axios = require('axios');
  const fs = require('fs-extra');
  const path = require('path');
  // 确保imgs文件夹存在
  const imgsDir = path.join(__dirname, 'imgs');
  if (!fs.existsSync(imgsDir)) {
    fs.mkdirSync(imgsDir);
  }

  const data = fs.readFileSync('error.txt', 'utf8');
  // 分割字符串获取URL数组
  const urls = data.split(',');

  // 下载图片函数
  async function downloadImage(url, retries = 3) {
    // 使用正则表达式提取URL中最后一个'/'和第一个'?'之间的部分作为文件名
    const regex = /\/([^\/?]+)\?/;
    const matches = url.match(regex);
    let fileName = matches ? `${matches[1]}` : 'image';

    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer',
      });

      // 获取文件类型
      let extension = '';
      const contentType = response.headers['content-type'];
      if (contentType) {
        if (contentType.includes('image/jpeg')) {
          extension = '.jpg';
        } else if (contentType.includes('image/png')) {
          extension = '.png';
        } else if (contentType.includes('image/gif')) {
          extension = '.gif';
        } else if (contentType.includes('image/webp')) {
          extension = '.webp';
        } else if (contentType.includes('image/bmp')) {
          extension = '.bmp';
        } else if (contentType.includes('image/svg+xml')) {
          extension = '.svg';
        } else {
          // 如果需要，可以添加更多的文件类型判断
          console.error('Unsupported content type:', contentType);
          return;
        }
      }

      // 如果URL中没有文件扩展名，使用从Content-Type中确定的扩展名
      if (!fileName.includes('.')) {
        fileName += extension;
      }

      const filePath = path.join(imgsDir, fileName);
      const writer = fs.createWriteStream(filePath);

      writer.write(response.data);
      writer.end();

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      console.error(`Error downloading ${url}: `, error);
    }
  }

  // 顺序下载所有图片
  async function downloadAllImages() {
    console.log(urls.length);
    for (let i = 0; i < urls.length; i++) {
      await downloadImage(urls[i], i);
      console.log(`Downloaded ${i}: ${urls[i]}`);
    }
  }

  downloadAllImages().then(() => {
    console.log('All images have been downloaded.');
  });
})();
