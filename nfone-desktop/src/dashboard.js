// src/dashboard.js
import { db } from "./db.js";
import { LOGO_WSE_BASE64 } from "./assets.js";

let idNotaEmEdicao = null;

export function renderizarTelaDashboard() {
  const appContainer = document.getElementById("app-container");
  idNotaEmEdicao = null; // Reseta o estado de edição ao abrir a tela

  appContainer.innerHTML = `
    <h2>Painel de Controle <span style="color: var(--accent-green);">WSE</span></h2>
    <p style="color: var(--text-secondary); margin-top: 5px; margin-bottom: 25px;">Bem-vindo de volta! Monitoramento operacional e financeiro rápido.</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; width: 100%; box-sizing: border-box; margin-bottom: 30px;">
      
      <div class="card-form" style="margin-top: 0; padding: 25px; background: linear-gradient(135deg, #151a30 0%, #1a2035 100%); border-left: 5px solid var(--accent-green);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Faturamento Total</span>
          <span style="font-size: 18px; color: var(--accent-green);">💰</span>
        </div>
        <h3 id="dash-faturamento-total" style="font-size: 26px; color: #FFF; margin-top: 15px; font-weight: bold; letter-spacing: 0.5px;">R$ 0,00</h3>
        <div style="margin-top: 12px; height: 4px; background: rgba(34, 197, 94, 0.2); border-radius: 2px;">
          <div style="width: 100%; height: 100%; background: var(--accent-green); border-radius: 2px;"></div>
        </div>
      </div>

      <div class="card-form" style="margin-top: 0; padding: 25px; background: linear-gradient(135deg, #151a30 0%, #1a2035 100%); border-left: 5px solid var(--accent-blue);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Notas Emitidas</span>
          <span style="font-size: 18px; color: var(--accent-blue);">📄</span>
        </div>
        <h3 id="dash-total-notas" style="font-size: 26px; color: #FFF; margin-top: 15px; font-weight: bold;">0</h3>
        <div style="margin-top: 12px; height: 4px; background: rgba(0, 198, 255, 0.2); border-radius: 2px;">
          <div style="width: 100%; height: 100%; background: var(--accent-blue); border-radius: 2px;"></div>
        </div>
      </div>

      <div class="card-form" style="margin-top: 0; padding: 25px; background: linear-gradient(135deg, #151a30 0%, #1a2035 100%); border-left: 5px solid #f59e0b;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Média por Nota</span>
          <span style="font-size: 18px; color: #f59e0b;">📊</span>
        </div>
        <h3 id="dash-media-nota" style="font-size: 26px; color: #FFF; margin-top: 15px; font-weight: bold;">R$ 0,00</h3>
        <div style="margin-top: 12px; height: 4px; background: rgba(245, 158, 11, 0.2); border-radius: 2px;">
          <div style="width: 100%; height: 100%; background: #f59e0b; border-radius: 2px;"></div>
        </div>
      </div>

    </div>

    <div style="display: grid; grid-template-columns: 1fr 340px; gap: 25px; width: 100%; box-sizing: border-box; align-items: flex-start;">
      
      <div style="display: flex; flex-direction: column; gap: 15px; min-width: 0;">
        <h3 style="color: var(--text-primary); font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">Histórico de Emissões (ERP)</h3>
        
        <div class="card-form" style="padding: 0; overflow-x: auto; border: 1px solid var(--border); margin-top: 0; background: #151a30; width: 100%;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; color: var(--text-primary); font-size: 14px; table-layout: fixed;">
            <thead>
              <tr style="background-color: #111522; border-bottom: 1px solid var(--border); font-weight: bold;">
                <th style="padding: 15px; width: 22%;">N/D/N</th>
                <th style="padding: 15px; width: 40%;">Cliente / Tomador</th>
                <th style="padding: 15px; width: 23%;">Data</th>
                <th style="padding: 15px; width: 15%; text-align: right;">Valor</th>
                <th style="padding: 15px; width: 110px; text-align: center;">Ações</th>
              </tr>
            </thead>
            <tbody id="lista-historico-dash">
              </tbody>
          </table>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 15px;">
        <h3 style="color: var(--text-primary); font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">Gerenciamento Rápido</h3>
        
        <div class="card-form" id="painel-nota-rapida" style="margin-top: 0; padding: 20px; background: #1a2035; border: 1px solid var(--border); border-radius: 12px;">
          <span class="section-label" id="titulo-form-nota" style="color: var(--accent-blue); margin-top: 0; margin-bottom: 15px;">Emitir Nota Rápida</span>
          
          <input type="text" id="dash-cli-nome" class="input-field" placeholder="Nome do Cliente" style="width: 100%; margin-bottom: 12px; padding: 12px;">
          <input type="text" id="dash-cli-data" class="input-field" placeholder="Data (DD/MM/AAAA)" style="width: 100%; margin-bottom: 12px; padding: 12px;">
          <input type="text" id="dash-cli-valor" class="input-field" placeholder="Valor R$ (Ex: 1500,00)" style="width: 100%; margin-bottom: 15px; padding: 12px;">

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button id="btn-salvar-nota-rapida" class="btn-primary" style="margin-top: 0; padding: 12px; font-size: 14px; background-color: var(--accent-blue); color: #0a0e1a;">SALVAR EMISSÃO</button>
            <button id="btn-cancelar-nota-edicao" class="btn-primary" style="margin-top: 0; padding: 12px; font-size: 14px; background: #333; color: #fff; display: none;">CANCELAR EDICÃO</button>
          </div>
        </div>
      </div>

    </div>
  `;

  inicializarLogicaDashboard();
}

async function inicializarLogicaDashboard() {
  const tbody = document.getElementById("lista-historico-dash");
  const txtFaturamento = document.getElementById("dash-faturamento-total");
  const txtTotalNotas = document.getElementById("dash-total-notas");
  const txtMedia = document.getElementById("dash-media-nota");

  const inputNome = document.getElementById("dash-cli-nome");
  const inputData = document.getElementById("dash-cli-data");
  const inputValor = document.getElementById("dash-cli-valor");
  const btnSalvar = document.getElementById("btn-salvar-nota-rapida");
  const btnCancelar = document.getElementById("btn-cancelar-nota-edicao");
  const painelForm = document.getElementById("painel-nota-rapida");
  const tituloForm = document.getElementById("titulo-form-nota");

  const gerarProximoNumeroNota = async () => {
    const notas = await db.notas.toArray();
    if (notas.length === 0) return "001";

    const numerosConvertidos = notas.map((n) => {
      let numLimpo = n.numero ? n.numero.replace("#", "") : "0";
      return parseInt(numLimpo, 10) || 0;
    });

    const maiorNumero = Math.max(...numerosConvertidos);
    const proximo = maiorNumero + 1;

    return String(proximo).padStart(3, "0");
  };

  const atualizarPainel = async () => {
    const notasSalvas = await db.notas.toArray();
    let somaTotal = 0;
    tbody.innerHTML = "";

    if (notasSalvas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: var(--text-secondary);">Nenhum registro de faturamento local.</td></tr>`;
      txtTotalNotas.innerText = "0";
      txtFaturamento.innerText = "R$ 0,00";
      txtMedia.innerText = "R$ 0,00";
      return;
    }

    const notasOrdenadas = [...notasSalvas].reverse();

    notasOrdenadas.forEach((nota) => {
      let valorLimpo = nota.valor
        ? nota.valor.replace(/\./g, "").replace(",", ".")
        : "0";
      let valorNumerico = parseFloat(valorLimpo) || 0;
      somaTotal += valorNumerico;

      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--border)";
      tr.innerHTML = `
        <td style="padding: 15px; font-weight: bold; color: var(--accent-blue);">${nota.numero.startsWith("#") ? nota.numero : "#" + nota.numero}</td>
        <td style="padding: 15px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nota.cliente}</td>
        <td style="padding: 15px; color: var(--text-secondary);">${nota.data || "-"}</td>
        <td style="padding: 15px; text-align: right; color: var(--accent-green); font-weight: bold;">R$ ${nota.valor}</td>
        <td style="padding: 15px; text-align: center;">
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button class="btn-edit-nota" data-id="${nota.id}" style="background: none; border: none; color: var(--accent-blue); cursor: pointer; font-size: 13px; font-weight: bold;">Editar</button>
            <button class="btn-del-nota" data-id="${nota.id}" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 13px; font-weight: bold; transition: 0.2s;">Excluir</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    txtTotalNotas.innerText = notasSalvas.length;
    txtFaturamento.innerText = `R$ ${somaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const mediaCalculada = somaTotal / notasSalvas.length;
    txtMedia.innerText = `R$ ${mediaCalculada.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    document.querySelectorAll(".btn-edit-nota").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
        const nota = await db.notas.get(id);
        if (nota) {
          idNotaEmEdicao = id;
          tituloForm.innerText = `📝 Editar Nota ${nota.numero}`;
          tituloForm.style.color = "var(--accent-blue)";
          painelForm.style.borderColor = "var(--accent-blue)";
          btnCancelar.style.display = "block";
          btnSalvar.innerText = "ATUALIZAR NOTA";
          btnSalvar.style.backgroundColor = "var(--accent-blue)";

          inputNome.value = nota.cliente;
          inputData.value = nota.data;
          inputValor.value = nota.valor;
        }
      });
    });

    document.querySelectorAll(".btn-del-nota").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const botao = e.target;

        if (botao.innerText === "Excluir") {
          botao.innerText = "Confirma?";
          botao.style.color = "#ef4444";

          setTimeout(() => {
            if (botao && botao.innerText === "Confirma?") {
              botao.innerText = "Excluir";
              botao.style.color = "var(--danger)";
            }
          }, 3000);
          return;
        }

        if (botao.innerText === "Confirma?") {
          const id = parseInt(botao.getAttribute("data-id"));
          await db.notas.delete(id);
          if (idNotaEmEdicao === id) resetarFormularioNota();
          atualizarPainel();
        }
      });
    });
  };

  const resetarFormularioNota = () => {
    idNotaEmEdicao = null;
    tituloForm.innerText = "Emitir Nota Rápida";
    tituloForm.style.color = "var(--accent-blue)";
    painelForm.style.borderColor = "var(--border)";
    btnCancelar.style.display = "none";
    btnSalvar.innerText = "SALVAR EMISSÃO";
    btnSalvar.style.backgroundColor = "var(--accent-blue)";

    inputNome.value = "";
    inputData.value = "";
    inputValor.value = "";
  };

  // INJETADO: MOTOR DE PDF DENTRO DO BOTÃO SALVAR
  btnSalvar.addEventListener("click", async () => {
    const cliente = inputNome.value.trim();
    const data = inputData.value.trim();
    const valor = inputValor.value.trim();

    if (!cliente || !valor)
      return alert("Por favor, informe no mínimo o Cliente e o Valor!");

    let numeroNotaFormatado = "";

    if (idNotaEmEdicao === null) {
      const proximoNum = await gerarProximoNumeroNota();
      numeroNotaFormatado = "#" + proximoNum;
      await db.notas.add({
        numero: numeroNotaFormatado,
        cliente,
        data,
        valor,
      });
    } else {
      const notaOriginal = await db.notas.get(idNotaEmEdicao);
      numeroNotaFormatado = notaOriginal.numero;
      await db.notas.update(idNotaEmEdicao, {
        numero: numeroNotaFormatado,
        cliente,
        data,
        valor,
      });
    }

    // DISPARA O DOWNLOAD AUTOMÁTICO DO PDF NO NAVEGADOR
    try {
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
          <div class="date"><span class="bold">Data de Entrega:</span> ${data || "-"}</div>
          <div class="header">
              <h1>WSE Bombas e Motores</h1>
              <h3>Nota de Prestação de Serviço</h3>
              <div style="font-size: 14px; margin-top: 5px; font-weight: bold; color: #333;">N/D/N: ${numeroNotaFormatado}</div>
          </div>
          <div class="section">
              <div class="section-title">IDENTIFICAÇÃO DO PRESTADOR</div>
              <div class="row"><span class="bold">Razão Social:</span> WSE BOMBAS E MOTORES ELETRICOS LTDA</div>
              <div class="row"><span class="bold">CNPJ:</span> 58.054.890/0001-02</div>
              <div class="row"><span class="bold">E-mail:</span> wsebombas@gmail.com</div>
          </div>
          <div class="section">
              <div class="section-title">DADOS DO TOMADOR (CLIENTE)</div>
              <div class="row"><span class="bold">Nome/Razão Social:</span> ${cliente}</div>
          </div>
          <div class="section">
              <div class="section-title">DETALHES DO TRABALHO</div>
              <div style="margin-top: 10px;">
                  <div class="bold">Descrição dos Serviços:</div>
                  <div class="desc-box">Prestação de serviço operacional unificado. Detalhes completos sob consulta técnica na ordem de faturamento principal.</div>
              </div>
          </div>
          <div class="total-box">Valor Total: R$ ${valor}</div>
          <div class="footer">
              <span class="bold">WSE BOMBAS E MOTORES ELÉTRICOS</span><br/>
              CNPJ: 58.054.890/0001-02
          </div>
      </div>`;

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
      linkDownload.download = `Nota_Rapida_WSE_${numeroNotaFormatado.replace("#", "")}_${cliente.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(linkDownload);
      linkDownload.click();
      document.body.removeChild(linkDownload);
      URL.revokeObjectURL(urlBlob);
    } catch (e) {
      console.error("Erro ao baixar PDF da nota rápida:", e);
    }

    resetarFormularioNota();
    atualizarPainel();
  });

  btnCancelar.addEventListener("click", resetarFormularioNota);

  atualizarPainel();
}
