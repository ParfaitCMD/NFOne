// src/historico.js
import { db } from "./db.js";

export async function gerarPlanilhaHistoricoCompleto() {
  try {
    console.log(
      "Iniciando a consolidação de dados para o relatório corporativo...",
    );

    // 1. Busca os dados reais das tabelas locais do Dexie/IndexedDB
    const listaNotas = await db.notas.toArray();
    const listaOrdemServicos = db.ordens ? await db.ordens.toArray() : [];
    const listaAgenda = db.agenda ? await db.agenda.toArray() : [];

    // 2. Estrutura o HTML no formato de documento oficial impresso (Fundo Claro)
    let htmlRelatorio = `
      <div class="relatorio-documento">
          <style>
              /* Configurações de página corporativa e limpa */
              .relatorio-documento { 
                  font-family: 'Segoe UI', Helvetica, Arial, sans-serif; 
                  padding: 50px; 
                  color: #1e293b; 
                  background: #ffffff; 
                  width: 790px; /* Largura ideal para simular proporção A4 */
                  box-sizing: border-box; 
              }
              
              /* Cabeçalho oficial WSE */
              .header-oficial { 
                  border-bottom: 2px solid #0f172a; 
                  padding-bottom: 12px; 
                  margin-bottom: 30px; 
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
              }
              .header-oficial h1 { margin: 0; font-size: 26px; color: #0f172a; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
              .header-oficial p { margin: 2px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500; }
              .data-geracao { text-align: right; font-size: 11px; color: #64748b; line-height: 1.4; }

              /* Títulos das Seções */
              .titulo-secao { 
                  font-size: 13px; 
                  font-weight: bold; 
                  background-color: #f1f5f9; 
                  padding: 8px 12px; 
                  border-left: 4px solid #0f172a; 
                  margin-top: 30px; 
                  margin-bottom: 15px; 
                  color: #0f172a; 
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  page-break-after: avoid; /* Impede que o título fique sozinho no fim de uma página */
              }
              
              /* Tabelas estruturadas e limpas para documentos */
              table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
              tr { page-break-inside: avoid; } /* IMPEDE QUE UMA LINHA SEJA CORTADA NA METADE ENTRE AS PÁGINAS */
              th { background-color: #f8fafc; color: #475569; font-weight: bold; padding: 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; }
              td { padding: 10px; border: 1px solid #e2e8f0; color: #334155; background-color: #ffffff; }
              .zebra { background-color: #f8fafc; }
              
              .footer-documento { 
                  margin-top: 50px; 
                  text-align: center; 
                  font-size: 11px; 
                  color: #94a3b8; 
                  border-top: 1px solid #e2e8f0; 
                  padding-top: 15px;
                  page-break-inside: avoid;
              }
          </style>

          <div class="header-oficial">
              <div>
                  <h1>WSE Bombas e Motores</h1>
                  <p>Relatório Consolidado Interno de Atividades</p>
              </div>
              <div class="data-geracao">
                  <strong>Documento de Auditoria</strong><br/>
                  Emitido em: ${new Date().toLocaleDateString("pt-BR")}<br/>
                  Horário: ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
          </div>

          <!-- BLOCO 1: NOTAS FISCAIS -->
          <div class="titulo-secao">1. Histórico de Notas Emitidas</div>
          <table>
              <thead>
                  <tr>
                      <th style="width: 20%;">N° Nota</th>
                      <th style="width: 45%;">Cliente / Tomador</th>
                      <th style="width: 20%;">Data de Emissão</th>
                      <th style="width: 15%; text-align: right;">Valor</th>
                  </tr>
              </thead>
              <tbody>
    `;

    if (listaNotas.length === 0) {
      htmlRelatorio += `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">Nenhum registro de faturamento local localizado.</td></tr>`;
    } else {
      [...listaNotas].reverse().forEach((n, idx) => {
        const classeZebra = idx % 2 === 0 ? "" : 'class="zebra"';
        htmlRelatorio += `
          <tr ${classeZebra}>
              <td style="font-weight: bold; color: #0f172a;">${n.numero || "-"}</td>
              <td>${n.cliente || "-"}</td>
              <td>${n.data || "-"}</td>
              <td style="text-align: right; font-weight: bold; color: #0f172a;">R$ ${n.valor || "0,00"}</td>
          </tr>
        `;
      });
    }

    htmlRelatorio += `
              </tbody>
          </table>

          <!-- BLOCO 2: ORDENS DE SERVIÇO -->
          <div class="titulo-secao">2. Ordens de Serviço Ativas</div>
          <table>
              <thead>
                  <tr>
                      <th style="width: 15%;">N° OS</th>
                      <th style="width: 35%;">Cliente / Condomínio</th>
                      <th style="width: 30%;">Equipamento Atendido</th>
                      <th style="width: 20%;">Status</th>
                  </tr>
              </thead>
              <tbody>
    `;

    if (listaOrdemServicos.length === 0) {
      htmlRelatorio += `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">Nenhuma ordem de serviço registrada no momento.</td></tr>`;
    } else {
      [...listaOrdemServicos].reverse().forEach((os, idx) => {
        const classeZebra = idx % 2 === 0 ? "" : 'class="zebra"';
        htmlRelatorio += `
          <tr ${classeZebra}>
              <td style="font-weight: bold;">${os.numero || "-"}</td>
              <td>${os.cliente || "-"}</td>
              <td>${os.equipamento || "-"}</td>
              <td style="font-weight: bold; color: #1e293b;">${os.status || "Pendente"}</td>
          </tr>
        `;
      });
    }

    htmlRelatorio += `
              </tbody>
          </table>

          <!-- BLOCO 3: AGENDA CORPORATIVA -->
          <div class="titulo-secao">3. Compromissos e Cronograma da Agenda</div>
          <table>
              <thead>
                  <tr>
                      <th style="width: 20%;">Data Alocada</th>
                      <th style="width: 30%;">Compromisso</th>
                      <th style="width: 50%;">Descrição / Detalhes</th>
                  </tr>
              </thead>
              <tbody>
    `;

    if (listaAgenda.length === 0) {
      htmlRelatorio += `<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 20px;">Nenhum compromisso agendado no calendário interno.</td></tr>`;
    } else {
      [...listaAgenda].reverse().forEach((ag, idx) => {
        const classeZebra = idx % 2 === 0 ? "" : 'class="zebra"';
        let dataFormatada = ag.dataUnica || "-";
        if (ag.dataUnica && ag.dataUnica.includes("-")) {
          const [ano, mes, dia] = ag.dataUnica.split("-");
          dataFormatada = `${dia}/${mes}/${ano}`;
        }

        htmlRelatorio += `
          <tr ${classeZebra}>
              <td style="font-weight: bold;">${dataFormatada}</td>
              <td style="font-weight: bold;">${ag.titulo || "-"}</td>
              <td style="color: #475569; white-space: pre-wrap;">${ag.descricao || "-"}</td>
          </tr>
        `;
      });
    }

    htmlRelatorio += `
              </tbody>
          </table>

          <div class="footer-documento">
              <strong>WSE BOMBAS E MOTORES ELÉTRICOS LTDA</strong><br/>
              Relatório Unificado de Operações gerado localmente pelo ecossistema seguro NFOne.
          </div>
      </div>
    `;

    // 3. Aciona o compilador html2pdf injetado globalmente
    const container = document.createElement("div");
    container.innerHTML = htmlRelatorio;

    const pdfArrayBuffer = await window
      .html2pdf()
      .set({
        margin: 0.3, // Margem nas bordas para simular impressão real em folha física
        filename: "temp.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css"] }, // Permite que o PDF quebre em infinitas páginas se o conteúdo crescer
      })
      .from(container)
      .outputPdf("arraybuffer");

    // 4. Cria o arquivo Blob na memória e força o download nativo do navegador
    const blob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
    const urlBlob = URL.createObjectURL(blob);

    const dataHoje = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    const linkDownload = document.createElement("a");
    linkDownload.href = urlBlob;
    linkDownload.download = `Relatorio_Geral_WSE_${dataHoje}.pdf`;

    document.body.appendChild(linkDownload);
    linkDownload.click();

    // 5. Limpa a memória física alocada
    document.body.removeChild(linkDownload);
    URL.revokeObjectURL(urlBlob);

    return { sucesso: true };
  } catch (erro) {
    console.error("Erro ao gerar o PDF do histórico unificado:", erro);
    alert(
      "Ocorreu um erro ao compilar e renderizar o relatório em formato de folha PDF.",
    );
    throw erro;
  }
}
