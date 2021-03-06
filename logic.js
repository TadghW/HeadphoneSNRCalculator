//This is JavaScript, the logic for the page 

//At the beginning of our script we can define information that our logic might need.

//As these definitions exist outside of a function or object, they are "global" objects
//and can be referenced by anything.

//"Const" objects are constant, their values do not change and cannot be written to.
//"Var" objects are variable, and can be manipulated by the logic (or the user).

const noiseCalcOutput = document.getElementById("noiseoutput");
const outputCalcOutput = document.getElementById("outputcalcoutput");
var mwHistory = [];
var vHistory = [];
var impHistory = [];
var ampWHistory = [];
var refImpHistory = [];

//A "function" is a package of behaviour we want this program to undertake when told to.
//In this case, we demand that an object be passed to the function before it works,
//and in our HTML we made our input fields pass their own information into the function
//every time one of them is called.
//This will allow us to access both the name and the value of the particular object that
//called the function easily.

//MIRROR FUNCTION
function update(source) {
  mirror(source);
  sensCalc();
  snrCalc();
  outputCalc();
  zImpactCalc();
}

function mirror(source) {

  //Check what element called the function and push their value to the appropriate array

  switch(source.name) {
    case "mw":
    mwHistory.push(source.value); 
    break;
    case "vrms":
    vHistory.push(source.value);
    break;
    case "ohm": 
    impHistory.push(source.value);
    break;

  }

  //Cycle through objects with the same name, and push the latest relevant value to their
  //input fields

  document.querySelectorAll("input[name=" + source.name + "]").forEach(element => {
    switch(source.name) {
    case "mw":
    var latestValue = mwHistory[(mwHistory.length - 1)];
    element.value = latestValue;
    console.log("latest mw value = " + latestValue);
    break;
    case "vrms":
    var latestValue = vHistory[(vHistory.length - 1)];
    element.value = latestValue;
    console.log("latest vrms value = " + latestValue);
    break;
    case "ohm":
    var latestValue = impHistory[(impHistory.length - 1)];
    element.value = latestValue;
    console.log("latest imp value = " + latestValue);
    break;
    }
    });
}


//AUTOMATIC SENSITIVITY CONVERTER

function sensCalc() {

//These variables are locally scoped, so they only exist within the context of this function
//by scoping the same information locally inside each of our functions we can stop them
//interfering with one another.

var impedance = document.getElementById("headphoneimpedance").value;
var milliwattSensitivity = document.getElementById("headphonesensitivitymw").value;
var voltageSensitivity = document.getElementById("headphonesensitivityv").value;

//This part chooses which calculation to do based on what the user has input:
//If all three fields are populated do nothing
//If everything but dB/V is populated calculate dB/V
//If everything but dB/mW is populated calculate dB/mW
//If only one field is populated do nothing

 if (impedance.length > 0 && milliwattSensitivity.length > 0 && voltageSensitivity.length > 0) { 
 } else if (impedance.length > 0 && milliwattSensitivity.length > 0) {
  calculateVoltageSensitivity();
  console.log("dB/V calculated")
 } else if (impedance.length > 0 && voltageSensitivity.length > 0) {
  calculateMilliwattSensitivity();
  console.log("dB/mW calculated");
 } else {
   console.log("insufficient data for automatic sensitivity calculation, waiting for additional input..");
  }

 }

function calculateVoltageSensitivity() {
    
    //Variables in front define relevant information to the calculation
    //Calculation is made with existing information and rounded to two places, before being ouput
    //Output populates the appropriate input field
  
    var milliwattSensitivity = document.getElementById("headphonesensitivitymw").value;
    var voltageSensitivity = document.getElementById("headphonesensitivityv").value;
    var impedance = document.getElementById("headphoneimpedance").value;
    
    var calculatedVoltageSensitivity = milliwattSensitivity - (Math.log10(Math.sqrt(impedance * 0.001)) * 20);
    var roundedVoltageSensitivity = calculatedVoltageSensitivity.toFixed(2);
  
    //For some reason assigning the new value directly to the voltageSensitivity variable wasn't working,
    //solved by selecting the input field with querySelector instead of id, here's one of the reasons 
    //here's one of the scenarios where assigning a name as well as an id makes sense :) although I 
    //honestly can't think of others...
      
    document.querySelectorAll('input[name="vrms"]').forEach(element => {
    element.value = roundedVoltageSensitivity;
    });
      return roundedVoltageSensitivity;
  }
  
  function calculateMilliwattSensitivity() {
  
    //Same shtick here
    var impedance = document.getElementById("headphoneimpedance").value;
    var milliwattSensitivity = document.getElementById("headphonesensitivitymw").value;
    var voltageSensitivity = document.getElementById("headphonesensitivityv").value;
    var calculatedMilliwattSensitivity = (voltageSensitivity -(10 * Math.log10((1/impedance)*1000)));
    var roundedMilliwattSensitivity = calculatedMilliwattSensitivity.toFixed(2);
  
    document.querySelector('input[name="mw"]').value = roundedMilliwattSensitivity;
    document.querySelectorAll('input[name="mw"]').forEach(element => {
    element.value = roundedMilliwattSensitivity;
    });
    return roundedMilliwattSensitivity;
  }


//MAJOR CALCULATORS

function snrCalc(){

  //By telling the code how to get do each stage of the calculation we can just call the result and
  //the code will figure it out for us
  var headphoneSensitivity = document.getElementById("headphonesensitivityv").value;
  var amplifierSnr = document.getElementById("amplifiersnr").value;
  var referenceLevel = document.getElementById("referencelvl").value;
  var logOfReferenceLevel = Math.log10(referenceLevel) * 20;
  var ampSnrMinusResult = (amplifierSnr - logOfReferenceLevel);
  var noiseOutput = (headphoneSensitivity - ampSnrMinusResult);
  var noiseOutputRounded = noiseOutput.toFixed(2);
    
  //Here's how we write the answer to the page - the code will calculate the correct value with
  //the formula we gave it above
  if(isFinite(noiseOutputRounded)) {
    noiseCalcOutput.innerHTML = "Total noise output = " + noiseOutputRounded + "dBSPL";
  }
}

function outputCalc() {

  var headphoneImpedance = document.getElementById("headphoneimpedance").value;
  var milliwattSensitivity = document.getElementById("headphonesensitivitymw").value;
  var voltageSensitivity = parseFloat(document.getElementById("headphonesensitivityv").value);
  var amplifierPower = document.getElementById("amplifieroutput").value;
  var referenceImpedance = document.getElementById("referenceimpedance").value;
  var crestFactor = parseFloat(document.getElementById("crestfactor").value);
  var maxOutput;

  if (headphoneImpedance > 0 & referenceImpedance > 0 & crestFactor > 0) {
    
    if (referenceImpedance <= headphoneImpedance) {
      
      var ampPowerW = amplifierPower * .001;
      var sqrtApRi = Math.sqrt(ampPowerW * referenceImpedance);
      var log20SqrtApRi = (Math.log10(sqrtApRi) * 20);
      var plsVs = (log20SqrtApRi + voltageSensitivity);
      var mO = plsVs - crestFactor;
      var mOR = mO.toFixed(2);
      var mP = parseFloat(mOR) + parseFloat(crestFactor); 
      
      outputCalcOutput.innerHTML = "Maximum average level = " + mOR + "dBSPL" + "<br>" + "Maximum peak level = " + mP + "dBSPL";
      console.log("Max output is: " + mO);

    } else if (referenceImpedance > headphoneImpedance) {

      var amplifierCurrent = Math.sqrt((amplifierPower*.001) / referenceImpedance);
      var amplifierVoltage = (amplifierCurrent * headphoneImpedance);
      
      var logAv = 20 * Math.log10(amplifierVoltage);
      var plsVs = logAv + voltageSensitivity;
      var mO = plsVs - crestFactor;
      var mOR = mO.toFixed(2);
      var mP = parseFloat(mOR) + parseFloat(crestFactor);
      
      outputCalcOutput.innerHTML = "Maximum average level = " + mOR + "dBSPL" + "<br>" + "Maximum peak level = " + mP + "dBSPL";
      console.log("Max output is: " + mOR + "dBSPL");
    }
  } else {
    console.log("insufficient data for maximum output calculation, waiting for additional input...")
  }
}

  function zImpactCalc() {

    var minHeadphoneImpedance = parseFloat(document.getElementById("minimumheadphoneimpedance").value);
    var maxHeadphoneImpedance = parseFloat(document.getElementById("maximumheadphoneimpedance").value);
    var amplifierZOut = parseFloat(document.getElementById("amplifieroutputimpedance").value);
    var output = document.getElementById("frequencyresponseimpact");

    //Voltage out into minimum headphone impedance, turn that into dB 

    minVOut = minHeadphoneImpedance / (minHeadphoneImpedance + amplifierZOut);
    minImpFrImpact = 20 * (Math.log10(minVOut));

    //Voltage out into maximum headphone impedance, turn that into dB

    maxVOut = maxHeadphoneImpedance / (maxHeadphoneImpedance + amplifierZOut);
    maxImpFrImpact = 20 * (Math.log10(maxVOut));


    var frImpact = maxImpFrImpact - minImpFrImpact;
    var frImpactRounded = frImpact.toFixed(2);
	
	var sensImpactRounded = minImpFrImpact.toFixed(2)

    //Calculate relative FR change between two points, wrapped in isFinite to stop function from outputing NaN, infinity, -infinity, etc.
    if(isFinite(frImpact)){
      output.innerHTML = "Worst-case change in relative frequency response from output impedance: " + frImpactRounded + "dB" + "<br>" + "Sensitivity loss from output impedance voltage drop: " + sensImpactRounded + "dB";
      } else {
      console.log("insufficient data for impact of Z calculation");
    }
  
    }