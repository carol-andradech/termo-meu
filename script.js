// Configurações do jogo
const palavraDoDia = "SAGAZ"; // Palavra a ser adivinhada
const maxTentativas = 6; // Número máximo de tentativas

// Estado do jogo
let tentativaAtual = 0;
let posicaoAtual = 0;
let historicoResultado = []; // guarda o desempenho para compartilhar

// Elementos da interface
const board = document.getElementById("board");
const message = document.getElementById("message");
const keyboard = document.getElementById("keyboard");

// Configurações
const palavraLength = palavraDoDia.length;
const letrasValidas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const linhasTeclado = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Backspace"],
  ["Z", "X", "C", "V", "B", "N", "M", "Enter"],
];

/** Cria o tabuleiro de letras */
function criarTabuleiro() {
  board.innerHTML = "";
  for (let i = 0; i < maxTentativas * palavraLength; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.setAttribute("id", `tile-${i}`);
    tile.addEventListener("click", () => {
      if (Math.floor(i / palavraLength) === tentativaAtual) {
        posicaoAtual = i % palavraLength;
        destacarQuadradoSelecionado();
      }
    });
    board.appendChild(tile);
  }
  posicaoAtual = 0;
  destacarQuadradoSelecionado();
}

/** Cria o teclado virtual */
function criarTeclado() {
  keyboard.innerHTML = "";
  linhasTeclado.forEach((linha) => {
    const linhaDiv = document.createElement("div");
    linhaDiv.classList.add("keyboard-row");
    linha.forEach((tecla) => {
      const button = document.createElement("button");
      button.textContent =
        tecla === "Backspace" ? "⌫" : tecla === "Enter" ? "ENTER" : tecla;
      button.classList.add("key");
      if (tecla === "Backspace" || tecla === "Enter") {
        button.classList.add("wide");
      }
      button.setAttribute("id", `key-${tecla.toLowerCase()}`);
      button.addEventListener("click", () => handleKey(tecla));
      linhaDiv.appendChild(button);
    });
    keyboard.appendChild(linhaDiv);
  });
}

/** Mensagem temporária */
function mostrarMensagem(texto, duracao = 3000) {
  message.textContent = texto;
  if (duracao > 0) {
    setTimeout(() => {
      message.textContent = "";
    }, duracao);
  }
}

/** Destaque no quadrado atual */
function destacarQuadradoSelecionado() {
  for (
    let i = tentativaAtual * palavraLength;
    i < (tentativaAtual + 1) * palavraLength;
    i++
  ) {
    board.children[i].style.outline = "none";
  }
  if (posicaoAtual >= 0 && posicaoAtual < palavraLength) {
    const atual = board.children[tentativaAtual * palavraLength + posicaoAtual];
    if (atual) {
      atual.style.outline = "2px solid #cb6734ff";
    }
  }
}

/** Processa teclas */
function handleKey(key) {
  if (tentativaAtual >= maxTentativas) return;

  if (key.toLowerCase() === "backspace") {
    if (posicaoAtual > 0) {
      posicaoAtual--;
      const tile =
        board.children[tentativaAtual * palavraLength + posicaoAtual];
      tile.textContent = "";
      tile.classList.remove("filled");
      destacarQuadradoSelecionado();
    }
    return;
  }

  if (key.toLowerCase() === "enter") {
    let completa = true;
    for (
      let i = tentativaAtual * palavraLength;
      i < (tentativaAtual + 1) * palavraLength;
      i++
    ) {
      if (!board.children[i].textContent) {
        completa = false;
        break;
      }
    }
    if (!completa) {
      mostrarMensagem("Palavra incompleta!");
      return;
    }
    let tentativa = "";
    for (
      let i = tentativaAtual * palavraLength;
      i < (tentativaAtual + 1) * palavraLength;
      i++
    ) {
      tentativa += board.children[i].textContent;
    }
    tentativa = tentativa.toUpperCase();
    avaliarTentativa(tentativa);
    return;
  }

  if (letrasValidas.includes(key.toUpperCase())) {
    if (posicaoAtual < palavraLength) {
      const tile =
        board.children[tentativaAtual * palavraLength + posicaoAtual];
      tile.textContent = key.toUpperCase();
      tile.classList.add("filled");
      posicaoAtual++;
      if (posicaoAtual > palavraLength - 1) {
        posicaoAtual = palavraLength;
      }
      destacarQuadradoSelecionado();
    }
  }
}

/** Avalia a palavra */
function avaliarTentativa(tentativa) {
  const letrasPalavra = palavraDoDia.split("");
  const resultado = Array(palavraLength).fill("absent");
  const letrasContadas = {};

  // corretas
  for (let i = 0; i < palavraLength; i++) {
    if (tentativa[i] === letrasPalavra[i]) {
      resultado[i] = "correct";
      letrasContadas[tentativa[i]] = (letrasContadas[tentativa[i]] || 0) + 1;
    }
  }

  // presentes
  for (let i = 0; i < palavraLength; i++) {
    if (resultado[i] === "correct") continue;
    if (letrasPalavra.includes(tentativa[i])) {
      const totalNaPalavra = letrasPalavra.filter(
        (l) => l === tentativa[i]
      ).length;
      const usadas = letrasContadas[tentativa[i]] || 0;
      if (usadas < totalNaPalavra) {
        resultado[i] = "present";
        letrasContadas[tentativa[i]] = usadas + 1;
      }
    }
  }

  // cores no tabuleiro
  for (let i = 0; i < palavraLength; i++) {
    const tile = document.getElementById(
      `tile-${tentativaAtual * palavraLength + i}`
    );
    tile.classList.add(resultado[i]);
  }

  // teclado
  atualizarTeclado(tentativa, resultado);

  // Salvar linha para compartilhar
  const linhaEmoji =
    resultado
      .map((r) => (r === "correct" ? "🟩" : r === "present" ? "🟨" : "⬛"))
      .join("") +
    " " +
    tentativa;
  historicoResultado.push(linhaEmoji);

  // Vitória
  if (tentativa === palavraDoDia) {
    mostrarMensagem("Parabéns! Você acertou a palavra!", 0); // 0 = sem tempo limite
    chuvaDeCoracoes();
    tentativaAtual = maxTentativas;
    mostrarResultadoFinal();
    return;
  }

  tentativaAtual++;
  posicaoAtual = 0;

  // Derrota
  if (tentativaAtual === maxTentativas) {
    mostrarMensagem(`Fim de jogo! A palavra era: ${palavraDoDia}`, 0); // sem limite
    mostrarResultadoFinal();
  }

  destacarQuadradoSelecionado();
}

/** Atualiza teclado */
function atualizarTeclado(tentativa, resultado) {
  for (let i = 0; i < tentativa.length; i++) {
    const keyBtn = document.getElementById(`key-${tentativa[i].toLowerCase()}`);
    if (!keyBtn) continue;
    if (resultado[i] === "correct") {
      keyBtn.classList.remove("present", "absent");
      keyBtn.classList.add("correct");
    } else if (resultado[i] === "present") {
      if (!keyBtn.classList.contains("correct")) {
        keyBtn.classList.remove("absent");
        keyBtn.classList.add("present");
      }
    } else {
      if (
        !keyBtn.classList.contains("correct") &&
        !keyBtn.classList.contains("present")
      ) {
        keyBtn.classList.add("absent");
      }
    }
  }
}

/** Mostrar resultado final com botão de copiar */
function mostrarResultadoFinal() {
  const textoFinal = historicoResultado.join("\n");
  const resultadoDiv = document.createElement("div");
  resultadoDiv.style.marginTop = "15px";
  resultadoDiv.style.textAlign = "center";
  resultadoDiv.innerHTML = `
    <pre style="background:#fff;color:#000;padding:10px;border-radius:6px;white-space:pre-wrap;">${textoFinal}</pre>
    <button id="copiarBtn" style="margin-top:8px;padding:5px 10px;">📋 Copiar Resultado</button>
  `;
  document.body.appendChild(resultadoDiv);

  document.getElementById("copiarBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(textoFinal).then(() => {
      mostrarMensagem("Resultado copiado!");
    });
  });
}

/** Animação de corações */
function chuvaDeCoracoes() {
  const numCoracoes = 80;
  for (let i = 0; i < numCoracoes; i++) {
    const coracao = document.createElement("div");
    coracao.classList.add("coracao");
    coracao.textContent = "❤️";
    coracao.style.left = Math.random() * 100 + "vw";
    coracao.style.animationDuration = 2 + Math.random() * 3 + "s";
    coracao.style.animationDelay = Math.random() * 5 + "s";
    const tamanho = 14 + Math.random() * 16;
    coracao.style.fontSize = tamanho + "px";
    coracao.style.opacity = 0.7 + Math.random() * 0.3;
    document.body.appendChild(coracao);
    coracao.addEventListener("animationend", () => {
      coracao.remove();
    });
  }
}

// Eventos de teclado físico
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleKey("Enter");
  } else if (e.key === "Backspace") {
    handleKey("Backspace");
  } else {
    const letra = e.key.toUpperCase();
    if (letrasValidas.includes(letra)) {
      handleKey(letra);
    }
  }
});

// Inicializa
criarTabuleiro();
criarTeclado();
