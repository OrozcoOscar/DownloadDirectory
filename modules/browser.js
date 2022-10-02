const pup=require("puppeteer")
class browser{
	constructor(h=true){
		this.browser;
		this.headless=h
	}
	async newPage(){
		this.browser=await pup.launch({
			headless: this.headless,
			args: ["--disable-setuid-sandbox"],
	        'ignoreHTTPSErrors': true
		})
		const page=await this.browser.newPage()
		return await page;
	}
	async close(){
		await this.browser.close()
	}
}
////////////////////////////////////////////
module.exports=browser
////////////////////////////////////////////
