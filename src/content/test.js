const json = require('./search.json')
const hits = json.hits.hits
const pages = 10
for (let [hIndex, hitItem] of hits.entries()) {
  const columns = hitItem.columns;
  //循环columns
  for (let [cIndex,columnItem] of columns.entries()) {
    const categories = columnItem.categories;
    
    if (categories) {
      //循环categories
      for (let [cateIndex , categoryItem] of categories.entries()) {
        const url = categoryItem.url;
        const subCate = categoryItem.categories;
        const title = categoryItem.title;
        for (let i = 0; i < pages; i++) {
          
        }
        if (subCate) {
          //循环categories的categories
          for (let [subCtIndex,subCateItem] of subCate.entries()) {
            const subUrl = subCateItem.url;
            if(subUrl == '/category/antivozrastnoy-uhod-38000/'){
              for (let k = 0; k < pages; k++){
                if(k== 9){
                  let a ={
                    subCatePageIndex:k,
                    subCateIndex:subCtIndex,
                    categoryPageIndex :10 ,
                    categoryIndex:cateIndex,
                    columnIndex:cIndex,
                    hitIndex : hIndex
                  }
                  console.log(a)
                }
              }
            }
            
          }
        }
      }
    }
  }
}