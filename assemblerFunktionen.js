function parseRegister(regString){
  var tempString = regString.replace(/\s/g, '');
  var regAddress = parseInt(tempString.substring(1));
  if(tempString[0] != 'R' || isNaN(regAddress) || regAddress > 31 || regAddress < 0){
    throw "Error: " + regString + " ist keine valide Addresse";
    return null;
  }
  else
    return regAddress;
}

function parseValue(valueString){

  var value;
  if(valueString[0] == "0" && valueString[1] == "b"){
      var value = parseInt(valueString.substr(2),2);
  }else if(valueString[0] == "0" && valueString[1] == "x"){
      var value = parseInt(valueString.substr(2),16);
  }else{
      var value = parseInt(valueString);
  }


  if(isNaN(value))
    throw "Error: " + valueString + "ist kein valider Wert";
  return value;
}

function setFlags(value){

  var newValue = value;


  var cMask  = 0b100000000;
  var vMask  = 0b110000000;

  console.log(newValue);

  var c = (newValue & cMask) == cMask;

  var n = (value <  0);

  var z = (newValue == 0);

  var v = ( (newValue &vMask) != vMask && (newValue &vMask) != 0);

  if(c)
    flagElements[0].classList.add("select");
  else
    flagElements[0].classList.remove("select");

  if(n)
    flagElements[1].classList.add("select");
  else
    flagElements[1].classList.remove("select");

  if(z)
    flagElements[2].classList.add("select");
  else
    flagElements[2].classList.remove("select");

  if(v)
    flagElements[3].classList.add("select");
  else
    flagElements[3].classList.remove("select");




  return {C:c,N:n,Z:z,V:v}

}

var assemblerFunktionen = {

  LD:   ld,//Louis DONE
  LDD:  ldd,//Louis DONE
  LDI:  ldi,//Done
  LDS:  lds,//Fabian DONE
  LSL:  lsl,//Louis DONE
  LSR:  lsr,//Louis DONE
  MOV:  mov,//Louis DONE
  MUL:  mul,//Louis DONE
  NOP:  nop,//Fabian DONE
  OR:   or,//Fabian DONE
  OUT:  out,//Fabian DONE
  POP:  pop,//Fabian DONE
  PUSH: push,//Fabian DONE
  RCALL:rcall,//Fabian DONE
  RET:  ret,//Fabian DONE
  RJMP: rjmp,//Fabian DONE
  SBR:  sbr,//Louis DONE
  ST:   st,//Fabian DONE
  STD:  std,//Fabian DONE
  STS:  sts,//Louis DONE NOT CHECKED
  SUB:  sub,//Louis DONE
  ADD:  add,//Fabian DONE
  AND:  and,//Louis DONE
  BCLR: bclr,//Louis DONE
  BREQ: breq,//Fabian DONE
  BRLO: brlo,//Fabian DONE
  BSET: bset,//Louis DONE
  CBR:  cbr,//Louis DONE NOT CHECKED
  COM:  com,//Louis DONE
  CP:   cp,//Louis DONE
  CPI:  cpi,//Louis DONE
  DEC:  dec,//Louis DONE
  EOR:  eor,//Louis DONE
  ICALL:icall,//Fabian DONE
  IJMP: ijmp,//Fabian DONE
  IN:   inFunc,//Fabian in ist schon belegt DONE
  INC:  inc//Louis DONE
};



function ld(befehl){

  try{

    var zReg = befehl.spec2.value.replace(/\s/g, '');
    var registerAdd = parseRegister(befehl.spec1.value);
    var memoryAddress;
    var zRegister;
    switch (zReg) {
      case "X":
          memoryAddress = getX();
      break;
      case "Y":
          memoryAddress = getY();
      break;
      case "Z":
          memoryAddress = getZ();
      break;
      default:
        throw (zReg + " ist kein gültiger Parameter");
    }
    changeRegister(registerAdd,memory.memory[memoryAddress])

  }catch(err){
    alert(err);
    return false;
  }


}

function ldd(befehl){

  try{

    var addressString = befehl.spec2.value.replace(/\s/g, '');
    var addressArr = addressString.split("+");
    if(addressArr.length != 2)
      throw (addressString + " ist kein Valider Register+Offset");
    var zReg = addressArr[0];
    var offset = parseValue(addressArr[1]);
    var registerAdd = parseRegister(befehl.spec1.value);
    var memoryAddress;
    var zRegister;
    switch (zReg) {
      case "X":
          memoryAddress = getX();
      break;
      case "Y":
          memoryAddress = getY();
      break;
      case "Z":
          memoryAddress = getZ();
      break;
      default:
        throw (zReg + " ist kein gültiger Parameter");
    }

    changeRegister(registerAdd,memory.memory[memoryAddress + offset]);

  }catch(err){
    alert(err);
    return false;
  }

}
function ldi(befehl){

  try{
    console.log("LDI wurde aufgerufen");

    var regString   = befehl.spec1.value;
    var regAddress  = parseRegister(regString);

    if(regAddress < 16 || regAddress > register.register.length)
      throw "Error: Mit LDI können nur Register größer 15 beschrieben werden";

    var value       = parseValue(befehl.spec2.value);

    changeRegister(regAddress,value);



    return flags;
  }catch(err){
    alert(err);
    return false;
  }

}
function lds(befehl){

  try{

    var register= parseRegister(befehl.spec1.value);
    var address = parseValue(befehl.spec2.value);

    if(address < 0 || address >= memory.memorySize)
      throw "Die Addresse "+address+" liegt außerhalb des Ram's (Ramgröße: "+memory.memorySize+")";

    changeRegister(register,memory.memory[address]);
    changeMemory(address,memory.memory[address]);


  }catch(err){
    alert(err);
    return false;
  }
}

function lsl(befehl)
{

  try{

    console.log("LSL wurde aufgerufen");



    var regString   = befehl.spec1.value;

    var regAddress  = parseRegister(regString);

    var value = register.register[regAddress] << 1;

    changeRegister(regAddress,value);
    return setFlags(value);


  }catch(err){
    alert(err);
    return false;
  }

}


function lsr(befehl){

  try{

    console.log("LSL wurde aufgerufen");



    var regString   = befehl.spec1.value;

    var regAddress  = parseRegister(regString);

    var value = register.register[regAddress] >> 1;

    changeRegister(regAddress,value);
    return setFlags(value);

  }catch(err){
    alert(err);
    return false;
  }

}

function mov(befehl){

  try{

  var regAdd1 = parseRegister(befehl.spec1.value);
  var regAdd2 = parseRegister(befehl.spec2.value);

  changeRegister(regAdd1,register.register[regAdd2]);

  }catch(err){
    alert(err);
    return false;
  }

}

function mul(befehl){

  try {

    var regAdd1 = parseRegister(befehl.spec1.value);
    var regAdd2 = parseRegister(befehl.spec2.value);
    var highMask = 0b1111111100000000;
    var lowMask= 0b0000000011111111;

    var bigValue = register.register[regAdd1] * register.register[regAdd2];
    var lowValue = bigValue&lowMask;
    var highValue= (bigValue&highMask) >> 8;

    changeRegister(0,lowValue);
    changeRegister(1,highValue);
    return setFlags(bigValue);

  }catch (err) {
    alert(err);
    return null;
  }

}

function nop(befehl){

}
function or(befehl){

  try {

    var rd = parseRegister(befehl.spec1.value);
    var rr = parseRegister(befehl.spec2.value);

    changeRegister(rd, register.register[rd]|register.register[rr]);


  } catch (err) {
    alert(err);
    return false;
  }
}

function out(befehl){

  try{

    var portString = befehl.spec1.value;
    var targetPort;


    var registerAdd = parseRegister(befehl.spec2.value);
    var registerValue = register.register[registerAdd];
    switch (portString) {

        case "DDRA":
          writeDDR(0,registerValue);
        break;

        case "DDRB":
          writeDDR(1,registerValue);
        break;

        case "DDRC":
          writeDDR(2,registerValue);
        break;

        case "DDRD":
          writeDDR(3,registerValue);
        break;

        case "PORTA":
          writePort(0,registerValue);
        break;

        case "PORTB":
            writePort(1,registerValue);
        break;

        case "PORTC":
            writePort(2,registerValue);
        break;

        case "PORTD":
            writePort(3,registerValue);
        break;


        default:
          throw (portString + " ist kein bekannter Port oder DDR name");

        break;
      }



    fillPorts();

  }catch(err){
    alert(err);
    return false;
  }
}
function pop(befehl){

  try{
  var address = parseRegister(befehl.spec1.value);

  var value  = popStack();
  changeRegister(address,value);



  }catch(err){
      alert(err);
      return false;
  }


}
function push(befehl){


  try{
  var address = parseRegister(befehl.spec1.value);

  pushStack(register.register[address]);



  }catch(err){
      alert(err);
      return false;
  }

}
function rcall(befehl){

  try{
    pushStack(actualStep);
    rjmp(befehl);
  }catch(err){
    alert(err);
    return false;
  }
}
function ret(befehl){
  try{
    var address = popStack();
    if(address != -1){
      befehl.spec1.value = address - actualStep;
      rjmp(befehl);
    }
  }catch(err){
    alert(err);
    return false;
  }
}
function rjmp(befehl){

  try{

      var sprungMarke = befehl.spec1.value;
      //prüfen ob es sich um einen dezimalwert handelt
      var relativeAddress = parseInt(sprungMarke);


      //Falls es sich um eine relative Addresse handelt
      if(!isNaN(relativeAddress)){
        //ToDo
        var newAddress = actualStep + relativeAddress;
        actualStep = newAddress;

      }
      //Falls es sich um eine Sprungmarke handelt
      else{
        var address = findSprungmarkenAddresse(sprungMarke);
        //makeStep(address);

        actualStep = address-1;

      }

    console.log("rjmp",actualStep);
  }catch(err){
    alert(err);
    return false;
  }
}
function sbr(befehl){
  try{

    var registerAdd = parseRegister(befehl.spec1.value);
    var mask       = parseValue(befehl.spec2.value);
    var value = register.register[registerAdd]|mask;
    changeRegister(registerAdd,value);

  }catch(err){
    alert(err);
    return false;
  }

}
function st(befehl){

  try{

    var zReg = befehl.spec1.value.replace(/\s/g, '');
    var registerAdd = parseRegister(befehl.spec2.value);
    var memoryAddress;
    var zRegister;
    switch (zReg) {
      case "X":
          memoryAddress = getX();
      break;
      case "Y":
          memoryAddress = getY();
      break;
      case "Z":
          memoryAddress = getZ();
      break;
      default:
        throw (zReg + " ist kein gültiger Parameter");
    }

    changeMemory(memoryAddress,register.register[registerAdd]);

  }catch(err){
    alert(err);
    return false;
  }

}
function std(befehl){

  try{

    var addressString = befehl.spec1.value.replace(/\s/g, '');
    var addressArr = addressString.split("+");
    if(addressArr.length != 2)
      throw (addressString + " ist kein Valider Register+Offset");
    var zReg = addressArr[0];
    var offset = parseValue(addressArr[1]);
    var registerAdd = parseRegister(befehl.spec2.value);
    var memoryAddress;
    var zRegister;
    switch (zReg) {
      case "X":
          memoryAddress = getX();
      break;
      case "Y":
          memoryAddress = getY();
      break;
      case "Z":
          memoryAddress = getZ();
      break;
      default:
        throw (zReg + " ist kein gültiger Parameter");
    }

    changeMemory(memoryAddress + offset,register.register[registerAdd]);

  }catch(err){
    alert(err);
    return false;
  }

}
function sts(befehl){

  try{
    var memoryAdd   = parseValue(befehl.spec1.value);
    var registerAdd = parseRegister(befehl.spec2.value);

    changeMemory(memoryAdd,register.register[registerAdd]);

  }catch(err){
    alert(err);
    return false;
  }

}
function sub(befehl){

  try{
    var regString1   = befehl.spec1.value;
    var regAddress1  = parseRegister(regString1);

    var regString2   = befehl.spec2.value;
    var regAddress2  = parseRegister(regString2);

    var newValue = register.register[regAddress1]-register.register[regAddress2];
    console.log("regAddress1",register.register[regAddress1]);
    console.log("regAddress2",register.register[regAddress2]);
    console.log("newValue",newValue);

    changeRegister(regAddress1, newValue);
    return setFlags(newValue);
  }
  catch(err){
      alert(err);
      return false;
  }

}
function add(befehl){

  try{
    var regString1   = befehl.spec1.value;
    var regAddress1  = parseRegister(regString1);

    var regString2   = befehl.spec2.value;
    var regAddress2  = parseRegister(regString2);

    var newValue = register.register[regAddress1]+register.register[regAddress2];
    console.log("regAddress1",register.register[regAddress1]);
    console.log("regAddress2",register.register[regAddress2]);
    console.log("newValue",newValue);

    changeRegister(regAddress1, newValue);
    return setFlags(newValue);
  }
  catch(err){
      alert(err);
      return false;
  }
}
function and(befehl){

  try {

    var rd = parseRegister(befehl.spec1.value);
    var rr = parseRegister(befehl.spec2.value);

    changeRegister(rd, register.register[rd]&register.register[rr]);
    return setFlags(register.register[rd]);

  } catch (err) {
    alert(err);
    return false;
  }

}
function bclr(befehl){

  try{

    var clearBit = parseValue(befehl.spec1.value);

    switch (clearBit) {
      case 0:
        flags.C = 0;
        flagElements[0].classList.remove("select");
      break;
      case 1:
        flags.N = 0;
        flagElements[1].classList.remove("select");
      break;
      case 2:
        flags.Z = 0;
        flagElements[2].classList.remove("select");
      break;
      case 3:
        flags.V = 0;
        flagElements[3].classList.remove("select");
      break;

    default:
        throw (clearBit + " ist kein Status bit (0-3)");
    }
  }catch(err){
    alert(err);
    return false;
  }

}
function breq(befehl){

  console.log(flags);

  if(flags.Z == true)
    rjmp(befehl);
}
function brlo(befehl){

  if(flags.C == true)
    rjmp(befehl);

}
function bset(befehl){

  try{

    var clearBit = parseValue(befehl.spec1.value);

    switch (clearBit) {
      case 0:
        flags.C = 1;
        flagElements[0].classList.add("select");
      break;
      case 1:
        flags.N = 1;
        flagElements[1].classList.add("select");
      break;
      case 2:
        flags.Z = 1;
        flagElements[2].classList.add("select");
      break;
      case 3:
        flags.V = 1;
        flagElements[3].classList.add("select");
      break;

    default:
        throw (clearBit + " ist kein Status bit (0-3)");
    }
  }catch(err){
    alert(err);
    return false;
  }

}
function cbr(befehl){

  try{

    var registerAdd = parseRegister(befehl.spec1.value);
    var mask       = parseValue(befehl.spec2.value);
    var value = register.register[registerAdd]&(~mask);
    changeRegister(registerAdd,value);

  }catch(err){
    alert(err);
    return false;
  }


}
function com(befehl){

  try{
      var registerAdd = parseRegister(befehl.spec1.value);
      changeRegister(registerAdd,~register.register[registerAdd]);

  }catch(err){
    alert(err);
    return false;
  }

}
function cp(befehl){

  try{
    var regString1   = befehl.spec1.value;
    var regAddress1  = parseRegister(regString1);

    var regString2   = befehl.spec2.value;
    var regAddress2  = parseRegister(regString2);

    var newValue = register.register[regAddress1]-register.register[regAddress2];
    return setFlags(newValue);
  }
  catch(err){
      alert(err);
      return false;
  }

}
function cpi(befehl){
  try{
    var regString1   = befehl.spec1.value;
    var regAddress1  = parseRegister(regString1);

    var value        = parseValue(befehl.spec2.value);

    var newValue = register.register[regAddress1]-value;
    return setFlags(newValue);
  }
  catch(err){
      alert(err);
      return false;
  }
}
function dec(befehl){
  try{
    var registerAdd = parseRegister(befehl.spec1.value);
    changeRegister(registerAdd, register.register[registerAdd]-1)
  }catch(err){
    alert(err);
    return null;
  }
}
function eor(befehl){
  try{
    var registerAdd1 = parseRegister(befehl.spec1.value);
    var registerAdd2 = parseRegister(befehl.spec2.value);
    var value = register.register[registerAdd1]^register.register[registerAdd2];

    changeRegister(registerAdd1,value);

  }catch(err){
    alert(err);
    return false;
  }

}
function icall(befehl){

  try{
    pushStack(actualStep);
    var relativeAddress = (getZ()-textEditorPreLines) - actualStep;
    var tempBefehl = new assemblerBefehl();
    tempBefehl.spec1.value = relativeAddress;
    rjmp(tempBefehl);
  }catch(err){
    alert(err);
    return false;
  }

}
function ijmp(befehl){

  try{
    var relativeAddress = (getZ()-textEditorPreLines) - actualStep;
    var tempBefehl = new assemblerBefehl();
    tempBefehl.spec1.value = relativeAddress;
    rjmp(tempBefehl);
  }catch(err){
    alert(err);
    return false;
  }

}
function inFunc(befehl){

  try{

    var portString = befehl.spec2.value;
    var targetPort;


    var registerAdd = parseRegister(befehl.spec1.value);

    switch (portString) {

        case "DDRA":
          targetPort = register.ddrs[0];
        break;

        case "DDRB":
          targetPort = register.ddrs[1];
        break;

        case "DDRC":
          targetPort = register.ddrs[2];
        break;

        case "DDRD":
          targetPort = register.ddrs[3];
        break;

        case "PORTA":
          targetPort = register.ports[0];
        break;

        case "PORTB":
            targetPort = register.ports[1];
        break;

        case "PORTC":
            targetPort = register.ports[2];
        break;

        case "PORTD":
            targetPort = register.ports[3];
        break;


        default:
          throw (portString + " ist kein bekannter Port oder DDR name");

        break;
      }

    var byteString = ""
    for (var i = targetPort.length-1; i >= 0; i--)
      byteString += targetPort[i]%2;

    var value = parseInt(byteString,2);

    changeRegister(registerAdd,value);

  }catch(err){
    alert(err);
    return false;
  }

}
function inc(befehl){
  try{
    var registerAdd = parseRegister(befehl.spec1.value);
    changeRegister(registerAdd, register.register[registerAdd]+1)
  }catch(err){
    alert(err);
    return null;
  }
}
