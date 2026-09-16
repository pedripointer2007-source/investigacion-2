const SUPABASE_URL = 'https://cfpsmdmwiujstkqvrgsp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_z06IelSQA5cVUsS56eroPg_dWBmPHUG';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Estructura limpia por defecto de las 9 secciones para nuevos proyectos
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

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const shareToken = urlParams.get('token');
  const shareMode = urlParams.get('mode') || 'view_comment';

  const { data: { session } } = await supabaseClient.auth.getSession();
  currentUser = session?.user || null;

  updateAuthUI(session);

  if (shareToken) {
    await loadSharedProject(shareToken, shareMode);
    return;
  }

  if (currentUser) {
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
});

// Cargar un proyecto compartido mediante Token de la URL
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

    // Incrementar contador de visitas
    await supabaseClient.from('investigations')
      .update({ views_count: (proj.views_count || 0) + 1 })
      .eq('id', proj.id);

    // Registrar notificación al dueño
    await supabaseClient.from('visitor_notifications').insert([{
      owner_id: proj.user_id,
      visitor_email: currentUser ? currentUser.email : 'Anónimo',
      visitor_name: currentUser ? (currentUser.user_metadata.full_name || 'Visitante') : 'Visitante',
      action: mode === 'edit' ? 'Accedió en modo edición' : 'Visualizó el proyecto'
    }]);

    renderProjectToCanvas(proj, currentRole === 'editor');
    configureVisitorUI(mode);
  } catch (e) {
    console.error("Error al cargar proyecto compartido:", e);
  }
}

// Cargar el último proyecto del usuario autenticado
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
    // Si es un usuario totalmente nuevo, crear su primer proyecto en blanco
    await createNewProject(false);
  }

  renderProjectToCanvas(currentProject, true);
  fetchNotifications();
}

// Renderizado del proyecto en el DOM
function renderProjectToCanvas(project, canEdit) {
  document.getElementById('welcome-screen')?.classList.add('hidden');
  document.getElementById('investigation-canvas')?.classList.remove('hidden');

  document.getElementById('doc-title').innerText = project.title || "TITULO DEL PROYECTO";
  
  // Rellenar las secciones
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

// Guardar el proyecto actual en Supabase
async function saveCurrentProject() {
  if (!currentUser) return alert("Debes iniciar sesión para guardar cambios.");
  if (currentRole === 'viewer') return alert("No tienes permisos de edición en este proyecto.");

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

    if (!error) alert("¡Proyecto guardado con éxito!");
  } else {
    const { data, error } = await supabaseClient.from('investigations').insert([{
      user_id: currentUser.id,
      title: title,
      sections: sections
    }]).select().single();

    if (!error && data) {
      currentProject = data;
      alert("¡Nuevo proyecto creado y guardado con éxito!");
    }
  }
}

// Crear un proyecto totalmente nuevo
async function createNewProject(confirmDialog = true) {
  if (confirmDialog && !confirm("¿Deseas crear un nuevo proyecto en blanco? Se cargarán las plantillas por defecto.")) return;

  currentProject = {
    title: "NUEVO PROTOCOLO DE INVESTIGACIÓN",
    sections: emptySectionsTemplate
  };

  renderProjectToCanvas(currentProject, true);
  if (currentUser) {
    await saveCurrentProject();
  }
}

// Cargar Comentarios
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

  list.innerHTML = (comments || []).map(c => `
    <div class="comment-item"><strong>${c.user_name}:</strong> ${c.comment_text}</div>
  `).join('');
}

// Enviar Comentario
async function addComment(secId) {
  const input = document.getElementById(`input-${secId}`);
  if (!input || !input.value.trim()) return;

  const commentText = input.value.trim();
  const userName = currentUser ? (currentUser.user_metadata.full_name || currentUser.email) : 'Visitante';
  const userEmail = currentUser ? currentUser.email : 'anonimo@correo.com';

  if (currentProject?.id) {
    await supabaseClient.from('section_comments').insert([{
      investigation_id: currentProject.id,
      section_id: secId,
      user_email: userEmail,
      user_name: userName,
      comment_text: commentText
    }]);

    if (currentProject.user_id !== currentUser?.id) {
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

// Gestión de Notificaciones
async function fetchNotifications() {
  if (!currentUser) return;
  const badge = document.getElementById('notif-badge');
  const list = document.getElementById('notif-list');

  const { data: notifs } = await supabaseClient
    .from('visitor_notifications')
    .select('*')
    .eq('owner_id', currentUser.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false });

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
  if (!currentUser) return;
  await supabaseClient.from('visitor_notifications')
    .update({ is_read: true })
    .eq('owner_id', currentUser.id);

  fetchNotifications();
}

function toggleNotifications() {
  document.getElementById('notifications-panel')?.classList.toggle('hidden');
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

  // Cargar Proyectos del usuario y estadísticas
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

function closeProfileModal() {
  document.getElementById('profile-modal')?.classList.add('hidden');
}

// Configuración de interfaz compartida
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
    alert("¡Enlace de proyecto copiado al portapapeles!");
  }
}

function closeShareModal() {
  document.getElementById('share-modal')?.classList.add('hidden');
}

function configureVisitorUI(mode) {
  document.getElementById('btn-notifications').style.display = 'none';
  const badge = document.createElement('span');
  badge.className = 'share-mode-badge';
  badge.innerText = mode === 'edit' ? 'Modo: Edición Compartida' : 'Modo: Solo Lectura';
  document.querySelector('.brand')?.appendChild(badge);
}

// Login
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

// Exportación
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