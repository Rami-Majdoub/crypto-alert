require('dotenv').config();
const axios = require('axios');
const notifier = require('node-notifier');
const Preferences = require("preferences");
const path = require('node:path');
const { Epoch } = require("@jmac18/epoch");

const { requests, dev } = require('minimist')(process.argv.slice(2));

const getConversionRate = async ({ from, to }) => {
  let response;
  try {
    response = await axios.get(`https://api.coingecko.com/api/v3/coins/${from.toLowerCase()}`);
  } catch(ex) {
    console.log(`1 ${from.padEnd(10)} = ${to.toUpperCase()}: error(${ex.message})`);
  }
  if (response) {
    // success
    const resNameTo = to.toUpperCase();
    const resNameFrom = response.data.symbol.toUpperCase();
    const resPrice = response.data.market_data.current_price[to.toLowerCase()];
    
    const rate = resPrice;
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

const showAlert= (request) => {
	notifier.notify({
	  title: 'Crpto alert (Conversion rate satisfied)',
	  message: request
	});
}

const prefs = loadPrefs();
console.log(`date: ${Epoch().now}`);

if(!dev){
	const canrun = load(prefs);
	if(!canrun) return;
}

const check = async (request) => {
	const [from, operator, amount, to] = request.split(" ");
	
	const rate = await getConversionRate({ from, to });
	console.log({ from, to, rate });
	if (
		operator == ">" && rate > amount
		|| operator == "<" && rate < amount
	){
		showAlert(request);
		if(!dev){
			save(prefs);
		}
	}
	console.log(`Rate: ${rate}`);
}

(async () => {
	requests.replaceAll(", ", ",").split(",").forEach(async request => await check(request))
})();
