// src/orcamentos.js
import { LOGO_WSE_BASE64 } from "./assets.js";

export function renderizarTelaOrcamentos() {
  const appContainer = document.getElementById("app-container");

  appContainer.innerHTML = `
    <h2>Gerar Documento Comercial</h2>
    <div class="card-form faturamento-largura">
      <span class="section-label">Configuração do Documento</span>
      <div class="form-row" style="margin-bottom: 15px;">
        <select id="orc-tipo" class="input-field" style="background-color: var(--bg-input); color: #fff; padding: 15px; border: 1px solid var(--border); border-radius: 8px;">
          <option value="Orçamento">📋 Orçamento Comercial</option>
          <option value="Laudo">🔬 Laudo Técnico</option>
        </select>
      </div>

      <span class="section-label">Informações Adicionais (Opcionais)</span>
      <input type="text" id="orc-local" class="input-field" placeholder="Local / Setor (Ex: Sala de Bombas - Bloco A)" style="width: 100%; margin-bottom: 15px;">
      
      <span class="section-label">Itens do Documento</span>
      <div id="itens-container" style="margin-bottom: 15px;">
        <div class="form-row item-linha" style="margin-bottom: 10px; display: flex; gap: 10px;">
          <input type="text" class="input-field orc-item-desc" placeholder="Descrição da peça ou análise técnica" style="flex: 2;">
          <input type="number" step="0.01" class="input-field orc-item-valor" placeholder="Valor (Ex: 250.00)" style="flex: 1;">
          <button type="button" class="btn-remover-item" style="background: #ef4444; color: white; border: none; border-radius: 8px; padding: 0 15px; cursor: pointer;">X</button>
        </div>
      </div>
      
      <button id="btn-adicionar-item" type="button" class="btn-secondary" style="background-color: #2563eb; color: white; margin-bottom: 20px; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">+ ADICIONAR ITEM</button>

      <div id="wrapper-total-tela" style="font-size: 18px; font-weight: bold; margin-bottom: 20px; text-align: right; color: #fff;">
        Total Acumulado: R$ <span id="lbl-total-acumulado">0,00</span>
      </div>

      <button id="btn-gerar-documento" class="btn-primary">GERAR DOCUMENTO PDF</button>
    </div>
  `;

  const selectTipo = document.getElementById("orc-tipo");
  const wrapperTotalTela = document.getElementById("wrapper-total-tela");

  // FUNÇÃO QUE ALTERNA A INTERFACE EM TEMPO REAL (Esconde/Mostra Valores)
  function alternarCamposPorTipo() {
    const ehLaudo = selectTipo.value === "Laudo";

    // Esconde ou mostra o totalizador da tela
    wrapperTotalTela.style.display = ehLaudo ? "none" : "block";

    // Esconde ou mostra as caixas de valores de cada linha adicionada
    document.querySelectorAll(".orc-item-valor").forEach((input) => {
      input.style.display = ehLaudo ? "none" : "block";
    });
  }

  // Ouvinte de mudança do tipo de documento
  selectTipo.addEventListener("change", alternarCamposPorTipo);

  // Função para calcular o total em tempo real na tela (apenas para Orçamentos)
  function atualizarTotalPrevia() {
    if (selectTipo.value === "Laudo") return;
    let total = 0;
    document.querySelectorAll(".orc-item-valor").forEach((input) => {
      const val = parseFloat(input.value) || 0;
      total += val;
    });
    document.getElementById("lbl-total-acumulado").innerText =
      total.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  }

  document.getElementById("itens-container").addEventListener("input", (e) => {
    if (e.target.classList.contains("orc-item-valor")) {
      atualizarTotalPrevia();
    }
  });

  document.getElementById("itens-container").addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-remover-item")) {
      const linhas = document.querySelectorAll(".item-linha");
      if (linhas.length > 1) {
        e.target.closest(".item-linha").remove();
        atualizarTotalPrevia();
      } else {
        alert("O documento precisa ter pelo menos um item!");
      }
    }
  });

  document
    .getElementById("btn-adicionar-item")
    .addEventListener("click", () => {
      const container = document.getElementById("itens-container");
      const novaLinha = document.createElement("div");
      novaLinha.className = "form-row item-linha";
      novaLinha.style = "margin-bottom: 10px; display: flex; gap: 10px;";
      novaLinha.innerHTML = `
      <input type="text" class="input-field orc-item-desc" placeholder="Descrição da peça ou análise técnica" style="flex: 2;">
      <input type="number" step="0.01" class="input-field orc-item-valor" placeholder="Valor (Ex: 250.00)" style="flex: 1;">
      <button type="button" class="btn-remover-item" style="background: #ef4444; color: white; border: none; border-radius: 8px; padding: 0 15px; cursor: pointer;">X</button>
    `;
      container.appendChild(novaLinha);

      // Roda a validação para garantir que se for Laudo, o novo input já nasça oculto
      alternarCamposPorTipo();
    });

  // AÇÃO DO BOTÃO GERAR PDF
  document
    .getElementById("btn-gerar-documento")
    .addEventListener("click", async () => {
      const tipoDocumento = selectTipo.value;
      const local =
        document.getElementById("orc-local").value || "Não especificado";
      const dataHoje = new Date().toLocaleDateString("pt-BR");
      const ehLaudo = tipoDocumento === "Laudo";

      let totalGeral = 0;
      let htmlQuadrantesItens = "";

      const descInputs = document.querySelectorAll(".orc-item-desc");
      const valorInputs = document.querySelectorAll(".orc-item-valor");

      descInputs.forEach((descIn, index) => {
        const descTexto = descIn.value || "Item sem descrição";
        const valorNum = parseFloat(valorInputs[index].value) || 0;
        totalGeral += valorNum;

        const valorFormatado = valorNum.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        if (ehLaudo) {
          // Layout para Laudo: Apenas quadrantes de descrição ocupando largura inteira
          htmlQuadrantesItens += `
          <div class="quadrantes-container">
              <div class="quadrante-item">
                  <div class="desc-text-box">${descTexto}</div>
              </div>
          </div>
        `;
        } else {
          // Layout para Orçamento: Quadrante de descrição + Quadrante de valor lado a lado
          htmlQuadrantesItens += `
          <div class="quadrantes-container">
              <div class="quadrante-item">
                  <div class="desc-text-box">${descTexto}</div>
              </div>
              <div class="quadrante-item valor-alinhamento">
                  <div class="valor-text-box">R$ ${valorFormatado}</div>
              </div>
          </div>
        `;
        }
      });

      const totalGeralFormatado = totalGeral.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const htmlDoDocumento = `
      <div class="pdf-documento-limpo">
          <style>
              .pdf-documento-limpo { font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #FFF; width: 750px; position: relative; box-sizing: border-box; }
              .logo-header { position: absolute; top: 40px; left: 50px; width: 80px; height: 80px; object-fit: contain; }
              .date-top { text-align: right; font-size: 13px; color: #64748b; margin-bottom: 20px; }
              .header-emissor { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 30px; margin-top: 20px; }
              .header-emissor h1 { margin: 0; font-size: 26px; color: #0f172a; text-transform: uppercase; }
              .header-emissor h3 { margin: 5px 0 0 0; font-size: 16px; color: #475569; }
              
              .section-box { margin-bottom: 20px; }
              .section-title-pdf { background-color: #f1f5f9; padding: 8px 12px; font-weight: bold; border-left: 4px solid #0f172a; margin-bottom: 12px; font-size: 12px; text-transform: uppercase; color: #0f172a; }
              .row-pdf { margin-bottom: 6px; font-size: 13px; color: #334155; }
              .bold { font-weight: bold; color: #0f172a; }
              
              .quadrantes-header { display: flex; gap: 20px; font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 6px; padding: 0 5px; }
              .quadrantes-header div { flex: 1; }
              .quadrantes-header .val-title { max-width: 200px; text-align: right; }

              .quadrantes-container { display: flex; gap: 20px; margin-bottom: 8px; page-break-inside: avoid; }
              .quadrante-item { flex: 1; display: flex; flex-direction: column; }
              .quadrante-item.valor-alinhamento { max-width: 200px; }
              
              .desc-text-box { border: 1px solid #cbd5e1; padding: 12px; min-height: 40px; font-size: 13px; white-space: pre-wrap; color: #334155; background: #f8fafc; line-height: 1.4; display: flex; align-items: center; }
              .valor-text-box { border: 1px solid #cbd5e1; padding: 12px; min-height: 40px; font-size: 14px; font-weight: bold; color: #0f172a; background: #f8fafc; display: flex; align-items: center; justify-content: flex-end; width: 100%; box-sizing: border-box; }
              
              .total-box-pdf { margin-top: 30px; padding: 15px; border: 2px solid #0f172a; text-align: right; font-size: 18px; font-weight: bold; color: #0f172a; }
              
              .footer-agradecimento { margin-top: 50px; text-align: center; font-size: 13px; font-weight: 600; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>

          ${LOGO_WSE_BASE64 ? `<img src="${LOGO_WSE_BASE64}" class="logo-header" />` : ""}
          
          <div class="date-top"><span class="bold">Data de Emissão:</span> ${dataHoje}</div>
          <div class="header-emissor">
              <h1>WSE Bombas e Motores</h1>
              <h3>${tipoDocumento} Técnico Operacional</h3>
          </div>

          <div class="section-box">
              <div class="section-title-pdf">Identificação do Prestador</div>
              <div class="row-pdf"><span class="bold">Razão Social:</span> WSE BOMBAS E MOTORES ELETRICOS LTDA</div>
              <div class="row-pdf"><span class="bold">CNPJ:</span> 58.054.890/0001-02</div>
              <div class="row-pdf"><span class="bold">Localidade:</span> Brasília - Distrito Federal | Brasil</div>
              <div class="row-pdf"><span class="bold">E-mail:</span> wsebombas@gmail.com</div>
          </div>

          <div class="section-box">
              <div class="section-title-pdf">Detalhes do Registro</div>
              <div class="row-pdf"><span class="bold">Local / Setor Aplicado:</span> ${local}</div>
          </div>

          <div class="quadrantes-header">
              <div>${ehLaudo ? "Análises e Descrições Técnicas:" : "Descrição das Peças / Serviços:"}</div>
              ${ehLaudo ? "" : '<div class="val-title">Valores Unitários:</div>'}
          </div>

          ${htmlQuadrantesItens}

          ${ehLaudo ? "" : `<div class="total-box-pdf">Valor Total Geral: R$ ${totalGeralFormatado}</div>`}

          <div class="footer-agradecimento">
              WSE Bombas e Motores agradece a preferência!
          </div>
      </div>
    `;

      try {
        const container = document.createElement("div");
        container.innerHTML = htmlDoDocumento;

        const pdfArrayBuffer = await window
          .html2pdf()
          .set({
            margin: 0.3,
            filename: "temp.pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["avoid-all", "css"] },
          })
          .from(container)
          .outputPdf("arraybuffer");

        const blob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
        const urlBlob = URL.createObjectURL(blob);

        const linkDownload = document.createElement("a");
        linkDownload.href = urlBlob;
        linkDownload.download = `${tipoDocumento}_WSE_${dataHoje.replace(/\//g, "-")}.pdf`;
        document.body.appendChild(linkDownload);
        linkDownload.click();

        document.body.removeChild(linkDownload);
        URL.revokeObjectURL(urlBlob);

        alert(`${tipoDocumento} gerado com sucesso!`);

        document.getElementById("orc-local").value = "";
        document.getElementById("itens-container").innerHTML = `
        <div class="form-row item-linha" style="margin-bottom: 10px; display: flex; gap: 10px;">
          <input type="text" class="input-field orc-item-desc" placeholder="Descrição da peça ou análise técnica" style="flex: 2;">
          <input type="number" step="0.01" class="input-field orc-item-valor" placeholder="Valor (Ex: 250.00)" style="flex: 1;">
          <button type="button" class="btn-remover-item" style="background: #ef4444; color: white; border: none; border-radius: 8px; padding: 0 15px; cursor: pointer;">X</button>
        </div>
      `;
        alternarCamposPorTipo();
        atualizarTotalPrevia();
      } catch (erro) {
        console.error("Erro ao processar PDF:", erro);
        alert("Erro ao compilar o arquivo PDF.");
      }
    });

  // Executa uma vez no início para garantir que o estado inicial do formulário esteja correto
  alternarCamposPorTipo();
}
