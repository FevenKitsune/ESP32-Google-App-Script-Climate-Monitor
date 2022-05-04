/*
Climate Monitor Control Script

Replaces an (unreliable) IFTTT Webhook that injected sensor data from a microcontroller into a Google Spreadsheet.
*/

/**
 * Processes and verifies formatting for GET requests. Valid GET parameters are listed below:
 * {
 *  "temperature": String or number,
 *  "humidity": String or number,
 *  "outsideHumidity": String or number
 * }
 * 
 * Scrubs data given using isNaN() test.
 * 
 * @param {Event} e The doGet event.
 * @return {TextOutput} PlainText HTTP return response.
 */
function doGet(e) {
  // Pull desired parameter from 
  var temperature = e.parameter["temperature"];
  // isNan(var) check to ensure only numbers are given. Prevents code-injection exploits into spreadsheet.
  if (isNaN(temperature)) {
    // If variable is Not a Number, return error message.
    Logger.log("NaN value: temperature");
    return ContentService.createTextOutput("NaN value: temperature");
  }

  // Repeat previous process for humidity.
  var humidity = e.parameter["humidity"];
  if (isNaN(humidity)) {
    Logger.log("NaN value: humidity");
    return ContentService.createTextOutput("NaN value: humidity");
  }

  // Repeat previous process for outsideHumidity.
  var outsideHumidity = e.parameter["outsideHumidity"];
  if (isNaN(outsideHumidity)) {
    Logger.log("NaN value: outsideHumidity");
    return ContentService.createTextOutput("NaN value: outsideHumidity");
  }

  // With valid values, call appendValues function to append values to spreadsheet.
  appendValues(temperature, humidity, outsideHumidity);

  // Return and log that data has been posted.
  Logger.log("Data posted!");
  return ContentService.createTextOutput("Data posted!");
  
}

/**
 * Function to test appendValues() functionality. Ensures the script is linked to the appropriate spreadsheet.
 * Values here are not passed through a NaN check.
 */
function appendValuesTest() {
  // Test function to ensure spreadsheet can be accessed. Values are not passed through a NaN check.
  appendValues(32.1, 50.3, 0.0);
}

/**
 * Accesses the appropriate spreadsheet and inserts HTTP GET data provided by doGet(e).
 * 
 * @param {string|number} temperature The retrieved temperature.
 * @param {string|number} humidity The retrieved humidity.
 * @param {string|number} outsideHumidity Humidity outside retrieved from weather API. Not implemented yet.
 */
function appendValues(temperature, humidity, outsideHumidity) {
  var spreadsheetId = 'REMOVED';
  var rangeName = 'Sheet1!A:D'; // 4 col wide. Was previously 7 col wide for compatability.

  // Create Sheets.newRowData() structure.
  var valueRange = Sheets.newRowData();
  
  /*
  Array of values are placed in zeroth index of a root because multiple rows can be defined in a single array. We will only be inserting one row though.
  The 3 dashes are to ensure backwards compatability with previous IFTTT implementation, which used the first 3 cells as formulas to format date and times.
  In this implementation, DateTime is processed to the desired format with the getTime() function.

  Update 05/04/2022: Removed IFTTT backwards compatability.
  */
  valueRange.values = [[getTime(), temperature, humidity, outsideHumidity]];
  
  /*
  Run Sheets API append call with the given data. valueInputOption determines how the data will be processed.
  USER_ENTERED allows for formatted data but requires protection from malicious spreadsheet code-injection.
  RAW converts all data to Plain Text but results in DateTime formatted strings to format incorrectly.
  For our purpose, because we will be graphing based on DateTime, we should use USER_ENTERED.
  */
  Sheets.Spreadsheets.Values.append(valueRange, spreadsheetId, rangeName, {valueInputOption: "USER_ENTERED"});
}

/**
 * Retrieves DateTime with JavaScript's Date() and formats it to be identical to how Google Sheets DATEVALUE + TIMEVALUE is formatted.
 * This replaces code previously implemented with formulas injected by IFTTT.
 * 
 * @return {string} Correctly formatted string containing DateTime data.
 */
function getTime() {
  var d = new Date();
  var dateString = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
  Logger.log(`dateString Generated: ${dateString}`);
  return dateString;
}
