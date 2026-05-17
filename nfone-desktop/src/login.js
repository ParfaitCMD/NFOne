import { LOGO_WSE_BASE64 } from "./assets.js";
import { db } from "./db.js";
import { supabase } from "./auth.js";

let deepLinkInicializado = false;

export function renderizarTelaLogin(aoLogarSucesso) {
  const appContainer = document.getElementById("app-container");

  const sidebar = document.querySelector(".sidebar");

  const topHeader = document.querySelector(".top-header");

  if (sidebar) sidebar.style.display = "none";

  if (topHeader) topHeader.style.display = "none";

  appContainer.innerHTML = `
    <div style="
      display:flex;
      justify-content:center;
      align-items:center;
      width:100%;
      min-height:100vh;
      background:#0f172a;
    ">
      <div style="
        width:400px;
        padding:40px;
        border-radius:12px;
        text-align:center;
        background:#111827;
        box-shadow:0 0 30px rgba(0,0,0,0.4);
      ">

        ${
          LOGO_WSE_BASE64
            ? `
            <img
              src="${LOGO_WSE_BASE64}"
              style="
                width:90px;
                margin-bottom:20px;
              "
            />
          `
            : ""
        }

        <h2 style="
          color:white;
          margin-bottom:10px;
          font-size:28px;
        ">
          NFOne WSE
        </h2>

        <p style="
          color:#9ca3af;
          margin-bottom:25px;
        ">
          Login corporativo com Google
        </p>

        <button
          id="btn-google-auth"
          style="
            width:100%;
            padding:14px;
            border:none;
            border-radius:8px;
            cursor:pointer;
            font-weight:bold;
            background:#22c55e;
            color:white;
            font-size:15px;
            transition:0.2s;
          "
        >
          Entrar com Google
        </button>

        <div
          id="login-status-feedback"
          style="
            margin-top:20px;
            color:white;
            min-height:24px;
            font-size:14px;
          "
        ></div>

      </div>
    </div>
  `;

  document
    .getElementById("btn-google-auth")
    .addEventListener("click", loginGoogle);

  iniciarDeepLinkSeguro(aoLogarSucesso);
}

async function loginGoogle() {
  const feedback = document.getElementById("login-status-feedback");

  try {
    feedback.innerText = "Conectando ao Google...";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",

      options: {
        redirectTo: "nfone://login",

        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    feedback.innerText = "Abrindo navegador externo...";

    await window.__TAURI__.core.invoke("plugin:opener|open_url", {
      url: data.url,
    });
  } catch (err) {
    console.error(err);

    feedback.innerText = err.message || "Erro ao iniciar login.";
  }
}

async function iniciarDeepLinkSeguro(callbackEntrar) {
  if (deepLinkInicializado) return;

  deepLinkInicializado = true;

  try {
    async function processarUrl(url) {
      try {
        if (!url) return;

        console.log("URL RECEBIDA:", url);

        const feedback = document.getElementById("login-status-feedback");

        if (feedback) {
          feedback.innerText = "Validando autenticação...";
        }

        const urlConvertida = url.replace("nfone://login", "http://localhost");

        const urlObj = new URL(urlConvertida);

        const code = urlObj.searchParams.get("code");

        console.log("CODE:", code);

        if (!code) {
          if (feedback) {
            feedback.innerText = "Código OAuth não encontrado.";
          }

          return;
        }

        const { data, error } =
          await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error(error);

          if (feedback) {
            feedback.innerText = error.message;
          }

          return;
        }

        console.log("LOGIN OK");

        const user = data.session.user;

        const nomeUsuario = user.user_metadata.name || user.email || "Operador";

        if (feedback) {
          feedback.innerText = `Bem-vindo ${nomeUsuario}`;
        }

        await db.notas.count();

        const sidebarDOM = document.querySelector(".sidebar");

        const topHeaderDOM = document.querySelector(".top-header");

        if (sidebarDOM) {
          sidebarDOM.style.display = "flex";
        }

        if (topHeaderDOM) {
          topHeaderDOM.style.display = "flex";
        }

        setTimeout(() => {
          callbackEntrar();
        }, 1000);
      } catch (err) {
        console.error("Erro OAuth:", err);

        const feedback = document.getElementById("login-status-feedback");

        if (feedback) {
          feedback.innerText = "Erro ao concluir login.";
        }
      }
    }

    // ESCUTA EVENTOS FUTUROS
    window.__TAURI__.event.listen(
      "deep-link://new-url",

      async (event) => {
        console.log("EVENTO FUTURO:", event);

        const urls = event.payload;

        const url = urls[0];

        await processarUrl(url);
      },
    );

    // CAPTURA URL INICIAL
    const initialUrl = await window.__TAURI__.core.invoke(
      "plugin:deep-link|get_current",
    );

    console.log("INITIAL URL:", initialUrl);

    if (initialUrl && initialUrl[0]) {
      await processarUrl(initialUrl[0]);
    }
  } catch (err) {
    console.error("Erro ao registrar Deep Link:", err);
  }
}
