require('dotenv').config();
const axios = require('axios');
const notifier = require('node-notifier');
const Preferences = require("preferences");
const path = require('node:path');
const { Epoch } = require("@jmac18/epoch");

// String
// notifier.notify('Message');

// Object
/*
notifier.notify({
  title: 'My notification',
  message: 'Hello, there!'
});
*/

if(process.env.API_KEY == undefined){
  console.log("Argument apikey is required (usage: --apikey=\"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX\" get your api key from https://pro.coinmarketcap.com/account)");
  return;
}


// https://coinmarketcap.com/api/documentation/v1/#operation/getV2ToolsPriceconversion
getConversionRate = async ({ from, to }) => {
  let response;
  try {
    response = await axios.get(
      `https://pro-api.coinmarketcap.com/v2/tools/price-conversion?convert=${to}&symbol=${from}&amount=1`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.API_KEY,
        },
      }
    );
  } catch(ex) {
    console.log(`1 ${from.padEnd(10)} = ${to}: error(${ex.message})`);
  }
  if (response) {
    // success
    const [ result ] = response.data.data;
    const rate = result.quote[to].price;
    return rate;
  }
}

const loadPrefs = () => new Preferences('com.rami-majdoub.crypto-alert',{}, {
  encrypt: false,
  file: path.join(path.dirname(process.cwd()), '.prefs'),
  format: 'yaml'
});

const overridePrefs = (prefs) => prefs.last_check = Epoch().days(0).hours(24 +1).ago;
const load = (prefs) => Epoch().days(0).hours(24).ago > Epoch(prefs.last_check || 0).now;
const save = (prefs) => prefs.last_check = Epoch().now;

async function main(){
	const prefs = loadPrefs();
	
	// overridePrefs(prefs);
	console.log(`date: ${Epoch().now}`);
	
	if( cooldown = false ){
		const canrun = load(prefs);
		if(!canrun) return;
	}
	
	// BAT > 3.5 GRT:BTC < 20000 USD
	const rate = await getConversionRate({ from: "BAT", to: "GRT" });
	if (rate >= 2.25){
		notifier.notify({
		  title: 'Crpto alert',
		  message: 'Conversion rate satisfied'
		});
		save(prefs);
	}
	console.log(`Rate: ${rate}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
