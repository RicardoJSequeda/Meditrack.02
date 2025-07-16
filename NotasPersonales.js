// NotasPersonales.js
// Lógica moderna para la página de Notas Personales

// Estado en memoria
let notas = [];
let editIndex = null;

// Referencias DOM
const addNoteButton = document.getElementById('add-new-note-button');
const addNoteModal = document.getElementById('addNoteModal');
const closeModalButtons = document.querySelectorAll('.close-button');
const addNoteForm = document.getElementById('add-note-form');
const notesGrid = document.getElementById('notes-grid-container');
const totalNotesStat = document.getElementById('total-notes-stat');
const thisWeekNotesStat = document.getElementById('this-week-notes-stat');
const notesTrendStat = document.getElementById('notes-trend-stat');
const notificationContainer = document.getElementById('notification-container');

// Acceso rápido: Seguimiento Síntomas (Estadísticas)
const symptomBtn = document.querySelector('.quick-action-btn[data-action="symptom-tracker"]');

// Acceso rápido: Registro Medicamentos (Estadísticas)
const medicationBtn = document.querySelector('.quick-action-btn[data-action="medication-tracker"]');

// Acceso rápido: Estado de Ánimo (Estadísticas)
const moodBtn = document.querySelector('.quick-action-btn[data-action="mood-tracker"]');

// Acceso rápido: Registro de Sueño (Estadísticas)
const sleepBtn = document.querySelector('.quick-action-btn[data-action="sleep-tracker"]');

// Acceso rápido: Estadísticas de Síntomas
const symptomStatsBtn = document.querySelector('.quick-action-btn[data-action="symptom-tracker"]');
const symptomStatsModal = document.getElementById('symptomStatsModal');
const statsSummary = document.getElementById('symptom-stats-summary');
const statsChart = document.getElementById('symptom-stats-chart');
const statsList = document.getElementById('symptom-stats-list');
const statsRecommendations = document.getElementById('symptom-stats-recommendations');

// Acceso rápido: Estadísticas de Medicamentos
const medicationStatsBtn = document.querySelector('.quick-action-btn[data-action="medication-tracker"]');
const medicationStatsModal = document.getElementById('medicationStatsModal');
const medicationStatsSummary = document.getElementById('medication-stats-summary');
const medicationStatsChart = document.getElementById('medication-stats-chart');
const medicationStatsList = document.getElementById('medication-stats-list');
const medicationStatsRecommendations = document.getElementById('medication-stats-recommendations');

// Acceso rápido: Estadísticas de Estado de Ánimo
const moodStatsBtn = document.querySelector('.quick-action-btn[data-action="mood-tracker"]');
const moodStatsModal = document.getElementById('moodStatsModal');
const moodStatsSummary = document.getElementById('mood-stats-summary');
const moodStatsChart = document.getElementById('mood-stats-chart');
const moodStatsList = document.getElementById('mood-stats-list');
const moodStatsRecommendations = document.getElementById('mood-stats-recommendations');

// Acceso rápido: Estadísticas de Sueño
const sleepStatsBtn = document.querySelector('.quick-action-btn[data-action="sleep-tracker"]');
const sleepStatsModal = document.getElementById('sleepStatsModal');
const sleepStatsSummary = document.getElementById('sleep-stats-summary');
const sleepStatsChart = document.getElementById('sleep-stats-chart');
const sleepStatsList = document.getElementById('sleep-stats-list');
const sleepStatsRecommendations = document.getElementById('sleep-stats-recommendations');

// Modal helpers
function openModal(modal) {
  modal.classList.add('active');
}
function closeModal(modal) {
  modal.classList.remove('active');
}

// Notificación
function showNotification(msg, type = 'info') {
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = msg;
  notificationContainer.appendChild(notif);
  setTimeout(() => notif.remove(), 2500);
}

// Listeners
if (addNoteButton && addNoteModal) {
  addNoteButton.addEventListener('click', () => openModal(addNoteModal));
}
closeModalButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const modalId = btn.dataset.modalId;
    const modal = document.getElementById(modalId);
    if (modal) closeModal(modal);
  });
});
if (addNoteForm) {
  addNoteForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('note-title').value.trim();
    const category = document.getElementById('note-category').value;
    const description = document.getElementById('note-description').value.trim();
    // Tags
    let tags = [];
    // Si tienes UI de tags, aquí deberías obtenerlos
    // Estado de ánimo
    let mood = null;
    const moodRadio = document.querySelector('#add-note-form input[name="mood"]:checked');
    if (moodRadio) mood = moodRadio.value;
    // Imagen
    let imagenUrl = null;
    const fileInput = document.getElementById('note-image');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      imagenUrl = URL.createObjectURL(file);
    } else if (editIndex !== null && notas[editIndex].imagenUrl) {
      imagenUrl = notas[editIndex].imagenUrl;
    }
    // Prioridad
    const prioridad = document.getElementById('note-priority')?.value || 'media';
    // Estado
    let estado = 'pendiente';
    // Usuario/avatar
    let usuario = { nombre: 'María López', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' };
    // Fecha
    const fecha = new Date();
    if (!title || !description) {
      showNotification('Completa todos los campos', 'error');
      return;
    }
    if (editIndex !== null) {
      notas[editIndex] = { title, category, description, fecha, tags, mood, imagenUrl, prioridad, estado, usuario };
      editIndex = null;
      showNotification('Nota actualizada', 'success');
    } else {
      notas.push({ title, category, description, fecha, tags, mood, imagenUrl, prioridad, estado, usuario });
      showNotification('Nota guardada', 'success');
    }
    renderNotas();
    updateStats();
    closeModal(addNoteModal);
    addNoteForm.reset();
    // Limpia imagen temporal
    if (fileInput) fileInput.value = '';
    // Limpia estado de ánimo
    const checkedMood = document.querySelector('#add-note-form input[name="mood"]:checked');
    if (checkedMood) checkedMood.checked = false;
  });
}

// Event listeners para botones de estadísticas
if (symptomBtn) {
  symptomBtn.addEventListener('click', () => {
    mostrarEstadisticasSintomas();
    openModal(symptomStatsModal);
  });
}

if (medicationBtn) {
  medicationBtn.addEventListener('click', () => {
    mostrarEstadisticasMedicamentos();
    openModal(medicationStatsModal);
  });
}

if (moodBtn) {
  moodBtn.addEventListener('click', () => {
    mostrarEstadisticasEstadoAnimo();
    openModal(moodStatsModal);
  });
}

if (sleepBtn) {
  sleepBtn.addEventListener('click', () => {
    mostrarEstadisticasSueno();
    openModal(sleepStatsModal);
  });
}

// Guardar y cargar notas en localStorage
function saveNotasToStorage() {
  localStorage.setItem('notas-personales', JSON.stringify(notas));
}
function loadNotasFromStorage() {
  const data = localStorage.getItem('notas-personales');
  if (data) {
    try {
      notas = JSON.parse(data);
    } catch (e) {
      notas = [];
    }
  }
  
  // Si no hay notas, agregar algunas de ejemplo para probar las estadísticas
  if (notas.length === 0) {
    const ahora = new Date();
    const hace1Dia = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
    const hace3Dias = new Date(ahora.getTime() - 3 * 24 * 60 * 60 * 1000);
    const hace5Dias = new Date(ahora.getTime() - 5 * 24 * 60 * 60 * 1000);
    
    // Notas de síntomas de ejemplo
    notas.push({
      title: 'Dolor de cabeza',
      category: 'symptom',
      description: 'Dolor intenso en la frente',
      fecha: hace1Dia,
      intensidad: 7,
      tags: ['dolor de cabeza'],
      prioridad: 'media',
      estado: 'pendiente',
      usuario: { nombre: 'María López', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }
    });
    
    notas.push({
      title: 'Dolor de cabeza',
      category: 'symptom',
      description: 'Dolor leve',
      fecha: hace3Dias,
      intensidad: 3,
      tags: ['dolor de cabeza'],
      prioridad: 'baja',
      estado: 'completada',
      usuario: { nombre: 'María López', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }
    });
    
    notas.push({
      title: 'Fiebre',
      category: 'symptom',
      description: 'Fiebre alta',
      fecha: hace5Dias,
      intensidad: 8,
      tags: ['fiebre'],
      prioridad: 'alta',
      estado: 'completada',
      usuario: { nombre: 'María López', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }
    });
    
    // Notas de medicamentos de ejemplo
    notas.push({
      title: 'Paracetamol',
      category: 'medication',
      description: 'Dosis: 500mg',
      fecha: hace1Dia,
      dosis: '500mg',
      hora: '08:00',
      tags: ['paracetamol'],
      prioridad: 'media',
      estado: 'pendiente',
      usuario: { nombre: 'María López', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }
    });
    
    notas.push({
      title: 'Ibuprofeno',
      category: 'medication',
      description: 'Dosis: 400mg',
      fecha: hace3Dias,
      dosis: '400mg',
      hora: '14:00',
      tags: ['ibuprofeno'],
      prioridad: 'media',
      estado: 'completada',
      usuario: { nombre: 'María López', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }
    });
    
    // Notas de estado de ánimo de ejemplo
    notas.push({
      title: 'Estado de ánimo',
      category: 'mood',
      description: 'Me siento bien hoy',
      fecha: hace1Dia,
      estado: '2',
      tags: [],
      prioridad: 'normal',
      estado: 'pendiente',
      usuario: { nombre: 'María López', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }
    });
    
    notas.push({
      title: 'Estado de ánimo',
      category: 'mood',
      description: 'Un poco cansada',
      fecha: hace3Dias,
      estado: '4',
      tags: [],
      prioridad: 'normal',
      estado: 'pendiente',
      usuario: { nombre: 'María López', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }
    });
    
    // Notas de sueño de ejemplo
    notas.push({
      title: 'Registro de sueño',
      category: 'sleep',
      description: 'Dormí bien',
      fecha: hace1Dia,
      horaAcostarse: '22:00',
      horaLevantarse: '07:00',
      calidad: 8,
      tags: ['sueño'],
      prioridad: 'normal',
      estado: 'pendiente',
      usuario: { nombre: 'María López', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }
    });
    
    notas.push({
      title: 'Registro de sueño',
      category: 'sleep',
      description: 'Sueño interrumpido',
      fecha: hace3Dias,
      horaAcostarse: '23:00',
      horaLevantarse: '06:30',
      calidad: 5,
      tags: ['sueño'],
      prioridad: 'normal',
      estado: 'pendiente',
      usuario: { nombre: 'María López', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }
    });
  }
}

// Renderizado de notas
function renderNotas() {
  if (!notesGrid) return;
  notesGrid.innerHTML = '';
  if (notas.length === 0) {
    notesGrid.innerHTML = '<div class="empty-state">No hay notas aún.</div>';
    saveNotasToStorage();
    return;
  }
  notas.slice().reverse().forEach((nota, idxR) => {
    const idx = notas.length - 1 - idxR;
    const card = document.createElement('div');
    card.className = 'note-card';
    card.setAttribute('data-category', nota.category);
    // Icono de categoría
    const iconMap = {
      symptom: 'fa-head-side-cough',
      medication: 'fa-pills',
      appointment: 'fa-calendar-check',
      activity: 'fa-running',
      diet: 'fa-apple-alt',
      other: 'fa-sticky-note',
    };
    const icon = iconMap[nota.category] || 'fa-sticky-note';
    // Fecha
    const fecha = nota.fecha ? new Date(nota.fecha) : new Date();
    const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // Imagen o placeholder
    let imgHtml = '';
    if (nota.imagenUrl) {
      imgHtml = `<img src="${nota.imagenUrl}" class="note-card-image" alt="Imagen nota" />`;
    } else {
      imgHtml = `<div class='note-card-image-placeholder'><i class='fas fa-image'></i></div>`;
    }
    // Tags
    let tagsHtml = '';
    if (nota.tags && nota.tags.length) {
      tagsHtml = `<div class="note-card-tags">${nota.tags.map(tag => `<span class="note-card-tag">${tag}</span>`).join('')}</div>`;
    }
    // Estado de ánimo
    const moodIcons = [
      { val: 1, icon: 'fa-grin-hearts', label: 'Muy feliz' },
      { val: 2, icon: 'fa-smile', label: 'Feliz' },
      { val: 3, icon: 'fa-meh', label: 'Neutral' },
      { val: 4, icon: 'fa-frown', label: 'Triste' },
      { val: 5, icon: 'fa-sad-tear', label: 'Muy triste' },
    ];
    let moodHtml = `<div class="note-card-mood"><span>Estado de ánimo:</span> ` +
      moodIcons.map(m => `<i class="fas ${m.icon} mood-icon${nota.mood == m.val ? ' selected' : ''}" title="${m.label}"></i>`).join('') + '</div>';
    // Favorito/Importante
    let favHtml = `<button class="note-action-btn note-fav-btn" title="${nota.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}" data-action="fav">` +
      `<i class="fas fa-star${nota.favorito ? ' selected' : ''}"></i></button>`;
    // Estado y prioridad
    let estado = nota.estado || 'pendiente';
    let prioridad = nota.prioridad || 'media';
    let estadoBadge = `<span class="note-card-badge estado-${estado}">${estado.charAt(0).toUpperCase() + estado.slice(1)}</span>`;
    let prioridadBadge = `<span class="note-card-badge prioridad-${prioridad}">${prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}</span>`;
    // Botones para cambiar estado
    let estadoBtns = `<div style='display:flex;gap:0.3rem;margin-left:0.5rem;'>
      <button class='note-action-btn' title='Pendiente' data-action='estado-pendiente'><i class='fas fa-hourglass-start'></i></button>
      <button class='note-action-btn' title='En progreso' data-action='estado-progreso'><i class='fas fa-spinner'></i></button>
      <button class='note-action-btn' title='Completada' data-action='estado-completada'><i class='fas fa-check'></i></button>
    </div>`;
    // Usuario/avatar
    let usuario = nota.usuario || { nombre: 'María López', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' };
    let userHtml = `<div class="note-card-user"><img src="${usuario.avatar}" class="note-card-avatar" alt="Avatar usuario" />${usuario.nombre}</div>`;
    // Fecha de edición
    let editHtml = '';
    if (nota.editado) {
      const editDate = new Date(nota.editado);
      editHtml = `<div class="note-card-edited">Editado: ${editDate.toLocaleDateString()} ${editDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>`;
    }
    // Comentarios (simulado)
    let comentarios = nota.comentarios || 0;
    let commentsHtml = `<div class="note-card-comments"><i class="far fa-comments"></i> ${comentarios} comentario${comentarios === 1 ? '' : 's'}</div>`;
    // Recordatorio
    let recordatorioHtml = '';
    if (nota.recordatorio) {
      const recDate = new Date(nota.recordatorio);
      recordatorioHtml = `<span title="Recordatorio" style="margin-left:0.5rem;"><i class="far fa-bell"></i> ${recDate.toLocaleDateString()} ${recDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
    }
    card.innerHTML = `
      <div class="note-card-header">
        <div class="note-card-icon"><i class="fas ${icon}"></i></div>
        <div class="note-card-title-group">
          <div class="note-card-title">${nota.title}</div>
          <div class="note-card-date"><i class="far fa-clock"></i> ${hora} ${recordatorioHtml}</div>
        </div>
        <div class="note-card-category-badge">${categoriaNombre(nota.category)}</div>
      </div>
      ${imgHtml}
      <div class="note-card-badges">${estadoBadge}${prioridadBadge}${estadoBtns}</div>
      <div class="note-card-description">${nota.description}</div>
      ${tagsHtml}
      ${moodHtml}
      ${userHtml}
      ${editHtml}
      ${commentsHtml}
      <div class="note-card-actions">
        ${favHtml}
        <button class="note-action-btn" title="Editar" data-action="edit"><i class="fas fa-edit"></i></button>
        <button class="note-action-btn" title="Eliminar" data-action="delete"><i class="fas fa-trash"></i></button>
      </div>
    `;
    // Acciones
    const actions = card.querySelector('.note-card-actions');
    actions.querySelector('[data-action="edit"]').onclick = () => editarNota(idx);
    actions.querySelector('[data-action="delete"]').onclick = () => eliminarNota(idx);
    actions.querySelector('[data-action="fav"]').onclick = () => toggleFavorito(idx);
    // Estado
    card.querySelector('[data-action="estado-pendiente"]').onclick = () => cambiarEstado(idx, 'pendiente');
    card.querySelector('[data-action="estado-progreso"]').onclick = () => cambiarEstado(idx, 'progreso');
    card.querySelector('[data-action="estado-completada"]').onclick = () => cambiarEstado(idx, 'completada');
    notesGrid.appendChild(card);
  });
  saveNotasToStorage();
}

function categoriaNombre(cat) {
  switch(cat) {
    case 'symptom': return 'Síntoma';
    case 'medication': return 'Medicamento';
    case 'appointment': return 'Cita';
    case 'activity': return 'Actividad';
    case 'diet': return 'Dieta';
    case 'other': return 'Otro';
    default: return cat;
  }
}

function editarNota(idx) {
  editIndex = idx;
  const nota = notas[idx];
  document.getElementById('note-title').value = nota.title;
  document.getElementById('note-category').value = nota.category;
  document.getElementById('note-description').value = nota.description;
  document.getElementById('note-priority').value = nota.prioridad || 'media';
  // Tags
  if (nota.tags && Array.isArray(nota.tags)) {
    // Aquí podrías renderizar los tags en el input si tienes UI para ello
  }
  // Estado de ánimo
  if (nota.mood) {
    const moodRadio = document.querySelector(`#add-note-form input[name='mood'][value='${nota.mood}']`);
    if (moodRadio) moodRadio.checked = true;
  }
  // Imagen: no se puede previsualizar por seguridad, pero podrías mostrar un aviso
  openModal(addNoteModal);
}

function eliminarNota(idx) {
  if (confirm('¿Seguro que deseas eliminar esta nota?')) {
    notas.splice(idx, 1);
    renderNotas();
    updateStats();
    showNotification('Nota eliminada', 'success');
  }
}

function toggleFavorito(idx) {
  notas[idx].favorito = !notas[idx].favorito;
  renderNotas();
}

function cambiarEstado(idx, nuevoEstado) {
  notas[idx].estado = nuevoEstado;
  renderNotas();
  let estadoMsg = '';
  if (nuevoEstado === 'pendiente') estadoMsg = 'pendiente';
  else if (nuevoEstado === 'progreso') estadoMsg = 'en progreso';
  else if (nuevoEstado === 'completada') estadoMsg = 'completada';
  showNotification(`Estado cambiado a: ${estadoMsg}`, 'success');
}

// Estadísticas
function updateStats() {
  totalNotesStat.innerHTML = `${notas.length} <small>Notas totales</small>`;
  // Simulación: esta semana = todas
  thisWeekNotesStat.innerHTML = `${notas.length} <small>Esta semana</small>`;
  notesTrendStat.innerHTML = `${notas.length > 0 ? '+100%' : '0'} <small>Tendencia</small>`;
}

function mostrarEstadisticasSintomas() {
  // Filtra solo notas de tipo symptom
  const sintomas = notas.filter(n => n.category === 'symptom');
  if (!statsSummary || !statsChart || !statsList || !statsRecommendations) return;
  if (sintomas.length === 0) {
    statsSummary.innerHTML = '<div style="text-align:center;color:#aaa;font-size:1.1rem;">Aún no has registrado síntomas.<br>¡Sigue cuidando tu salud!</div>';
    statsChart.innerHTML = '';
    statsList.innerHTML = '';
    statsRecommendations.innerHTML = '';
    return;
  }
  // Estadísticas básicas
  const freq = {};
  const intensidades = {};
  const fechas = {};
  sintomas.forEach(s => {
    const nombre = (s.title || '').toLowerCase();
    freq[nombre] = (freq[nombre] || 0) + 1;
    intensidades[nombre] = (intensidades[nombre] || []);
    if (s.intensidad) intensidades[nombre].push(s.intensidad);
    fechas[nombre] = (!fechas[nombre] || s.fecha > fechas[nombre]) ? s.fecha : fechas[nombre];
  });
  // Top síntomas
  const top = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,5);
  // Promedio de intensidad
  const proms = Object.fromEntries(Object.entries(intensidades).map(([k,v]) => [k, v.length ? (v.reduce((a,b)=>a+b,0)/v.length).toFixed(1) : '-']));
  // Última fecha
  const ultimas = Object.fromEntries(Object.entries(fechas).map(([k,v]) => [k, new Date(v).toLocaleDateString()]));
  // Tendencia semanal
  const ahora = new Date();
  const hace7 = new Date(); hace7.setDate(ahora.getDate()-7);
  const sintomasSemana = sintomas.filter(s => new Date(s.fecha) >= hace7);
  const tendencia = sintomasSemana.length - sintomas.length/4; // simple: compara última semana vs promedio semanal
  // Resumen
  statsSummary.innerHTML = `
    <div style="display:flex;gap:2.5rem;align-items:center;flex-wrap:wrap;justify-content:center;">
      <div><b>Total de síntomas:</b> <span style='color:#e57373;font-size:1.2rem;'>${sintomas.length}</span></div>
      <div><b>Síntomas distintos:</b> <span style='color:#ffb74d;'>${Object.keys(freq).length}</span></div>
      <div><b>Último registro:</b> <span style='color:#888;'>${new Date(Math.max(...sintomas.map(s=>+new Date(s.fecha)))).toLocaleString()}</span></div>
      <div><b>Tendencia semanal:</b> <span style='color:${tendencia>0?'#388e3c':'#e57373'};'>${tendencia>0?'+':'-'}${Math.abs(tendencia)}</span></div>
    </div>`;
  // Gráfico de barras simple
  statsChart.innerHTML = `<div style='width:100%;max-width:500px;margin:1.2rem auto;'>
    ${top.map(([nombre, cantidad]) => {
      const ancho = Math.max(10, Math.min(100, cantidad*20));
      return `<div style='display:flex;align-items:center;margin-bottom:0.5rem;'>
        <span style='width:120px;text-transform:capitalize;'>${nombre}</span>
        <div style='background:#e57373;height:18px;border-radius:8px;width:${ancho}px;min-width:18px;margin:0 0.7rem;'></div>
        <span style='color:#e57373;font-weight:600;'>${cantidad}</span>
      </div>`;
    }).join('')}
  </div>`;
  // Lista de síntomas frecuentes
  statsList.innerHTML = `<h4 style='color:#e57373;margin-bottom:0.7rem;'>Síntomas más frecuentes</h4>
    <ul style='list-style:none;padding:0;'>
      ${top.map(([nombre, cantidad]) => `<li style='margin-bottom:0.5rem;'><b style='text-transform:capitalize;'>${nombre}</b> (${cantidad} veces) <span style='color:#888;'>Promedio intensidad: ${proms[nombre]}</span> <span style='color:#888;'>Última vez: ${ultimas[nombre]}</span></li>`).join('')}
    </ul>
    <h4 style='color:#e57373;margin:1.2rem 0 0.7rem 0;'>Últimos síntomas registrados</h4>
    <ul style='list-style:none;padding:0;'>
      ${sintomas.slice(-5).reverse().map(s => `<li style='margin-bottom:0.4rem;'><b>${s.title}</b> (${s.intensidad ? 'Intensidad: '+s.intensidad+'/10' : ''}) <span style='color:#888;'>${new Date(s.fecha).toLocaleString()}</span></li>`).join('')}
    </ul>`;
  // Recomendaciones personalizadas
  let rec = '';
  if (top.length) {
    const [masFrecuente] = top[0];
    rec = `<div style='background:#fff3e0;border-radius:1rem;padding:1.2rem 1rem;margin-top:1rem;box-shadow:0 1px 6px #ffb74d33;'>
      <b>Recomendación:</b> Has registrado <b>${masFrecuente}</b> con frecuencia. Considera:
      <ul style='margin:0.5rem 0 0 1.2rem;'>
        <li>Consultar a un profesional si el síntoma persiste o empeora.</li>
        <li>Llevar un registro detallado de factores desencadenantes.</li>
        <li>Revisar tus hábitos de sueño, alimentación y estrés.</li>
      </ul>
      <span style='color:#e57373;font-size:0.98rem;'>Esta recomendación es informativa y no sustituye la consulta médica.</span>
    </div>`;
  }
  statsRecommendations.innerHTML = rec;
}

function mostrarEstadisticasMedicamentos() {
  const medicamentos = notas.filter(n => n.category === 'medication');
  if (!medicationStatsSummary || !medicationStatsChart || !medicationStatsList || !medicationStatsRecommendations) return;
  if (medicamentos.length === 0) {
    medicationStatsSummary.innerHTML = '<div style="text-align:center;color:#aaa;font-size:1.1rem;">Aún no has registrado medicamentos.<br>¡Mantén un control de tus tratamientos!</div>';
    medicationStatsChart.innerHTML = '';
    medicationStatsList.innerHTML = '';
    medicationStatsRecommendations.innerHTML = '';
    return;
  }
  // Estadísticas básicas
  const freq = {};
  const dosis = {};
  const horarios = {};
  medicamentos.forEach(m => {
    const nombre = (m.title || '').toLowerCase();
    freq[nombre] = (freq[nombre] || 0) + 1;
    if (m.dosis) dosis[nombre] = m.dosis;
    if (m.hora) horarios[nombre] = m.hora;
  });
  // Top medicamentos
  const top = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,5);
  // Resumen
  medicationStatsSummary.innerHTML = `
    <div style="display:flex;gap:2.5rem;align-items:center;flex-wrap:wrap;justify-content:center;">
      <div><b>Total de registros:</b> <span style='color:#4fc3f7;font-size:1.2rem;'>${medicamentos.length}</span></div>
      <div><b>Medicamentos distintos:</b> <span style='color:#29b6f6;'>${Object.keys(freq).length}</span></div>
      <div><b>Último registro:</b> <span style='color:#888;'>${new Date(Math.max(...medicamentos.map(m=>+new Date(m.fecha)))).toLocaleString()}</span></div>
      <div><b>Frecuencia diaria:</b> <span style='color:#4fc3f7;'>${(medicamentos.length/7).toFixed(1)}</span></div>
    </div>`;
  // Gráfico de barras
  medicationStatsChart.innerHTML = `<div style='width:100%;max-width:500px;margin:1.2rem auto;'>
    ${top.map(([nombre, cantidad]) => {
      const ancho = Math.max(10, Math.min(100, cantidad*20));
      return `<div style='display:flex;align-items:center;margin-bottom:0.5rem;'>
        <span style='width:120px;text-transform:capitalize;'>${nombre}</span>
        <div style='background:#4fc3f7;height:18px;border-radius:8px;width:${ancho}px;min-width:18px;margin:0 0.7rem;'></div>
        <span style='color:#4fc3f7;font-weight:600;'>${cantidad}</span>
      </div>`;
    }).join('')}
  </div>`;
  // Lista de medicamentos
  medicationStatsList.innerHTML = `<h4 style='color:#4fc3f7;margin-bottom:0.7rem;'>Medicamentos más frecuentes</h4>
    <ul style='list-style:none;padding:0;'>
      ${top.map(([nombre, cantidad]) => `<li style='margin-bottom:0.5rem;'><b style='text-transform:capitalize;'>${nombre}</b> (${cantidad} veces) <span style='color:#888;'>Dosis: ${dosis[nombre] || 'No especificada'}</span> <span style='color:#888;'>Hora: ${horarios[nombre] || 'No especificada'}</span></li>`).join('')}
    </ul>
    <h4 style='color:#4fc3f7;margin:1.2rem 0 0.7rem 0;'>Últimos medicamentos registrados</h4>
    <ul style='list-style:none;padding:0;'>
      ${medicamentos.slice(-5).reverse().map(m => `<li style='margin-bottom:0.4rem;'><b>${m.title}</b> (${m.dosis || ''}) <span style='color:#888;'>${new Date(m.fecha).toLocaleString()}</span></li>`).join('')}
    </ul>`;
  // Recomendaciones
  let rec = '';
  if (top.length) {
    const [masFrecuente] = top[0];
    rec = `<div style='background:#e3f2fd;border-radius:1rem;padding:1.2rem 1rem;margin-top:1rem;box-shadow:0 1px 6px #4fc3f733;'>
      <b>Recomendación:</b> Has registrado <b>${masFrecuente}</b> con frecuencia. Considera:
      <ul style='margin:0.5rem 0 0 1.2rem;'>
        <li>Mantener un horario consistente para tus medicamentos.</li>
        <li>Consultar con tu médico sobre la frecuencia de uso.</li>
        <li>Revisar posibles interacciones con otros medicamentos.</li>
      </ul>
      <span style='color:#4fc3f7;font-size:0.98rem;'>Esta recomendación es informativa y no sustituye la consulta médica.</span>
    </div>`;
  }
  medicationStatsRecommendations.innerHTML = rec;
}

// Funcionalidad de tabs para el modal de sueño
function switchTab(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  
  // Mostrar el tab seleccionado
  document.getElementById(tabName + '-tab').classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Si es el tab de estadísticas, actualizar los datos
  if (tabName === 'stats') {
    mostrarEstadisticasSueno();
  } else if (tabName === 'history') {
    mostrarHistorialSueno();
  }
}

// Event listeners para tabs
document.addEventListener('DOMContentLoaded', function() {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });
  
  // Event listener para el formulario de registro de sueño
  const sleepRegisterForm = document.getElementById('sleep-register-form');
  if (sleepRegisterForm) {
    sleepRegisterForm.addEventListener('submit', e => {
      e.preventDefault();
      registrarSueno();
    });
  }
  
  // Event listener para el slider de calidad de sueño
  const sleepQuality = document.getElementById('sleep-quality');
  const sleepQualityValue = document.getElementById('sleep-quality-value');
  if (sleepQuality && sleepQualityValue) {
    sleepQuality.addEventListener('input', () => {
      sleepQualityValue.textContent = sleepQuality.value;
    });
  }
});

function registrarSueno() {
  const bedtime = document.getElementById('sleep-bedtime').value;
  const waketime = document.getElementById('sleep-waketime').value;
  const quality = parseInt(document.getElementById('sleep-quality').value, 10);
  const obs = document.getElementById('sleep-observations').value.trim();
  const dateInput = document.getElementById('sleep-date').value;
  const fecha = dateInput ? new Date(dateInput) : new Date();
  
  if (!bedtime || !waketime || quality < 1) {
    showNotification('Completa todos los campos requeridos', 'error');
    return;
  }
  
  // Crea la nota tipo sleep
  notas.push({
    title: 'Registro de sueño',
    category: 'sleep',
    description: obs || `Calidad: ${quality}/10`,
    fecha,
    tags: ['sueño'],
    mood: null,
    imagenUrl: null,
    prioridad: 'media',
    estado: 'pendiente',
    usuario: { nombre: 'María López', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    horaAcostarse: bedtime,
    horaLevantarse: waketime,
    calidad: quality
  });
  
  renderNotas();
  updateStats();
  showNotification('Registro de sueño guardado', 'success');
  
  // Limpiar formulario
  document.getElementById('sleep-register-form').reset();
  document.getElementById('sleep-quality').value = 5;
  document.getElementById('sleep-quality-value').textContent = '5';
  
  // Cambiar a tab de estadísticas
  switchTab('stats');
}

function mostrarHistorialSueno() {
  const registrosSueno = notas.filter(n => n.category === 'sleep');
  const historyList = document.getElementById('sleep-history-list');
  
  if (!historyList) return;
  
  if (registrosSueno.length === 0) {
    historyList.innerHTML = '<div style="text-align:center;color:#aaa;font-size:1.1rem;">No hay registros de sueño.</div>';
    return;
  }
  
  const historialHtml = registrosSueno
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .map(s => {
      let horas = '';
      if (s.horaAcostarse && s.horaLevantarse) {
        const acostarse = new Date(`2000-01-01 ${s.horaAcostarse}`);
        const levantarse = new Date(`2000-01-01 ${s.horaLevantarse}`);
        if (levantarse < acostarse) levantarse.setDate(levantarse.getDate() + 1);
        horas = `${((levantarse - acostarse) / (1000 * 60 * 60)).toFixed(1)}h`;
      }
      
      const fecha = new Date(s.fecha);
      const calidadColor = s.calidad >= 7 ? '#4caf50' : s.calidad >= 5 ? '#ff9800' : '#e57373';
      
      return `
        <div style="border:1px solid #e0e0e0;border-radius:8px;padding:1rem;margin-bottom:0.8rem;background:#fafafa;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
            <strong>${fecha.toLocaleDateString()}</strong>
            <span style="color:${calidadColor};font-weight:600;">Calidad: ${s.calidad}/10</span>
          </div>
          <div style="color:#666;margin-bottom:0.5rem;">
            <i class="fas fa-moon"></i> ${s.horaAcostarse} - <i class="fas fa-sun"></i> ${s.horaLevantarse}
            <span style="margin-left:1rem;color:#9c27b0;"><i class="fas fa-clock"></i> ${horas}</span>
          </div>
          ${s.description ? `<div style="color:#555;font-style:italic;">${s.description}</div>` : ''}
        </div>
      `;
    }).join('');
  
  historyList.innerHTML = `
    <h4 style="color:#9c27b0;margin-bottom:1rem;">Historial de Registros de Sueño</h4>
    ${historialHtml}
  `;
}

function mostrarEstadisticasEstadoAnimo() {
  const estadosAnimo = notas.filter(n => n.category === 'mood');
  if (!moodStatsSummary || !moodStatsChart || !moodStatsList || !moodStatsRecommendations) return;
  
  if (estadosAnimo.length === 0) {
    moodStatsSummary.innerHTML = '<div style="text-align:center;color:#aaa;font-size:1.1rem;">Aún no has registrado tu estado de ánimo.<br>¡Es importante monitorear tu bienestar emocional!</div>';
    moodStatsChart.innerHTML = '';
    moodStatsList.innerHTML = '';
    moodStatsRecommendations.innerHTML = '';
    return;
  }
  
  // Estadísticas básicas
  const estados = {};
  const fechas = {};
  const estadosPorDia = {};
  
  estadosAnimo.forEach(e => {
    const estado = e.estado || '3';
    estados[estado] = (estados[estado] || 0) + 1;
    fechas[estado] = (!fechas[estado] || e.fecha > fechas[estado]) ? e.fecha : fechas[estado];
    
    // Agrupar por día
    const fecha = new Date(e.fecha).toDateString();
    if (!estadosPorDia[fecha]) estadosPorDia[fecha] = [];
    estadosPorDia[fecha].push(parseInt(estado));
  });
  
  // Promedio de estado de ánimo
  const proms = estadosAnimo.reduce((sum, e) => sum + (parseInt(e.estado) || 3), 0) / estadosAnimo.length;
  
  // Análisis por períodos
  const ahora = new Date();
  const hace7 = new Date(); hace7.setDate(ahora.getDate()-7);
  const hace30 = new Date(); hace30.setDate(ahora.getDate()-30);
  
  const estadosSemana = estadosAnimo.filter(e => new Date(e.fecha) >= hace7);
  const estadosMes = estadosAnimo.filter(e => new Date(e.fecha) >= hace30);
  
  const promSemana = estadosSemana.length ? estadosSemana.reduce((sum, e) => sum + (parseInt(e.estado) || 3), 0) / estadosSemana.length : 0;
  const promMes = estadosMes.length ? estadosMes.reduce((sum, e) => sum + (parseInt(e.estado) || 3), 0) / estadosMes.length : 0;
  
  const tendenciaSemana = promSemana - proms;
  const tendenciaMes = promMes - proms;
  
  // Resumen mejorado
  moodStatsSummary.innerHTML = `
    <div style="display:flex;gap:2rem;align-items:center;flex-wrap:wrap;justify-content:center;margin-bottom:1rem;">
      <div><b>Total de registros:</b> <span style='color:#ff9800;font-size:1.2rem;'>${estadosAnimo.length}</span></div>
      <div><b>Promedio general:</b> <span style='color:#ff5722;'>${proms.toFixed(1)}/5</span></div>
      <div><b>Último registro:</b> <span style='color:#888;'>${new Date(Math.max(...estadosAnimo.map(e=>+new Date(e.fecha)))).toLocaleString()}</span></div>
    </div>
    <div style="display:flex;gap:2rem;align-items:center;flex-wrap:wrap;justify-content:center;">
      <div><b>Promedio semana:</b> <span style='color:${promSemana>3?'#4caf50':'#e57373'};'>${promSemana.toFixed(1)}/5</span></div>
      <div><b>Promedio mes:</b> <span style='color:${promMes>3?'#4caf50':'#e57373'};'>${promMes.toFixed(1)}/5</span></div>
      <div><b>Tendencia semanal:</b> <span style='color:${tendenciaSemana>0?'#388e3c':'#e57373'};'>${tendenciaSemana>0?'+':'-'}${Math.abs(tendenciaSemana).toFixed(1)}</span></div>
    </div>`;
  
  // Gráfico de estados mejorado
  const iconos = {1:'😍',2:'😊',3:'😐',4:'😔',5:'😢'};
  const labels = {1:'Muy feliz',2:'Feliz',3:'Neutral',4:'Triste',5:'Muy triste'};
  
  moodStatsChart.innerHTML = `<div style='width:100%;max-width:600px;margin:1.2rem auto;'>
    ${Object.entries(estados).sort((a,b) => b[1]-a[1]).map(([estado, cantidad]) => {
      const ancho = Math.max(10, Math.min(100, cantidad*25));
      const porcentaje = ((cantidad / estadosAnimo.length) * 100).toFixed(1);
      return `<div style='display:flex;align-items:center;margin-bottom:0.8rem;'>
        <span style='width:100px;font-size:1.2rem;'>${iconos[estado] || '😐'}</span>
        <span style='width:80px;font-size:0.9rem;color:#666;'>${labels[estado] || 'Estado '+estado}</span>
        <div style='background:#ff9800;height:20px;border-radius:10px;width:${ancho}px;min-width:20px;margin:0 0.7rem;'></div>
        <span style='color:#ff9800;font-weight:600;'>${cantidad}</span>
        <span style='color:#888;margin-left:0.5rem;'>(${porcentaje}%)</span>
      </div>`;
    }).join('')}
  </div>`;
  
  // Análisis de tendencias
  const trendsDiv = document.getElementById('mood-stats-trends');
  if (trendsDiv) {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const promediosPorDia = {};
    
    // Calcular promedio por día de la semana
    estadosAnimo.forEach(e => {
      const fecha = new Date(e.fecha);
      const diaSemana = diasSemana[fecha.getDay()];
      if (!promediosPorDia[diaSemana]) promediosPorDia[diaSemana] = [];
      promediosPorDia[diaSemana].push(parseInt(e.estado));
    });
    
    const promediosFinales = {};
    Object.keys(promediosPorDia).forEach(dia => {
      promediosFinales[dia] = (promediosPorDia[dia].reduce((a,b) => a+b, 0) / promediosPorDia[dia].length).toFixed(1);
    });
    
    trendsDiv.innerHTML = `
      <h4 style='color:#ff9800;margin-bottom:0.7rem;'>Análisis por Día de la Semana</h4>
      <div style='display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-bottom:1rem;'>
        ${diasSemana.map(dia => {
          const prom = promediosFinales[dia] || 'N/A';
          const color = prom !== 'N/A' ? (prom > 3 ? '#4caf50' : prom > 2 ? '#ff9800' : '#e57373') : '#ccc';
          return `<div style='text-align:center;padding:0.5rem;background:#f5f5f5;border-radius:8px;min-width:60px;'>
            <div style='font-weight:600;color:#666;'>${dia}</div>
            <div style='color:${color};font-size:1.1rem;'>${prom}</div>
          </div>`;
        }).join('')}
      </div>
    `;
  }
  
  // Lista de estados mejorada
  moodStatsList.innerHTML = `
    <h4 style='color:#ff9800;margin-bottom:0.7rem;'>Distribución de estados de ánimo</h4>
    <ul style='list-style:none;padding:0;'>
      ${Object.entries(estados).sort((a,b) => b[1]-a[1]).map(([estado, cantidad]) => {
        const porcentaje = ((cantidad / estadosAnimo.length) * 100).toFixed(1);
        return `<li style='margin-bottom:0.5rem;'>
          <span style='font-size:1.1rem;'>${iconos[estado] || '😐'}</span> 
          <b>${labels[estado] || 'Estado '+estado}</b> (${cantidad} veces, ${porcentaje}%) 
          <span style='color:#888;'>Última vez: ${new Date(fechas[estado]).toLocaleDateString()}</span>
        </li>`;
      }).join('')}
    </ul>
    <h4 style='color:#ff9800;margin:1.2rem 0 0.7rem 0;'>Últimos registros de ánimo</h4>
    <ul style='list-style:none;padding:0;'>
      ${estadosAnimo.slice(-5).reverse().map(e => {
        const fecha = new Date(e.fecha);
        return `<li style='margin-bottom:0.4rem;'>
          <span style='font-size:1.1rem;'>${iconos[e.estado] || '😐'}</span> 
          <b>${labels[e.estado] || 'Estado '+e.estado}</b> 
          <span style='color:#888;'>${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
          ${e.description ? `<div style='color:#666;font-style:italic;margin-left:1.5rem;'>"${e.description}"</div>` : ''}
        </li>`;
      }).join('')}
    </ul>`;
  
  // Recomendaciones mejoradas
  let rec = '';
  if (proms < 2.5) {
    rec = `<div style='background:#fff3e0;border-radius:1rem;padding:1.2rem 1rem;margin-top:1rem;box-shadow:0 1px 6px #ff980033;'>
      <b>⚠️ Atención:</b> Tu estado de ánimo promedio es bajo (${proms.toFixed(1)}/5). 
      <ul style='margin:0.5rem 0 0 1.2rem;'>
        <li>Considera hablar con un profesional de salud mental</li>
        <li>Busca actividades que te hagan sentir mejor</li>
        <li>Mantén rutinas saludables de sueño y ejercicio</li>
        <li>Conecta con amigos y familiares</li>
      </ul>
      <span style='color:#ff9800;font-size:0.98rem;'>Tu bienestar emocional es fundamental para tu salud general.</span>
    </div>`;
  } else if (proms < 3.5) {
    rec = `<div style='background:#fff3e0;border-radius:1rem;padding:1.2rem 1rem;margin-top:1rem;box-shadow:0 1px 6px #ff980033;'>
      <b>💡 Sugerencia:</b> Tu estado de ánimo está en un nivel moderado (${proms.toFixed(1)}/5). 
      <ul style='margin:0.5rem 0 0 1.2rem;'>
        <li>Identifica qué actividades te hacen sentir mejor</li>
        <li>Practica técnicas de relajación o meditación</li>
        <li>Mantén un diario de gratitud</li>
      </ul>
      <span style='color:#ff9800;font-size:0.98rem;'>Pequeños cambios pueden mejorar significativamente tu bienestar.</span>
    </div>`;
  } else {
    rec = `<div style='background:#e8f5e8;border-radius:1rem;padding:1.2rem 1rem;margin-top:1rem;box-shadow:0 1px 6px #4caf5033;'>
      <b>🎉 ¡Excelente!</b> Tu estado de ánimo promedio es muy bueno (${proms.toFixed(1)}/5). 
      <ul style='margin:0.5rem 0 0 1.2rem;'>
        <li>Continúa con las actividades que te hacen sentir bien</li>
        <li>Comparte tu energía positiva con otros</li>
        <li>Mantén estos hábitos saludables</li>
      </ul>
      <span style='color:#4caf50;font-size:0.98rem;'>¡Sigue cuidando tu bienestar emocional!</span>
    </div>`;
  }
  
  // Agregar consejos específicos según tendencias
  if (tendenciaSemana < -0.5) {
    rec += `<div style='background:#ffebee;border-radius:1rem;padding:1rem;margin-top:1rem;box-shadow:0 1px 6px #e5737333;'>
      <b>📉 Tendencia:</b> Tu estado de ánimo ha empeorado en la última semana. 
      Considera revisar qué ha cambiado en tu rutina o entorno.
    </div>`;
  } else if (tendenciaSemana > 0.5) {
    rec += `<div style='background:#e8f5e8;border-radius:1rem;padding:1rem;margin-top:1rem;box-shadow:0 1px 6px #4caf5033;'>
      <b>📈 Tendencia:</b> ¡Excelente! Tu estado de ánimo ha mejorado en la última semana. 
      Continúa con las actividades que están funcionando.
    </div>`;
  }
  
  moodStatsRecommendations.innerHTML = rec;
}

function mostrarEstadisticasSueno() {
  const registrosSueno = notas.filter(n => n.category === 'sleep');
  if (!sleepStatsSummary || !sleepStatsChart || !sleepStatsRecommendations) return;
  
  if (registrosSueno.length === 0) {
    sleepStatsSummary.innerHTML = '<div style="text-align:center;color:#aaa;font-size:1.1rem;">Aún no has registrado tu sueño.<br>¡Un buen descanso es fundamental para tu salud!</div>';
    sleepStatsChart.innerHTML = '';
    sleepStatsRecommendations.innerHTML = '';
    return;
  }
  
  // Estadísticas básicas
  const horasSueno = [];
  const calidades = [];
  const fechas = [];
  const registrosPorDia = {};
  
  registrosSueno.forEach(s => {
    if (s.horaAcostarse && s.horaLevantarse) {
      const acostarse = new Date(`2000-01-01 ${s.horaAcostarse}`);
      const levantarse = new Date(`2000-01-01 ${s.horaLevantarse}`);
      if (levantarse < acostarse) levantarse.setDate(levantarse.getDate() + 1);
      const horas = (levantarse - acostarse) / (1000 * 60 * 60);
      horasSueno.push(horas);
      
      // Agrupar por día de la semana
      const fecha = new Date(s.fecha);
      const diaSemana = fecha.getDay();
      if (!registrosPorDia[diaSemana]) registrosPorDia[diaSemana] = { horas: [], calidad: [] };
      registrosPorDia[diaSemana].horas.push(horas);
      if (s.calidad) registrosPorDia[diaSemana].calidad.push(s.calidad);
    }
    if (s.calidad) calidades.push(parseInt(s.calidad));
    fechas.push(new Date(s.fecha));
  });
  
  // Promedios
  const promHoras = horasSueno.length ? (horasSueno.reduce((a,b) => a+b, 0) / horasSueno.length).toFixed(1) : 0;
  const promCalidad = calidades.length ? (calidades.reduce((a,b) => a+b, 0) / calidades.length).toFixed(1) : 0;
  
  // Análisis por períodos
  const ahora = new Date();
  const hace7 = new Date(); hace7.setDate(ahora.getDate()-7);
  const hace30 = new Date(); hace30.setDate(ahora.getDate()-30);
  
  const suenoSemana = registrosSueno.filter(s => new Date(s.fecha) >= hace7);
  const suenoMes = registrosSueno.filter(s => new Date(s.fecha) >= hace30);
  
  const promHorasSemana = suenoSemana.length ? suenoSemana.reduce((sum, s) => {
    if (s.horaAcostarse && s.horaLevantarse) {
      const acostarse = new Date(`2000-01-01 ${s.horaAcostarse}`);
      const levantarse = new Date(`2000-01-01 ${s.horaLevantarse}`);
      if (levantarse < acostarse) levantarse.setDate(levantarse.getDate() + 1);
      return sum + (levantarse - acostarse) / (1000 * 60 * 60);
    }
    return sum;
  }, 0) / suenoSemana.length : 0;
  
  const promCalidadSemana = suenoSemana.length ? suenoSemana.reduce((sum, s) => sum + (s.calidad || 0), 0) / suenoSemana.length : 0;
  
  // Resumen mejorado
  sleepStatsSummary.innerHTML = `
    <div style="display:flex;gap:2rem;align-items:center;flex-wrap:wrap;justify-content:center;margin-bottom:1rem;">
      <div><b>Total de registros:</b> <span style='color:#9c27b0;font-size:1.2rem;'>${registrosSueno.length}</span></div>
      <div><b>Promedio de horas:</b> <span style='color:#673ab7;'>${promHoras}h</span></div>
      <div><b>Promedio calidad:</b> <span style='color:#9c27b0;'>${promCalidad}/10</span></div>
    </div>
    <div style="display:flex;gap:2rem;align-items:center;flex-wrap:wrap;justify-content:center;">
      <div><b>Esta semana:</b> <span style='color:#673ab7;'>${promHorasSemana.toFixed(1)}h</span></div>
      <div><b>Calidad semana:</b> <span style='color:#9c27b0;'>${promCalidadSemana.toFixed(1)}/10</span></div>
      <div><b>Último registro:</b> <span style='color:#888;'>${new Date(Math.max(...registrosSueno.map(s=>+new Date(s.fecha)))).toLocaleDateString()}</span></div>
    </div>`;
  
  // Gráfico de calidad mejorado
  const calidadesFreq = {};
  calidades.forEach(c => calidadesFreq[c] = (calidadesFreq[c] || 0) + 1);
  
  sleepStatsChart.innerHTML = `<div style='width:100%;max-width:600px;margin:1.2rem auto;'>
    <h4 style='color:#9c27b0;margin-bottom:0.7rem;'>Distribución de Calidad del Sueño</h4>
    ${Object.entries(calidadesFreq).sort((a,b) => b[1]-a[1]).map(([calidad, cantidad]) => {
      const ancho = Math.max(10, Math.min(100, cantidad*20));
      const porcentaje = ((cantidad / calidades.length) * 100).toFixed(1);
      const color = calidad >= 7 ? '#4caf50' : calidad >= 5 ? '#ff9800' : '#e57373';
      return `<div style='display:flex;align-items:center;margin-bottom:0.8rem;'>
        <span style='width:80px;'>Calidad ${calidad}/10</span>
        <div style='background:${color};height:20px;border-radius:10px;width:${ancho}px;min-width:20px;margin:0 0.7rem;'></div>
        <span style='color:${color};font-weight:600;'>${cantidad}</span>
        <span style='color:#888;margin-left:0.5rem;'>(${porcentaje}%)</span>
      </div>`;
    }).join('')}
  </div>`;
  
  // Análisis semanal
  const weeklyDiv = document.getElementById('sleep-stats-weekly');
  if (weeklyDiv) {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    weeklyDiv.innerHTML = `
      <h4 style='color:#9c27b0;margin-bottom:0.7rem;'>Análisis por Día de la Semana</h4>
      <div style='display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-bottom:1rem;'>
        ${diasSemana.map((dia, index) => {
          const datos = registrosPorDia[index];
          if (!datos || datos.horas.length === 0) {
            return `<div style='text-align:center;padding:0.5rem;background:#f5f5f5;border-radius:8px;min-width:80px;opacity:0.5;'>
              <div style='font-weight:600;color:#666;'>${dia}</div>
              <div style='color:#ccc;font-size:0.9rem;'>Sin datos</div>
            </div>`;
          }
          
          const promHoras = (datos.horas.reduce((a,b) => a+b, 0) / datos.horas.length).toFixed(1);
          const promCalidad = datos.calidad.length ? (datos.calidad.reduce((a,b) => a+b, 0) / datos.calidad.length).toFixed(1) : 'N/A';
          const colorHoras = promHoras >= 7 ? '#4caf50' : promHoras >= 6 ? '#ff9800' : '#e57373';
          const colorCalidad = promCalidad !== 'N/A' ? (promCalidad >= 7 ? '#4caf50' : promCalidad >= 5 ? '#ff9800' : '#e57373') : '#ccc';
          
          return `<div style='text-align:center;padding:0.5rem;background:#f5f5f5;border-radius:8px;min-width:80px;'>
            <div style='font-weight:600;color:#666;'>${dia}</div>
            <div style='color:${colorHoras};font-size:1rem;'>${promHoras}h</div>
            <div style='color:${colorCalidad};font-size:0.9rem;'>${promCalidad}/10</div>
          </div>`;
        }).join('')}
      </div>
    `;
  }
  
  // Recomendaciones mejoradas
  let rec = '';
  
  // Recomendaciones por horas de sueño
  if (promHoras < 6) {
    rec += `<div style='background:#f3e5f5;border-radius:1rem;padding:1.2rem 1rem;margin-top:1rem;box-shadow:0 1px 6px #9c27b033;'>
      <b>⚠️ Horas de sueño insuficientes:</b> Tu promedio (${promHoras}h) está por debajo de lo recomendado (7-9h).
      <ul style='margin:0.5rem 0 0 1.2rem;'>
        <li>Intenta acostarte 30 minutos antes cada día</li>
        <li>Establece una rutina de sueño consistente</li>
        <li>Evita pantallas 1 hora antes de dormir</li>
        <li>Considera consultar con un especialista si persiste</li>
      </ul>
    </div>`;
  } else if (promHoras > 9) {
    rec += `<div style='background:#f3e5f5;border-radius:1rem;padding:1.2rem 1rem;margin-top:1rem;box-shadow:0 1px 6px #9c27b033;'>
      <b>💤 Exceso de sueño:</b> Tu promedio (${promHoras}h) está por encima de lo normal.
      <ul style='margin:0.5rem 0 0 1.2rem;'>
        <li>Revisa si hay causas médicas subyacentes</li>
        <li>Mantén horarios regulares de sueño</li>
        <li>Evita siestas largas durante el día</li>
      </ul>
    </div>`;
  } else {
    rec += `<div style='background:#e8f5e8;border-radius:1rem;padding:1.2rem 1rem;margin-top:1rem;box-shadow:0 1px 6px #4caf5033;'>
      <b>✅ Horas de sueño adecuadas:</b> Tu promedio (${promHoras}h) está en el rango saludable.
    </div>`;
  }
  
  // Recomendaciones por calidad
  if (promCalidad < 5) {
    rec += `<div style='background:#f3e5f5;border-radius:1rem;padding:1.2rem 1rem;margin-top:1rem;box-shadow:0 1px 6px #9c27b033;'>
      <b>😴 Calidad de sueño baja:</b> Tu promedio (${promCalidad}/10) indica problemas de descanso.
      <ul style='margin:0.5rem 0 0 1.2rem;'>
        <li>Revisa factores ambientales (temperatura, ruido, luz)</li>
        <li>Practica técnicas de relajación antes de dormir</li>
        <li>Evita cafeína después de las 2 PM</li>
        <li>Considera usar una máscara de sueño o tapones</li>
      </ul>
    </div>`;
  } else if (promCalidad >= 7) {
    rec += `<div style='background:#e8f5e8;border-radius:1rem;padding:1.2rem 1rem;margin-top:1rem;box-shadow:0 1px 6px #4caf5033;'>
      <b>😴 Calidad de sueño buena:</b> Tu promedio (${promCalidad}/10) indica un descanso satisfactorio.
    </div>`;
  }
  
  // Consejos generales
  rec += `<div style='background:#f3e5f5;border-radius:1rem;padding:1.2rem 1rem;margin-top:1rem;box-shadow:0 1px 6px #9c27b033;'>
    <b>💡 Consejos para mejorar el sueño:</b>
    <ul style='margin:0.5rem 0 0 1.2rem;'>
      <li>Mantén horarios regulares de sueño</li>
      <li>Ejercítate regularmente, pero no cerca de la hora de dormir</li>
      <li>Evita comidas pesadas antes de dormir</li>
      <li>Crea un ambiente relajante en tu habitación</li>
      <li>Considera usar apps de meditación o sonidos relajantes</li>
    </ul>
    <span style='color:#9c27b0;font-size:0.98rem;'>El sueño es fundamental para tu salud física y mental.</span>
  </div>`;
  
  sleepStatsRecommendations.innerHTML = rec;
}

// Actualización de tarjetas de insights en tiempo real
function updateInsightsCards() {
  // 1. Patrón de síntomas (últimos 7 días, más frecuente)
  const notas = JSON.parse(localStorage.getItem('notas-personales') || '[]');
  const hoy = new Date();
  const hace7 = new Date(); hace7.setDate(hoy.getDate() - 7);
  const sintomas = notas.filter(n => n.category === 'symptom' && n.fecha && new Date(n.fecha) >= hace7);
  let sintomaFrecuente = '';
  let vecesSintoma = 0;
  if (sintomas.length > 0) {
    const freq = {};
    sintomas.forEach(s => { freq[s.title] = (freq[s.title] || 0) + 1; });
    const top = Object.entries(freq).sort((a,b) => b[1]-a[1])[0];
    sintomaFrecuente = top[0];
    vecesSintoma = top[1];
    document.getElementById('insight-symptom-pattern').innerHTML = `<b>Patrón de síntomas</b><br>Has reportado <b>${sintomaFrecuente}</b> ${vecesSintoma} vez${vecesSintoma===1?'':'es'} en los últimos 7 días`;
  } else {
    document.getElementById('insight-symptom-pattern').innerHTML = `<b>Patrón de síntomas</b><br>No hay síntomas registrados en los últimos 7 días`;
  }

  // 2. Medicaciones (último mes)
  const hace30 = new Date(); hace30.setDate(hoy.getDate() - 30);
  const medicamentos = notas.filter(n => n.category === 'medication' && n.fecha && new Date(n.fecha) >= hace30);
  document.getElementById('insight-medications').innerHTML = `<b>Medicaciones</b><br>${medicamentos.length} nota${medicamentos.length===1?'':'s'} relacionadas con medicamentos en el último mes`;

  // 3. Recordatorios activos (de localStorage o recordatorios extra)
  let recordatorios = [];
  try {
    recordatorios = JSON.parse(localStorage.getItem('recordatorios-extra') || '[]');
  } catch {}
  const activos = recordatorios.filter(r => r.status === 'active');
  document.getElementById('insight-reminders').innerHTML = `<b>Recordatorios activos</b><br>${activos.length} recordatorio${activos.length===1?'':'s'} programado${activos.length===1?'':'s'}`;

  // 4. Tendencia de salud (estado de ánimo)
  const moods = notas.filter(n => n.category === 'mood' && n.fecha);
  const hace7b = new Date(); hace7b.setDate(hoy.getDate() - 7);
  const moodsSemana = moods.filter(m => new Date(m.fecha) >= hace7b);
  const moodsPrevSemana = moods.filter(m => new Date(m.fecha) < hace7b && new Date(m.fecha) >= (new Date(hace7b.getTime() - 7*24*60*60*1000)));
  const promSemana = moodsSemana.length ? moodsSemana.reduce((a,b)=>a+(parseInt(b.estado)||3),0)/moodsSemana.length : 0;
  const promPrev = moodsPrevSemana.length ? moodsPrevSemana.reduce((a,b)=>a+(parseInt(b.estado)||3),0)/moodsPrevSemana.length : 0;
  let tendencia = 0;
  if (promPrev > 0) tendencia = ((promSemana-promPrev)/promPrev)*100;
  document.getElementById('insight-mood-trend').innerHTML = `<b>Tendencia de salud</b><br>${promPrev>0?`Mejora del ${tendencia.toFixed(0)}% en el estado de ánimo esta semana`:'Sin datos suficientes para tendencia'}`;

  // 5. Notas importantes
  const importantes = notas.filter(n => n.favorito || n.important);
  document.getElementById('insight-important-notes').innerHTML = `<b>Notas importantes</b><br>${importantes.length} nota${importantes.length===1?'':'s'} marcadas como importantes`;

  // 6. Próximas citas (de localStorage o manager de citas)
  let citas = [];
  try {
    citas = JSON.parse(localStorage.getItem('citas-medicas') || '[]');
  } catch {}
  const futuras = citas.filter(c => c.fecha && new Date(c.fecha) >= hoy);
  document.getElementById('insight-next-appointments').innerHTML = `<b>Próximas citas</b><br>${futuras.length} cita${futuras.length===1?'':'s'} médicas programadas`;
}

// Llamar al cargar y cada vez que cambien datos relevantes
window.addEventListener('storage', updateInsightsCards);
document.addEventListener('DOMContentLoaded', updateInsightsCards);
// Si tienes listeners de guardado de notas/recordatorios, llama también a updateInsightsCards() después de guardar.

// Inicialización
loadNotasFromStorage();
renderNotas();
updateStats(); 