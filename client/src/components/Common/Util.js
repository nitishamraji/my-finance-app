import LZString from 'lz-string';

export const COMMON_UTIL = {
  getSupportedStocksJson: async () => {
    var supportedStocksData = [];
    try {
      let supportedStocksDataSessionStorage = localStorage.getItem('supportedStocks');
      if( supportedStocksDataSessionStorage ) {
        supportedStocksDataSessionStorage = LZString.decompress(supportedStocksDataSessionStorage);
      }
      if( !supportedStocksDataSessionStorage || supportedStocksDataSessionStorage.length < 3000 ) {
        const res = await fetch('/api/getSupportedStocks');
        const supportedStocksJson = await res.json();
        localStorage.setItem( "supportedStocks", LZString.compress(JSON.stringify(supportedStocksJson.data)) );
        supportedStocksData = supportedStocksJson.data;
      } else {
        supportedStocksData = JSON.parse(supportedStocksDataSessionStorage);
      }
    } catch (error) {
      console.log(error);
    }
    return supportedStocksData;
  },
}
