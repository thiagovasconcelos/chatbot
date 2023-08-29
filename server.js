const express = require("express");
const app = express();
const axios = require("axios");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

var score;
var CNS;

app.post("/Dialogflow", function (request, response) {
  var intentName = request.body.queryResult.intent.displayName;
  let cns = request.body.queryResult.parameters.CNS;
  let nome = request.body.queryResult.parameters.nome;
  let idade = request.body.queryResult.parameters.idade;
  let perg_1 = + request.body.queryResult.parameters.Perg_1;
  let perg_2 = + request.body.queryResult.parameters.Perg_2;
  let perg_3 = + request.body.queryResult.parameters.Perg_3;
  let perg_4 = + request.body.queryResult.parameters.Perg_4;
  let perg_5 = + request.body.queryResult.parameters.Perg_5;
  let perg_6 = + request.body.queryResult.parameters.Perg_6;
  let perg_7 = + request.body.queryResult.parameters.Perg_7;
  let perg_8 = + request.body.queryResult.parameters.Perg_8;
  let FAQ = request.body.queryResult.parameters.Faq;
  let Diario = request.body.queryResult.parameters.d_sim;


  if (intentName === "Default Welcome Intent") {
     console.log(cns, nome, idade)
    CNS = cns;
    salvar(cns, nome, idade);
  } else if (intentName === "IPSS") {
    console.log(
      intentName,
      perg_1,
      perg_2,
      perg_3,
      perg_4,
      perg_5,
      perg_6,
      perg_7,
      perg_8
    );

    score =
      perg_1 + perg_2 + perg_3 + perg_4 + perg_5 + perg_6 + perg_7 + perg_8;
    console.log(score);
    result(score, response);
    save_result(score, CNS);
  }
  else if(intentName === "Faq"){
    Faq(response, FAQ)
    console.log(intentName)
  }
  else if(intentName === "Diario Miccional - yes"){
    diario(response, Diario, CNS)
    console.log(intentName)
    console.log(Diario)
  }  
});

const listener = app.listen(process.env.PORT, function () {
  console.log("Your app listening on port " + listener.address().port);
});

//Função para salvar dados na tabela
function salvar(cns, nome, idade) {
  axios
    .post(
      "https://sheetdb.io/api/v1/lu8iaubciwoim",
      {
        data: {
          CNS: cns,
          nome: nome,
          idade: idade,
        },
      },
      {
        auth: {
         username: "45w98pkn",
          password: "qcud2okpayhuubwohfbi",
        },
      }
    )
    .then((response) => {
      //alert(response.data);
    })
    .catch((response) => {
      console.log(response.data);
    });
}
//Função para consultar assuntos que o cliente solicitou e retornar respostas
  function Faq(response, FAQ) {
    return axios.get(`https://sheetdb.io/api/v1/lu8iaubciwoim/?sheet=Faq`, {
        auth: {
         username: "45w98pkn",
          password: "qcud2okpayhuubwohfbi",
        },
      })
      .then((res) => {
      console.log(res.data)
        res.data.map((person) => {
          if(FAQ == person.Num_Perg){
            response.json({
            fulfillmentText:
              person.Resposta,
          });
          }  
        });
      });
    }

//Função para resultado do escore
function result(score, response) {
  if (score >= 0 && score <= 19) {
    console.log("Obrigado por finalizar. Nos vemos novamente próximo mês!");
    response.json({
      fulfillmentText:
        "Obrigado por finalizar. Nos vemos novamente próximo mês!",
    });
  } else {
    console.log(
      "Entre em contato com o HC para marcação de uma consulta com o seu Urologista."
    );
    response.json({
      fulfillmentText:
        "Entre em contato com o HC para marcação de uma consulta com o seu Urologista.",
    });
  }
}

//Função para associar o score ao Cartão do SUS 
function save_result(score, CNS) {
  axios
    .patch(
      `https://sheetdb.io/api/v1/lu8iaubciwoim/CNS/${CNS}`,
      {
        data: {
          score: score,
        },
      },
      {
        auth: {
          username: "45w98pkn",
          password: "qcud2okpayhuubwohfbi",
        },
      }
    )
    .then((response) => {
      console.log(response.data);
    })
    .catch((erro) => {
      console.log(erro);
    });
}

//Função para armazenar informações no Diario miccional
function diario(response, Diario, CNS) {
    return axios.post(`https://sheetdb.io/api/v1/lu8iaubciwoim/?sheet=Diario`,{
      "data":{
        "CNS": CNS,
        "Data": new Date().toLocaleString("pt-BR", {timeZone:"America/Sao_Paulo"}),
        "Volume": Diario
      }
    }, {
        auth: {
         username: "45w98pkn",
          password: "qcud2okpayhuubwohfbi",
        },
      })
      .then((res) => {
      console.log(res.data)
       
      });
}

