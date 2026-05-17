// src/dashboard.js
import { db } from "./db.js";

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

  // FUNÇÃO QUE CALCULA O PRÓXIMO NÚMERO SEQUENCIAL (EX: 001, 002, 003...)
  const gerarProximoNumeroNota = async () => {
    const notas = await db.notas.toArray();
    if (notas.length === 0) return "001";

    // Filtra e converte os números das notas existentes para inteiros para achar o maior
    const numerosConvertidos = notas.map((n) => {
      let numLimpo = n.numero ? n.numero.replace("#", "") : "0";
      return parseInt(numLimpo, 10) || 0;
    });

    const maiorNumero = Math.max(...numerosConvertidos);
    const proximo = maiorNumero + 1;

    // Formata com zeros à esquerda (ex: 4 vira 004)
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

    // Ordena para exibir as notas mais recentes no topo
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
            <button class="btn-del-nota" data-id="${nota.id}" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 13px; font-weight: bold;">Excluir</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Atualiza os KPIs principais
    txtTotalNotas.innerText = notasSalvas.length;
    txtFaturamento.innerText = `R$ ${somaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const mediaCalculada = somaTotal / notasSalvas.length;
    txtMedia.innerText = `R$ ${mediaCalculada.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // EVENTO: ABRIR EDIÇÃO DA NOTA
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

    // EVENTO: EXCLUIR REGISTRO DE NOTA
    document.querySelectorAll(".btn-del-nota").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        if (!confirm("Remover permanentemente esta nota do histórico?")) return;
        const id = parseInt(e.target.getAttribute("data-id"));
        await db.notas.delete(id);
        if (idNotaEmEdicao === id) resetarFormularioNota();
        atualizarPainel();
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

  // EVENTO: ADICIONAR OU SALVAR ATUALIZAÇÃO DA NOTA
  btnSalvar.addEventListener("click", async () => {
    const cliente = inputNome.value.trim();
    const data = inputData.value.trim();
    const valor = inputValor.value.trim();

    if (!cliente || !valor)
      return alert("Por favor, informe no mínimo o Cliente e o Valor!");

    if (idNotaEmEdicao === null) {
      // GERAÇÃO SEQUENCIAL INFALÍVEL EM ORDEM CRONOLÓGICA (001 -> ...)
      const proximoNum = await gerarProximoNumeroNota();
      await db.notas.add({
        numero: "#" + proximoNum,
        cliente,
        data,
        valor,
      });
    } else {
      // Mantém o mesmo número da nota original ao atualizar os campos
      const notaOriginal = await db.notas.get(idNotaEmEdicao);
      await db.notas.update(idNotaEmEdicao, {
        numero: notaOriginal.numero,
        cliente,
        data,
        valor,
      });
    }

    resetarFormularioNota();
    atualizarPainel();
  });

  btnCancelar.addEventListener("click", resetarFormularioNota);

  // Executa a primeira renderização dos dados na tela
  atualizarPainel();
}
