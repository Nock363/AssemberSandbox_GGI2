

var codeContainer;
var codeEditor;
var codeEditorBackground;
var textEditorPreLines = 8;
var codeEditorLines;

var registerTable1;
var registerTable2;

var ports;

var stackTable;

var memoryCellContainer;
var memoryCells
var schrittInput;

var register;
var memory;

var codeLines;
var avrCommands;



var sprungMarkenAddressen;


var errorCount;

var standardStepTime = 500;
var stepTime
var actualStep = -1;
var actualStepLine;

var flags = {C:0,N:0,Z:0,V:0}
var flagElements;

var programmInterval;

function init(){

  codeContainer       = document.getElementsByClassName("sourceCodeContainer")[0];
  codeEditor          = document.getElementById("textEditor");
  codeEditorBackground= document.getElementById("textEditorBackground");
  registerTable1      = document.getElementById("registerTable1").tBodies[0];
  registerTable2      = document.getElementById("registerTable2").tBodies[0];
  stackTable          = document.getElementById("stackTable").tBodies[0];
  memoryCellContainer =document.getElementById("memoryCells");
  schrittInput        = document.getElementById("schrittInput");
  flagElements        = document.getElementsByClassName("flag");
  ports               = document.getElementsByClassName("port");


  errorCount = 0;

  register = new Register();
  memory   = new Memory();

  fillRegisterTable(register);
  fillStackTable(register);
  fillMemoryCells();
  fillPorts();
  textAreaFunktion(null);


  if(navigator.appVersion.indexOf("Edge") != -1)
    alert("Mit der Nutzung des Edge browsers, kann die visuelle Darstellund der Seite abweichen. Wir empfehlen dir Chrome oder Firefox zu nutzen.")

}

function textAreaFunktion(event){

  errorCount = 0;
  codeEditorLines = undefined;



  codeLines = codeEditor.value.split("\n");

  var editorBackgroundHtml ="";
  for (var i = 0; i < codeLines.length + textEditorPreLines; i++) {
    editorBackgroundHtml += '<div class="editorLine">'+i+'</div>';
  }

  codeEditor.rows = codeLines.length;

  textEditorBackground.innerHTML= editorBackgroundHtml;

}

function checkCode(){
  parseCodeLines();
  markErrorLines();
}



function parseCodeLines(){

  clearInterval(programmInterval);

  avrCommands = [];
  goodAvrCommands = [];
  badAvrCommands = [];
  sprungMarkenAddressen = [];
  for (var i = 0; i < codeLines.length; i++) {


      avrCommands[i] = new assemblerBefehl();
      avrCommands[i].orgBefehl = codeLines[i].replace("\t", "");
      avrCommands[i].parse();

      if(!/\S/.test(codeLines[i]))
        avrCommands[i].skip = true;
      else if(avrCommands[i].befehl.value == undefined && avrCommands[i].mark.value != undefined)
        avrCommands[i].skip = true;
  }
  //Aufteilen der avrCommands in gute und schlechte(fehler)
  for (var i = 0; i < avrCommands.length; i++) {
    if(avrCommands[i].isValid == true){

      //falls sprungMarke vorhanden ist, zur sprungMarkenAddressen hinzufügen
      if(avrCommands[i].mark.value != undefined)
        sprungMarkenAddressen.push({addresse: i, name: avrCommands[i].mark.value});

      goodAvrCommands.push(avrCommands[i]);
    }
    else if(avrCommands[i] != 0)
      badAvrCommands.push(avrCommands[i]);

  }

}

//makiert die Zeilen, in denen noch Fehler sind
function markErrorLines(){

    errorCount = 0;
    codeEditorLines = document.getElementsByClassName("editorLine");
    for (var i = 0; i < avrCommands.length; i++) {
        if(avrCommands[i].isValid == false && avrCommands[i].skip != true){
          codeEditorLines[i+textEditorPreLines].classList.add("error");
          errorCount++;
        }
    }
}

function setStepHighligh(){

  if(actualStepLine != undefined)
    actualStepLine.classList.remove("step");

  if(actualStep >= 0 && actualStep < codeEditorLines.length){

    actualStepLine = codeEditorLines[actualStep + textEditorPreLines];
    actualStepLine.classList.add("step");

  }
}

function makeStep(step = null){

  if(codeEditorLines == undefined){
    console.log("es muss erst geprüft werden");
    checkCode();
  }


  var nextStep = (step == null)? (actualStep+1): step;

  //Prüfen auf Situtation die das durchführen des Steps verhindern
  if(nextStep < 0){
    throw "Error: programmCounter kleiner als 0";
    clearInterval(programmInterval);
    return -1;
  }else if(nextStep >= avrCommands.length){
    alert("Programm ist durchgelaufen.");
    actualStep = nextStep;
    clearInterval(programmInterval);
    return -1;
  }else if(errorCount != 0){
    alert("Es müssen erst alle Fehler behoben werden, bevor das Programm laufen kann!");
    markErrorLines();
    clearInterval(programmInterval);
    return -1;
  }

  //Falls nextStep in eine leere Zeile zeigt, wird die nächste Befehlszeile gesucht
  if(avrCommands[nextStep].skip){
    do {
      nextStep++;
    } while (nextStep < avrCommands.length && avrCommands[nextStep].skip);
  }

  if(nextStep >= avrCommands.length){

    alert("Programm ist durchgelaufen.");
    actualStep = nextStep;
    clearInterval(programmInterval);

    return undefined;
  }


  //Letztes prüfen, ob der Befehl ohne Fehler ist
  var command = avrCommands[nextStep].befehl.value;
  console.log(command);
  if(command == undefined){
    alert("Fehler in Zeile " +nextStep+ "");
    codeEditorLines[nextStep+textEditorPreLines].classList.add("error");
    errorCount++;
    return -1;
  }


  //durchführen des steps

  actualStep = nextStep;
  setStepHighligh();

  var result = assemblerFunktionen[command](avrCommands[nextStep]);

  if(typeof(result) == "object")
    flags = result;

  if(result == false){
    clearInterval(programmInterval);
    codeEditorLines[nextStep+textEditorPreLines].classList.remove("step");
    codeEditorLines[nextStep+textEditorPreLines].classList.add("error");
    errorCount++;
    avrCommands[nextStep].isValid = false;
    return -1;
  }


}

function runProgram(){

  //Zuerst die stepDauer bestimmen;
  var newStepTime = parseInt(schrittInput.value);

  if(isNaN(newStepTime))
    stepTime = standardStepTime;
  else
    stepTime = newStepTime;

    console.log(stepTime);

  if(makeStep() != -1){
    clearInterval(programmInterval);
    programmInterval = setInterval(makeStep,stepTime);
  }
}

function stopProgram() {
    clearInterval(programmInterval);
    actualStep = -1;
}

function resetProgram(){
    clearInterval(programmInterval);
    actualStep = -1;
    register = new Register();
    memory   = new Memory();
    fillRegisterTable(register);
    fillMemoryCells();
    fillStackTable(register);
    fillPorts();
    actualStepLine = undefined;
    for (var i = 0; i < codeEditorLines.length; i++) {
      codeEditorLines[i].classList.remove("step");
    }

    setStepHighligh();
    flagElements[0].classList.remove("select");
    flagElements[1].classList.remove("select");
    flagElements[2].classList.remove("select");
    flagElements[3].classList.remove("select");
}

function setDelay(i) {

}

function to8bitString(number){

  var isNegative = (number < 0);

  var maxSize = 0b11111111;

  var newNumber = number & maxSize;
  //  var overflow  = number &

  /*if(number%127 != 0 && number != 0)
    number %= 127;


  if(number >= 0){



  }else{
    var n = (255+number +1).toString(2);



  }
  */

  var b = newNumber.toString(2);
  return "00000000".substr(b.length) + b;
}

function findSprungmarkenAddresse(name){
  name = name.replace("\t", "");
  for (var i = 0; i < sprungMarkenAddressen.length; i++) {
    if(sprungMarkenAddressen[i].name == name)
      return sprungMarkenAddressen[i].addresse;
  }


}

function fillRegisterTable(register){

  var tableCode1 = "";
  var tableCode2 = "";
  var r = register.register;
  for(var i = 0; i < r.length/2; i++ ){
    tableCode1 += "<tr><td>R"+i+"</td> <td>"+(r[i])+" 0b"+to8bitString(r[i])+"</td>";
  }
  for(var i = r.length/2; i < r.length; i++ ){

    if(i == register.X[0] || i == register.X[1])
      var registerName = "(X)R"+i;
    else if(i == register.Y[0] || i == register.Y[1])
      var registerName = "(Y)R"+i;
    else if(i == register.Z[0] || i == register.Z[1])
      var registerName = "(Z)R"+i;
    else
      var registerName = "R"+i;


    tableCode2 += "<tr><td>"+registerName+"</td> <td>("+r[i]+") 0b"+to8bitString(r[i])+"</td>";
  }

  registerTable1.innerHTML = tableCode1;
  registerTable2.innerHTML = tableCode2;

}

function fillStackTable(register) {

  var stackCode = "";

  var stack = register.stack;

  for (var i = 0; i < stack.length; i++) {
    stackCode += "<tr><td>0b"+ to8bitString(stack[i]) +" ("+stack[i]+")</td></tr>";
  }

  for (var i = 0; i < (register.stackDepth - stack.length); i++) {
    stackCode += "<tr><td>---</td></tr>";
  }

  stackTable.innerHTML = stackCode;

}

function fillMemoryCells(){

  memoryCells = [];
  memoryCellContainer.innerHTML = "";
  var cells = memory.memory;
  for (var i = 0; i < cells.length; i++) {
    var cell = document.createElement("div");
    cell.classList.add("memoryCell");
    if(i%2 == 1)
      cell.classList.add("light");
    var text = cells[i].toString(16);
    cell.innerHTML = "00".substr(text.length) + text;
    memoryCellContainer.appendChild(cell);
    memoryCells[i] = cell;
  }


}

function fillPorts(){
  var r = register;
  //1 == ausgang
  for (var i = 0; i < r.ports.length; i++) {


    for (var a = 0; a < r.ports[i].length; a++) {

      if(r.ddrs[i][a] == 1){
        ports[i].children[a].classList.remove("in");
        ports[i].children[a].classList.add("out");
      }else{
        ports[i].children[a].classList.add("in");
        ports[i].children[a].classList.remove("out");
      }

      if(r.ports[i][a])
        ports[i].children[a].classList.add("high");
      else
        ports[i].children[a].classList.remove("high");

    }


  }

}

function changeMemory(index,value){

  if(index < 0 || index >= memory.memorySize){
    console.error("Error: index liegt außerhalb des Speichers");
    return -1;
  }
  var maxSize = 0b11111111;

  memory.memory[index] = value&maxSize;

  var text = memory.memory[index].toString(16).toUpperCase();

  memoryCells[index].innerHTML = "00".substr(text.length) + text;

  memoryCells[index].classList.add("singleBlink");
  var removeTimeout = setTimeout(function(){
    memoryCells[index].classList.remove("singleBlink");

  },500);


}

function changeRegister(index, value){

  var maxSize = 255;
  var result = value&maxSize;
  register.register[index] = result;

  //Aufteilen auf die beiden Tabellen (von R00 bis R15, und R16 bis R32)
  if(index < register.registerCount/2){
    var row = registerTable1.rows[index];
  }
  else{
    var tempIndex = index - register.registerCount/2;
    var row = registerTable2.rows[tempIndex];
  }
  row.cells[1].innerHTML = "("+result+") 0b" + to8bitString(result);


  row.classList.add("singleBlink");

  var removeTimeout = setTimeout(function(){
    row.classList.remove("singleBlink");

  },500);

}

function switchPort(port,index,force = false){

  if(port < 0 || port > register.ports.length){
    throw "Error: Einen Port mit diesem Index gibt es nicht";
    return -1;
  }
  if(index < 0 || index > register.ports[0].length){
    throw "Error: Der Port hat nicht so einen Index";
    return -1;
  }

  var actualValue = register.ports[port][index];

  if(register.ddrs[port][index] == 0 || force ){

    register.ports[port][index] = !actualValue;
    if(!actualValue == 0)
      ports[port].children[index].classList.remove("high");
    else
      ports[port].children[index].classList.add("high");
  }

}

function writePort(port, value){


  var targetPort = register.ports[port];
  for (var i = 0; i < targetPort.length; i++) {
    targetPort[i] = value%2;
    value = value >> 1;
    if(value == 0)
      break;
  }

}


function writeDDR(ddr, value){


  var targetPort = register.ddrs[ddr];
  for (var i = 0; i < targetPort.length; i++) {
    targetPort[i] = value%2;
    value = value >> 1;
    if(value == 0)
      break;
  }

}


function setX(value){
  var r = register;
  var lMask = 0b0000000011111111;
  var hMask = 0b1111111100000000;
  var lValue = value&lMask;
  var hValue = (value&hMask) >> 8;
  changeRegister(r.X[0], lValue);
  changeRegister(r.X[1], hValue);

}

function setY(value){
  var r = register;
  var lMask = 0b0000000011111111;
  var hMask = 0b1111111100000000;
  changeRegister(r.Y[0], value&lMask);
  changeRegister(r.Y[1], (value&hMask) >> 8);

}

function setZ(value){
  var r = register;
  var lMask = 0b0000000011111111;
  var hMask = 0b1111111100000000;
  changeRegister(r.Z[0], value&lMask);
  changeRegister(r.Z[1], (value&hMask) >> 8);

}

function getX(){
  var  lValue = register.register[register.X[0]];
  var  hValue = register.register[register.X[1]] << 8;
  return lValue + hValue;
}

function getY(){
  var  lValue = register.register[register.Y[0]];
  var  hValue = register.register[register.Y[1]] << 8;
  return lValue + hValue;
}

function getZ(){
  var  lValue = register.register[register.Z[0]];
  var  hValue = register.register[register.Z[1]] << 8;
  return lValue + hValue;
}


function popStack(){

  if(register.stack.length > 0){

    stackTable.parentElement.classList.add("singleBlink");
    var removeTimeout = setTimeout(function(){
      stackTable.parentElement.classList.remove("singleBlink");
    },500);

    var value = register.stack.pop();
    fillStackTable(register);
    return value;

  }else{
    throw "Es kann nichts vom Stack genommen werden, wenn er leer ist!";
    return undefined;
  }

}

function pushStack(value){

  var number = parseInt(value);
  if(!isNaN(number) && register.stack.length < register.stackDepth){

    stackTable.parentElement.classList.add("singleBlink");
    var removeTimeout = setTimeout(function(){
      stackTable.parentElement.classList.remove("singleBlink");
    },500);

    register.stack.push(number);
    fillStackTable(register);
  }else if(isNaN(number)) {
     throw "Auf den Stack können nur Zahlen abgelegt werden";
  }else{
      throw "Maximale Stack-Tiefe erreicht.";
  }

}


class Register {


  constructor(random = false){

    this.stackDepth = 16;
    this.registerCount = 32;
    this.register =[];
    this.stack = [];
    this.X = [26,27];
    this.Y = [28,29];
    this.Z = [30,31];
    this.ports = [];
    this.ddrs   = [];

    this.ports[0]  = [0,0,0,0,0,0,0,0];
    this.ddrs[0]   = [0,0,0,0,0,0,0,0];

    this.ports[1]  = [0,0,0,0,0,0,0,0];
    this.ddrs[1]   = [0,0,0,0,0,0,0,0];

    this.ports[2]  = [0,0,0,0,0,0,0,0];
    this.ddrs[2]   = [0,0,0,0,0,0,0,0];

    this.ports[3]   = [0,0,0,0,0,0,0,0];
    this.ddrs[3]    = [0,0,0,0,0,0,0,0];

    this.initRegister(random);

  }

  /*
  Initialisiert die Register, entweder mit zufälligen Zahlen oder mit nullen
  */
  initRegister(random = false){

    if(random){
      //ToDo
    }else{

      for(var i = 0; i < this.registerCount;i++){

          this.register[i] = 0;

      }


    }


  }





}

class Memory{
  constructor(random = false){
    this.memorySize = 306;
    this.memory = [];

    for (var i = 0; i < this.memorySize; i++) {
      this.memory[i] = 0;
    }
  }
}
