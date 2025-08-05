//----------------------------------//
// Configurações básicas do jogo
//----------------------------------//

// Palavra secreta que o jogador deve descobrir
const palavraDoDia = "CANTO";
// Quantidade máxima de tentativas (linhas do tabuleiro)
const maxTentativas = 6;

// Em qual tentativa (linha) o jogador está atualmente
let tentativaAtual = 0;

// Em qual posição (coluna da linha) estamos digitando no momento
// Pode valer de 0 até palavraLength (quando essa linha estiver cheia)
let posicaoAtual = 0;

//----------------------------------//
// Pegando elementos do HTML na tela
//----------------------------------//

// Div do tabuleiro — onde os quadradinhos das letras aparecem
const board = document.getElementById("board");
// Div de mensagens — onde mostramos "palavra incompleta" ou "parabéns" etc
const message = document.getElementById("message");
// Div do teclado virtual
const keyboard = document.getElementById("keyboard");

// Quantidade de letras da palavra secreta (ex: 5 do "CANTO")
const palavraLength = palavraDoDia.length;

// Array com todas as letras que consideramos como válidas para digitar
const letrasValidas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

//----------------------------------//
// Estrutura do teclado virtual
//----------------------------------//

// Dividimos em 3 linhas, como no site Original
const linhasTeclado = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Backspace"],
  ["Z", "X", "C", "V", "B", "N", "M", "Enter"],
];

//----------------------------------//
// Criação do tabuleiro visual (divs)
//----------------------------------//
function criarTabuleiro() {
  board.innerHTML = ""; // limpa qualquer coisa dentro do #board

  // Criamos (maxTentativas × palavraLength) quadrados
  for (let i = 0; i < maxTentativas * palavraLength; i++) {
    // Cria uma nova div (quadrado)
    const tile = document.createElement("div");
    tile.classList.add("tile"); // adiciona classe CSS .tile
    tile.setAttribute("id", `tile-${i}`); // dá um id único: tile-0, tile-1, ...

    // Adiciona evento de clique:
    // se clicarmos num quadrado da linha atual, vamos mover o "cursor" para ele
    tile.addEventListener("click", () => {
      if (Math.floor(i / palavraLength) === tentativaAtual) {
        posicaoAtual = i % palavraLength; // coluna = resto da divisão
        destacarQuadradoSelecionado(); // mostra contorno laranja
      }
    });

    board.appendChild(tile); // adiciona o quadradinho na tela
  }

  // inicializa o cursor (contorno) na primeira posição da primeira linha
  posicaoAtual = 0;
  destacarQuadradoSelecionado();
}

//----------------------------------//
// Criação do teclado virtual na tela
//----------------------------------//
function criarTeclado() {
  keyboard.innerHTML = ""; // limpa

  linhasTeclado.forEach((linha) => {
    const linhaDiv = document.createElement("div");
    linhaDiv.classList.add("keyboard-row"); // agrupa os botões da linha

    linha.forEach((tecla) => {
      const button = document.createElement("button");

      // Define o texto do botão
      // - Backspace vira ícone ⌫
      // - Enter vira palavra ENTER
      // - Caso contrário, mostra a letra
      button.textContent =
        tecla === "Backspace" ? "⌫" : tecla === "Enter" ? "ENTER" : tecla;

      button.classList.add("key"); // estilo padrão de tecla

      // Deixa a tecla mais larga se for especial
      if (tecla === "Backspace" || tecla === "Enter") {
        button.classList.add("wide");
      }

      // Define o id do botão ex: key-a, key-q, key-enter
      button.setAttribute("id", `key-${tecla.toLowerCase()}`);

      // Quando clicamos na tecla, enviamos o valor dela para handleKey()
      button.addEventListener("click", () => handleKey(tecla));

      linhaDiv.appendChild(button);
    });

    keyboard.appendChild(linhaDiv); // adiciona a linha ao teclado completo
  });
}

//----------------------------------//
// Exibe uma mensagem na parte inferior
//----------------------------------//
function mostrarMensagem(texto, duracao = 3000) {
  message.textContent = texto; // mostra o texto
  if (duracao > 0) {
    setTimeout(() => {
      message.textContent = ""; // limpa depois de alguns segundos
    }, duracao);
  }
}

//----------------------------------//
// Mostra o contorno laranja no quadrado selecionado
//----------------------------------//
function destacarQuadradoSelecionado() {
  // Primeiro remove contorno da linha inteira
  for (
    let i = tentativaAtual * palavraLength;
    i < (tentativaAtual + 1) * palavraLength;
    i++
  ) {
    board.children[i].style.outline = "none";
  }

  // Se a posição atual for válida, coloca o contorno
  if (posicaoAtual >= 0 && posicaoAtual < palavraLength) {
    const atual = board.children[tentativaAtual * palavraLength + posicaoAtual];
    atual.style.outline = "2px solid #FF894F";
  }
}

//----------------------------------//
// Quando o usuário aperta uma tecla (mouse ou teclado físico)
//----------------------------------//
function handleKey(key) {
  // Se já acabou o jogo, não faz nada
  if (tentativaAtual >= maxTentativas) return;

  // Se apertou BACKSPACE → apagar a letra da posição anterior
  if (key.toLowerCase() === "backspace") {
    if (posicaoAtual > 0) {
      posicaoAtual--;
      const tile =
        board.children[tentativaAtual * palavraLength + posicaoAtual];
      tile.textContent = ""; // apaga a letra
      tile.classList.remove("filled"); // remove estilo de preenchido
      destacarQuadradoSelecionado();
    }
    return;
  }

  // Se apertou ENTER → avalia a linha inteira
  if (key.toLowerCase() === "enter") {
    // Verifica se todos os quadrados da linha estão preenchidos
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

    // Monta a string com a tentativa do usuário
    let tentativa = "";
    for (
      let i = tentativaAtual * palavraLength;
      i < (tentativaAtual + 1) * palavraLength;
      i++
    ) {
      tentativa += board.children[i].textContent;
    }
    tentativa = tentativa.toUpperCase();

    // Chama a função que compara com a palavra do dia
    avaliarTentativa(tentativa);
    return;
  }

  // Se for uma letra de A-Z → coloca na posição atual
  if (letrasValidas.includes(key.toUpperCase())) {
    if (posicaoAtual < palavraLength) {
      const tile =
        board.children[tentativaAtual * palavraLength + posicaoAtual];
      tile.textContent = key.toUpperCase(); // escreve a letra no quadrado
      tile.classList.add("filled"); // marca visualmente como preenchido
      posicaoAtual++; // vai para o próximo quadrado

      // se passou do último quadrado, marcamos posição fora da linha
      if (posicaoAtual > palavraLength - 1) {
        posicaoAtual = palavraLength;
      }
      destacarQuadradoSelecionado();
    }
  }
}

//----------------------------------//
// Compara a tentativa do jogador com a palavra secreta
//----------------------------------//
function avaliarTentativa(tentativa) {
  const letrasPalavra = palavraDoDia.split(""); // ["C","A","N","T","O"]
  const resultado = Array(palavraLength).fill("absent"); // ["absent","absent",...]
  const letrasContadas = {}; // controla quantas vezes já marcou uma letra

  // 1º passo: marca como 'correct' (verde) as letras na posição certa
  for (let i = 0; i < palavraLength; i++) {
    if (tentativa[i] === letrasPalavra[i]) {
      resultado[i] = "correct";
      letrasContadas[tentativa[i]] = (letrasContadas[tentativa[i]] || 0) + 1;
    }
  }

  // 2º passo: marca como 'present' (amarelo) letras existentes mas em posição errada
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

  // 3º passo: aplica as classes no DOM para colorir
  for (let i = 0; i < palavraLength; i++) {
    const tile = document.getElementById(
      `tile-${tentativaAtual * palavraLength + i}`
    );
    tile.classList.add(resultado[i]); // adiciona .correct, .present ou .absent
  }

  // pinta o teclado virtual também
  atualizarTeclado(tentativa, resultado);

  // Se acertou a palavra, termina o jogo
  if (tentativa === palavraDoDia) {
    mostrarMensagem("Parabéns! Você acertou a palavra!", 5000);
    tentativaAtual = maxTentativas;
    return;
  }

  // Senão vai para a próxima linha
  tentativaAtual++;
  posicaoAtual = 0;

  // Se usou todas as tentativas
  if (tentativaAtual === maxTentativas) {
    mostrarMensagem(`Fim de jogo! A palavra era: ${palavraDoDia}`, 5000);
  }

  destacarQuadradoSelecionado();
}

//----------------------------------//
// Atualiza as cores das teclas do teclado virtual
//----------------------------------//
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

//----------------------------------//
// Permite usar o teclado do computador também
//----------------------------------//
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

//----------------------------------//
// Inicializa tudo quando a página carrega
//----------------------------------//
criarTabuleiro();
criarTeclado();
