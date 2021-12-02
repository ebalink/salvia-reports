
/**
 * 
 * @returns
 */
function exportToJSON() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(stats, replacer, 2)], {
    type: "application/json"
  }));
  a.setAttribute("download", "data.json");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function replacer(key, value) {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else if(value instanceof TestResult) {
    return {
      dataType: 'TestResult',
      value: {...value}, // or with spread: value: [...value]
    };
  } else if(value instanceof Stats) {
    return {
      dataType: 'Stats',
      value: {...value}, // or with spread: value: [...value]
    };
  } else if(value instanceof QW_Result) {
    return {
      dataType: 'QW_Result',
      value: {...value}, // or with spread: value: [...value]
    };
  } 

else {
    return value;
  }
}

function reviver(key, value) {
  if(typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
	if (value.dataType === 'TestResult') {
      return Object.assign(new TestResult(), value.value);
    }
	if (value.dataType === 'Stats') {
      return Object.assign(new Stats(), value.value);
    }
	if (value.dataType === 'QW_Result') {
      return Object.assign(new QW_Result(), value.value);
    }
  }
  return value;
}

/**
 *  Toteutetaan niin, että uploadatun JSONin sisällöt lisätään olemassaolevaan registryData-objektiin,
	jolloin säilyvät objektien väliset viittaukset (eli samaan tapaan, kuin tietojen parsinta csv:ltä
 * @returns
 */
function uploadExistingStatsJSON(){
	let files = document.getElementById('chosenJSONfile').files;
	 if (files.length <= 0) {
	   return false;
	 }
	
	 var fr = new FileReader();

	 fr.onload = function(e) { 
		 //var stats = Object.assign(new Stats(), JSON.parse(e.target.result, reviver));
	 	let stats_ = JSON.parse(e.target.result, reviver);
		console.log("imported "+files[0].name);
		stats.merge(stats_);
		
		// assing the objects as class instances
		/*let results = new Map();
		
		for(const key of stats.testresults.keys()) {
			let result = Object.assign(new TestResult(), JSON.parse(stats.testresults.get(key)));
			results.set(key, result);	
		}
		stats.testresults = results;*/
		allDone();
		
		/*console.log("Stats now contain "+stats.getCount_reports()+" testreports, "
			+stats.getCount_testTypes()+" unique test types and " 
			+ stats.getCount_testCases() +" unique tests on element.");*/
	 }
	 fr.readAsText(files.item(0));
}


function uploadNewReportJSON(){
	let files = document.getElementById('chosenNewJSONfile').files;
	 if (files.length <= 0) {
	   return false;
	 }

	 var fr = new FileReader();

	 fr.onload = function(e) { 
				 
		stats.addQWResult(JSON.parse(e.target.result), files[0].name);
		allDone();
		console.log("imported "+files[0].name);
		console.log("Stats now contain "+stats.getCount_reports()+" testreports, "
			+stats.getCount_testTypes()+" unique test types and " 
			+ stats.getCount_testCases() +" unique tests on element.");
	 }
	 fr.readAsText(files.item(0));
}

function exportToCSV(contentArray){
	let csvContent = contentArray.map(e => e.join(";")).join("\n");
	
	 const a = document.createElement("a");
	  a.href = URL.createObjectURL(new Blob([csvContent], {
	    type: "data:text/csv;charset=ISO-8859-1"
	  }));
	  a.setAttribute("download", "data.csv");
	  document.body.appendChild(a);
	  a.click();
	  document.body.removeChild(a);
}

