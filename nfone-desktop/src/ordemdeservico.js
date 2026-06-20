// src/ordemdeservico.js
import { db } from "./db.js";

let idOSEmEdicao = null;

export function renderizarTelaOrdemServico() {
  const appContainer = document.getElementById("app-container");
  idOSEmEdicao = null; // Reseta o estado de edição ao abrir a tela

  appContainer.innerHTML = `
    <h2>Gerenciamento de Ordens de Serviço <span style="color: var(--accent-blue);">WSE</span></h2>
    <p style="color: var(--text-secondary); margin-top: 5px; margin-bottom: 25px;">Controle de ordens abertas, manutenções em andamento e equipes de campo.</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; width: 100%; box-sizing: border-box; margin-bottom: 30px;">
      
      <div class="card-form" style="margin-top: 0; padding: 20px; background: linear-gradient(135deg, #151a30 0%, #1a2035 100%); border-left: 5px solid #f59e0b;">
        <span style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">OS Pendentes</span>
        <h3 id="os-kpi-pendentes" style="font-size: 24px; color: #FFF; margin-top: 10px; font-weight: bold;">0</h3>
      </div>

      <div class="card-form" style="margin-top: 0; padding: 20px; background: linear-gradient(135deg, #151a30 0%, #1a2035 100%); border-left: 5px solid var(--accent-blue);">
        <span style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Em Andamento</span>
        <h3 id="os-kpi-andamento" style="font-size: 24px; color: #FFF; margin-top: 10px; font-weight: bold;">0</h3>
      </div>

      <div class="card-form" style="margin-top: 0; padding: 20px; background: linear-gradient(135deg, #151a30 0%, #1a2035 100%); border-left: 5px solid var(--accent-green);">
        <span style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">OS Concluídas</span>
        <h3 id="os-kpi-concluidas" style="font-size: 24px; color: #FFF; margin-top: 10px; font-weight: bold;">0</h3>
      </div>

    </div>

    <div style="display: grid; grid-template-columns: 1fr 360px; gap: 25px; width: 100%; box-sizing: border-box; align-items: flex-start;">
      
      <div style="display: flex; flex-direction: column; gap: 15px; min-width: 0;">
        <h3 style="color: var(--text-primary); font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">Painel Geral de Atendimentos</h3>
        
        <div class="card-form" style="padding: 0; overflow-x: auto; border: 1px solid var(--border); margin-top: 0; background: #151a30; width: 100%;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; color: var(--text-primary); font-size: 14px; table-layout: fixed;">
            <thead>
              <tr style="background-color: #111522; border-bottom: 1px solid var(--border); font-weight: bold;">
                <th style="padding: 15px; width: 15%;">N° OS</th>
                <th style="padding: 15px; width: 35%;">Cliente</th>
                <th style="padding: 15px; width: 25%;">Equipamento</th>
                <th style="padding: 15px; width: 25%;">Status</th>
                <th style="padding: 15px; width: 120px; text-align: center;">Ações</th>
              </tr>
            </thead>
            <tbody id="lista-geral-os">
              </tbody>
          </table>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 15px;">
        <h3 style="color: var(--text-primary); font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">Abertura / Registro</h3>
        
        <div class="card-form" id="painel-os-cadastro" style="margin-top: 0; padding: 20px; background: #1a2035; border: 1px solid var(--border); border-radius: 12px;">
          <span class="section-label" id="titulo-form-os" style="color: var(--accent-blue); margin-top: 0; margin-bottom: 15px;">Nova Ordem de Serviço</span>
          
          <input type="text" id="os-input-cliente" class="input-field" placeholder="Cliente / Condomínio" style="width: 100%; margin-bottom: 12px; padding: 12px;">
          <input type="text" id="os-input-equipamento" class="input-field" placeholder="Equipamento (Ex: Bomba Pluvial 2cv)" style="width: 100%; margin-bottom: 12px; padding: 12px;">
          <input type="text" id="os-input-tecnico" class="input-field" placeholder="Técnico Alocado" style="width: 100%; margin-bottom: 12px; padding: 12px;">
          
          <label style="font-size: 12px; color: var(--text-secondary); font-weight: bold; display: block; margin-bottom: 6px;">STATUS DA ORDEM:</label>
          <select id="os-input-status" class="input-field" style="width: 100%; margin-bottom: 20px; padding: 12px; background-color: #0f131f; color: #fff; border: 1px solid var(--border); border-radius: 8px;">
            <option value="Pendente">🟡 Pendente</option>
            <option value="Em Andamento">🔵 Em Andamento</option>
            <option value="Concluída">🟢 Concluída</option>
          </select>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button id="btn-salvar-os" class="btn-primary" style="margin-top: 0; padding: 12px; font-size: 14px; background-color: var(--accent-blue); color: #0a0e1a;">SALVAR ORDEM</button>
            <button id="btn-cancelar-os" class="btn-primary" style="margin-top: 0; padding: 12px; font-size: 14px; background: #333; color: #fff; display: none;">CANCELAR EDICÃO</button>
          </div>
        </div>
      </div>

    </div>
  `;

  inicializarLogicaOrdemServico();
}

async function inicializarLogicaOrdemServico() {
  const tbody = document.getElementById("lista-geral-os");

  const kpiPendentes = document.getElementById("os-kpi-pendentes");
  const kpiAndamento = document.getElementById("os-kpi-andamento");
  const kpiConcluidas = document.getElementById("os-kpi-concluidas");

  const inputCliente = document.getElementById("os-input-cliente");
  const inputEquipamento = document.getElementById("os-input-equipamento");
  const inputTecnico = document.getElementById("os-input-tecnico");
  const inputStatus = document.getElementById("os-input-status");

  const btnSalvar = document.getElementById("btn-salvar-os");
  const btnCancelar = document.getElementById("btn-cancelar-os");
  const painelForm = document.getElementById("painel-os-cadastro");
  const tituloForm = document.getElementById("titulo-form-os");

  if (!db.ordens) {
    try {
      db.version(db.verno + 1).stores({
        ordens: "++id, numero, cliente, equipamento, tecnico, status",
      });
    } catch (e) {}
  }

  const gerarProximoNumeroOS = async () => {
    try {
      const ordens = await db.ordens.toArray();
      if (!ordens || ordens.length === 0) return "001";
      const numeros = ordens.map(
        (o) => parseInt(o.numero.replace("#", ""), 10) || 0,
      );
      return String(Math.max(...numeros) + 1).padStart(3, "0");
    } catch (e) {
      return "001";
    }
  };

  const atualizarTelaOS = async () => {
    let ordens = [];
    try {
      ordens = await db.ordens.toArray();
    } catch (e) {
      ordens = [];
    }

    let countP = 0,
      countA = 0,
      countC = 0;
    tbody.innerHTML = "";

    if (!ordens || ordens.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: var(--text-secondary);">Nenhuma Ordem de Serviço registrada no momento.</td></tr>`;
      kpiPendentes.innerText = "0";
      kpiAndamento.innerText = "0";
      kpiConcluidas.innerText = "0";
      return;
    }

    ordens.forEach((o) => {
      if (o.status === "Pendente") countP++;
      else if (o.status === "Em Andamento") countA++;
      else if (o.status === "Concluída") countC++;
    });

    kpiPendentes.innerText = countP;
    kpiAndamento.innerText = countA;
    kpiConcluidas.innerText = countC;

    [...ordens].reverse().forEach((os) => {
      let badgeStyle =
        "background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid #f59e0b;";
      if (os.status === "Em Andamento")
        badgeStyle =
          "background: rgba(0, 198, 255, 0.15); color: var(--accent-blue); border: 1px solid var(--accent-blue);";
      if (os.status === "Concluída")
        badgeStyle =
          "background: rgba(34, 197, 94, 0.15); color: var(--accent-green); border: 1px solid var(--accent-green);";

      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--border)";
      tr.innerHTML = `
        <td style="padding: 15px; font-weight: bold; color: var(--accent-blue);">${os.numero}</td>
        <td style="padding: 15px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${os.cliente}</td>
        <td style="padding: 15px; color: var(--text-secondary);">${os.equipamento || "-"}</td>
        <td style="padding: 15px;">
          <span style="padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; display: inline-block; ${badgeStyle}">
            ${os.status}
          </span>
        </td>
        <td style="padding: 15px; text-align: center;">
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button class="btn-edit-os" data-id="${os.id}" style="background: none; border: none; color: var(--accent-blue); cursor: pointer; font-size: 13px; font-weight: bold;">Editar</button>
            <button class="btn-del-os" data-id="${os.id}" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 13px; font-weight: bold; transition: 0.2s;">Excluir</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".btn-edit-os").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt(e.target.getAttribute("data-id"), 10);
        const os = await db.ordens.get(id);
        if (os) {
          idOSEmEdicao = id;
          tituloForm.innerText = `📝 Editar OS ${os.numero}`;
          btnCancelar.style.display = "block";
          btnSalvar.innerText = "ATUALIZAR OPERAÇÃO";

          inputCliente.value = os.cliente;
          inputEquipamento.value = os.equipamento;
          inputTecnico.value = os.tecnico || "";
          inputStatus.value = os.status;
        }
      });
    });

    // CORREÇÃO DEFINITIVA DO EXCLUSÃO: Clique duplo customizado e inline à prova de falhas do Tauri v2
    document.querySelectorAll(".btn-del-os").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const botao = e.target;

        if (botao.innerText === "Excluir") {
          botao.innerText = "Confirma?";
          botao.style.color = "#ef4444"; // Transforma em vermelho vivo indicando perigo

          // Reseta o botão para o texto original após 3 segundos de inatividade
          setTimeout(() => {
            if (botao && botao.innerText === "Confirma?") {
              botao.innerText = "Excluir";
              botao.style.color = "var(--danger)";
            }
          }, 3000);
          return;
        }

        if (botao.innerText === "Confirma?") {
          const id = parseInt(botao.getAttribute("data-id"), 10);
          await db.ordens.delete(id);
          if (idOSEmEdicao === id) resetarFormularioOS();
          atualizarTelaOS();
        }
      });
    });
  };

  const resetarFormularioOS = () => {
    idOSEmEdicao = null;
    tituloForm.innerText = "Nova Ordem de Serviço";
    btnCancelar.style.display = "none";
    btnSalvar.innerText = "SALVAR ORDEM";

    inputCliente.value = "";
    inputEquipamento.value = "";
    inputTecnico.value = "";
    inputStatus.value = "Pendente";
  };

  btnSalvar.addEventListener("click", async () => {
    const cliente = inputCliente.value.trim();
    const equipamento = inputEquipamento.value.trim();
    const tecnico = inputTecnico.value.trim();
    const status = inputStatus.value;

    if (!cliente || !equipamento)
      return alert("Por favor, preencha o Nome do Cliente e o Equipamento!");

    if (idOSEmEdicao === null) {
      const proximoNum = await gerarProximoNumeroOS();
      await db.ordens.add({
        numero: "#" + proximoNum,
        cliente,
        equipamento,
        tecnico,
        status,
      });
    } else {
      const osOriginal = await db.ordens.get(idOSEmEdicao);
      await db.ordens.update(idOSEmEdicao, {
        numero: osOriginal.numero,
        cliente,
        equipamento,
        tecnico,
        status,
      });
    }

    resetarFormularioOS();
    atualizarTelaOS();
  });

  btnCancelar.addEventListener("click", resetarFormularioOS);
  atualizarTelaOS();
}
