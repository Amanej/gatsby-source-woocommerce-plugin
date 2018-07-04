const crypto = require("crypto");
const fetch = require("node-fetch");
const queryString = require("query-string");

exports.sourceNodes = (
    { boundActionCreators, createNodeId },
    configOptions
  ) => {
    const { createNode } = boundActionCreators;
  
    // Gatsby adds a configOption that's not needed for this plugin, delete it
    delete configOptions.plugins;

  // Convert the options object into a query string
  //const apiOptions = queryString.stringify(configOptions)
  const auth = queryString.stringify(configOptions.auth);

  console.log("configOptions");
  console.log(configOptions);

  const wcSiteUrl = configOptions.url;

  
  const apiUrl = `${wcSiteUrl}wp-json/wc/v1/products?${auth}`
    
  console.log(apiUrl);

  const processProduct = product => {
        const nodeId = createNodeId(`wc-product-${product.id}`);
        const nodeContent = JSON.stringify(product);
        const nodeContentDigest = crypto 
        .createHash('md5')
        .update(nodeContent)
        .digest('hex')


    const nodeData = Object.assign({}, product, {
        id: nodeId,
        parent: null, 
        children: [],
        internal: {
            type: 'Product',
            content: nodeContent,
            contentDigest: nodeContentDigest
        }
    })

    return nodeData
  }  
  
  return (
      fetch(apiUrl)
        .then(response => response.json())
            .then(data => {
                data.forEach(product => {
                    console.log("Product data is: ", product);

                    const nodeData = processProduct(product);

                    createNode(nodeData);
                })
            })
  )

}