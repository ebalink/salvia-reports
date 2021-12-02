QW_Result = function(){
	this.url = "";
	this.date = "";
	this.filename = "";
	// Map of TestResult objects
	this.testresults = new Map();
}

/**
 * return the test keys for all tests that have any other results than inapplicable
 */
QW_Result.prototype.getTestsWithResults = function() {
	let results = [];
	this.testresults.forEach( (value, key) => {
		if(value.count_passed > 0 || value.count_failed > 0 || value.count_warnings > 0 ){
			results.push(key);
		}
	})
	return results;

}

QW_Result.prototype.parseTests = function(data, filename){
	this.filename = filename;
	let pages = Object.keys(data);
	
	let longurl = pages[0];
	this.url = longurl.slice(8, longurl.length-1);
	this.url = this.url.slice(0, this.url.indexOf("/"));
	this.date = data[pages[0]]["system"].date;
	
	pages.forEach(url => {
		
		let tests = Object.keys(data[url].modules["act-rules"].assertions);
		tests.forEach( testkey => {
			let test = data[url].modules["act-rules"].assertions[testkey];
			let testresult = new TestResult();
			testresult.code = test.code;
			testresult.name = test.name;
			
			if(test.results.length == 0 ){
				testresult.addInapplicable();	
			}
			else {
				test.results.forEach( result => {
					testresult.addResult(result.verdict);
				})
			}
			if(this.testresults.get(testresult.code) === undefined){
				this.testresults.set(testresult.code, testresult);
			}
			else{
				this.testresults.get(testresult.code).merge(testresult);
			}
		})
	})
	
	// now we add the rates for every test
	this.testresults.forEach( test => {
		if(test.getRate() != undefined){
			test.rate_list.push(test.getRate());
		}
	})
}

TestResult = function(){
	this.code = "";
	this.name = "";
	//this.count_total = 0;
	this.count_passed = 0;
	this.count_warnings = 0;
	this.count_failed = 0;
	this.count_inapplicable = 0;
	
	// includes the rates from every test so we can get the median, mean, highest and lowest values
	this.rate_list = new Array();
	// number of sites that this test resulted other than inapplicable
	this.sites = 0;
}

TestResult.prototype.getRate_mean = function(){
	if(this.rate_list.length == 0){
		return undefined;
	}
	let total = 0;
	this.rate_list.forEach( rate => total += rate);
	return total / this.rate_list.length;
}

TestResult.prototype.getRate_median = function(){
	if(this.rate_list.length == 0){
		return undefined;
	}
	this.rate_list.sort();
	let med = 0;
	if(this.rate_list.length > 1){
		med = Math.round(this.rate_list.length / 2);
	}
	return this.rate_list[med];
}

TestResult.prototype.getRate_lowerQ = function(){
	if(this.rate_list.length == 0){
		return undefined;
	}
	this.rate_list.sort();
	let x = 0;
	if(this.rate_list.length > 1){
		x = Math.round(this.rate_list.length * 0.25);
	}
	return this.rate_list[x];
}

TestResult.prototype.getRate_upperQ = function(){
	if(this.rate_list.length == 0){
		return undefined;
	}
	this.rate_list.sort();
	let x = 0;
	if(this.rate_list.length > 1){
		x = Math.round(this.rate_list.length * 0.75 );
	}
	return this.rate_list[x];
}

TestResult.prototype.getRate_lowest = function(){
	if(this.rate_list.length == 0){
		return undefined;
	}
	let lowest = this.rate_list[0];
	this.rate_list.forEach( val => {
		if(val < lowest) {
			lowest = val;
		}
	})
	return lowest;
}

TestResult.prototype.getRate_highest = function(){
	if(this.rate_list.length == 0){
		return undefined;
	}
	let highest = this.rate_list[0];
	this.rate_list.forEach( val => {
		if(val > highest) {
			highest = val;
		}
	})
	return highest;
}


TestResult.prototype.getRate = function(){
	if(this.getTotal() == 0){
		return undefined;
	}
	return (((this.count_passed + this.count_warnings) / this.getTotal()));
}

TestResult.prototype.getRateForPrint = function(){
	if(this.getTotal() == 0){
		return " - ";
	}
	return (((this.count_passed + this.count_warnings) / this.getTotal()) * 100).toFixed(0) +" %";
}

TestResult.prototype.merge = function(newTestResult){
	if(!(newTestResult instanceof TestResult) ){
		throw new Error("newtestResult not an instance of TestResult", newTestResult);
	}
	if( this.code != newTestResult.code){
		throw new Error("test result codes don't match", this, newTestResult);
	}
	this.count_passed += newTestResult.count_passed;
	this.count_warnings += newTestResult.count_warnings;
	this.count_inapplicable += newTestResult.count_inapplicable;
	this.count_failed += newTestResult.count_failed;
	
	if(newTestResult.rate_list[0] != null){
		this.rate_list.push(newTestResult.rate_list[0]);
	}
}

TestResult.prototype.addResult = function(resultType){
	if(resultType.toLowerCase() == "passed"){
		this.addPassed();
	}
	else if(resultType.toLowerCase() == "failed"){
		this.addFailed();
	}
	else if(resultType.toLowerCase() == "warning"){
		this.addWarning();
	}
	else if(resultType.toLowerCase() == "inapplicable"){
		this.addInapplicable();
	}
}

TestResult.prototype.addPassed = function(){
	this.count_passed++;
}
TestResult.prototype.addWarning = function(){
	this.count_warnings++;
}
TestResult.prototype.addFailed = function(){
	this.count_failed++;
}
TestResult.prototype.addInapplicable = function(){
	this.count_inapplicable++;
}
TestResult.prototype.getTotal = function(){
	return this.count_passed + this.count_warnings + this.count_failed;
}
TestResult.prototype.getTotal_full = function(){
	return this.getTotal() + this.count_inapplicable;
}


Stats = function(){
	// Array of QW_Result objects
	this.tests = [];
	// Map of TestResult objects
	this.testresults = new Map(); // key: testcode, value: TestResult object
}

Stats.prototype.merge = function(other){
	other.tests.forEach( a => {
		this.tests.push(a);
		this.addResults(a.testresults);
	})
	console.log("Merge done. Stats now contain "+stats.getCount_reports()+" testreports, "
			+stats.getCount_testTypes()+" unique test types and " 
			+ stats.getCount_testCases() +" unique tests on element.");
	
}

/**
 * Browses through each test report stats and updates the test stat infos with number of sites this was successfully tested against
 */
Stats.prototype.updateSitesCount = function(){
	//initialize
	this.testresults.forEach(res => res.sites = 0 );
	
	// update
	this.tests.forEach(qw => {
		qw.getTestsWithResults().forEach(testkey => {
			this.testresults.get(testkey).sites++;
		})
	})
}

Stats.prototype.addQWResult = function(data){
	let qwresult = new QW_Result();
	qwresult.parseTests(data);
	this.tests.push(qwresult);
	this.addResults(qwresult.testresults);
}

Stats.prototype.addResults = function(results){
	if(!(results instanceof Map) ){
		throw new Error("results not an instance of Map", results);
	}
	results.forEach(value => this.addResult(value));
}

Stats.prototype.addResult = function(result){
	if(!(result instanceof TestResult) ){
		throw new Error("result not an instance of TestResult", result);
	}
	
	if(this.testresults.get(result.code) === undefined){
		this.testresults.set(result.code, result);
	}
	else{
		this.testresults.get(result.code).merge(result);
	}
}

Stats.prototype.getCount_reports = function(){
	return this.tests.length;
}

Stats.prototype.getCount_testTypes = function(){
	return this.testresults.size;
}

Stats.prototype.getCount_testCases = function(){
	let cases = 0;
	this.testresults.forEach(value => cases += value.getTotal_full());
	return cases;
}

Stats.prototype.getRates = function(median){
	let tests = new Array();
	
	this.testresults.forEach(value => {
		tests.push(value);
	});	
	if(median == true){
		tests.sort(sortByRates_median);
	}
	else{
		tests.sort(sortByRates);
	}
	
	let sorted = new Array();
	tests.forEach( value => {
		let rate = {
			"code" : value.code,
			"name" : value.name,
			"rate" : value.getRateForPrint(),
			"rate_mean" : value.getRate_mean(),
			"rate_median" : value.getRate_median(),
			"rate_highest" : value.getRate_highest(),
			"rate_lowest" : value.getRate_lowest(),
			"rate_lowerQ" : value.getRate_lowerQ(),
			"rate_upperQ" : value.getRate_upperQ(),
			"count": value.getTotal(),
			"sites": value.sites
			
		}
		sorted.push(rate);
	})
	return sorted;
}



Stats.prototype.printRates = function(){
	this.getRates().forEach(rate => {
		console.log("["+rate.rate +"], testi: "+rate.code +" /  \""+rate.name+"\"\n\tTestattuja elementtejä: "+rate.count+", joista ehdot täytti "+rate.rate+" elementeistä.\n\t"
			+ "Testatuista sivuista heikoimman tulos: "+getPercentage(rate.rate_lowest)+" ja parhaimman "+getPercentage(rate.rate_highest)+". Sivujen onnistumisen keskiarvo: "+getPercentage(rate.rate_mean)+
			" ja mediaani: "+getPercentage(rate.rate_median)+".");
	})
}

Stats.prototype.printRatesCSV = function(){
	
	this.updateSitesCount();
	let content = [];
	content.push(["test", "sites", "min", "lower", "median", "upper", "max", "mean"]);
	
	this.getRates().forEach(rate => {
		content.push([rate.code, rate.sites, getPercentage(rate.rate_lowest), getPercentage(rate.rate_lowerQ), getPercentage(rate.rate_median), getPercentage(rate.rate_upperQ), getPercentage(rate.rate_highest), getPercentage(rate.rate_mean) ]);
	})
	exportToCSV(content);
}

Stats.prototype.printRatesCSV2 = function(){
	this.updateSitesCount();
	let content = new Map();
	
	this.testresults.forEach( (value, key) => {
		content.set(key, new Array());
	})
	this.tests.forEach( qw => {
		qw.testresults.forEach( (value, key) => {
			content.get(key).push(value.getRate());
		})
	})
	
	// transform content to array
	let content_array = [];
	content.forEach( (value, key) => {
		let row = [];
		row.push(key);
		value.forEach( rate => row.push(rate));
		content_array.push(row);
		
		
	})
	exportToCSV(content_array);
}

function sortByRates( testA, testB ) {
	let a_total = testA.getTotal();
	let a_rate = testA.getRate();
	let b_total = testB.getTotal();
	let b_rate = testB.getRate();
	
	if(a_total== 0 && b_total > 0) {
		return 1;
	}
	else if(a_total > 0 && b_total == 0) {
		return -1;
	}
	else if(a_total == 0 && b_total == 0) {
		return testA.code.localeCompare(testB.code, undefined, {numeric: true});
	}
	else if(a_rate < b_rate){
		return -1;
	}
	else if(a_rate > b_rate){
		return 1;
	}
	else if(a_total > b_total){
		return -1;
	}
	else if(a_total < b_total){
		return 1;
	}
	return testA.code.localeCompare(testB.code, undefined, {numeric: true});
}

function sortByRates_median( testA, testB ) {
	let a_total = testA.getTotal();
	let a_rate = testA.getRate_median();
	let b_total = testB.getTotal();
	let b_rate = testB.getRate_median();
	
	if(a_total== 0 && b_total > 0) {
		return 1;
	}
	else if(a_total > 0 && b_total == 0) {
		return -1;
	}
	else if(a_total == 0 && b_total == 0) {
		return testA.code.localeCompare(testB.code, undefined, {numeric: true});
	}
	else if(a_rate < b_rate){
		return -1;
	}
	else if(a_rate > b_rate){
		return 1;
	}
	else if(a_total > b_total){
		return -1;
	}
	else if(a_total < b_total){
		return 1;
	}
	return testA.code.localeCompare(testB.code, undefined, {numeric: true});
}

function getPercentage(value){
	if(!(typeof value === 'number') || !isFinite(value)){
		return " - ";
	}
	return (value * 100).toFixed(0) +" %";
}




/**
 * Stats master objekti
 */
var stats = new Stats;