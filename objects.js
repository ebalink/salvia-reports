QW_Result = function(){
	this.url = "";
	this.date = "";
	this.filename = "";
	// Map of TestResult objects
	this.testresults = new Map();
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
}

TestResult = function(){
	this.code = "";
	this.name = "";
	//this.count_total = 0;
	this.count_passed = 0;
	this.count_warnings = 0;
	this.count_failed = 0;
	this.count_inapplicable = 0;
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
	this.count_passed++;
}
TestResult.prototype.addFailed = function(){
	this.count_passed++;
}
TestResult.prototype.addInapplicable = function(){
	this.count_passed++;
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
	for (const value of this.testresults.values()) {
	  cases += value.getTotal_full();
	}
	return cases;
}



/**
 * Stats master objekti
 */
var stats = new Stats;