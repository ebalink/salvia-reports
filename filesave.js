
/**
 * 
 * @returns
 */
function exportToJSON() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(registryData, null, 2)], {
    type: "application/json"
  }));
  a.setAttribute("download", "data.json");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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
		 var stats = Object.assign(new Stats(), JSON.parse(e.target.result));
		
		// assing the objects as class instances
		let results = new Map();
		
		for(const key of stats.testresults.keys()) {
			let result = Object.assign(new TestResult(), JSON.parse(stats.testresults.get(key)));
			results.set(key, result);	
		}
		stats.testresults = results;
		allDone();
		console.log("imported "+files[0].name);
		console.log("Stats now contain "+stats.getCount_files()+" files, "
			+stats.getCount_testTypes()+" unique test types and " 
			+ stats.getCount_testCases() +" unique tests on element.");
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

