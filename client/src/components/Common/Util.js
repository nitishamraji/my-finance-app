import LZString from 'lz-string';

export const COMMON_UTIL = {
  getSupportedStocksJson: async () => {
    let supportedStocksData = [];
    try {

      let needsUpdate = false

      if( !localStorage.getItem('supportedStocksLastUpdate') ) {
        needsUpdate = true
      }

      if( !needsUpdate ) {
        const res = await fetch('/api/getSupportedStocksLastUpdate')
        const supportedStocksLastUpdateJson = await res.json()
        const serverlastUpdated = supportedStocksLastUpdateJson.data
        const localLastUpdate = localStorage.getItem('supportedStocksLastUpdate')

        if( Date.parse(localLastUpdate) < Date.parse(serverlastUpdated) ) {
          needsUpdate = true
        }
      }

      if( needsUpdate ) {
        console.log('needsUpdate true')
        const res = await fetch('/api/getSupportedStocks');
        const supportedStocksJson = await res.json();
        localStorage.setItem( "supportedStocks", LZString.compress(JSON.stringify(supportedStocksJson.data.data)) )
        localStorage.setItem( "supportedStocksLastUpdate", supportedStocksJson.data.updatedAt )
      } else {
        console.log('needsUpdate false')
      }

      supportedStocksData = JSON.parse(LZString.decompress(localStorage.getItem('supportedStocks')))

      // let supportedStocksDataSessionStorage = localStorage.getItem('supportedStocks')
      // if( supportedStocksDataSessionStorage ) {
      //   supportedStocksDataSessionStorage = LZString.decompress(supportedStocksDataSessionStorage);
      // }
      // if( !supportedStocksDataSessionStorage || supportedStocksDataSessionStorage.length < 3000 ) {
      //
      // } else {
      //   supportedStocksData = JSON.parse(supportedStocksDataSessionStorage);
      // }
    } catch (error) {
      console.log(error);
    }
    return supportedStocksData;
  },
}
