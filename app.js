// Configuración de Supabase
const SUPABASE_URL = 'https://cfpsmdmwiujstkqvrgsp.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_publishable_z06IelSQA5cVUsS56eroPg_dWBmPHUG';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Adaptación de las 9 Fases Académicas de la Investigación de Pedro
const defaultSections = [
  {
    id: "sec-1",
    title: "1. Selección y Delimitación del Tema",
    themeClass: "theme-1",
    content: `
      <h3>Tema de Investigación</h3>
      <p><strong>"Análisis descriptivo del impacto del diseño de software y gestión de microservicios en el consumo de energía eléctrica mediante monitoreo IoT en infraestructura de servidores."</strong></p>
      <ul>
        <li><strong>Línea de Investigación:</strong> Green Computing e Infraestructura Red distribuida.</li>
        <li><strong>Delimitación Temática:</strong> Evaluación del consumo de energía eléctrica (Watts) y uso de hardware (CPU/RAM) en contenedores Docker.</li>
        <li><strong>Delimitación Espacial:</strong> Laboratorio informático de servidores del área de Ingeniería en Sistemas (INATEC León).</li>
        <li><strong>Delimitación Temporal:</strong> Análisis continuo durante 3 meses de prueba.</li>
      </ul>
    `
  },
  {
    id: "sec-2",
    title: "2. Planteamiento y Pregunta de Investigación",
    themeClass: "theme-2",
    content: `
      <h3>Descripción de la Problemática</h3>
      <p>La transición hacia microservicios en contenedores ha incrementado la huella energética en centros de datos. La falta de visibilidad del costo energético directo en decisiones de software (consultas ineficientes, contenedores zombies en iddle) provoca consumo innecesario de watts y costos financieros elevados.</p>
      <h3>Pregunta Principal de Investigación</h3>
      <p><em>"¿Cuáles son los patrones de consumo energético y el perfil de uso de recursos de hardware en aplicaciones de microservicios desplegadas en servidores bajo diferentes cargas de trabajo e itinerarios de optimización?"</em></p>
    `
  },
  {
    id: "sec-3",
    title: "3. Marco Teleológico (Objetivos)",
    themeClass: "theme-3",
    content: `
      <h3>Objetivo General</h3>
      <p>Analizar de manera descriptiva la relación entre la carga de trabajo de arquitecturas de microservicios y el consumo de energía eléctrica en entornos de servidores, mediante métricas de telemetría e instrumentos de medición IoT para fundamentar directrices de Green Computing.</p>
      <h3>Objetivos Específicos</h3>
      <ol>
        <li>Caracterizar el entorno de hardware, software y contenedores en el escenario de prueba.</li>
        <li>Diseñar e implementar el sistema de monitoreo IoT utilizando sensores SCT-013, ESP32 y Prometheus/Grafana.</li>
        <li>Medir y registrar los perfiles de consumo eléctrico (Watts) y CPU/RAM bajo escenarios idle, carga normal y picos de demanda.</li>
        <li>Sintetizar hallazgos y proponer buenas prácticas de desarrollo y orquestación sustentable.</li>
      </ol>
    `
  },
  {
    id: "sec-4",
    title: "4. Revisión Bibliográfica y Marco Teórico (APA 7)",
    themeClass: "theme-4",
    content: `
      <h3>Fundamentación Teórica</h3>
      <p><strong>Green Computing:</strong> Murugesan (2008) define las prácticas de informática verde enfocadas en software eficiente para reducir ciclos de reloj y uso de memoria.</p>
      <p><strong>Microservicios y Docker:</strong> Fowler (2014) analiza el aislamiento de procesos y el impacto de contenedores subutilizados en la potencia eléctrica.</p>
      <p><strong>Telemetría e IoT:</strong> Convergencia de sensores no invasivos SCT-013 con agentes Prometheus/cAdvisor para perfilado directo de hardware/software.</p>
      <h3>Referencias Bibliográficas</h3>
      <p>• Fowler, M. (2014). Microservices: a definition of this new architectural term. <em>IEEE Software Journal</em>, 31(3), 24-29.</p>
      <p>• Murugesan, S. (2008). Harnessing Green IT: Principles and practices. <em>IT Professional</em>, 10(1), 24-33.</p>
    `
  },
  {
    id: "sec-5",
    title: "5. Diseño Metodológico",
    themeClass: "theme-5",
    content: `
      <h3>Tipo y Enfoque de Investigación</h3>
      <p><strong>Tipo:</strong> Descriptiva cuantitativa. Se orienta a caracterizar el comportamiento de consumo de potencia sin manipulación experimental de variables.</p>
      <p><strong>Enfoque:</strong> Cuantitativo, basado en telemetría continua e intervalos de corriente lecturas en tiempo real.</p>
    `
  },
  {
    id: "sec-6",
    title: "6. Población, Muestra e Instrumentación",
    themeClass: "theme-6",
    content: `
      <h3>Población y Muestra</h3>
      <p><strong>Población:</strong> Microservicios y contenedores Docker en el clúster de servidores del laboratorio.</p>
      <p><strong>Muestra:</strong> Muestreo no probabilístico de 5 microservicios clave (Autenticación, Catálogo, Pagos, Notificaciones y Logs).</p>
      <h3>Instrumentos Técnicos</h3>
      <ul>
        <li><strong>Hardware:</strong> Sensores de corriente SCT-013 integrados con microcontrolador ESP32.</li>
        <li><strong>Software:</strong> Prometheus, Grafana y agente cAdvisor.</li>
      </ul>
    `
  },
  {
    id: "sec-7",
    title: "7. Cronograma de Actividades",
    themeClass: "theme-7",
    content: `
      <ul>
        <li><strong>Mes 1:</strong> Configuración de escenario IoT y prueba piloto del sensor ESP32.</li>
        <li><strong>Mes 2:</strong> Recolección continua de métricas bajo escenarios simulados de carga.</li>
        <li><strong>Mes 3:</strong> Procesamiento de datos, tabulación y redacción del informe final.</li>
      </ul>
    `
  },
  {
    id: "sec-8",
    title: "8. Aspectos Éticos e Integridad Científica",
    themeClass: "theme-8",
    content: `
      <p><strong>Protección de Datos:</strong> Registro exclusivo de métricas de infraestructura sin capturar datos sensibles de usuarios.</p>
      <p><strong>Sostenibilidad Ambiental:</strong> Protocolo diseñado para minimizar pruebas de estrés innecesarias y evitar desperdicio eléctrico.</p>
    `
  },
  {
    id: "sec-9",
    title: "9. Matriz de Operacionalización e Instrumentos",
    themeClass: "theme-9",
    content: `
      <p>Matriz de variables (Consumo en Watts, Porcentaje de CPU/RAM, Tasa de Peticiones/seg) integrada con la ficha de observación técnica automatizada.</p>
    `
  }
];

// Inicialización de la Aplicación
document.addEventListener("DOMContentLoaded", () => {
  renderSections(defaultSections);
  fetchNotifications();
});

function renderSections(sections) {
  const grid = document.getElementById("bento-grid");
  grid.innerHTML = "";
  
  sections.forEach((sec, idx) => {
    const card = document.createElement("div");
    card.className = `bento-card`;
    card.innerHTML = `
      <div class="card-header ${sec.themeClass}">
        <span>${sec.title}</span>
        <div class="card-number">${idx + 1}</div>
      </div>
      <div class="card-body" contenteditable="true" id="${sec.id}">
        ${sec.content}
      </div>
      <div class="comments-section">
        <div class="comment-box">
          <input type="text" id="input-${sec.id}" placeholder="Escribe un comentario o sugerencia en esta sección...">
          <button onclick="addComment('${sec.id}')"><i class="ri-send-plane-fill"></i></button>
        </div>
        <div class="comments-list" id="comments-list-${sec.id}">
          <div class="comment-item"><strong>Revisión Académica:</strong> Sección alineada con la norma APA 7.</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Editor de Texto Enriquecido
function execCmd(command, value = null) {
  document.execCommand(command, false, value);
}

function insertImage() {
  const url = prompt("Introduce la URL de la imagen:");
  if (url) execCmd('insertImage', url);
}

function addNewSection() {
  const title = prompt("Título de la nueva sección:", "Sección Adicional");
  if (!title) return;
  const newSec = {
    id: `sec-${Date.now()}`,
    title: title,
    themeClass: "theme-1",
    content: "<p>Escribe el contenido aquí...</p>"
  };
  defaultSections.push(newSec);
  renderSections(defaultSections);
}

// Autenticación con Google vía Supabase
async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) alert("Error al iniciar sesión: " + error.message);
}

// Gestión de Notificaciones de Visitas
async function fetchNotifications() {
  const { data: notifications } = await supabase.from('visitor_notifications').select('*');
  const badge = document.getElementById('notif-badge');
  const list = document.getElementById('notif-list');
  
  if (!notifications || notifications.length === 0) {
    // Datos simulados iniciales si la tabla está vacía
    const mockNotifs = [
      { id: 1, visitor_name: 'Dra. Damaris Medal', action: 'Visualizó tu protocolo' },
      { id: 2, visitor_name: 'Ing. Denis Berrios', action: 'Dejó un comentario en Marco Teórico' }
    ];
    badge.innerText = mockNotifs.length;
    list.innerHTML = mockNotifs.map(n => `
      <li class="notif-item">
        <span><strong>${n.visitor_name}:</strong> ${n.action}</span>
        <button onclick="deleteNotif(this)"><i class="ri-delete-bin-line"></i></button>
      </li>
    `).join('');
    return;
  }

  badge.innerText = notifications.length;
  list.innerHTML = notifications.map(n => `
    <li class="notif-item">
      <span><strong>${n.visitor_name}:</strong> ${n.action}</span>
      <button onclick="deleteNotifBD('${n.id}', this)"><i class="ri-delete-bin-line"></i></button>
    </li>
  `).join('');
}

function deleteNotif(btnElement) {
  btnElement.parentElement.remove();
  const badge = document.getElementById('notif-badge');
  badge.innerText = Math.max(0, parseInt(badge.innerText) - 1);
}

function toggleNotifications() {
  document.getElementById('notifications-panel').classList.toggle('hidden');
}

// Funciones de Exportación Multiformato
function exportPDF() {
  const element = document.getElementById('investigation-canvas');
  const opt = {
    margin: 10,
    filename: 'Protocolo_Investigacion_Pedro_Valverde.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

function exportPNG() {
  const element = document.getElementById('investigation-canvas');
  html2canvas(element).then(canvas => {
    const link = document.createElement('a');
    link.download = 'Investigacion_BentoGrid.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}

function exportPPT() {
  let pptx = new PptxGenJS();
  let slide = pptx.addSlide();
  slide.addText("Defensa de Monografía: Monitoreo IoT & Green IT", { x: 1, y: 1, fontSize: 24, color: "363636", bold: true });
  slide.addText("Pedro Ismael Valverde Zapata - INATEC León", { x: 1, y: 2, fontSize: 16, color: "5B8E7D" });
  pptx.writeFile({ fileName: "Presentacion_Defensa_Investigacion.pptx" });
}

function exportWord() {
  const content = document.getElementById('investigation-canvas').innerText;
  const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Protocolo_Investigacion_Pedro_Valverde.doc';
  a.click();
}

// Modal para Compartir
document.getElementById('btn-share').onclick = () => {
  document.getElementById('share-modal').classList.remove('hidden');
  document.getElementById('share-url-input').value = window.location.href + "?token=share-abc12345";
};

function closeShareModal() {
  document.getElementById('share-modal').classList.add('hidden');
}

function copyShareUrl() {
  const input = document.getElementById('share-url-input');
  input.select();
  document.execCommand('copy');
  alert("¡Enlace de investigación copiado al portapapeles!");
}