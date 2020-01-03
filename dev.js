// ==UserScript==
// @name         DEV Pallas EstagScript
// @namespace    http://github.com/AndradeMatheus/PallasEstagScript/
// @version      DEV
// @description  Cálculo de horas pallas estagiário
// @author       AndradeMatheus - Matheus Andrade (https://github.com/AndradeMatheus)
// @contributor  lucasvsouza28 - Lucas Souza (https://github.com/lucasvsouza28)
// @copyright    2019+, AndradeMatheus (https://github.com/AndradeMatheus)
// @match        http://intranet/pallas/*
// @icon
// @homepageURL  https://github.com/AndradeMatheus/PallasEstagScript/
// @include      *github.com*
// @grant        none
// ==/UserScript==

var $$ = window.jQuery;
var teste = null;
$$("#labelAbaModulo")[0].innerHTML = "[DEV] Pallas Estagiário";

$$("iframe#ifrmPai").on("load", function(e) {
  calculatePallas();
});

window.addEventListener(
  "load",
  function() {
    var li = $$(`<li id="divCalcEstagio" class="liTopo li-notificacao">
                             <a id="linkCalcEstagio" href="#" class="has-submenu">
                                 <i id="imagemCalcEstagio" class="fa fa-refresh corFonte"></i>
                                 <label id="labelCalcEstagio" class='label-icon-descricao'>RECALC PALLAS</label>
                             </a>
             </li>`);

    $$(li).click(function() {
      calculatePallas();
    });
    $$(".menuTopo").prepend(li);
  },
  false
);

function calculatePallas() {
  var date = new Date();
  var diasUteisHoje = date.getMonthBusinessDays(true);
  var $frm = $$("iframe#ifrmPai").contents();
  var $txtapontamentos_mes = $$("#txtapontamentos_mes", $frm);
  var $txtapontamentos_dia = $$("#txtapontamentos_dia", $frm);
  var $txtnr_horas_saldo_mes = $$("#txtnr_horas_saldo_mes", $frm);
  var $txtdt_saida_programada = $$("#txtdt_saida_programada", $frm);

  //Calcula os apontamentos do mês
  //var totalMes = "79h 17min / 168h 0min";

  var totalMes = (teste && teste["totalMes"]) || $txtapontamentos_mes.text();

  var hMes = parseInt(totalMes.split(" /")[0].split("h ")[0], 10);
  var minMes = parseInt(
    totalMes
      .split(" /")[0]
      .split("h ")[1]
      .replace("min", ""),
    10
  );
  var aux = (parseInt(totalMes.split("/ ")[1].split("h "), 10) / 8) * 6;
  totalMes = totalMes.split("/ ")[0];
  totalMes = `${totalMes}/ ${aux}h 0min`;

  //Calcula os apontamentos do dia
  var totalDia = (teste && teste["totalDia"]) || $txtapontamentos_dia.text();

  aux = parseInt(totalDia.split("/ ")[1].split("h "), 10) - 2;
  totalDia = totalDia.split("/ ")[0];
  totalDia = `${totalDia}/ ${aux}h 0min`;

  //Calcula o saldo do mês e a saída ideal
  var saida = "";
  var sldMes = -(diasUteisHoje * 6 - hMes);
  var totalSaldo = "";

  if (sldMes == 0 && minMes == 0) {
    totalSaldo = "ZEROU O SALDO!";
    alert("Hora de ir embora!");
    saida = "VAI EMBORA!!";
  } else if (sldMes >= 0) {
    totalSaldo = `+${sldMes}h ${minMes}min`;
    alert(`Cara, vai embora! Você tem ${totalSaldo.replace("+", "").replace(" ", " e ")} a mais!`);
    saida = "VAI EMBORA!!";
  } else {
    minMes = minMes > 0 ? 60 - minMes : 0;
    sldMes = minMes > 0 ? sldMes + 1 : sldMes;
    totalSaldo = `${sldMes}h ${minMes}min`;

    if (date.getMinutes() + minMes >= 60) {
      minMes = date.getMinutes() - 60 + minMes;
      sldMes -= 1;
    } else {
      minMes = date.getMinutes() + minMes;
    }

    var passouDia = date.getHours() + Math.abs(sldMes) >= 24 ? true : false;

    saida = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${
      passouDia ? 23 : date.getHours() + Math.abs(sldMes)
    }:${passouDia ? 59 : minMes < 10 ? "0" + minMes : minMes}`;
  }

  if (!teste) {
    teste = { totalMes: $$("#txtapontamentos_mes", $frm), totalDia: $$("#txtapontamentos_dia", $frm) };
  }

  //Atualiza as variáveis do HTML
  $txtapontamentos_mes[0].innerHTML = totalMes;
  $txtapontamentos_dia[0].innerHTML = totalDia;
  $txtnr_horas_saldo_mes[0].innerHTML = totalSaldo;
  $txtdt_saida_programada[0].innerHTML = saida;

  return true;
}

/*
 * Valida se é dia útil
 * returns   true = é dia útil, false = não é dia útil
 */
Date.prototype.isBusinessDay = function() {
  return this.getDay() % 6;
};

/*
 * Retorna quantidade de dias no mês
 * returns   quantidade de dias no mês
 */
Date.prototype.getDaysInMonth = function() {
  return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
};

/*
 * Retorna quantidade de dias úteis no mês. Se toDate = true, retorna quantidade de dias úteis até o hoje
 * returns   Quantidade de dias úteis no mês
 */
Date.prototype.getMonthBusinessDays = function(toDate = false) {
  debugger;
  var year = this.getFullYear();
  var month = this.getMonth();
  var today = new Date();

  // obtem quantidade de dias no mês
  var daysInMonth = this.getDaysInMonth();
  var ret = [];

  for (var i = 0; i < daysInMonth; i++) {
    var tmp = new Date(year, month, i + 1);

    // valida se é um dia útil
    if (tmp.isBusinessDay()) {
      // valida se deve calcular somente até o dia atual
      if (toDate && i >= today.getDate()) break;

      ret.push(i);
    }
  }
  return ret.length;
};
