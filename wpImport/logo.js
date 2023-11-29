(async () => {
  const fs = require('fs-extra');
  const path = require('path');
  const Parser = require('json2csv').Parser;
  const xml2js = require('xml2js');

  const filePath = path.join(process.cwd(), 'data.json');
  const jsonArray = await fs.readJson(filePath);
  const uniqueJsonArray = jsonArray.reduce((accumulator, current) => {
    // 查找累加器数组中是否已经有当前元素的id
    if (!accumulator.some(item => item.id === current.id)) {
      // 如果没有找到，就将当前元素添加到累加器数组中
      accumulator.push(current);
    }
    // 返回累加器数组作为下一次迭代的结果
    return accumulator;
  }, []); // 初始累加器为空数组

  console.log(uniqueJsonArray.length);
  // 提取所有logo字段

  // 创建XML构建器
  const builder = new xml2js.Builder();

  // 每500个logo生成一个XML文件
  const chunkSize = 500;
  for (let i = 0; i < uniqueJsonArray.length; i += chunkSize) {
    // 获取当前chunk的logo数组
    const currentChunk = jsonArray.slice(i, i + chunkSize);

    // 将当前chunk的所有logo用逗号分隔
    const logosString = currentChunk.map(item => item.logo).join(',');

    // 创建product对象
    const product = {
      product: {
        id: [i / chunkSize + 1],
        logos: [logosString],
      },
    };

    // 生成XML
    const xml = builder.buildObject(product);

    // 写入XML文件
    fs.writeFile(
      `product_${i / chunkSize + 1}.xml`,
      xml,
      { encoding: 'utf8' },
      err => {
        if (err) throw err;
        console.log(
          `The XML file product_${i / chunkSize + 1}.xml has been saved!`
        );
      }
    );
  }
})();
