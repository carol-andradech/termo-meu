// Configurações do jogo
const palavraDoDia = "BEIJO"; // Palavra a ser adivinhada
const maxTentativas = 6; // Número máximo de tentativas

// Estado do jogo
let tentativaAtual = 0; // Tentativa atual (0 a 5)
let posicaoAtual = 0; // Posição atual da letra sendo digitada (0 a 4)

// Elementos da interface
const board = document.getElementById("board"); // Tabuleiro de letras
const message = document.getElementById("message"); // Área de mensagens
const keyboard = document.getElementById("keyboard"); // Teclado virtual

// Configurações da palavra
const palavraLength = palavraDoDia.length; // Tamanho da palavra (5)
const letrasValidas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""); // Letras permitidas

// Layout do teclado (igual ao Termo/Wordle)
const linhasTeclado = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Backspace"],
  ["Z", "X", "C", "V", "B", "N", "M", "Enter"],
];

/** Cria o tabuleiro de letras */
function criarTabuleiro() {
  board.innerHTML = ""; // Limpa o tabuleiro

  // Cria 30 quadrados (6 tentativas * 5 letras)
  for (let i = 0; i < maxTentativas * palavraLength; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile"); // Estilo básico do quadrado
    tile.setAttribute("id", `tile-${i}`); // ID único

    // Permite clicar no quadrado para selecionar posição
    tile.addEventListener("click", () => {
      // Só permite seleção na linha atual
      if (Math.floor(i / palavraLength) === tentativaAtual) {
        posicaoAtual = i % palavraLength;
        destacarQuadradoSelecionado(); // Atualiza destaque
      }
    });

    board.appendChild(tile);
  }

  posicaoAtual = 0; // Começa na primeira posição
  destacarQuadradoSelecionado(); // Destaca o quadrado inicial
}

/** Cria o teclado virtual */
function criarTeclado() {
  keyboard.innerHTML = ""; // Limpa o teclado

  // Cria cada linha do teclado
  linhasTeclado.forEach((linha) => {
    const linhaDiv = document.createElement("div");
    linhaDiv.classList.add("keyboard-row"); // Container de linha

    // Cria os botões para cada tecla
    linha.forEach((tecla) => {
      const button = document.createElement("button");

      // Define texto exibido (especiais têm ícones)
      button.textContent =
        tecla === "Backspace" ? "⌫" : tecla === "Enter" ? "ENTER" : tecla;

      button.classList.add("key"); // Estilo básico

      // Teclas especiais são mais largas
      if (tecla === "Backspace" || tecla === "Enter") {
        button.classList.add("wide");
      }

      button.setAttribute("id", `key-${tecla.toLowerCase()}`); // ID baseado na tecla
      button.addEventListener("click", () => handleKey(tecla)); // Evento de clique
      linhaDiv.appendChild(button);
    });

    keyboard.appendChild(linhaDiv);
  });
}

/** Exibe mensagens temporárias na interface */
function mostrarMensagem(texto, duracao = 3000) {
  message.textContent = texto;
  if (duracao > 0) {
    setTimeout(() => {
      message.textContent = ""; // Limpa após o tempo definido
    }, duracao);
  }
}

/** Destaca o quadrado atual na linha de tentativa */
function destacarQuadradoSelecionado() {
  // Remove destaque de todos os quadrados da linha atual
  for (
    let i = tentativaAtual * palavraLength;
    i < (tentativaAtual + 1) * palavraLength;
    i++
  ) {
    board.children[i].style.outline = "none";
  }

  // Destaca apenas o quadrado atual (se estiver dentro dos limites)
  if (posicaoAtual >= 0 && posicaoAtual < palavraLength) {
    const atual = board.children[tentativaAtual * palavraLength + posicaoAtual];
    if (atual) {
      atual.style.outline = "2px solid #FF894F"; // Borda laranja
    }
  }
}

/** Processa as ações das teclas */
function handleKey(key) {
  // Impede ação após o fim do jogo
  if (tentativaAtual >= maxTentativas) return;

  // Tecla Backspace (apagar)
  if (key.toLowerCase() === "backspace") {
    if (posicaoAtual > 0) {
      posicaoAtual--;
      const tile =
        board.children[tentativaAtual * palavraLength + posicaoAtual];
      tile.textContent = ""; // Remove letra
      tile.classList.remove("filled"); // Remove estilo
      destacarQuadradoSelecionado(); // Atualiza seleção
    }
    return;
  }

  // Tecla Enter (enviar tentativa)
  if (key.toLowerCase() === "enter") {
    // Verifica se a palavra está completa
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

    // Alerta se incompleta
    if (!completa) {
      mostrarMensagem("Palavra incompleta!");
      return;
    }

    // Constrói a palavra da tentativa
    let tentativa = "";
    for (
      let i = tentativaAtual * palavraLength;
      i < (tentativaAtual + 1) * palavraLength;
      i++
    ) {
      tentativa += board.children[i].textContent;
    }
    tentativa = tentativa.toUpperCase(); // Padroniza

    // Avalia a tentativa
    avaliarTentativa(tentativa);
    return;
  }

  // Teclas de letra (A-Z)
  if (letrasValidas.includes(key.toUpperCase())) {
    // Só adiciona se houver espaço na palavra
    if (posicaoAtual < palavraLength) {
      const tile =
        board.children[tentativaAtual * palavraLength + posicaoAtual];
      tile.textContent = key.toUpperCase(); // Insere letra
      tile.classList.add("filled"); // Adiciona estilo
      posicaoAtual++; // Avança posição

      // Remove destaque se chegar no final
      if (posicaoAtual > palavraLength - 1) {
        posicaoAtual = palavraLength;
      }
      destacarQuadradoSelecionado(); // Atualiza seleção
    }
  }
}

/** Avalia a palavra submetida contra a palavra do dia */
function avaliarTentativa(tentativa) {
  const letrasPalavra = palavraDoDia.split("");
  // Inicializa todos como ausentes (cinza)
  const resultado = Array(palavraLength).fill("absent");
  const letrasContadas = {}; // Controla letras já verificadas

  // 1ª passada: Verifica letras corretas (posição certa)
  for (let i = 0; i < palavraLength; i++) {
    if (tentativa[i] === letrasPalavra[i]) {
      resultado[i] = "correct"; // Verde
      letrasContadas[tentativa[i]] = (letrasContadas[tentativa[i]] || 0) + 1;
    }
  }

  // 2ª passada: Verifica letras presentes (posição errada)
  for (let i = 0; i < palavraLength; i++) {
    // Ignora já corretas
    if (resultado[i] === "correct") continue;

    if (letrasPalavra.includes(tentativa[i])) {
      const totalNaPalavra = letrasPalavra.filter(
        (l) => l === tentativa[i]
      ).length;
      const usadas = letrasContadas[tentativa[i]] || 0;

      // Se ainda há ocorrências não descobertas
      if (usadas < totalNaPalavra) {
        resultado[i] = "present"; // Amarelo
        letrasContadas[tentativa[i]] = usadas + 1;
      }
    }
  }

  // Aplica cores nos quadrados
  for (let i = 0; i < palavraLength; i++) {
    const tile = document.getElementById(
      `tile-${tentativaAtual * palavraLength + i}`
    );
    tile.classList.add(resultado[i]); // Adiciona classe de cor
  }

  // Atualiza cores do teclado
  atualizarTeclado(tentativa, resultado);

  // Vitória: Acertou a palavra
  if (tentativa === palavraDoDia) {
    mostrarMensagem("Parabéns! Você acertou a palavra!", 5000);
    tentativaAtual = maxTentativas; // Bloqueia novas tentativas
    return;
  }

  tentativaAtual++; // Passa para próxima tentativa
  posicaoAtual = 0; // Reinicia posição

  // Derrota: Esgotou tentativas
  if (tentativaAtual === maxTentativas) {
    mostrarMensagem(`Fim de jogo! A palavra era: ${palavraDoDia}`, 5000);
  }

  destacarQuadradoSelecionado(); // Atualiza destaque
}

/** Atualiza as cores das teclas do teclado virtual */
function atualizarTeclado(tentativa, resultado) {
  for (let i = 0; i < tentativa.length; i++) {
    const keyBtn = document.getElementById(`key-${tentativa[i].toLowerCase()}`);
    if (!keyBtn) continue;

    // Prioridade: correct > present > absent
    if (resultado[i] === "correct") {
      keyBtn.classList.remove("present", "absent");
      keyBtn.classList.add("correct"); // Verde
    } else if (resultado[i] === "present") {
      // Não sobrescreve teclas já marcadas como corretas
      if (!keyBtn.classList.contains("correct")) {
        keyBtn.classList.remove("absent");
        keyBtn.classList.add("present"); // Amarelo
      }
    } else {
      // Só marca como ausente se não tiver status melhor
      if (
        !keyBtn.classList.contains("correct") &&
        !keyBtn.classList.contains("present")
      ) {
        keyBtn.classList.add("absent"); // Cinza
      }
    }
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

// Inicialização do jogo
criarTabuleiro();
criarTeclado();
