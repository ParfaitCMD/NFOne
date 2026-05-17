// src/agenda.js
import { db } from "./db.js";

// CORREÇÃO: Variável de controle global criada corretamente no topo do arquivo
let idNotaEmEdicao = null;
let dataSelecionadaStr = "";
let dataAtualFoco = new Date(); // Controla o mês/ano que está sendo visualizado

export function renderizarTelaAgenda() {
  const appContainer = document.getElementById("app-container");

  const hoje = new Date();
  dataSelecionadaStr = formatarDataISO(hoje);

  appContainer.innerHTML = `
    <h2>Agenda e Calendário Corporativo <span style="color: var(--accent-blue);">WSE</span></h2>
    <p style="color: var(--text-secondary); margin-top: 5px; margin-bottom: 25px;">Gerencie compromissos, prazos de entrega e lembretes livremente pelo calendário.</p>
    
    <div style="display: grid; grid-template-columns: 1fr 350px; gap: 25px; width: 100%; box-sizing: border-box; align-items: flex-start;">
      
      <div class="card-form" style="margin-top: 0; padding: 25px; background: #151a30; width: 100%;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button id="cal-btn-voltar" class="btn-primary" style="margin-top: 0; width: auto; padding: 10px 15px; background: #1a2035; color: var(--accent-blue); border: 1px solid var(--border);">◀ Mês Anterior</button>
          <h3 id="cal-mes-ano-titulo" style="color: #FFF; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; text-transform: capitalize;">Mês Ano</h3>
          <button id="cal-btn-avancar" class="btn-primary" style="margin-top: 0; width: auto; padding: 10px 15px; background: #1a2035; color: var(--accent-blue); border: 1px solid var(--border);">Próximo Mês ▶</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: bold; font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
          <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SÁB</div>
        </div>

        <div id="cal-grade-dias" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px;">
          </div>
      </div>

      <div class="card-form" id="painel-agenda-compromisso" style="margin-top: 0; padding: 20px; background: #1a2035; border: 1px solid var(--border); border-radius: 12px;">
        <span class="section-label" style="color: var(--accent-green); margin-top: 0; margin-bottom: 5px;">Compromissos do Dia</span>
        <div id="cal-txt-data-selecionada" style="font-size: 14px; color: var(--text-secondary); font-weight: bold; margin-bottom: 15px;">00/00/0000</div>
        
        <div id="cal-lista-notas-dia" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; max-height: 220px; overflow-y: auto; padding-right: 5px;">
          </div>

        <div style="border-top: 1px solid var(--border); padding-top: 15px;">
          <span style="font-size: 12px; color: #fff; font-weight: bold; display: block; margin-bottom: 8px;" id="titulo-acao-agenda">Nova Anotação</span>
          <input type="text" id="agenda-input-titulo" class="input-field" placeholder="Título do compromisso" style="width: 100%; margin-bottom: 10px; padding: 10px;">
          <textarea id="agenda-input-desc" class="input-field" placeholder="Descrição livre (Ex: Entregar motor Weg para o condomínio...)" style="width: 100%; height: 70px; resize: none; margin-bottom: 10px; padding: 10px; font-size: 13px;"></textarea>
          
          <label style="font-size: 11px; color: var(--text-secondary); display: block; margin-bottom: 5px;">Selecione uma cor para a bolinha:</label>
          <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <input type="color" id="agenda-input-cor" value="#22c55e" style="border: none; background: none; width: 40px; height: 30px; cursor: pointer;">
            <span style="font-size: 12px; color: var(--text-secondary); align-self: center;">Marcador Visual</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button id="btn-salvar-agenda" class="btn-primary" style="margin-top: 0; padding: 10px; font-size: 13px;">GRAVAR COMPROMISSO</button>
            <button id="btn-limpar-agenda-form" class="btn-primary" style="margin-top: 0; padding: 10px; font-size: 13px; background: #333; color: #fff;">LIMPAR</button>
          </div>
        </div>
      </div>

    </div>
  `;

  document
    .getElementById("cal-btn-voltar")
    .addEventListener("click", () => alterarMes(-1));
  document
    .getElementById("cal-btn-avancar")
    .addEventListener("click", () => alterarMes(1));
  document
    .getElementById("btn-salvar-agenda")
    .addEventListener("click", salvarAnotacaoAgenda);
  document
    .getElementById("btn-limpar-agenda-form")
    .addEventListener("click", resetarFormularioAgenda);

  montarCalendarioCompleto();
}

// CORREÇÃO: Ajustado a variável 'direcao' que estava escrita em inglês internamente
function alterarMes(direcao) {
  dataAtualFoco.setMonth(dataAtualFoco.getMonth() + direcao);
  montarCalendarioCompleto();
}

async function montarCalendarioCompleto() {
  const gradeDias = document.getElementById("cal-grade-dias");
  const tituloMesAno = document.getElementById("cal-mes-ano-titulo");

  gradeDias.innerHTML = "";

  const ano = dataAtualFoco.getFullYear();
  const mes = dataAtualFoco.getMonth();

  const nomeMes = dataAtualFoco.toLocaleString("pt-BR", { month: "long" });
  tituloMesAno.innerText = `${nomeMes} de ${ano}`;

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDiasMes = new Date(ano, mes + 1, 0).getDate();

  const todasNotasAgenda = await db.agenda.toArray();

  for (let i = 0; i < primeiroDiaSemana; i++) {
    const divVazio = document.createElement("div");
    gradeDias.appendChild(divVazio);
  }

  for (let dia = 1; dia <= totalDiasMes; dia++) {
    const dataLoopStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

    const blocoDia = document.createElement("div");
    blocoDia.style.cssText =
      "background: #1a2035; border: 1px solid var(--border); padding: 12px; border-radius: 8px; min-height: 65px; cursor: pointer; position: relative; transition: 0.2s; display: flex; flex-direction: column; justify-content: space-between;";

    if (dataLoopStr === dataSelecionadaStr) {
      blocoDia.style.borderColor = "var(--accent-blue)";
      blocoDia.style.background = "#1e2640";
    }

    blocoDia.innerHTML = `<span style="font-weight: bold; font-size: 14px; color: #fff;">${dia}</span>`;

    const notasDoDia = todasNotasAgenda.filter(
      (n) => n.dataUnica === dataLoopStr,
    );

    if (notasDoDia.length > 0) {
      const containerBolinhas = document.createElement("div");
      containerBolinhas.style.cssText =
        "display: flex; gap: 4px; flex-wrap: wrap; margin-top: 5px;";

      notasDoDia.slice(0, 3).forEach((nota) => {
        const bolinha = document.createElement("span");
        bolinha.style.cssText = `width: 8px; height: 8px; border-radius: 50%; background-color: ${nota.cor || "var(--accent-green)"}; display: inline-block;`;
        containerBolinhas.appendChild(bolinha);
      });
      blocoDia.appendChild(containerBolinhas);
    }

    blocoDia.addEventListener("click", () => {
      dataSelecionadaStr = dataLoopStr;

      document.querySelectorAll("#cal-grade-dias > div").forEach((d) => {
        if (d.style) d.style.borderColor = "var(--border)";
      });
      blocoDia.style.borderColor = "var(--accent-blue)";

      exibirNotasDoDiaSelecionado();
    });

    gradeDias.appendChild(blocoDia);
  }

  exibirNotasDoDiaSelecionado();
}

async function exibirNotasDoDiaSelecionado() {
  const listaContainer = document.getElementById("cal-lista-notas-dia");
  const txtDataHeader = document.getElementById("cal-txt-data-selecionada");

  const [ano, mes, dia] = dataSelecionadaStr.split("-");
  txtDataHeader.innerText = `${dia}/${mes}/${ano}`;

  listaContainer.innerHTML = "";

  const notasDoDia = await db.agenda
    .where("dataUnica")
    .equals(dataSelecionadaStr)
    .toArray();

  if (notasDoDia.length === 0) {
    listaContainer.innerHTML = `<p style="color: var(--text-secondary); font-size: 13px; text-align: center; margin-top: 15px;">Nenhum compromisso agendado.</p>`;
    return;
  }

  notasDoDia.forEach((nota) => {
    const item = document.createElement("div");
    item.style.cssText = `background: #111522; padding: 12px; border-radius: 8px; border-left: 4px solid ${nota.cor || "var(--accent-green)"}; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;`;

    item.innerHTML = `
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: bold; color: #fff; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nota.titulo}</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 3px; white-space: pre-wrap;">${nota.descricao}</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn-cal-edit" data-id="${nota.id}" style="background:none; border:none; color:var(--accent-blue); cursor:pointer; font-size:11px; font-weight:bold;">Editar</button>
        <button class="btn-cal-del" data-id="${nota.id}" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:11px; font-weight:bold;">X</button>
      </div>
    `;

    item.querySelector(".btn-cal-edit").addEventListener("click", () => {
      idNotaEmEdicao = nota.id;
      document.getElementById("titulo-acao-agenda").innerText =
        "📝 Modificar Anotação";
      document.getElementById("agenda-input-titulo").value = nota.titulo;
      document.getElementById("agenda-input-desc").value = nota.descricao;
      document.getElementById("agenda-input-cor").value = nota.cor;
      document.getElementById("btn-salvar-agenda").innerText = "ATUALIZAR NOTA";
    });

    item.querySelector(".btn-cal-del").addEventListener("click", async () => {
      if (!confirm("Deseja deletar esta anotação da agenda?")) return;
      await db.agenda.delete(nota.id);
      resetarFormularioAgenda();
      montarCalendarioCompleto();
    });

    listaContainer.appendChild(item);
  });
}

async function salvarAnotacaoAgenda() {
  const titulo = document.getElementById("agenda-input-titulo").value.trim();
  const descricao = document.getElementById("agenda-input-desc").value.trim();
  const cor = document.getElementById("agenda-input-cor").value;

  if (!titulo) return alert("Por favor, dê um título ao compromisso!");

  const payload = { dataUnica: dataSelecionadaStr, titulo, descricao, cor };

  if (idNotaEmEdicao === null) {
    await db.agenda.add(payload);
  } else {
    await db.agenda.update(idNotaEmEdicao, payload);
  }

  resetarFormularioAgenda();
  montarCalendarioCompleto();
}

function resetarFormularioAgenda() {
  idNotaEmEdicao = null;
  document.getElementById("titulo-acao-agenda").innerText = "Nova Anotação";
  document.getElementById("agenda-input-titulo").value = "";
  document.getElementById("agenda-input-desc").value = "";
  document.getElementById("agenda-input-cor").value = "#22c55e";
  document.getElementById("btn-salvar-agenda").innerText = "GRAVAR COMPROMISSO";
  exibirNotasDoDiaSelecionado();
}

function formatarDataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}
