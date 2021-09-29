
/**
* PapaParsen configit
*/
const parseConfigs = 	{
	delimiter: "",	// auto-detect
	newline: "",	// auto-detect
	quoteChar: '"',
	escapeChar: '"',
	header: true,
	transformHeader: undefined,
	dynamicTyping: false,
	preview: 0,
	encoding: "UTF-8",
	worker: false,
	comments: false,
	step: undefined,
	complete: function(results, file) {
		console.log("Parsing complete:", file.name);
		addOrganisaatiot(results);
	},
	error: undefined,
	download: false,
	downloadRequestHeaders: undefined,
	downloadRequestBody: undefined,
	skipEmptyLines: true,
	chunk: undefined,
	chunkSize: undefined,
	fastMode: undefined,
	beforeFirstChunk: undefined,
	withCredentials: undefined,
	transform: undefined,
	delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
};

const jsonToCsvConfigs = {
	quotes: false, //or array of booleans
	quoteChar: '"',
	escapeChar: '"',
	delimiter: ";",
	header: true,
	newline: "\r\n",
	skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
	columns: null //or array of strings
}




/**
 * Steps for printing parsing results to page
 * @returns
 */
function allDone(){
	
	
	$("#saveToJSON").prop('disabled', false);
	
}




function runFilter(){
	$("#organisations").empty();
	$("#showOrgs").removeClass("sample");
	let filter = createFilterFromForm();
	filteredOrganisations = registryData.filter(filter);
	$("#orgCount").html(" ("+filteredOrganisations.length+" kpl)")
}

function showOrganisations(){
	if($("#showOrgs").hasClass("sample")){
		showSampleOrganizations();
	}
	else{
		showRegistryOrganizations();
	}
	
}

