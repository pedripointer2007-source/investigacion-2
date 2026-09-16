const SUPABASE_URL = 'https://cfpsmdmwiujstkqvrgsp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_z06IelSQA5cVUsS56eroPg_dWBmPHUG';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

const emptySectionsTemplate = [
  { id: "sec-1", title: "1. Selección y Delimitación del Tema", themeClass: "theme-1", content: "<p>Escribe aquí la delimitación y justificación de tu tema...</p>" },
  { id: "sec-2", title: "2. Planteamiento y Pregunta de Investigación", themeClass: "theme-2", content: "<p>Escribe la descripción de la problemática y la pregunta principal...</p>" },
  { id: "sec-3", title: "3. Marco Teleológico (Objetivos)", themeClass: "theme-3", content: "<h3>Objetivo General</h3><p>...</p><h3>Objetivos Específicos</h3><ol><li>...</li></ol>" },
  { id: "sec-4", title: "4. Revisión Bibliográfica y Marco Teórico", themeClass: "theme-4", content: "<p>Añade los conceptos clave y fundamentos teóricos en norma APA 7...</p>" },
  { id: "sec-5", title: "5. Diseño Metodológico", themeClass: "theme-5", content: "<p>Especifica el tipo de investigación y el enfoque cuantitativo/cualitativo...</p>" },
  { id: "sec-6", title: "6. Población, Muestra e Instrumentación", themeClass: "theme-6", content: "<p>Detalla el universo de estudio y las herramientas de recolección de datos...</p>" },
  { id: "sec-7", title: "7. Cronograma de Actividades", themeClass: "theme-7", content: "<p>Plantea las fases de desarrollo por semanas o meses...</p>" },
  { id: "sec-8", title: "8. Aspectos Éticos e Integridad Científica", themeClass: "theme-8", content: "<p>Garantías de protección de información y confidencialidad...</p>" },
  { id: "sec-9", title: "9. Matriz de Operacionalización e Instrumentos", themeClass: "theme-9", content: "<p>Operacionalización de variables y fichas de medición...</p>" }
];

let currentProject = null;
let currentUser = null;
let currentRole = 'owner'; 
let currentVisitorEmail = localStorage.getItem('visitor_email') || '';

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const shareToken = urlParams.get('token');
  const shareMode = urlParams.get('mode') || 'view_comment';

  const { data: { session } } = await supabaseClient.auth.getSession();
  currentUser = session?.user || null;

  updateAuthUI(session);

  if (shareToken) {
    await loadSharedProject(shareToken, shareMode);
  } else if (currentUser) {
    await loadUserLatestProject();
  } else {
    document.getElementById('welcome-screen')?.classList.remove('hidden');
    document.getElementById('investigation-canvas')?.classList.add('hidden');
  }

  const btnShare = document.getElementById('btn-share');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      document.getElementById('share-modal')?.classList.remove('hidden');
      generateShareUrl();
    });
  }

  // Comprobar estado de notificaciones push
  checkNotificationStatus();
});

// Solicitud y manejo de permisos de Notificaciones Emergentes (Desktop & Mobile)
function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Tu navegador no soporta notificaciones emergentes.");
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      alert("¡Notificaciones emergentes activadas con éxito!");
      showPushNotification("Investigación II", "Las notificaciones emergentes están habilitadas.");
    } else {
      alert("Permiso de notificaciones denegado.");
    }
  });
}

function checkNotificationStatus() {
  const btn = document.getElementById('btn-push-permission');
  if ("Notification" in window && Notification.permission === "granted" && btn) {
    btn.style.color = "#5b8e7d";
  }
}

function showPushNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: body,
      icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    });
  }
}

// Cargar un proyecto compartido mediante Token
async function loadSharedProject(token, mode) {
  try {
    const { data: proj, error } = await supabaseClient
      .from('investigations')
      .select('*')
      .eq('share_token', token)
      .single();

    if (error || !proj) {
      alert("El enlace del proyecto no es válido o expiró.");
      return;
    }

    currentProject = proj;
    currentRole = mode === 'edit' ? 'editor' : 'viewer';

    if (!currentUser && !currentVisitorEmail) {
      currentVisitorEmail = prompt("Ingresa tu correo para identificarte en los comentarios y recibir notificaciones:") || `anon_${Math.floor(Math.random()*10000)}@correo.com`;
      localStorage.setItem('visitor_email', currentVisitorEmail);
    }

    // Incrementar contador de visitas
    await supabaseClient.from('investigations')
      .update({ views_count: (proj.views_count || 0) + 1 })
      .eq('id', proj.id);

    // Registrar notificación al dueño
    await supabaseClient.from('visitor_notifications').insert([{
      owner_id: proj.user_id,
      visitor_email: currentUser ? currentUser.email : currentVisitorEmail,
      visitor_name: currentUser ? (currentUser.user_metadata.full_name || 'Usuario') : currentVisitorEmail.split('@')[0],
      action: mode === 'edit' ? 'Accedió en modo edición' : 'Visualizó el proyecto'
    }]);

    renderProjectToCanvas(proj, currentRole === 'editor');
    configureVisitorUI(mode);
    fetchNotifications();
    setupRealtimeSubscriptions();
  } catch (e) {
    console.error("Error al cargar proyecto compartido:", e);
  }
}

// Cargar el último proyecto del propietario
async function loadUserLatestProject() {
  document.getElementById('welcome-screen')?.classList.add('hidden');
  document.getElementById('investigation-canvas')?.classList.remove('hidden');

  const { data: projects } = await supabaseClient
    .from('investigations')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('updated_at', { ascending: false });

  if (projects && projects.length > 0) {
    currentProject = projects[0];
  } else {
    await createNewProject(false);
  }

  renderProjectToCanvas(currentProject, true);
  fetchNotifications();
  setupRealtimeSubscriptions();
}

// Renderizado del lienzo
function renderProjectToCanvas(project, canEdit) {
  document.getElementById('welcome-screen')?.classList.add('hidden');
  document.getElementById('investigation-canvas')?.classList.remove('hidden');

  const toolbar = document.getElementById('editor-toolbar');
  if (canEdit) {
    toolbar?.classList.remove('hidden');
  } else {
    toolbar?.classList.add('hidden');
  }

  document.getElementById('doc-title').innerText = project.title || "TITULO DEL PROYECTO";
  
  const grid = document.getElementById("bento-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const sections = project.sections && project.sections.length > 0 ? project.sections : emptySectionsTemplate;

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
          <input type="text" id="input-${sec.id}" placeholder="Escribe un comentario...">
          <button onclick="addComment('${sec.id}')"><i class="ri-send-plane-fill"></i></button>
        </div>
        <div class="comments-list" id="comments-list-${sec.id}"></div>
      </div>
    `;
    grid.appendChild(card);
    loadCommentsForSection(sec.id);
  });

  const editableFields = ['inst-name', 'inst-location', 'inst-dept', 'doc-title', 'author-name', 'subject-name', 'tutor-name', 'academic-year'];
  editableFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('contenteditable', canEdit ? "true" : "false");
  });
}

// Formateador Estilo Word (execCommand)
function formatDoc(cmd, value = null) {
  document.execCommand(cmd, false, value);
}

// Importar Archivos PDF / Word / TXT e Inyectarlos en las Plantillas
async function importDocumentToTemplate(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  let extractedText = "";

  try {
    if (fileName.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      extractedText = result.value;
    } else if (fileName.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        extractedText += textContent.items.map(item => item.str).join(' ') + '\n';
      }
    } else if (fileName.endsWith('.txt')) {
      extractedText = await file.text();
    }

    if (!extractedText.trim()) {
      alert("No se pudo extraer texto del archivo.");
      return;
    }

    // Distribuir dinámicamente el texto importado en los bloques del proyecto
    const chunks = extractedText.match(/[\s\S]{1,500}/g) || [extractedText];
    emptySectionsTemplate.forEach((sec, idx) => {
      const el = document.getElementById(sec.id);
      if (el && chunks[idx]) {
        el.innerHTML = `<p>${chunks[idx].replace(/\n/g, '<br>')}</p>`;
      }
    });

    alert("¡Documento procesado e importado con éxito a la plantilla!");
  } catch (err) {
    console.error("Error al procesar el documento:", err);
    alert("Ocurrió un error al leer el archivo.");
  }
}

// Guardar Cambios
async function saveCurrentProject() {
  if (!currentUser && currentRole !== 'editor') return alert("No tienes permisos de edición en este proyecto.");

  const sections = [];
  emptySectionsTemplate.forEach(sec => {
    const el = document.getElementById(sec.id);
    sections.push({
      id: sec.id,
      title: sec.title,
      themeClass: sec.themeClass,
      content: el ? el.innerHTML : sec.content
    });
  });

  const title = document.getElementById('doc-title').innerText;

  if (currentProject && currentProject.id) {
    const { error } = await supabaseClient.from('investigations').update({
      title: title,
      sections: sections,
      updated_at: new Date()
    }).eq('id', currentProject.id);

    if (!error) {
      alert("¡Proyecto guardado con éxito!");
      // Notificar a los visitantes/colaboradores que el autor modificó la obra
      await supabaseClient.from('visitor_notifications').insert([{
        owner_id: currentProject.user_id,
        visitor_email: 'Todos',
        visitor_name: 'Propietario',
        action: `Actualizó el contenido del proyecto: "${title}"`
      }]);
    }
  }
}

// Crear Nuevo Proyecto
async function createNewProject(confirmDialog = true) {
  if (confirmDialog && !confirm("¿Deseas crear un nuevo proyecto en blanco?")) return;

  currentProject = {
    title: "NUEVO PROTOCOLO DE INVESTIGACIÓN",
    sections: emptySectionsTemplate
  };

  renderProjectToCanvas(currentProject, true);
  if (currentUser) {
    await saveCurrentProject();
  }
}

// Cargar Comentarios con opción de respuestas anidadas
async function loadCommentsForSection(secId) {
  if (!currentProject?.id) return;
  const list = document.getElementById(`comments-list-${secId}`);
  if (!list) return;

  const { data: comments } = await supabaseClient
    .from('section_comments')
    .select('*')
    .eq('investigation_id', currentProject.id)
    .eq('section_id', secId)
    .order('created_at', { ascending: true });

  if (!comments) return;

  const parents = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => c.parent_id);

  list.innerHTML = parents.map(c => {
    const childReplies = replies.filter(r => r.parent_id === c.id);
    return `
      <div class="comment-item" id="comment-${c.id}">
        <div class="comment-header-text"><strong>${c.user_name}:</strong> ${c.comment_text}</div>
        <button class="btn-reply-link" onclick="showReplyBox('${c.id}')"><i class="ri-reply-line"></i> Responder</button>
        
        <div id="reply-box-${c.id}" class="reply-box hidden">
          <input type="text" id="reply-input-${c.id}" placeholder="Escribe una respuesta...">
          <button onclick="addComment('${secId}', '${c.id}', '${c.user_email}')"><i class="ri-send-plane-fill"></i></button>
        </div>

        <div class="replies-container">
          ${childReplies.map(r => `
            <div class="comment-item reply-item">
              <strong>${r.user_name}:</strong> ${r.comment_text}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function showReplyBox(commentId) {
  document.getElementById(`reply-box-${commentId}`)?.classList.toggle('hidden');
}

// Enviar Comentario o Respuesta
async function addComment(secId, parentId = null, parentAuthorEmail = null) {
  let input;
  if (parentId) {
    input = document.getElementById(`reply-input-${parentId}`);
  } else {
    input = document.getElementById(`input-${secId}`);
  }

  if (!input || !input.value.trim()) return;

  const commentText = input.value.trim();
  const userName = currentUser ? (currentUser.user_metadata.full_name || currentUser.email) : (currentVisitorEmail.split('@')[0] || 'Visitante');
  const userEmail = currentUser ? currentUser.email : currentVisitorEmail;

  if (currentProject?.id) {
    const payload = {
      investigation_id: currentProject.id,
      section_id: secId,
      user_email: userEmail,
      user_name: userName,
      comment_text: commentText
    };

    if (parentId) payload.parent_id = parentId;

    await supabaseClient.from('section_comments').insert([payload]);

    // Notificaciones cruzadas (Dueño -> Visitante o Visitante -> Dueño)
    if (parentId && parentAuthorEmail) {
      await supabaseClient.from('visitor_notifications').insert([{
        owner_id: currentProject.user_id,
        recipient_email: parentAuthorEmail,
        visitor_email: userEmail,
        visitor_name: userName,
        action: `Respondió a tu comentario en el proyecto`
      }]);
    } else if (currentProject.user_id !== currentUser?.id) {
      await supabaseClient.from('visitor_notifications').insert([{
        owner_id: currentProject.user_id,
        visitor_email: userEmail,
        visitor_name: userName,
        action: `Dejó un comentario en la sección: ${secId}`
      }]);
    }

    loadCommentsForSection(secId);
    input.value = '';
  }
}

// Notificaciones y Bandeja Bidireccional
async function fetchNotifications() {
  const badge = document.getElementById('notif-badge');
  const list = document.getElementById('notif-list');

  let query = supabaseClient.from('visitor_notifications').select('*').eq('is_read', false);

  if (currentUser) {
    query = query.or(`owner_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id},recipient_email.eq.${currentUser.email}`);
  } else if (currentVisitorEmail) {
    query = query.or(`recipient_email.eq.${currentVisitorEmail},visitor_email.eq.Todos`);
  }

  const { data: notifs } = await query.order('created_at', { ascending: false });

  if (badge) badge.innerText = notifs ? notifs.length : 0;
  if (list) {
    list.innerHTML = (notifs || []).map(n => `
      <li class="notif-item">
        <span><strong>${n.visitor_name}:</strong> ${n.action}</span>
      </li>
    `).join('');
  }
}

async function markAllNotificationsAsRead() {
  const targetEmail = currentUser ? currentUser.email : currentVisitorEmail;
  if (!targetEmail) return;

  await supabaseClient.from('visitor_notifications')
    .update({ is_read: true })
    .or(`owner_id.eq.${currentUser?.id},recipient_email.eq.${targetEmail}`);

  fetchNotifications();
}

function toggleNotifications() {
  document.getElementById('notifications-panel')?.classList.toggle('hidden');
}

// Escuchador en Tiempo Real para Cambios y Comentarios (Realtime)
function setupRealtimeSubscriptions() {
  if (!currentProject?.id) return;

  supabaseClient
    .channel('project-updates')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitor_notifications' }, payload => {
      fetchNotifications();
      showPushNotification("Nueva Notificación", `${payload.new.visitor_name}: ${payload.new.action}`);
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'section_comments' }, payload => {
      loadCommentsForSection(payload.new.section_id);
    })
    .subscribe();
}

// Dashboard y Modal de Perfil
async function openDashboard() {
  if (!currentUser) return loginWithGoogle();

  document.getElementById('profile-modal')?.classList.remove('hidden');
  document.getElementById('profile-user-name').innerText = currentUser.user_metadata.full_name || 'Usuario';
  document.getElementById('profile-user-email').innerText = currentUser.email;

  // Cargar Avatar
  const { data: profile } = await supabaseClient.from('user_profiles').select('avatar_url').eq('user_id', currentUser.id).single();
  if (profile?.avatar_url) {
    document.getElementById('user-avatar-img').src = profile.avatar_url;
  }

  // Cargar Estadísticas
  const { data: projects } = await supabaseClient.from('investigations').select('*').eq('user_id', currentUser.id);
  
  let totalViews = 0;
  (projects || []).forEach(p => totalViews += (p.views_count || 0));

  let totalComments = 0;
  if (projects && projects.length > 0) {
    const projectIds = projects.map(p => p.id);
    const { count } = await supabaseClient.from('section_comments').select('*', { count: 'exact' }).in('investigation_id', projectIds);
    totalComments = count || 0;
  }

  document.getElementById('stat-projects').innerText = projects ? projects.length : 0;
  document.getElementById('stat-views').innerText = totalViews;
  document.getElementById('stat-comments').innerText = totalComments;

  const projList = document.getElementById('user-projects-list');
  projList.innerHTML = (projects || []).map(p => `
    <div class="project-list-item" onclick="switchProject('${p.id}')">
      <div>
        <strong>${p.title}</strong>
        <p class="small-text">Visitas: ${p.views_count || 0}</p>
      </div>
      <i class="ri-arrow-right-line"></i>
    </div>
  `).join('');
}

async function switchProject(projId) {
  const { data: proj } = await supabaseClient.from('investigations').select('*').eq('id', projId).single();
  if (proj) {
    currentProject = proj;
    currentRole = 'owner';
    renderProjectToCanvas(proj, true);
    closeProfileModal();
  }
}

async function uploadAvatar(e) {
  const file = e.target.files[0];
  if (!file || !currentUser) return;

  const fileExt = file.name.split('.').pop();
  const filePath = `${currentUser.id}/avatar.${fileExt}`;

  let { error: uploadError } = await supabaseClient.storage.from('avatars').upload(filePath, file, { upsert: true });

  if (!uploadError) {
    const { data: { publicUrl } } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
    document.getElementById('user-avatar-img').src = publicUrl;

    await supabaseClient.from('user_profiles').upsert({
      user_id: currentUser.id,
      avatar_url: publicUrl,
      full_name: currentUser.user_metadata.full_name
    });
  }
}

// Cerrar Sesión
async function logoutUser() {
  await supabaseClient.auth.signOut();
  currentUser = null;
  localStorage.removeItem('visitor_email');
  window.location.href = window.location.origin + window.location.pathname;
}

function closeProfileModal() {
  document.getElementById('profile-modal')?.classList.add('hidden');
}

// Compartir Enlace
function generateShareUrl() {
  if (!currentProject) return;
  const permission = document.getElementById('share-permission').value;
  const baseUrl = window.location.origin + window.location.pathname;
  const token = currentProject.share_token;
  const shareUrl = `${baseUrl}?token=${token}&mode=${permission}`;
  
  document.getElementById('share-url-input').value = shareUrl;
}

function updateSharePermission() {
  generateShareUrl();
}

function copyShareUrl() {
  const input = document.getElementById('share-url-input');
  if (input) {
    input.select();
    document.execCommand('copy');
    alert("¡Enlace copiado al portapapeles!");
  }
}

function closeShareModal() {
  document.getElementById('share-modal')?.classList.add('hidden');
}

function configureVisitorUI(mode) {
  const badge = document.createElement('span');
  badge.className = 'share-mode-badge';
  badge.innerText = mode === 'edit' ? 'Modo: Edición Compartida' : 'Modo: Solo Lectura';
  document.querySelector('.brand')?.appendChild(badge);
}

// Autenticación Google
function updateAuthUI(session) {
  const container = document.getElementById('auth-container');
  if (!container) return;

  if (session) {
    container.innerHTML = `
      <button class="btn-secondary" onclick="openDashboard()">
        <i class="ri-user-3-line"></i> Mi Perfil
      </button>
    `;
  } else {
    container.innerHTML = `
      <button id="btn-login" class="btn-google" onclick="loginWithGoogle()">
        <i class="ri-google-fill"></i> Iniciar con Gmail
      </button>
    `;
  }
}

async function loginWithGoogle() {
  await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
}

// Exportación a formatos documentales
function exportPDF() {
  const element = document.getElementById('investigation-canvas');
  if (typeof html2pdf !== 'undefined') {
    html2pdf().set({ margin: 10, filename: 'Protocolo_Investigacion.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(element).save();
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
    slide.addText(document.getElementById('doc-title').innerText, { x: 1, y: 1, fontSize: 20, color: "363636", bold: true });
    pptx.writeFile({ fileName: "Presentacion_Investigacion.pptx" });
  }
}

function exportWord() {
  const element = document.getElementById('investigation-canvas');
  if (element) {
    const blob = new Blob(['\ufeff' + element.innerText], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Protocolo_Investigacion.doc';
    a.click();
  }
}