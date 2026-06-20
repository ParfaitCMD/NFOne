// src/main.js
import { db } from "./db.js";
import { supabase } from "./auth.js";
import { LOGO_WSE_BASE64 } from "./assets.js";

import { renderizarTelaLogin } from "./login.js";
import { renderizarTelaDashboard } from "./dashboard.js";
import { renderizarTelaCatalogo } from "./catalogo.js";
import { renderizarTelaOrdemServico } from "./ordemdeservico.js";
import { renderizarTelaAgenda } from "./agenda.js";

const appContainer = document.getElementById("app-container");
const tituloModulo = document.getElementById("titulo-modulo");

async function pegarProximoNumeroNotaUnificado() {
  const notas = await db.notas.toArray();
  if (notas.length === 0) return "001";

  const numerosConvertidos = notas.map((n) => {
    let numLimpo = n.numero ? n.numero.replace("#", "") : "0";
    return parseInt(numLimpo, 10) || 0;
  });

  const maiorNumero = Math.max(...numerosConvertidos);
  const proximo = maiorNumero + 1;
  return String(proximo).padStart(3, "0");
}

window.carregarTela = function (tela) {
  document
    .querySelectorAll(".menu-item")
    .forEach((btn) => btn.classList.remove("active"));
  const btnAtivo = document.getElementById(`btn-${tela}`);
  if (btnAtivo) btnAtivo.classList.add("active");

  if (tela === "dashboard") {
    tituloModulo.innerText = "Dashboard";
    renderizarTelaDashboard();
  } else if (tela === "faturamento") {
    tituloModulo.innerText = "Faturamento";
    appContainer.innerHTML = `
      <h2>Gerar Nota Fiscal</h2>
      <div class="card-form faturamento-largura">
        <span class="section-label">Dados do Cliente (Tomador)</span>
        <input type="text" id="cli-nome" class="input-field" placeholder="Nome / Razão Social do Cliente" style="width: 100%; margin-bottom: 15px;">
        
        <div class="form-row">
          <input type="text" id="cli-cnpj" class="input-field" placeholder="CNPJ do Cliente">
          <input type="text" id="cli-data" class="input-field" placeholder="Data de Entrega (DD/MM/AAAA)">
        </div>
        
        <input type="text" id="cli-endereco" class="input-field" placeholder="Endereço Completo do Cliente" style="width: 100%;">

        <span class="section-label">Detalhes Técnicos do Trabalho</span>
        <div class="form-row">
          <input type="text" id="tec-equip" class="input-field" placeholder="Equipamento (Ex: Bomba de Água)">
          <input type="text" id="tec-tag" class="input-field" placeholder="TAG / Identificação">
        </div>
        
        <div class="form-row">
          <input type="text" id="tec-potencia" class="input-field" placeholder="Potência (Ex: 5.0 CV)">
          <input type="text" id="tec-forma" class="input-field" placeholder="Forma de Recebimento (Ex: Boleto, Pix)">
        </div>

        <textarea id="tec-desc" class="input-field" placeholder="Descrição Detalhada dos Serviços Prestados" style="width: 100%; height: 90px; resize: none; margin-bottom: 15px;"></textarea>
        
        <input type="text" id="tec-valor" class="input-field" placeholder="Valor Total (Ex: 3130,00)" style="width: 100%;">

        <button id="btn-generar-pdf" class="btn-primary">GERAR PDF WSE</button>
      </div>
    `;

    document
      .getElementById("btn-generar-pdf")
      .addEventListener("click", async () => {
        const cliente =
          document.getElementById("cli-nome").value ||
          "Cliente_Nao_Identificado";
        const cnpj = document.getElementById("cli-cnpj").value || "-";
        const data = document.getElementById("cli-data").value || "-";
        const endereco = document.getElementById("cli-endereco").value || "-";
        const equipamento = document.getElementById("tec-equip").value || "-";
        const tag = document.getElementById("tec-tag").value || "-";
        const potencia = document.getElementById("tec-potencia").value || "-";
        const forma = document.getElementById("tec-forma").value || "-";
        const desc =
          document.getElementById("tec-desc").value ||
          "Nenhuma descrição fornecida.";
        const valor = document.getElementById("tec-valor").value || "0,00";

        const proximoNumeroSequencial = await pegarProximoNumeroNotaUnificado();
        const numeroNotaFormatado = "#" + proximoNumeroSequencial;

        const htmlDaNota = `
      <div class="pdf-wrapper">
          <style>
              .pdf-wrapper { font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #000; background: #FFF; width: 750px; position: relative; box-sizing: border-box; }
              .logo-header { position: absolute; top: 30px; left: 30px; width: 80px; height: 80px; object-fit: contain; }
              .date { text-align: right; font-size: 14px; margin-bottom: 20px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; margin-top: 30px; }
              .header h1 { margin: 0; font-size: 26px; }
              .section { margin-bottom: 20px; }
              .section-title { background-color: #f0f0f0; padding: 8px; font-weight: bold; border-left: 4px solid #333; margin-bottom: 10px; font-size: 12px; }
              .row { margin-bottom: 4px; font-size: 13px; }
              .bold { font-weight: bold; }
              .total-box { margin-top: 20px; padding: 15px; border: 2px solid #000; text-align: right; font-size: 18px; font-weight: bold; }
              .desc-box { border: 1px solid #ccc; padding: 10px; min-height: 80px; font-size: 13px; white-space: pre-wrap; margin-bottom: 10px; }
              .footer { margin-top: 40px; text-align: center; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>

          ${LOGO_WSE_BASE64 ? `<img src="${LOGO_WSE_BASE64}" class="logo-header" />` : ""}
          
          <div class="date"><span class="bold">Data de Entrega:</span> ${data}</div>
          <div class="header">
              <h1>WSE Bombas e Motores</h1>
              <h3>Nota de Prestação de Serviço</h3>
              <div style="font-size: 14px; margin-top: 5px; font-weight: bold; color: #333;">N/D/N: ${numeroNotaFormatado}</div>
          </div>

          <div class="section">
              <div class="section-title">IDENTIFICAÇÃO DO PRESTADOR</div>
              <div class="row"><span class="bold">Razão Social:</span> WSE BOMBAS E MOTORES ELETRICOS LTDA</div>
              <div class="row"><span class="bold">Nome Fantasia:</span> WSE BOMBAS E MOTORES ELETRICOS</div>
              <div class="row"><span class="bold">CNPJ:</span> 58.054.890/0001-02</div>
              <div class="row"><span class="bold">Localidade:</span> Brasília - Distrito Federal | Brasil</div>
              <div class="row"><span class="bold">E-mail:</span> wsebombas@gmail.com</div>
          </div>

          <div class="section">
              <div class="section-title">DADOS DO TOMADOR (CLIENTE)</div>
              <div class="row"><span class="bold">Nome/Razão Social:</span> ${cliente}</div>
              <div class="row"><span class="bold">CNPJ:</span> ${cnpj}</div>
              <div class="row"><span class="bold">Endereço:</span> ${endereco}</div>
          </div>

          <div class="section">
              <div class="section-title">DETALHES DO TRABALHO</div>
              <div class="row"><span class="bold">Equipamento:</span> ${equipamento} | <span class="bold">TAG:</span> ${tag}</div>
              <div class="row"><span class="bold">Potência:</span> ${potencia} | <span class="bold">Tributação:</span> 14.01.01 - Manutenção de maquinário</div>
              <div class="row"><span class="bold">Forma de Recebimento:</span> ${forma}</div>
              <div style="margin-top: 10px;">
                  <div class="bold">Descrição dos Serviços:</div>
                  <div class="desc-box">${desc}</div>
              </div>
          </div>

          <div class="total-box">Valor Total: R$ ${valor}</div>

          <div class="footer">
              <span class="bold">WSE BOMBAS E MOTORES ELÉTRICOS</span><br/>
              CNPJ: 58.054.890/0001-02 | Contato: (61) 99800-7873
          </div>
      </div>
      `;

        try {
          const container = document.createElement("div");
          container.innerHTML = htmlDaNota;

          const pdfArrayBuffer = await window
            .html2pdf()
            .set({
              margin: 0,
              filename: "temp.pdf",
              image: { type: "jpeg", quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
            })
            .from(container)
            .outputPdf("arraybuffer");

          const blob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
          const urlBlob = URL.createObjectURL(blob);

          const linkDownload = document.createElement("a");
          linkDownload.href = urlBlob;
          linkDownload.download = `Nota_WSE_${proximoNumeroSequencial}_${cliente.replace(/\s+/g, "_")}.pdf`;
          document.body.appendChild(linkDownload);
          linkDownload.click();

          document.body.removeChild(linkDownload);
          URL.revokeObjectURL(urlBlob);

          await db.notas.add({
            numero: numeroNotaFormatado,
            cliente: cliente,
            data: data,
            valor: valor,
          });

          alert("Nota gerada com sucesso via navegador!");
          document
            .querySelectorAll(".input-field")
            .forEach((input) => (input.value = ""));
        } catch (erro) {
          console.error("Erro ao gerar o PDF:", erro);
          alert("Ocorreu um erro ao compilar e baixar o arquivo PDF.");
        }
      });
  } else if (tela === "catalogo") {
    renderizarTelaCatalogo();
  } else if (tela === "logistica") {
    renderizarTelaOrdemServico();
  } else if (tela === "agenda") {
    tituloModulo.innerText = "Agenda Corporativa";
    renderizarTelaAgenda();
  }
};

// CORREÇÃO DEFINITIVA DO LOGOUT: Removido o confirm() nativo interceptado pelo Tauri v2
document.querySelector(".logout-btn").addEventListener("click", async (e) => {
  const botao = e.target;

  if (botao.innerText === "Sair") {
    botao.innerText = "Confirma?";

    // Volta ao texto normal após 3 segundos se o usuário desistir de clicar novamente
    setTimeout(() => {
      if (botao && botao.innerText === "Confirma?") {
        botao.innerText = "Sair";
      }
    }, 3000);
    return;
  }

  if (botao.innerText === "Confirma?") {
    botao.innerText = "Sair";
    if (supabase) await supabase.auth.signOut();
    renderizarTelaLogin(() => {
      carregarTela("dashboard");
    });
  }
});

document
  .getElementById("btn-dashboard")
  .addEventListener("click", () => carregarTela("dashboard"));
document
  .getElementById("btn-faturamento")
  .addEventListener("click", () => carregarTela("faturamento"));
document
  .getElementById("btn-catalogo")
  .addEventListener("click", () => carregarTela("catalogo"));
document
  .getElementById("btn-logistica")
  .addEventListener("click", () => carregarTela("logistica"));
document
  .getElementById("btn-agenda")
  .addEventListener("click", () => carregarTela("agenda"));

async function inicializarFluxoDeAcesso() {
  try {
    if (!supabase) throw new Error("Dependência do Supabase Offline");

    const { data, error } = await supabase.auth.getSession();
    if (error) console.error(error);

    if (data && data.session) {
      const sidebarDOM = document.querySelector(".sidebar");
      const topHeaderDOM = document.querySelector(".top-header");

      if (sidebarDOM) sidebarDOM.style.display = "flex";
      if (topHeaderDOM) topHeaderDOM.style.display = "flex";

      carregarTela("dashboard");
      return;
    }

    renderizarTelaLogin(() => {
      carregarTela("dashboard");
    });
  } catch (err) {
    console.warn("Módulo de autenticação interrompido:", err);
    renderizarTelaLogin(() => {
      carregarTela("dashboard");
    });
  }
}

inicializarFluxoDeAcesso();
