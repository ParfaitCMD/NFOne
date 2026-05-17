// src/catalogo.js
import { db } from "./db.js";

let idEquipamentoEmEdicao = null;

export function renderizarTelaCatalogo() {
  const appContainer = document.getElementById("app-container");
  idEquipamentoEmEdicao = null; // Reseta o estado ao abrir a tela

  appContainer.innerHTML = `
    <h2>Painel de Controle e Catálogo Técnico</h2>
    <p style="color: var(--text-secondary); margin-bottom: 20px;">Gerencie, adicione, edite ou remova os motores e bombas cadastrados na base de dados.</p>
    
    <div style="display: flex; gap: 25px; align-items: flex-start;">
      
      <div class="card-form" id="painel-formulario-motor" style="flex: 1; margin-top: 0; min-width: 320px; transition: 0.3s;">
        <span class="section-label" id="form-motor-titulo" style="color: var(--accent-green);">Cadastrar Novo Equipamento</span>
        
        <input type="text" id="mot-tipo" class="input-field" placeholder="Linha/Tipo (Ex: Motor de Indução)" style="width: 100%; margin-bottom: 15px;">
        
        <div class="form-row" style="margin-bottom: 15px;">
          <input type="text" id="mot-potencia" class="input-field" placeholder="Potência (Ex: 5.0 CV)">
          <input type="text" id="mot-rpm" class="input-field" placeholder="Rotação (Ex: 1750 RPM)">
        </div>
        
        <div class="form-row" style="margin-bottom: 15px;">
          <input type="text" id="mot-tensao" class="input-field" placeholder="Tensão Nominal (Ex: 220/380V)">
          <input type="text" id="mot-valor" class="input-field" placeholder="Valor Estimado R$">
        </div>

        <div style="display: flex; gap: 10px;">
          <button id="btn-salvar-motor" class="btn-primary" style="margin-top: 5px;">SALVAR MAQUINÁRIO</button>
          <button id="btn-cancelar-edicao" class="btn-primary" style="margin-top: 5px; background: #333; color: #fff; display: none;">CANCELAR</button>
        </div>
      </div>

      <div style="flex: 2; display: flex; flex-direction: column; gap: 15px; width: 100%;">
        <div class="card-form" style="margin-top: 0; padding: 15px; width: 100%;">
          <input type="text" id="busca-catalogo" class="input-field" placeholder="🔍 Digite para filtrar por tipo ou potência em tempo real..." style="width: 100%;">
        </div>

        <div class="card-form" style="padding: 0; overflow: hidden; border: 1px solid var(--border); width: 100%; margin-top: 0;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; color: var(--text-primary); font-size: 14px;">
            <thead>
              <tr style="background-color: #111522; border-bottom: 1px solid var(--border); font-weight: bold;">
                <th style="padding: 15px;">Equipamento</th>
                <th style="padding: 15px;">Potência</th>
                <th style="padding: 15px;">Tensão</th>
                <th style="padding: 15px;">Valor Estimado</th>
                <th style="padding: 15px; text-align: center;">Ações</th>
              </tr>
            </thead>
            <tbody id="lista-catalogo">
              </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  inicializarLogicaAdmin();
}

async function inicializarLogicaAdmin() {
  const tbody = document.getElementById("lista-catalogo");
  const buscaInput = document.getElementById("busca-catalogo");
  const btnSalvar = document.getElementById("btn-salvar-motor");
  const btnCancelar = document.getElementById("btn-cancelar-edicao");
  const formCard = document.getElementById("painel-formulario-motor");
  const formTitulo = document.getElementById("form-motor-titulo");

  const inputTipo = document.getElementById("mot-tipo");
  const inputPotencia = document.getElementById("mot-potencia");
  const inputRpm = document.getElementById("mot-rpm");
  const inputTensao = document.getElementById("mot-tensao");
  const inputValor = document.getElementById("mot-valor");

  const atualizarTabela = async (filtro = "") => {
    tbody.innerHTML = "";
    let listaEquipamentos = await db.equipamentos.toArray();

    // Carga inicial padrão caso o banco local esteja vazio
    if (listaEquipamentos.length === 0) {
      const padroes = [
        {
          tipo: "Bomba Centrífuga Schneider",
          potencia: "2.0 CV",
          rpm: "3500 RPM",
          tensao: "220V",
          valor: "1450,00",
        },
        {
          tipo: "Motor de Indução WEG W22",
          potencia: "5.0 CV",
          rpm: "1750 RPM",
          tensao: "220/380V",
          valor: "2890,00",
        },
      ];
      for (const p of padroes) {
        await db.equipamentos.add(p);
      }
      listaEquipamentos = await db.equipamentos.toArray();
    }

    const filtrados = listaEquipamentos.filter(
      (m) =>
        m.tipo.toLowerCase().includes(filtro.toLowerCase()) ||
        m.potencia.toLowerCase().includes(filtro.toLowerCase()),
    );

    if (filtrados.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: var(--text-secondary);">Nenhum equipamento localizado.</td></tr>`;
      return;
    }

    filtrados.forEach((item) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--border)";
      tr.innerHTML = `
        <td style="padding: 15px; font-weight: bold; color: var(--text-primary);">${item.tipo}</td>
        <td style="padding: 15px;">${item.potencia} <span style="font-size: 11px; color: var(--text-secondary);">(${item.rpm || "-"})</span></td>
        <td style="padding: 15px; color: var(--accent-blue);">${item.tensao}</td>
        <td style="padding: 15px; color: var(--accent-green);">R$ ${item.valor || "0,00"}</td>
        <td style="padding: 15px; text-align: center; display: flex; gap: 12px; justify-content: center;">
          <button class="btn-acao-editar" data-id="${item.id}" style="background: none; border: none; color: var(--accent-blue); cursor: pointer; font-weight: bold;">Editar</button>
          <button class="btn-acao-excluir" data-id="${item.id}" style="background: none; border: none; color: var(--danger); cursor: pointer; font-weight: bold;">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Eventos dos botões da tabela
    document.querySelectorAll(".btn-acao-editar").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
        const eq = await db.equipamentos.get(id);
        if (eq) {
          idEquipamentoEmEdicao = id;
          formTitulo.innerText = "📝 Editar Equipamento";
          formCard.style.borderColor = "var(--accent-blue)";
          btnCancelar.style.display = "block";
          btnSalvar.innerText = "ATUALIZAR DADOS";
          btnSalvar.style.backgroundColor = "var(--accent-blue)";

          inputTipo.value = eq.tipo;
          inputPotencia.value = eq.potencia;
          inputRpm.value = eq.rpm;
          inputTensao.value = eq.tensao;
          inputValor.value = eq.valor;
        }
      });
    });

    document.querySelectorAll(".btn-acao-excluir").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        if (!confirm("Remover permanentemente do catálogo?")) return;
        const id = parseInt(e.target.getAttribute("data-id"));
        await db.equipamentos.delete(id);
        if (idEquipamentoEmEdicao === id) resetarFormulario();
        atualizarTabela(buscaInput.value);
      });
    });
  };

  const resetarFormulario = () => {
    idEquipamentoEmEdicao = null;
    formTitulo.innerText = "Cadastrar Novo Equipamento";
    formCard.style.borderColor = "var(--border)";
    btnCancelar.style.display = "none";
    btnSalvar.innerText = "SALVAR MAQUINÁRIO";
    btnSalvar.style.backgroundColor = "var(--accent-green)";

    inputTipo.value = "";
    inputPotencia.value = "";
    inputRpm.value = "";
    inputTensao.value = "";
    inputValor.value = "";
  };

  btnSalvar.addEventListener("click", async () => {
    const tipo = inputTipo.value.trim();
    const potencia = inputPotencia.value.trim();
    const rpm = inputRpm.value.trim() || "-";
    const tensao = inputTensao.value.trim() || "-";
    const valor = inputValor.value.trim() || "0,00";

    if (!tipo || !potencia)
      return alert("Por favor, preencha o Tipo e a Potência do equipamento!");

    const payload = { tipo, potencia, rpm, tensao, valor };

    if (idEquipamentoEmEdicao === null) {
      await db.equipamentos.add(payload);
    } else {
      await db.equipamentos.update(idEquipamentoEmEdicao, payload);
    }
    resetarFormulario();
    atualizarTabela(buscaInput.value);
  });

  btnCancelar.addEventListener("click", resetarFormulario);
  buscaInput.addEventListener("input", (e) => atualizarTabela(e.target.value));

  atualizarTabela();
}
