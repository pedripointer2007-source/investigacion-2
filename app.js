// Configuración de Supabase
const SUPABASE_URL = 'https://cfpsmdmwiujstkqvrgsp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_z06IelSQA5cVUsS56eroPg_dWBmPHUG';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Correo del propietario exclusivo
const OWNER_EMAIL = "pedripointer2007@gmail.com";

// Secciones por defecto
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
      <p>La transición hacia microservicios en contenedores ha incrementado la huella energética en centros de datos. La falta de visibilidad del costo energético directo en decisiones de software provoca consumo innecesario de watts y costos financieros elevados.</p>
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
    `
  },
  {
    id: "sec-5",
    title: "5. Diseño Metodológico",
    themeClass: "theme-5",
    content: `
      <h3>Tipo y Enfoque de Investigación</h3>
      <p><strong>Tipo:</strong> Descriptiva cuantitativa.</p>
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
    `
  },
  {
    id: "sec-9",
    title: "9. Matriz de Operacionalización e Instrumentos",
    themeClass: "theme-9",
    content: `
      <p>Matriz de variables integrada con la ficha de observación técnica automatizada.</p>
    `
  }
];

// Secciones vacías para nuevos usuarios
const emptySections = defaultSections.map(sec => ({
  ...sec,
  content: `<p>Escribe aquí el contenido para tu sección...</p>`
}));

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const shareMode = urlParams.get('mode'); // 'view_comment' o 'edit'
  
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const userEmail = session?.user?.email;

    // Actualizar interfaz del botón de login/logout
    updateAuthUI(session);

    // ESCENARIO 1: Acceso vía enlace compartido por URL
    if (shareMode) {
      document.getElementById('welcome-screen')?.classList.add('hidden');
      document.getElementById('investigation-canvas')?.classList.remove('hidden');
      
      const isEditable = shareMode === 'edit';
      renderSections(defaultSections, isEditable);
      configureViewForVisitor(shareMode);
      return;
    }

    // ESCENARIO 2: Propietario del Proyecto
    if (userEmail === OWNER_EMAIL) {
      document.getElementById('welcome-screen')?.classList.add('hidden');
      document.getElementById('investigation-canvas')?.classList.remove('hidden');
      renderSections(defaultSections, true);
      fetchNotifications();
      return;
    }

    // ESCENARIO 3: Usuario autenticado ajeno (Nuevo Proyecto en blanco)
    if (session && userEmail !== OWNER_EMAIL) {
      document.getElementById('welcome-screen')?.classList.add('hidden');
      document.getElementById('investigation-canvas')?.classList.remove('hidden');
      
      // Limpiar portada para el nuevo usuario
      document.getElementById('doc-title').innerText = "TITULO DE TU NUEVO PROYECTO DE INVESTIGACIÓN";
      document.querySelector('.cover-metadata').innerHTML = `
        <p><strong>Autor:</strong> ${session.user.user_metadata.full_name || 'Nuevo Usuario'}</p>
        <p><strong>Asignatura:</strong> Investigación II</p>
        <p><strong>Estado:</strong> Borrador Propio</p>
        <p><strong>Año Académico:</strong> 2026</p>
      `;
      
      renderSections(emptySections, true);
      hideOwnerTools();
      return;
    }

    // ESCENARIO 4: Visita anónima sin link
    document.getElementById('welcome-screen')?.classList.remove('hidden');
    document.getElementById('investigation-canvas')?.classList.add('hidden');

  } catch (err) {
    console.error("Error al verificar permisos de la aplicación:", err);
  }

  // Escuchar eventos del modal de compartir
  const btnShare = document.getElementById('btn-share');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      document.getElementById('share-modal')?.classList.remove('hidden');
      generateShareUrl();
    });
  }

  const btnNotif = document.getElementById('btn-notifications');
  if (btnNotif) {
    btnNotif.addEventListener('click', toggleNotifications);
  }
});

// Renderizado dinámico respetando el permiso de edición
function renderSections(sections, canEdit) {
  const grid = document.getElementById("bento-grid");
  if (!grid) return;
  grid.innerHTML = "";
  
  sections.forEach((sec, idx) => {
    const card = document.createElement("div");
    card.className = `bento-card`;
    card.innerHTML = `
      <div class="card-header ${sec.themeClass}">
        <span>${sec.title}</span>
        <div class="card-number">${idx + 1}</div>
      </div>
      <div class="card-body" contenteditable="${canEdit}" id="${sec.id}">
        ${sec.content}
      </div>
      <div class="comments-section">
        <div class="comment-box">
          <input type="text" id="input-${sec.id}" placeholder="Escribe un comentario o sugerencia...">
          <button onclick="addComment('${sec.id}')"><i class="ri-send-plane-fill"></i></button>
        </div>
        <div class="comments-list" id="comments-list-${sec.id}">
          <div class="comment-item"><strong>Sistema:</strong> Sección disponible para revisión.</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Si no puede editar, bloquea la portada también
  const title = document.getElementById('doc-title');
  if (title) title.setAttribute('contenteditable', canEdit ? "true" : "false");
}

// Configuración visual para visitantes con link compartido
function configureViewForVisitor(mode) {
  const notifBtn = document.getElementById('btn-notifications');
  const shareBtn = document.getElementById('btn-share');
  
  if (notifBtn) notifBtn.style.display = 'none';
  if (shareBtn) shareBtn.style.display = 'none';

  const badge = document.createElement('span');
  badge.className = 'share-mode-badge';
  badge.innerText = mode === 'edit' ? 'Modo: Edición Compartida' : 'Modo: Solo Lectura';
  document.querySelector('.brand')?.appendChild(badge);
}

// Ocultar herramientas exclusivas del propietario
function hideOwnerTools() {
  const notifBtn = document.getElementById('btn-notifications');
  if (notifBtn) notifBtn.style.display = 'none';
}

// Actualizar el estado del botón de sesión
function updateAuthUI(session) {
  const btnLogin = document.getElementById('btn-login');
  if (!btnLogin) return;

  if (session) {
    btnLogin.innerHTML = `<i class="ri-logout-box-r-line"></i> Cerrar Sesión (${session.user.email.split('@')[0]})`;
    btnLogin.onclick = async () => {
      await supabaseClient.auth.signOut();
      window.location.href = window.location.pathname;
    };
  } else {
    btnLogin.innerHTML = `<i class="ri-google-fill"></i> Iniciar con Gmail`;
    btnLogin.onclick = loginWithGoogle;
  }
}

// Autenticación Supabase
async function loginWithGoogle() {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });
  if (error) alert("Error al autenticar: " + error.message);
}

// Agregar comentarios
function addComment(secId) {
  const input = document.getElementById(`input-${secId}`);
  const list = document.getElementById(`comments-list-${secId}`);
  if (input && input.value.trim() !== '') {
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.innerHTML = `<strong>Visitante:</strong> ${input.value}`;
    list.appendChild(item);
    input.value = '';
  }
}

// Notificaciones
async function fetchNotifications() {
  const badge = document.getElementById('notif-badge');
  const list = document.getElementById('notif-list');
  if (!badge || !list) return;

  try {
    const { data: notifications } = await supabaseClient.from('visitor_notifications').select('*');
    
    const mockNotifs = notifications && notifications.length > 0 ? notifications : [
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
  } catch (err) {
    console.error("Error al cargar notificaciones:", err);
  }
}

function deleteNotif(btnElement) {
  btnElement.parentElement.remove();
  const badge = document.getElementById('notif-badge');
  if (badge) {
    badge.innerText = Math.max(0, parseInt(badge.innerText || '0') - 1);
  }
}

function toggleNotifications() {
  const panel = document.getElementById('notifications-panel');
  if (panel) panel.classList.toggle('hidden');
}

// Generar URL para compartir
function generateShareUrl() {
  const role = document.getElementById('share-permission')?.value || 'view_comment';
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?mode=${role}`;
  const input = document.getElementById('share-url-input');
  if (input) input.value = shareUrl;
}

function copyShareUrl() {
  const input = document.getElementById('share-url-input');
  if (input) {
    input.select();
    document.execCommand('copy');
    alert("¡Enlace de investigación copiado al portapapeles!");
  }
}

function closeShareModal() {
  document.getElementById('share-modal')?.classList.add('hidden');
}

// Exportaciones
function exportPDF() {
  const element = document.getElementById('investigation-canvas');
  if (typeof html2pdf !== 'undefined') {
    const opt = {
      margin: 10,
      filename: 'Protocolo_Investigacion.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }
}

function exportPNG() {
  const element = document.getElementById('investigation-canvas');
  if (typeof html2canvas !== 'undefined') {
    html2canvas(element).then(canvas => {
      const link = document.createElement('a');
      link.download = 'Investigacion_Grid.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }
}

function exportPPT() {
  if (typeof PptxGenJS !== 'undefined') {
    let pptx = new PptxGenJS();
    let slide = pptx.addSlide();
    slide.addText("Defensa de Monografía: Monitoreo IoT & Green IT", { x: 1, y: 1, fontSize: 24, color: "363636", bold: true });
    slide.addText("Pedro Ismael Valverde Zapata - INATEC León", { x: 1, y: 2, fontSize: 16, color: "5B8E7D" });
    pptx.writeFile({ fileName: "Presentacion_Defensa_Investigacion.pptx" });
  }
}

function exportWord() {
  const element = document.getElementById('investigation-canvas');
  if (element) {
    const content = element.innerText;
    const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Protocolo_Investigacion.doc';
    a.click();
  }
}