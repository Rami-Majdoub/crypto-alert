require('dotenv').config();
const axios = require('axios');
const notifier = require('node-notifier');
const Preferences = require("preferences");
const path = require('node:path');
const { Epoch } = require("@jmac18/epoch");

const args = require('minimist')(process.argv.slice(2));
const { snooze, requests, noSnooze } = args;

const startTime = Epoch().now;

const snoozeSplit = snooze?.split(":");
const snoozeD = snoozeSplit?.[0] || 1;
const snoozeH = snoozeSplit?.[1] || 0;
const snoozeM = snoozeSplit?.[2] || 0;

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
  encrypt: false
});

const isSnoozed = (prefs) => Epoch().days(snoozeD).hours(snoozeH).minutes(snoozeM).ago < Epoch(prefs.last_check || 0).now;
const save = (prefs) => prefs.last_check = startTime || Epoch().now;

const showAlert= (request) => {
	notifier.notify({
	  title: 'Crpto alert | Conversion rate satisfied',
	  message: request
	});
}

const prefs = loadPrefs();
console.log(`date: ${Epoch().now}`);

if(!noSnooze){
	const canrun = !isSnoozed(prefs);
	if(!canrun) return;
}

const check = async (request) => {
	const [from, operator, amount, to] = request.split(" ");
	
	const rate = await getConversionRate({ from, to });
	console.log({ request, rate });
	if (
		operator == ">" && rate > amount
		|| operator == "<" && rate < amount
	){
		showAlert(request);
		if(!noSnooze){
			save(prefs);
		}
	}
}

(async () => {
	requests.replaceAll(", ", ",").split(",").forEach(async request => await check(request))
})();
