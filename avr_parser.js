
//init pointer, mostly usless now, need rework

function initPointer(commentPi,commentPj,befehlPi,befehlPj,markPi,markPj,offsetPi,offsetPj,spec1Pi,spec1Pj,spec2Pi,spec2Pj)
{
  var arr = [[commentPi,commentPj],[befehlPi,befehlPj],[markPi,markPj],[offsetPi,offsetPj],[spec1Pi,spec1Pj],[spec2Pi,spec2Pj]];
  return arr;
}


//flags to check
function initFlags()
{

              // not even using it. in 1.1 clear up
              //   0            1              2        3        4           5
            //commentFlag, befehlFlag,, markerFlag,offsetFlag,spec1Flag,spec2Flag
  var arr = ["0","0","0","0","0","0"]
  return arr;
}


//to remove unnecessary symbols from text
function declutterer(input)
{
  var output;
  if (input[0] == " " || input[0] == ";" || input[0] == "+" || input[0] == ":"
      || input[0] == ",")
  {
    input.shift();
  }
  return output = input;
}

//clasic node struct

function node(value)
{
  this.value = value;
  this.flag = false;

}


//list of all commands
var foo = ["SUB","STS","STD","ST","SBR","RJMP","RET","RCALL","PUSH","POP","OUT",
"OR","NOP","MUL","MOV","LSR","LSL","LDI","LDD","LD","INC","IN","IJMP","ICALL","EOR",
"DEC","CPI","CP","BSET","BRLO","BREQ","BCLR","AND","ADD","CBR"];


//my own .concat function
function deSplitter(arr)
{

  var result ="";
  for (var i = 0; i < arr.length; i++)
  {
    result += arr[i];
  }
  return result;
}


//object to handle imput
function assemblerBefehl()
{
  this.orgBefehl
  this.mark = new node();  //jmp marks
  this.befehl = new node(); //command
  this.spec1 = new node();  //specifier 1 (Register etc..)
  this.spec2 = new node();  //specifier 2 (Register etc..)
  this.offset = new node(); //offset. remove in 1.1
  this.comment = new node(); //comment
  this.isValid = false;  //check for existance of command in command array

  //print that shit to console
  this.printbefehl = function()
  {
    console.log(this.orgBefehl);
    if(this.befehl.flag)
    {
      console.log("Befehl     :" +  " " + this.befehl.value);
    }
    if(this.spec1.flag)
    {
      console.log("Spec1      :" +  " " + this.spec1.value);
    }
    if(this.offset.flag)
    {
      console.log("Offset     :" +  " " + this.offset.value);
    }
    if(this.spec2.flag)
    {
      console.log("Spec2      :" +  " " + this.spec2.value);
    }
    if(this.mark.flag)
    {
      console.log("Marke      :" +  " " + this.mark.value);
    }
    if (this.comment.flag)
    {
      console.log("Kommentar  :" + " " + this.comment.value);
    }
  }
  //actual "parsing"
  this.parse = function()
  {

    //cut input
    var out = this.orgBefehl.split("");


    //init objects
    var pointer = initPointer();
    var flags = initFlags();

    for (var i = 0; i < out.length; i++)
    {

        //check for parsing markers, check for reference points and safe in flags and Pointer
        //moste useless now, rework for 1.1
        switch (out[i])
        {

          case ":":
                          flags[2] = "1"
                          pointer[2,0] = i;


                          break;
          case "+":
                          flags[3] = "1";
                          pointer[3,0] = i;
                          break;
          case ",":
                          flags[5] = "1";
                          pointer[5,0] = i;
                          break;

        default:
                          break;
        }
    }
    //remove the comments
    for (var i = 0; i < out.length; i++)
    {
      if (out[i] == ";")
      {
        out.splice(i,out.length);
      }
    }

    //replacing of not useable symbols like ; or ,
    console.log(out);
    out = deSplitter(out);
    out = out.replace(","," ");
    out = out.replace(":"," ");
    out = out.split(" ");
    console.log("Start cutting___________________");
    console.log(out);


    //prevent from cutting elements from an array which is beeing iterated
    var tempOut = [];
    while (out.length > 0) {
      var part = out.shift();
      if (part != "")
        tempOut.push(part);
    }

    console.log("out: " + out);
    console.log("End cutting_____________________");

    out = tempOut;


    //assignment to parameter
    if (flags[2] == "1")
    {
      this.mark.value = out[0];  //jmp marks
      out.shift();
      this.mark.flag = true;
    }
    this.befehl.value = out[0];  //actual commands
    this.befehl.flag = true;
    out.shift();
    this.spec1.value = out[0];  //spec1
    this.spec1.flag = true;
    out.shift();

    if (flags[5] == "1")
    {
      this.spec2.value = out[0]; //spec2
      out.shift();
      this.spec2.flag = true;
    }

    for (var i = 0; i < foo.length; i++)
    {
      if (foo[i] == this.befehl.value || this.mark.flag)
      {
        this.isValid = true;
        break;
      }
    }

  }
}


//test area

var test = new assemblerBefehl();
test.orgBefehl = "LDI R16, 0b11110000 ";
test.parse();
test.printbefehl();
