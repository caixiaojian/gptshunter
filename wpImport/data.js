(async () => {
  const fs = require('fs-extra');
  const path = require('path');
  const moment = require('moment')
  const Parser = require('json2csv').Parser;
  const { XMLParser, XMLBuilder } = require('fast-xml-parser');
  const currentDate = moment().format('YYYY-MM-DD');

  const filePath = path.join(process.cwd()+'/wpImport', `data-hx-${currentDate}.json`);
  const arr = await fs.readJson(filePath);
  let jsonArray = arr.reduce((accumulator, current) => {
    // 查找累加器数组中是否已经有当前元素的id
    if (!accumulator.some(item => item.id === current.id)) {
      // 如果没有找到，就将当前元素添加到累加器数组中
      accumulator.push(current);
    }
    // 返回累加器数组作为下一次迭代的结果
    return accumulator;
  }, []); // 初始累加器为空数组

  // 指定每个XML文件的最大记录数
  // const maxRecordsPerFile = 2000;
  const maxRecordsPerFile = 6000;
  // sub_category的翻译映射
  const subCategoryTranslations = {
    productivity: '生产力助手',
    'language learning': '语言学习',
    'startup tools': '创业工具',
    'general writing': '通用写作',
    'developer tools': '开发人员工具',
    'customer support': '客户支持',
    'code assistant': '代码助手',
    finance: '金融助手',
    'education assistant': '教育助手',
    'writing assistant': '写作助手',
    healthcare: '医疗',
    'text to speech': '文本转语音',
    sales: '销售助手',
    marketing: '营销助手'
  };
  // imgs文件夹的路径
  const imgsFolderPath = `./wpImport/${currentDate}`;

  // 读取imgs文件夹下的所有文件
  const imgsFiles = fs.readdirSync(imgsFolderPath);
  console.log('imgsFiles文件个数' , imgsFiles.length)
  // 检查字符串是否只包含中文字符的函数
  function containsChinese(text) {
    return /[\u4e00-\u9fff]/.test(text);
  }

  // 检查字符串是否包含日文字符的函数
  function containsJapanese(text) {
    return /[\u3040-\u30ff\u31f0-\u31ff]/.test(text);
  }
  // 处理jsonArray中的每个对象
  jsonArray = jsonArray.map((item, index) => {
    // 如果sub_category不存在或为空，则根据位置和desc字段填充“精选”、“中文”或“最新”
    if (!item.sub_category || item.sub_category.trim() === '') {
      if (index < 20) {
        item.sub_category = '精选';
      } else if (item.desc && containsJapanese(item.desc)) {
        item.sub_category = '日文';
      } else if (
        item.desc &&
        containsChinese(item.desc) &&
        !containsJapanese(item.desc)
      ) {
        item.sub_category = '中文';
      } else {
        item.sub_category = '最新';
      }
    } else {
      // 将sub_category的值转换为小写，并查找对应的翻译
      const lowerCaseSubCategory = item.sub_category.toLowerCase();
      if (subCategoryTranslations[lowerCaseSubCategory]) {
        item.sub_category = subCategoryTranslations[lowerCaseSubCategory];
      }
    }

    // 处理logo字段
    if (item.logo) {
      const matches = item.logo.match(
        /https:\/\/files\.oaiusercontent\.com\/([^?]+)/
      );
      const logo = matches ? matches[1] : '';
      const logoFile = imgsFiles.find(file => file.startsWith(logo));
      if (logoFile) {
        // 如果找到文件，更新logo字段为文件名
        item.logo = logoFile;
      } else {
        item.logo = logo + '.png';
      }
    } else {
      item.logo = '';
    }

    // 处理detail对象中的prop字段
    if (item.detail && item.detail.prop) {
      // 分割prop字段的值为数组，并映射为对象数组
      item.detail.prop = {
        propItem: item.detail.prop
          .split(',')
          .map(propValue => propValue.trim()),
      };
    } else if (item.detail) {
      item.detail.prop = { propItem: [] };
    }

    // 处理detail对象中的fileInfo字段
    if (item.detail && item.detail.fileInfo) {
      // 分割fileInfo字段的值为数组，并映射为对象数组
      item.detail.fileInfo = {
        fileItem: item.detail.fileInfo.split(',').map(fileValue => {
          // 可能需要进一步处理，例如去除文件大小信息等
          return fileValue.trim();
        }),
      };
    } else if (item.detail) {
      item.detail.fileInfo = { fileItem: [] };
    }
    return item;
  });

  // 创建一个XMLBuilder实例
  const builder = new XMLBuilder({
    format: true, // 格式化输出
    ignoreAttributes: false, // 不忽略属性
    suppressEmptyNode: true, // 空节点不输出
  });

  // 分割JSON数组并写入多个XML文件
  for (let i = 0; i < jsonArray.length; i += maxRecordsPerFile) {
    // 获取子数组
    const subArray = jsonArray.slice(i, i + maxRecordsPerFile);

    // 构建XML对象
    const xmlObject = {
      items: {
        item: subArray,
      },
    };

    // 将对象转换为XML
    const xmlContent = builder.build(xmlObject);

    // 生成文件名
    // const fileName = `data_2000_${Math.floor(i / maxRecordsPerFile) + 1}.xml`;
    const fileName = `data_${currentDate}.xml`;

    // 将XML写入文件
    fs.writeFileSync(fileName, xmlContent);
    console.log(`The XML file ${fileName} has been saved!`);
  }
})();
