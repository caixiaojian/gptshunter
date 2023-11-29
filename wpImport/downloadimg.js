(async () => {
  const axios = require('axios');
  const fs = require('fs-extra');
  const path = require('path');
  // 确保imgs文件夹存在
  const imgsDir = path.join(__dirname, 'imgs');
  if (!fs.existsSync(imgsDir)) {
    fs.mkdirSync(imgsDir);
  }

  const filePath = path.join(process.cwd(), 'data.json');
  const jsonArray = await fs.readJson(filePath);

  // 错误日志文件路径
  const errorLogPath = path.join(__dirname, 'error.txt');

  // 记录错误URL到文件
  function logError(url) {
    fs.appendFileSync(errorLogPath, `${url},\n`);
  }

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
          logError(url);
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
      logError(url); // 直接记录错误的URL
    }
  }

  // 顺序下载所有图片
  async function downloadAllImages() {
    for (let i = 5090; i < jsonArray.length; i++) {
      const logoUrl = jsonArray[i].logo;
      if (logoUrl) {
        await downloadImage(logoUrl, i);
        console.log(`Downloaded ${i}: ${logoUrl}`);
      }
    }
  }

  downloadAllImages().then(() => {
    console.log('All images have been downloaded.');
  });
})();
