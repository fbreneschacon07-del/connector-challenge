(function () {
  "use strict";

  const TOPICS = [
    { id: "cpu", label: "Procesador y zócalo" },
    { id: "sata", label: "SATA y almacenamiento" },
    { id: "pcie", label: "Ranuras PCI Express" },
    { id: "ram", label: "DIMM y memoria RAM" },
    { id: "power", label: "Conectores de alimentación" },
  ];
  const LEVELS = [
    { name: "Fácil", seconds: 25 },
    { name: "Principiante", seconds: 20 },
    { name: "Intermedio", seconds: 15 },
    { name: "Avanzado", seconds: 12 },
    { name: "Experto", seconds: 10 },
    { name: "Maestro", seconds: 8 },
  ];
  const ADVANCED_LEVELS = new Set([4, 5, 6]);
  const STORAGE_KEY = "connector-challenge-v1";
  const IMAGE_CREDIT =
    "Ilustración original de Connector Challenge · CC0 1.0";
  const FALLBACK_IMAGE = "assets/board-fallback.svg";
  const IMAGE_ALT = {
    cpu: "Diagrama de una placa base con una zona cuadrada resaltada cerca del centro.",
    sata: "Diagrama de una placa base con varios conectores agrupados junto a un borde.",
    pcie: "Diagrama de una placa base con una ranura de expansión larga resaltada.",
    ram: "Diagrama de una placa base con varias ranuras paralelas resaltadas.",
    power: "Diagrama de una placa base con dos zonas de conexión resaltadas.",
  };

  // All artwork in assets/ was created for this game and is dedicated to CC0 1.0.
  const QUESTIONS = [
    {
      id: "cpu-01",
      topic: "cpu",
      image: "assets/cpu-socket.svg",
      alt: "Diagrama de una placa base con el zócalo cuadrado del procesador resaltado.",
      prompt: "¿En qué conector se instala directamente la CPU?",
      options: ["Zócalo del procesador", "Puerto SATA", "Ranura PCIe x1", "Conector ATX de 24 pines"],
      answer: "Zócalo del procesador",
      explanation: "El zócalo sostiene y conecta el procesador con la placa base. Su tipo debe ser compatible con la CPU.",
    },
    {
      id: "cpu-02",
      topic: "cpu",
      image: "assets/cpu-socket.svg",
      alt: "Zócalo de CPU resaltado junto a su palanca de retención.",
      prompt: "¿Para qué sirve la palanca junto al zócalo del procesador?",
      options: ["Sujetar la CPU en el zócalo", "Expulsar la memoria RAM", "Activar el puerto SATA", "Ajustar la velocidad del ventilador"],
      answer: "Sujetar la CPU en el zócalo",
      explanation: "La palanca mueve el mecanismo de retención para asegurar el procesador. En muchos zócalos se conoce como mecanismo ZIF.",
    },
    {
      id: "cpu-03",
      topic: "cpu",
      image: "assets/cpu-socket.svg",
      alt: "Vista superior de un zócalo de procesador con contactos marcados.",
      prompt: "En un zócalo LGA, ¿dónde se encuentran los contactos elásticos?",
      options: ["En el zócalo de la placa base", "En el ventilador del procesador", "En la memoria RAM", "En el cable SATA"],
      answer: "En el zócalo de la placa base",
      explanation: "LGA significa Land Grid Array: las superficies de contacto planas están en la CPU y los contactos elásticos, en el zócalo.",
    },
    {
      id: "cpu-04",
      topic: "cpu",
      image: "assets/cpu-socket.svg",
      alt: "Ilustración del zócalo de CPU con una esquina de alineación resaltada.",
      prompt: "¿Qué ayuda a orientar correctamente una CPU en su zócalo?",
      options: ["La marca de alineación y las muescas", "El color del cable de alimentación", "El tamaño de una ranura DIMM", "La posición del puerto de red"],
      answer: "La marca de alineación y las muescas",
      explanation: "Las marcas y muescas hacen coincidir el procesador con una sola orientación. No se debe forzar una CPU que no encaja.",
    },
    {
      id: "cpu-05",
      topic: "cpu",
      image: "assets/cpu-socket.svg",
      alt: "Zócalo del procesador destacado en el centro de la placa base.",
      prompt: "¿Qué componente se monta sobre la CPU después de instalarla?",
      options: ["Un disipador o refrigerador", "Una unidad SATA", "Una tarjeta PCIe x1", "El cable ATX de 24 pines"],
      answer: "Un disipador o refrigerador",
      explanation: "El disipador ayuda a retirar el calor del procesador. Se instala con el sistema de refrigeración adecuado y, normalmente, pasta térmica.",
    },
    {
      id: "cpu-06",
      topic: "cpu",
      image: "assets/cpu-socket.svg",
      alt: "Zócalo cuadrado de procesador marcado en una placa base.",
      prompt: "¿Qué determina principalmente si una CPU cabe en una placa base?",
      options: ["El tipo y compatibilidad del zócalo", "El número de puertos USB del gabinete", "La longitud del cable SATA", "El tamaño del ventilador de la fuente"],
      answer: "El tipo y compatibilidad del zócalo",
      explanation: "Hay que comprobar el zócalo y también la lista de compatibilidad del fabricante, que puede incluir requisitos de BIOS.",
    },
    {
      id: "sata-01",
      topic: "sata",
      image: "assets/sata-ports.svg",
      alt: "Grupo de puertos SATA en el borde de una placa base, con uno resaltado.",
      prompt: "¿Qué se conecta normalmente a un puerto SATA de la placa base?",
      options: ["Una unidad de almacenamiento SATA", "Un procesador", "Una memoria DIMM", "Un ventilador de gabinete"],
      answer: "Una unidad de almacenamiento SATA",
      explanation: "El cable de datos SATA enlaza la placa base con unidades compatibles, como discos duros o SSD de 2,5 pulgadas.",
    },
    {
      id: "sata-02",
      topic: "sata",
      image: "assets/sata-ports.svg",
      alt: "Puertos SATA de datos de siete contactos resaltados en la placa base.",
      prompt: "¿Cuál de estos cables lleva datos entre una unidad SATA y la placa base?",
      options: ["El cable SATA de datos", "El cable ATX de 24 pines", "El cable EPS de CPU", "El cable de pantalla HDMI"],
      answer: "El cable SATA de datos",
      explanation: "La unidad también necesita alimentación desde la fuente. El cable SATA de datos, por sí solo, no la alimenta.",
    },
    {
      id: "sata-03",
      topic: "sata",
      image: "assets/sata-ports.svg",
      alt: "Primer plano de un puerto SATA en forma de L para orientar el cable.",
      prompt: "¿Qué detalle ayuda a orientar un cable SATA al conectarlo?",
      options: ["La forma en L del conector", "Una pestaña de memoria DIMM", "Un tornillo de la CPU", "El seguro de una ranura PCIe"],
      answer: "La forma en L del conector",
      explanation: "La llave en forma de L evita conectar el enchufe al revés. Alinea ambas formas y conecta sin aplicar fuerza excesiva.",
    },
    {
      id: "sata-04",
      topic: "sata",
      image: "assets/sata-ports.svg",
      alt: "Puertos de almacenamiento SATA etiquetados en la placa base.",
      prompt: "¿Qué tipo de conexión de alimentación requiere además una unidad SATA de 2,5 pulgadas?",
      options: ["Alimentación SATA desde la fuente", "Otro cable de datos SATA", "El conector del procesador", "Una ranura PCIe x16"],
      answer: "Alimentación SATA desde la fuente",
      explanation: "La unidad usa un cable SATA de datos hacia la placa y un cable de alimentación SATA desde la fuente de poder.",
    },
    {
      id: "sata-05",
      topic: "sata",
      image: "assets/sata-ports.svg",
      alt: "Varios puertos SATA numerados junto al borde de la placa base.",
      prompt: "¿Dónde encontrarías varios puertos SATA en una placa base?",
      options: ["Agrupados cerca de un borde de la placa", "Dentro del zócalo del procesador", "En el centro de cada ranura DIMM", "En el panel de audio frontal"],
      answer: "Agrupados cerca de un borde de la placa",
      explanation: "Los puertos suelen estar en un borde para facilitar el recorrido de los cables hacia las unidades del gabinete.",
    },
    {
      id: "sata-06",
      topic: "sata",
      image: "assets/sata-ports.svg",
      alt: "Conexión SATA de datos marcada junto a una unidad de almacenamiento.",
      prompt: "¿Cuál afirmación sobre una conexión SATA es correcta?",
      options: ["Datos y alimentación usan conexiones distintas", "Un solo cable SATA alimenta siempre la placa base", "El cable SATA se instala en el zócalo de CPU", "SATA es una ranura para tarjeta gráfica"],
      answer: "Datos y alimentación usan conexiones distintas",
      explanation: "En una unidad SATA típica, el conector estrecho lleva datos y el conector más ancho recibe alimentación de la fuente.",
    },
    {
      id: "pcie-01",
      topic: "pcie",
      image: "assets/pcie-slot.svg",
      alt: "Ranura PCI Express larga x16 resaltada en la placa base.",
      prompt: "¿Qué tarjeta suele instalarse en una ranura PCIe x16?",
      options: ["Una tarjeta gráfica", "Un módulo DIMM", "Un disco SATA de 2,5 pulgadas", "El procesador"],
      answer: "Una tarjeta gráfica",
      explanation: "La ranura PCIe x16 larga es la ubicación habitual para una tarjeta gráfica dedicada, aunque también admite otras tarjetas compatibles.",
    },
    {
      id: "pcie-02",
      topic: "pcie",
      image: "assets/pcie-slot.svg",
      alt: "Ranura PCIe larga con su pestaña de retención marcada.",
      prompt: "¿Qué pieza ayuda a mantener una tarjeta PCIe sujeta al final de la ranura?",
      options: ["La pestaña de retención de la ranura", "La palanca del zócalo de CPU", "La muesca del cable SATA", "El conector de audio"],
      answer: "La pestaña de retención de la ranura",
      explanation: "Algunas ranuras incorporan una pestaña en el extremo que ayuda a fijar la tarjeta. Presiónala solo como indique el manual.",
    },
    {
      id: "pcie-03",
      topic: "pcie",
      image: "assets/pcie-slot.svg",
      alt: "Dos ranuras PCIe de longitudes distintas resaltadas.",
      prompt: "¿Qué indica principalmente el número en PCIe x1 o PCIe x16?",
      options: ["La cantidad de carriles de datos", "La cantidad de tornillos de la tarjeta", "La generación de memoria RAM", "El voltaje del cable ATX"],
      answer: "La cantidad de carriles de datos",
      explanation: "El número x1, x4, x8 o x16 describe el ancho de enlace, es decir, cuántos carriles PCIe usa la conexión.",
    },
    {
      id: "pcie-04",
      topic: "pcie",
      image: "assets/pcie-slot.svg",
      alt: "Ranura PCIe x1 corta comparada con una ranura x16 larga.",
      prompt: "¿Cuál de estas ranuras suele ser físicamente la más corta?",
      options: ["PCIe x1", "PCIe x16", "DIMM", "ATX de 24 pines"],
      answer: "PCIe x1",
      explanation: "Una ranura PCIe x1 es corta y suele alojar tarjetas de expansión pequeñas, como algunas tarjetas de red o sonido.",
    },
    {
      id: "pcie-05",
      topic: "pcie",
      image: "assets/pcie-slot.svg",
      alt: "Ranura de expansión PCI Express resaltada con contactos dorados.",
      prompt: "¿Qué debes comprobar antes de comprar una tarjeta PCIe?",
      options: ["Espacio, ranura disponible y compatibilidad", "Que tenga exactamente el mismo color que la placa", "Que coincida con el número de puertos SATA", "Que incluya un módulo DIMM"],
      answer: "Espacio, ranura disponible y compatibilidad",
      explanation: "Revisa el tamaño de la tarjeta, las ranuras libres, el espacio del gabinete, la alimentación y los requisitos del sistema.",
    },
    {
      id: "pcie-06",
      topic: "pcie",
      image: "assets/pcie-slot.svg",
      alt: "Ranura PCIe x16 destacada junto al área de expansión.",
      prompt: "¿Una tarjeta PCIe de una generación anterior puede funcionar en una ranura más nueva?",
      options: ["Generalmente sí, según la compatibilidad del sistema", "No, porque PCIe no admite generaciones anteriores", "Solo si se conecta al puerto SATA", "Sí, pero debe instalarse en una ranura DIMM"],
      answer: "Generalmente sí, según la compatibilidad del sistema",
      explanation: "PCIe suele permitir compatibilidad entre generaciones; la velocidad final puede depender del dispositivo, la ranura y la plataforma.",
    },
    {
      id: "ram-01",
      topic: "ram",
      image: "assets/dimm-slots.svg",
      alt: "Ranuras DIMM largas para memoria RAM resaltadas junto al procesador.",
      prompt: "¿En qué ranura se instala un módulo de memoria RAM de escritorio?",
      options: ["Ranura DIMM", "Puerto SATA", "Zócalo de CPU", "Conector ATX de 24 pines"],
      answer: "Ranura DIMM",
      explanation: "Los módulos de memoria de escritorio se insertan en ranuras DIMM, que suelen estar al lado del zócalo del procesador.",
    },
    {
      id: "ram-02",
      topic: "ram",
      image: "assets/dimm-slots.svg",
      alt: "Módulo RAM y ranura DIMM con la muesca de alineación marcada.",
      prompt: "¿Qué debes alinear antes de insertar un módulo DIMM?",
      options: ["La muesca del módulo con la llave de la ranura", "El borde del módulo con el puerto SATA", "La etiqueta con el ventilador", "El cable de la fuente con el centro de la ranura"],
      answer: "La muesca del módulo con la llave de la ranura",
      explanation: "La muesca cambia según el tipo de memoria y evita insertarla en una orientación o ranura incompatible.",
    },
    {
      id: "ram-03",
      topic: "ram",
      image: "assets/dimm-slots.svg",
      alt: "Cuatro ranuras DIMM con la primera y tercera indicadas.",
      prompt: "¿Por qué algunos manuales recomiendan usar A2 y B2 con dos módulos RAM?",
      options: ["Para activar la configuración de doble canal recomendada", "Para conectar una unidad SATA", "Para darle alimentación al procesador", "Para reservar una ranura PCIe"],
      answer: "Para activar la configuración de doble canal recomendada",
      explanation: "La disposición óptima depende de la placa. El manual indica qué ranuras usar para aprovechar el doble canal.",
    },
    {
      id: "ram-04",
      topic: "ram",
      image: "assets/dimm-slots.svg",
      alt: "Primer plano de los seguros en los extremos de una ranura DIMM.",
      prompt: "¿Qué hacen los seguros en los extremos de una ranura DIMM?",
      options: ["Ayudan a fijar el módulo en su lugar", "Envían datos al puerto SATA", "Enfrían el procesador", "Convierten un cable de CPU en PCIe"],
      answer: "Ayudan a fijar el módulo en su lugar",
      explanation: "Los seguros encajan en las muescas de los extremos del módulo. Sigue las instrucciones de la placa al abrirlos o cerrarlos.",
    },
    {
      id: "ram-05",
      topic: "ram",
      image: "assets/dimm-slots.svg",
      alt: "Ranuras DIMM de memoria RAM con colores que distinguen sus canales.",
      prompt: "¿Qué debes verificar antes de elegir módulos RAM para una placa?",
      options: ["Tipo DDR admitido y capacidad máxima", "El número de conectores SATA solamente", "La generación de la tarjeta PCIe", "El largo del cable ATX"],
      answer: "Tipo DDR admitido y capacidad máxima",
      explanation: "Las generaciones DDR no son intercambiables físicamente. Consulta el tipo, la capacidad y las velocidades admitidas por la placa.",
    },
    {
      id: "ram-06",
      topic: "ram",
      image: "assets/dimm-slots.svg",
      alt: "Ranura DIMM larga, paralela al borde de la placa base.",
      prompt: "¿Cómo distingues una ranura DIMM de una ranura PCIe?",
      options: ["La DIMM está diseñada para un módulo RAM y tiene una llave específica", "La DIMM siempre es un conector de alimentación", "La PCIe tiene los seguros de los extremos de la RAM", "No existe ninguna diferencia física"],
      answer: "La DIMM está diseñada para un módulo RAM y tiene una llave específica",
      explanation: "DIMM y PCIe tienen formas, contactos y funciones diferentes. No intercambies módulos entre ambos tipos de ranura.",
    },
    {
      id: "power-01",
      topic: "power",
      image: "assets/power-connectors.svg",
      alt: "Conector principal de alimentación ATX de 24 pines resaltado en el borde de la placa.",
      prompt: "¿Qué alimenta el conector ATX de 24 pines?",
      options: ["La placa base y sus circuitos principales", "Solo la tarjeta gráfica", "Una unidad SATA de datos", "El módulo RAM directamente desde la ranura"],
      answer: "La placa base y sus circuitos principales",
      explanation: "El conector ATX principal de 24 pines conecta la fuente de poder con la placa base.",
    },
    {
      id: "power-02",
      topic: "power",
      image: "assets/power-connectors.svg",
      alt: "Conector de alimentación EPS de CPU resaltado cerca del borde superior.",
      prompt: "¿Qué conexión de la fuente se usa normalmente cerca del procesador?",
      options: ["EPS de 4 u 8 pines para CPU", "SATA de datos", "PCIe x1", "DIMM de 288 contactos"],
      answer: "EPS de 4 u 8 pines para CPU",
      explanation: "El conector EPS aporta alimentación a la zona del procesador. La ubicación suele estar cerca del borde superior de la placa.",
    },
    {
      id: "power-03",
      topic: "power",
      image: "assets/power-connectors.svg",
      alt: "Conectores EPS y PCIe de alimentación marcados con etiquetas distintas.",
      prompt: "¿Qué precaución importante aplica a los cables EPS de CPU y PCIe de GPU?",
      options: ["No intercambiarlos aunque ambos tengan 8 pines", "Usarlos como cable SATA de datos", "Cortarlos para que encajen", "Conectarlos a las ranuras DIMM"],
      answer: "No intercambiarlos aunque ambos tengan 8 pines",
      explanation: "Aunque algunos enchufes parecen similares, su cableado y uso son distintos. Usa solo el conector identificado para cada componente.",
    },
    {
      id: "power-04",
      topic: "power",
      image: "assets/power-connectors.svg",
      alt: "Conector ATX principal con su pestaña de enganche resaltada.",
      prompt: "¿Cómo debe quedar asegurado el conector ATX de la placa?",
      options: ["Con la pestaña encajada en su retén", "Sostenido solo por el peso del cable", "Conectado al puerto de red", "Presionado dentro de una ranura PCIe"],
      answer: "Con la pestaña encajada en su retén",
      explanation: "Alinea el conector y presiónalo con cuidado hasta que su pestaña quede sujeta. Desconecta la fuente antes de instalar componentes.",
    },
    {
      id: "power-05",
      topic: "power",
      image: "assets/power-connectors.svg",
      alt: "Conector de alimentación PCIe separado del conector ATX principal.",
      prompt: "¿Qué conexión suele necesitar una tarjeta gráfica de alto consumo?",
      options: ["Alimentación PCIe dedicada desde la fuente", "Un cable SATA de datos a la placa", "El cable de audio frontal", "Un módulo DIMM adicional"],
      answer: "Alimentación PCIe dedicada desde la fuente",
      explanation: "Algunas tarjetas gráficas requieren alimentación PCIe adicional. Comprueba los conectores y la potencia que recomienda el fabricante.",
    },
    {
      id: "power-06",
      topic: "power",
      image: "assets/power-connectors.svg",
      alt: "Conectores de alimentación de la placa base con etiquetas ATX, EPS y PCIe.",
      prompt: "¿Qué se debe comprobar al elegir una fuente de poder?",
      options: ["Conectores requeridos y potencia recomendada", "Que tenga el mismo color que la memoria", "Que sustituya el cable SATA de datos", "Que encaje en el zócalo del procesador"],
      answer: "Conectores requeridos y potencia recomendada",
      explanation: "Verifica que la fuente incluya los conectores correctos y pueda entregar la potencia necesaria para todos los componentes.",
    },
  ];

  const els = {
    setup: document.getElementById("setup-screen"),
    setupForm: document.getElementById("setup-form"),
    playerName: document.getElementById("player-name"),
    opponentName: document.getElementById("opponent-name"),
    duelFields: document.getElementById("duel-fields"),
    timerFields: document.getElementById("timer-fields"),
    startButton: document.getElementById("start-game"),
    bossStart: document.getElementById("boss-start"),
    bossStatus: document.getElementById("boss-status"),
    setupError: document.getElementById("setup-error"),
    storageNotice: document.getElementById("storage-notice"),
    game: document.getElementById("game-screen"),
    results: document.getElementById("results-screen"),
    recordsPanel: document.getElementById("leaderboard"),
    questionNumber: document.getElementById("question-number"),
    timerValue: document.getElementById("timer-value"),
    timerBar: document.getElementById("timer-bar"),
    progressBar: document.getElementById("progress-bar"),
    scoreDisplay: document.getElementById("score-display"),
    scoreLabel: document.querySelector(".score-box > span"),
    activePlayer: document.getElementById("active-player-display"),
    livesContainer: document.getElementById("lives-container"),
    livesDisplay: document.getElementById("lives-display"),
    questionImage: document.getElementById("question-image"),
    imageCredit: document.getElementById("image-credit"),
    questionTitle: document.getElementById("question-title"),
    answerList: document.getElementById("answer-list"),
    feedback: document.getElementById("feedback"),
    feedbackTitle: document.getElementById("feedback-title"),
    feedbackText: document.getElementById("feedback-text"),
    continueButton: document.getElementById("continue-button"),
    help5050: document.getElementById("help-5050"),
    helpTime: document.getElementById("help-time"),
    helpDouble: document.getElementById("help-double"),
    resultTitle: document.getElementById("result-title"),
    resultsSummary: document.getElementById("results-summary"),
    resultsDetails: document.getElementById("results-details"),
    playAgain: document.getElementById("play-again"),
    backToSetup: document.getElementById("back-to-setup"),
    leaderboardBody: document.getElementById("leaderboard-body"),
    progressList: document.getElementById("progress-list"),
  };

  let store = { leaderboard: [], progress: {} };
  let storageUsable = true;
  let timerId = null;
  let config = null;
  let game = null;
  let handoffPanel = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function emptyStore() {
    return { leaderboard: [], progress: {} };
  }

  function isValidRecord(record) {
    return record && typeof record.name === "string" &&
      typeof record.points === "number" && Number.isFinite(record.points) &&
      typeof record.mode === "string" &&
      typeof record.level === "string" &&
      typeof record.date === "string";
  }

  function readStore() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyStore();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("El formato guardado no es válido.");
      }
      const leaderboard = Array.isArray(parsed.leaderboard)
        ? parsed.leaderboard.filter(isValidRecord).slice(0, 50)
        : [];
      const progress = parsed.progress && typeof parsed.progress === "object" &&
        !Array.isArray(parsed.progress) ? parsed.progress : {};
      return { leaderboard, progress };
    } catch (error) {
      storageUsable = false;
      showStorageNotice(
        error instanceof SyntaxError
          ? "Los datos guardados no se pudieron leer. Puedes jugar; el progreso nuevo no se conservará."
          : "El almacenamiento del navegador no está disponible. Puedes jugar sin guardar tu progreso."
      );
      return emptyStore();
    }
  }

  function saveStore() {
    if (!storageUsable) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      storageUsable = false;
      showStorageNotice("No se pudo guardar en este navegador. La partida sigue funcionando, pero el progreso no se conservará.");
    }
  }

  function showStorageNotice(message) {
    if (!els.storageNotice) return;
    els.storageNotice.textContent = message;
    els.storageNotice.hidden = false;
  }

  function normalizedName(name) {
    return name.trim().normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es");
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildQuestionSet(topicIds, count) {
    const groups = shuffle(topicIds).map((topicId) =>
      shuffle(QUESTIONS.filter((question) => question.topic === topicId))
    );
    const result = [];
    let round = 0;
    while (result.length < count) {
      let madeProgress = false;
      for (const group of groups) {
        if (group[round]) {
          result.push(group[round]);
          madeProgress = true;
          if (result.length === count) break;
        }
      }
      if (!madeProgress) break;
      round += 1;
    }
    return shuffle(result);
  }

  function selectedMode() {
    return document.querySelector('input[name="mode"]:checked')?.value || "solo";
  }

  function updateSetupFields() {
    const mode = selectedMode();
    els.duelFields.hidden = mode !== "duel";
    els.timerFields.hidden = mode !== "timed";
    updateBossAvailability();
  }

  function playerProgress(name) {
    const entry = store.progress[normalizedName(name)];
    return entry && typeof entry === "object" ? entry : {};
  }

  function hasUnlockedBoss(name) {
    const levels = playerProgress(name).levels || {};
    return LEVELS.every((_, index) => levels[String(index + 1)] === true);
  }

  function updateBossAvailability() {
    const name = els.playerName.value.trim();
    const unlocked = name && hasUnlockedBoss(name);
    els.bossStart.disabled = !unlocked;
    els.bossStatus.textContent = unlocked
      ? "Desbloqueado: diez preguntas, ocho segundos y tres vidas."
      : "Completa los seis niveles en práctica, con todos los temas y al menos 70 % de aciertos.";
  }

  function showScreen(screen) {
    stopTimer();
    els.setup.hidden = screen !== "setup";
    els.game.hidden = screen !== "game";
    els.results.hidden = screen !== "results";
    els.recordsPanel.hidden = screen === "game";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setSetupError(message) {
    els.setupError.textContent = message;
    els.setupError.hidden = !message;
  }

  function readConfig() {
    const playerName = els.playerName.value.trim();
    const opponentName = els.opponentName.value.trim();
    const topics = [...document.querySelectorAll('input[name="topics"]:checked')].map((input) => input.value);
    const mode = selectedMode();
    const difficulty = Number(document.querySelector('input[name="difficulty"]:checked')?.value || 1);
    const timedSeconds = Number(document.getElementById("timed-seconds").value);

    if (!playerName) return { error: "Escribe el nombre del jugador para guardar el progreso." };
    if (!topics.length) return { error: "Selecciona al menos un tema antes de empezar." };
    if (mode === "duel") {
      if (!opponentName) return { error: "Escribe el nombre del segundo jugador." };
      if (normalizedName(playerName) === normalizedName(opponentName)) {
        return { error: "Elige dos nombres distintos para el duelo." };
      }
    }
    if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 6) {
      return { error: "Selecciona un nivel de dificultad válido." };
    }
    if (mode === "timed" && ![10, 15].includes(timedSeconds)) {
      return { error: "Elige 10 o 15 segundos por pregunta." };
    }
    return {
      config: {
        playerName,
        opponentName,
        topics,
        mode,
        difficulty,
        timedSeconds: mode === "timed" ? timedSeconds : LEVELS[difficulty - 1].seconds,
        boss: false,
      },
    };
  }

  function startBoss() {
    const name = els.playerName.value.trim();
    if (!name) {
      setSetupError("Escribe tu nombre para iniciar el jefe final.");
      els.playerName.focus();
      return;
    }
    if (!hasUnlockedBoss(name)) {
      setSetupError("Primero completa los seis niveles requeridos para desbloquear el jefe final.");
      return;
    }
    setSetupError("");
    startGame({
      playerName: name,
      opponentName: "",
      topics: TOPICS.map((topic) => topic.id),
      mode: "solo",
      difficulty: 6,
      timedSeconds: 8,
      boss: true,
    });
  }

  function startGame(nextConfig) {
    stopTimer();
    config = { ...nextConfig, topics: nextConfig.topics.slice() };
    const questions = buildQuestionSet(config.topics, config.boss ? 10 : 10);
    const names = config.mode === "duel"
      ? [config.playerName, config.opponentName]
      : [config.playerName];
    game = {
      questions,
      questionIndex: 0,
      activePlayer: 0,
      players: names.map((name) => ({
        name,
        points: 0,
        correct: 0,
        answered: 0,
        lives: ADVANCED_LEVELS.has(config.difficulty) || config.boss ? 3 : null,
        totalMs: 0,
        streak: 0,
        helpUsed: { half: false, time: false, double: false },
        doubleNext: false,
      })),
      answeredThisTurn: false,
      lockedAnswer: null,
      secondsLeft: config.timedSeconds,
      currentTimerDuration: config.timedSeconds,
      questionStartedAt: 0,
      questionAnswered: false,
      timedOut: false,
      eliminated: false,
      history: [],
    };
    if (!questions.length) {
      setSetupError("No hay preguntas disponibles para esos temas.");
      showScreen("setup");
      return;
    }
    hideHandoff();
    showScreen("game");
    renderQuestion();
  }

  function stopTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    game.questionStartedAt = performance.now();
    game.secondsLeft = config.timedSeconds;
    game.currentTimerDuration = config.timedSeconds;
    renderTimer();
    timerId = window.setInterval(() => {
      game.secondsLeft -= 1;
      renderTimer();
      if (game.secondsLeft <= 0) {
        game.secondsLeft = 0;
        renderTimer();
        submitAnswer(null, true);
      }
    }, 1000);
  }

  function renderTimer() {
    els.timerValue.textContent = String(game.secondsLeft).padStart(2, "0");
    const fraction = Math.min(1, Math.max(0, game.secondsLeft / game.currentTimerDuration));
    els.timerBar.style.width = `${fraction * 100}%`;
    els.timerBar.setAttribute("aria-valuenow", String(game.secondsLeft));
    els.timerBar.parentElement?.setAttribute("aria-label", `${game.secondsLeft} segundos restantes`);
  }

  function renderQuestion() {
    if (!game || game.questionIndex >= game.questions.length) {
      finishGame();
      return;
    }
    hideHandoff();
    const question = game.questions[game.questionIndex];
    const player = game.players[game.activePlayer];
    game.questionAnswered = false;
    game.timedOut = false;
    game.answeredThisTurn = false;
    game.lockedAnswer = null;
    game.eliminated = false;
    els.game.classList.remove("handoff-active");
    els.questionTitle.textContent = question.prompt;
    els.questionNumber.textContent = String(game.questionIndex + 1).padStart(2, "0");
    els.questionNumber.parentElement.querySelector(".muted").textContent = `/ ${game.questions.length}`;
    const topic = TOPICS.find((item) => item.id === question.topic);
    document.querySelector("[data-game-topic]").textContent = topic?.label.toLocaleUpperCase("es") || "HARDWARE";
    document.querySelector("[data-game-difficulty]").textContent = String(config.difficulty).padStart(2, "0");
    els.questionImage.hidden = false;
    els.questionImage.alt = IMAGE_ALT[question.topic] || "Diagrama de un componente de hardware resaltado.";
    els.questionImage.dataset.fallbackLoaded = "false";
    els.questionImage.src = question.image;
    els.imageCredit.hidden = false;
    els.imageCredit.textContent = IMAGE_CREDIT;
    els.questionImage.onerror = function () {
      if (this.dataset.fallbackLoaded !== "true") {
        this.dataset.fallbackLoaded = "true";
        this.src = FALLBACK_IMAGE;
      } else {
        this.hidden = true;
      }
    };
    els.feedback.hidden = true;
    els.continueButton.hidden = true;
    els.answerList.replaceChildren();
    els.answerList.setAttribute("aria-disabled", "false");
    els.activePlayer.hidden = config.mode !== "duel" && !config.boss;
    els.activePlayer.innerHTML = `Turno de <strong>${escapeHtml(player.name)}</strong>`;
    const scoreBox = document.querySelector(".score-box");
    scoreBox.hidden = false;
    els.scoreLabel.textContent = config.mode === "duel" ? "MARCADOR" : "PUNTOS";
    if (config.mode === "duel") {
      els.scoreDisplay.textContent = game.activePlayer === 0
        ? String(game.players[0].points).padStart(3, "0")
        : `${game.players[0].points} · ${game.players[1].points}`;
    } else {
      els.scoreDisplay.textContent = String(player.points).padStart(3, "0");
    }
    els.livesContainer.hidden = player.lives === null;
    if (player.lives !== null) {
      els.livesDisplay.textContent = `${"♥ ".repeat(player.lives)}${"♡ ".repeat(3 - player.lives)}`.trim();
      els.livesDisplay.setAttribute("aria-label", `${player.lives} de 3 vidas`);
    }
    const progress = (game.questionIndex / game.questions.length) * 100;
    els.progressBar.setAttribute("aria-valuenow", String(game.questionIndex));
    els.progressBar.setAttribute("aria-valuemax", String(game.questions.length));
    els.progressBar.firstElementChild.style.width = `${progress}%`;
    const options = shuffle(question.options);
    options.forEach((answer, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-option";
      button.dataset.answer = answer;
      button.setAttribute("aria-label", `Opción ${String.fromCharCode(65 + index)}: ${answer}`);
      button.innerHTML = `<span class="answer-key">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(answer)}</span><span class="answer-arrow" aria-hidden="true">↗</span>`;
      button.addEventListener("click", () => submitAnswer(answer, false));
      els.answerList.appendChild(button);
    });
    refreshHelpButtons();
    const streak = document.querySelector("[data-streak]");
    if (streak) streak.textContent = String(player.streak);
    startTimer();
    els.questionTitle.focus?.({ preventScroll: true });
  }

  function responseTime() {
    return Math.max(0, Math.round(performance.now() - game.questionStartedAt));
  }

  function submitAnswer(answer, timedOut) {
    if (!game || game.questionAnswered) return;
    game.questionAnswered = true;
    stopTimer();
    const question = game.questions[game.questionIndex];
    const player = game.players[game.activePlayer];
    const elapsedMs = timedOut ? game.currentTimerDuration * 1000 : responseTime();
    const correct = !timedOut && answer === question.answer;
    const speedBonus = correct && config.mode === "timed"
      ? Math.max(0, Math.floor(game.secondsLeft) * 5)
      : 0;
    let earned = correct ? 100 + speedBonus : 0;
    if (correct && player.doubleNext) {
      earned *= 2;
      player.doubleNext = false;
    }
    player.totalMs += elapsedMs;
    player.answered += 1;
    if (correct) {
      player.correct += 1;
      player.points += earned;
      player.streak += 1;
    } else {
      player.streak = 0;
      if (player.lives !== null) player.lives -= 1;
    }
    game.history.push({
      questionId: question.id,
      playerName: player.name,
      correct,
      timedOut,
      earned,
      elapsedMs,
    });
    game.lockedAnswer = { answer, correct, timedOut, earned, elapsedMs };
    game.timedOut = timedOut;

    if (config.mode === "duel" && game.activePlayer === 0) {
      if (player.lives === 0) {
        game.eliminated = true;
        revealAnswer(question, game.lockedAnswer, player);
        els.feedbackText.textContent += " Se agotaron las vidas y el duelo termina.";
        els.continueButton.textContent = "Ver resultados";
        els.continueButton.hidden = false;
        disableAnswerButtons();
        return;
      }
      showHandoff();
      return;
    }

    revealDuelFeedback(question, game.lockedAnswer);
    revealAnswer(question, game.lockedAnswer, player);
    if (player.lives === 0) {
      game.eliminated = true;
      els.feedbackText.textContent += " Se agotaron las vidas.";
      els.continueButton.textContent = "Ver resultados";
    } else {
      els.continueButton.textContent = game.questionIndex === game.questions.length - 1
        ? "Ver resultados"
        : "Siguiente pregunta";
    }
    els.continueButton.hidden = false;
    disableAnswerButtons();
    els.scoreDisplay.textContent = config.mode === "duel"
      ? `${game.players[0].points} · ${game.players[1].points}`
      : String(player.points).padStart(3, "0");
    if (player.lives !== null) {
      els.livesDisplay.textContent = `${"♥ ".repeat(player.lives)}${"♡ ".repeat(3 - player.lives)}`.trim();
      els.livesDisplay.setAttribute("aria-label", `${player.lives} de 3 vidas`);
    }
    const streak = document.querySelector("[data-streak]");
    if (streak) streak.textContent = String(player.streak);
  }

  function revealDuelFeedback(question, latestAnswer) {
    if (config.mode !== "duel") return;
    const first = game.players[0];
    const second = game.players[1];
    const firstResult = game.history.slice().reverse().find((item) =>
      item.questionId === question.id && normalizedName(item.playerName) === normalizedName(first.name)
    );
    const secondResult = game.history.slice().reverse().find((item) =>
      item.questionId === question.id && normalizedName(item.playerName) === normalizedName(second.name)
    );
    const describe = (result) => {
      if (!result) return "";
      return `${result.playerName}: ${result.correct ? "correcto" : "incorrecto"}`;
    };
    els.feedbackText.textContent =
      `${describe(firstResult)}${firstResult && secondResult ? " · " : ""}${describe(secondResult)}. ${question.explanation}`;
    els.feedbackTitle.textContent = latestAnswer.correct
      ? `Respuesta de ${latestAnswer === game.lockedAnswer ? game.players[game.activePlayer].name : ""} correcta`
      : "Turno completado";
  }

  function revealAnswer(question, result, player) {
    els.feedback.hidden = false;
    els.feedbackTitle.textContent = result.timedOut
      ? "Se acabó el tiempo"
      : result.correct ? "¡Correcto!" : "Respuesta incorrecta";
    const pointText = result.correct
      ? ` +${result.earned} puntos.`
      : player.lives !== null ? ` Te queda${player.lives === 1 ? "" : "n"} ${player.lives} ${player.lives === 1 ? "vida" : "vidas"}.` : "";
    if (config.mode === "duel") {
      const outcomes = game.history.filter((item) => item.questionId === question.id);
      const descriptions = outcomes.map((item) =>
        `${escapeHtml(item.playerName)}: ${item.correct ? "acierto" : "error"}`
      ).join(" · ");
      els.feedbackText.innerHTML =
        `${descriptions}. ${escapeHtml(question.explanation)} Marcador: ${game.players[0].points} — ${game.players[1].points}.`;
    } else {
      const correctText = result.correct
        ? `${escapeHtml(question.explanation)}${pointText}`
        : `La respuesta correcta es ${escapeHtml(question.answer)}. ${escapeHtml(question.explanation)}${pointText}`;
      els.feedbackText.innerHTML = correctText;
    }
    const correctButton = [...els.answerList.querySelectorAll(".answer-option")]
      .find((button) => button.dataset.answer === question.answer);
    correctButton?.setAttribute("data-state", "correct");
    if (!result.correct && result.answer !== null) {
      const wrongButton = [...els.answerList.querySelectorAll(".answer-option")]
        .find((button) => button.dataset.answer === result.answer);
      wrongButton?.setAttribute("data-state", "incorrect");
    }
  }

  function disableAnswerButtons() {
    els.answerList.setAttribute("aria-disabled", "true");
    els.answerList.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });
  }

  function showHandoff() {
    els.game.classList.add("handoff-active");
    els.feedback.hidden = true;
    els.continueButton.hidden = true;
    if (!handoffPanel) {
      handoffPanel = document.createElement("section");
      handoffPanel.id = "handoff-panel";
      handoffPanel.className = "handoff-panel";
      handoffPanel.setAttribute("role", "status");
      handoffPanel.innerHTML = `
        <span class="step-label">TURNO REGISTRADO</span>
        <h2>Es momento de cambiar de jugador.</h2>
        <p>La respuesta y los puntos de la primera persona permanecerán ocultos hasta que la segunda responda.</p>
        <button class="button button-primary" id="handoff-continue" type="button">Pasar el turno <span aria-hidden="true">→</span></button>`;
      els.game.querySelector(".progress-line").after(handoffPanel);
      handoffPanel.querySelector("#handoff-continue").addEventListener("click", () => {
        game.activePlayer = 1;
        renderQuestion();
      });
    }
    handoffPanel.hidden = false;
    handoffPanel.querySelector("h2").textContent = `Pasa el turno a ${game.players[1].name}.`;
    els.scoreDisplay.closest(".score-box").hidden = true;
    els.activePlayer.hidden = true;
    els.timerValue.textContent = "—";
    els.timerBar.style.width = "0%";
    els.timerBar.parentElement?.setAttribute("aria-label", "Temporizador detenido");
    [...els.answerList.querySelectorAll("button")].forEach((button) => {
      button.removeAttribute("data-state");
      button.setAttribute("aria-pressed", "false");
    });
    els.answerList.replaceChildren();
    els.questionTitle.textContent = "Cambia de jugador antes de continuar.";
  }

  function hideHandoff() {
    if (handoffPanel) handoffPanel.hidden = true;
    if (els.game) els.game.classList.remove("handoff-active");
  }

  function advance() {
    if (!game) return;
    if (game.eliminated) {
      finishGame();
      return;
    }
    if (config.mode === "duel" && game.activePlayer === 0) {
      game.activePlayer = 1;
      renderQuestion();
      return;
    }
    game.questionIndex += 1;
    game.activePlayer = 0;
    if (game.questionIndex >= game.questions.length) {
      finishGame();
      return;
    }
    renderQuestion();
  }

  function refreshHelpButtons() {
    const player = game.players[game.activePlayer];
    const buttons = [
      [els.help5050, "half"],
      [els.helpTime, "time"],
      [els.helpDouble, "double"],
    ];
    buttons.forEach(([button, key]) => {
      button.disabled = player.helpUsed[key];
      button.setAttribute("aria-pressed", player.helpUsed[key] ? "true" : "false");
      button.title = player.helpUsed[key] ? "Ayuda ya utilizada en esta partida" : "Usar una vez en esta partida";
    });
  }

  function useHelp(type) {
    if (!game || game.questionAnswered) return;
    const player = game.players[game.activePlayer];
    if (player.helpUsed[type]) return;
    player.helpUsed[type] = true;
    if (type === "half") {
      const question = game.questions[game.questionIndex];
      const incorrect = shuffle([...els.answerList.querySelectorAll(".answer-option")]
        .filter((button) => button.dataset.answer !== question.answer));
      incorrect.slice(0, 2).forEach((button) => {
        button.hidden = true;
        button.disabled = true;
      });
      els.help5050.setAttribute("aria-label", "Ayuda 50/50 utilizada");
    } else if (type === "time") {
      game.secondsLeft += 10;
      game.currentTimerDuration += 10;
      renderTimer();
    } else if (type === "double") {
      player.doubleNext = true;
      els.helpDouble.title = "La siguiente respuesta correcta vale el doble.";
    }
    refreshHelpButtons();
  }

  function persistProgress() {
    if (config.mode !== "solo" || config.boss ||
        config.topics.length !== TOPICS.length ||
        !TOPICS.every((topic) => config.topics.includes(topic.id)) ||
        game.questionIndex < game.questions.length) return;
    const percent = game.players[0].correct / game.questions.length;
    if (percent < 0.7) return;
    const key = normalizedName(config.playerName);
    const existing = playerProgress(config.playerName);
    const levels = { ...(existing.levels || {}) };
    levels[String(config.difficulty)] = true;
    store.progress[key] = { name: config.playerName, levels };
    saveStore();
  }

  function savePlayerRecord(player) {
    const key = normalizedName(player.name);
    const existingIndex = store.leaderboard.findIndex((record) =>
      normalizedName(record.name) === key
    );
    const existing = existingIndex >= 0 ? store.leaderboard[existingIndex] : null;
    if (!existing || player.points > existing.points ||
        (player.points === existing.points && player.totalMs < (existing.timeMs || Infinity))) {
      const record = {
        name: player.name,
        points: player.points,
        mode: config.boss ? "Jefe final" : config.mode === "duel" ? "Duelo" : config.mode === "timed" ? "Contrarreloj" : "Práctica",
        level: config.boss ? "Jefe" : LEVELS[config.difficulty - 1].name,
        date: new Date().toLocaleDateString("es-CR"),
        timeMs: player.totalMs,
      };
      if (existingIndex >= 0) store.leaderboard.splice(existingIndex, 1);
      store.leaderboard.push(record);
    }
  }

  function finalMessage() {
    if (config.boss) {
      return game.players[0].correct >= 8
        ? "¡Jefe final superado!"
        : "El jefe final sigue en pie";
    }
    if (config.mode === "duel") {
      const [a, b] = game.players;
      if (a.points > b.points) return `Gana ${a.name}`;
      if (b.points > a.points) return `Gana ${b.name}`;
      if (a.totalMs < b.totalMs) return `Empate en puntos; gana ${a.name} por tiempo`;
      if (b.totalMs < a.totalMs) return `Empate en puntos; gana ${b.name} por tiempo`;
      return "El duelo termina en empate";
    }
    const player = game.players[0];
    const ratio = game.questions.length ? player.correct / game.questions.length : 0;
    if (ratio >= 0.8) return "¡Excelente trabajo!";
    if (ratio >= 0.5) return "¡Buen progreso!";
    return "Sigue practicando";
  }

  function finishGame() {
    if (!game) return;
    stopTimer();
    game.players.forEach(savePlayerRecord);
    persistProgress();
    saveStore();
    renderResults();
    showScreen("results");
  }

  function renderResults() {
    const winner = finalMessage();
    els.resultTitle.innerHTML = escapeHtml(winner);
    const player = game.players[0];
    const correctCount = game.players.length === 1
      ? player.correct
      : `${game.players[0].correct} — ${game.players[1].correct}`;
    const score = game.players.length === 1
      ? player.points
      : `${game.players[0].points} — ${game.players[1].points}`;
    const time = game.players.length === 1
      ? `${Math.round(player.totalMs / 1000)} s`
      : `${Math.round(game.players[0].totalMs / 1000)} s — ${Math.round(game.players[1].totalMs / 1000)} s`;
    els.resultsDetails.querySelector("[data-result-score]").textContent = String(score);
    els.resultsDetails.querySelector("[data-result-correct]").innerHTML = `${escapeHtml(String(correctCount))} <small>/ ${game.questions.length}</small>`;
    els.resultsDetails.querySelector("[data-result-time]").textContent = time;
    els.resultsDetails.querySelector("[data-result-level]").textContent = config.boss
      ? "Jefe final"
      : LEVELS[config.difficulty - 1].name;
    els.resultsSummary.querySelector(".step-label").textContent = config.mode === "duel"
      ? "RESULTADO DEL DUELO"
      : config.boss ? "RESULTADO DEL JEFE FINAL" : "RESUMEN DE PARTIDA";
    if (config.boss) {
      const passed = player.correct >= 8;
      els.resultTitle.innerHTML = passed
        ? "¡Jefe final<br><span>superado!</span>"
        : "El jefe final<br><span>sigue en pie</span>";
      els.resultsSummary.querySelector(".step-label").textContent = passed
        ? "VICTORIA · JEFE FINAL"
        : "INTÉNTALO DE NUEVO";
      els.playAgain.textContent = passed ? "Jugar otra vez" : "Reintentar jefe";
    } else {
      els.playAgain.textContent = "Jugar otra vez";
    }
    renderLeaderboard();
    renderProgress(player.name);
    if (config.mode === "duel") {
      els.resultsSummary.setAttribute("aria-label", `Resultado del duelo. ${winner}.`);
    } else {
      els.resultsSummary.removeAttribute("aria-label");
    }
  }

  function renderLeaderboard() {
    const rows = store.leaderboard
      .slice()
      .sort((a, b) => b.points - a.points || (a.timeMs || Infinity) - (b.timeMs || Infinity))
      .slice(0, 10);
    if (!rows.length) {
      els.leaderboardBody.innerHTML = '<tr data-empty-records><td colspan="6"><span class="empty-record-mark" aria-hidden="true">—</span>Aún no hay partidas. Tu primera marca empieza aquí.</td></tr>';
      return;
    }
    els.leaderboardBody.innerHTML = rows.map((record, index) =>
      `<tr><td>${index + 1}</td><td>${escapeHtml(record.name)}</td><td>${escapeHtml(record.mode)}</td><td>${escapeHtml(record.level)}</td><td>${record.points}</td><td>${escapeHtml(record.date)}</td></tr>`
    ).join("");
  }

  function renderProgress(name) {
    const levels = playerProgress(name).levels || {};
    els.progressList.innerHTML = `<div class="progress-levels">${LEVELS.map((level, index) => {
      const passed = levels[String(index + 1)] === true;
      return `<div class="progress-level${passed ? " is-complete" : ""}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(level.name)}</strong><span>${passed ? "Aprobado" : "Pendiente"}</span></div>`;
    }).join("")}</div><p class="progress-note">${hasUnlockedBoss(name) ? "Jefe final desbloqueado." : "Para desbloquear el jefe final, aprueba los seis niveles con todos los temas y al menos 70 % de aciertos."}</p>`;
  }

  function updateHelpForHandoff() {
    refreshHelpButtons();
  }

  function bindEvents() {
    els.setupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      setSetupError("");
      const result = readConfig();
      if (result.error) {
        setSetupError(result.error);
        return;
      }
      startGame(result.config);
    });
    document.querySelectorAll('input[name="mode"]').forEach((input) => {
      input.addEventListener("change", updateSetupFields);
    });
    els.playerName.addEventListener("input", updateBossAvailability);
    els.playerName.addEventListener("input", () => setSetupError(""));
    els.opponentName.addEventListener("input", () => setSetupError(""));
    els.bossStart.addEventListener("click", startBoss);
    els.continueButton.addEventListener("click", advance);
    els.help5050.addEventListener("click", () => useHelp("half"));
    els.helpTime.addEventListener("click", () => useHelp("time"));
    els.helpDouble.addEventListener("click", () => useHelp("double"));
    els.playAgain.addEventListener("click", () => {
      if (config) startGame(config);
    });
    els.backToSetup.addEventListener("click", () => {
      stopTimer();
      showScreen("setup");
      updateBossAvailability();
    });
    els.game.querySelector(".back-button").addEventListener("click", (event) => {
      event.preventDefault();
      stopTimer();
      showScreen("setup");
      updateBossAvailability();
    });
    document.querySelector(".topbar .text-button").addEventListener("click", () => {
      if (!els.recordsPanel.hidden) return;
      stopTimer();
      showScreen("setup");
      updateBossAvailability();
    });
    document.addEventListener("keydown", (event) => {
      if (els.game.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
      const keyIndex = event.key.toUpperCase().charCodeAt(0) - 65;
      const answers = [...els.answerList.querySelectorAll(".answer-option:not([hidden])")];
      if (keyIndex >= 0 && keyIndex < answers.length && !game.questionAnswered) {
        answers[keyIndex].click();
      }
    });
  }

  function initialize() {
    store = readStore();
    if (!storageUsable && els.storageNotice.textContent.trim() === "") {
      showStorageNotice("Los récords se guardan solo en este navegador y no se sincronizan entre dispositivos.");
    }
    bindEvents();
    updateSetupFields();
    renderLeaderboard();
  }

  initialize();
})();
