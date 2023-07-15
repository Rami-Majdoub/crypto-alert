## installation

	npm install -g crypto-alert

## usage examples

	crypto-alert --requests="<API id> ("<" or ">") <amount> <currency>"
	
### default snooze
show alert if last requset was shown 1 day ago (default snooze period)

	crypto-alert --requests="bitcoin > 30000 usd"
	
### no snooze
show alert and ignore snooze

	crypto-alert --requests="ethereum > 2000 usd, bitcoin > 30000 usd" --noSnooze

### snooze
show alert if last requset was shown 4 hours ago (--snooze "\<days\>:\<hours\>:\<minutes\>")

	crypto-alert --requests="ethereum < 1500 usd, bitcoin > 30000 usd" --snooze "0:4:0"


[List of supported currencies](https://api.coingecko.com/api/v3/simple/supported_vs_currencies)
