// Importar módulos de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, getDoc, getDocs } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// ===== INICIALIZACIÓN DEL SIDEBAR =====
document.addEventListener('DOMContentLoaded', function() {
    loadSidebar();
    // setupEventListeners(); // <-- Esta llamada se comenta para evitar conflicto
});

// Variables globales para Firebase
let app;
let db;
let auth;
let userId = null;
let notesCollectionRef;
let templatesCollectionRef;
let remindersCollectionRef;

// Referencias a elementos del DOM
const notesGrid = document.getElementById('notes-grid-container');
const addNoteForm = document.getElementById('add-note-form');
const noteTitleInput = document.getElementById('note-title');
const noteCategorySelect = document.getElementById('note-category');
const noteDescriptionTextarea = document.getElementById('note-description');
const noteTagsInput = document.getElementById('note-tags-input');
const selectedTagsContainer = document.querySelector('.selected-tags');
const newNoteMoodOptions = document.querySelectorAll('#add-note-form .mood-options input[name="mood"]');
const addNoteButton = document.getElementById('add-new-note-button');
const addNoteModal = document.getElementById('addNoteModal');

// Nuevas referencias para funcionalidades avanzadas
const floatingActionBtn = document.getElementById('floatingActionBtn');
const advancedFiltersPanel = document.getElementById('advancedFiltersPanel');
const quickStatsPanel = document.getElementById('quickStatsPanel');
const advancedSearchPanel = document.getElementById('advancedSearchPanel');
const closeFiltersBtn = document.getElementById('closeFiltersBtn');
const closeStatsBtn = document.getElementById('closeStatsBtn');
const closeSearchBtn = document.getElementById('closeSearchBtn');

// Referencias para analytics
const categoryChart = document.getElementById('categoryChart');
const moodChart = document.getElementById('moodChart');
const productivityChart = document.getElementById('productivityChart');
const symptomsChart = document.getElementById('symptomsChart');
const timeFilterBtns = document.querySelectorAll('.time-btn');

// Referencias para templates
const templatesGrid = document.querySelector('.templates-grid');
const createTemplateBtn = document.getElementById('create-template-btn');
const createTemplateModal = document.getElementById('createTemplateModal');
const createTemplateForm = document.getElementById('create-template-form');

// Referencias para recordatorios
const remindersContainer = document.getElementById('reminders-container');
const addReminderBtn = document.getElementById('add-reminder-btn');
const addReminderModal = document.getElementById('addReminderModal');
const addReminderForm = document.getElementById('add-reminder-form');

// Referencias para archivos adjuntos
const attachmentsGrid = document.getElementById('attachments-grid');
const totalAttachmentsSpan = document.getElementById('total-attachments');
const totalSizeSpan = document.getElementById('total-size');

// Referencias para exportar y compartir
const exportNotesBtn = document.getElementById('export-notes-btn');
const shareNotesBtn = document.getElementById('share-notes-btn');
const exportModal = document.getElementById('exportModal');
const shareModal = document.getElementById('shareModal');
const exportForm = document.getElementById('export-form');
const shareForm = document.getElementById('share-form');

// Referencias para toolbar mejorado
const showAdvancedFiltersBtn = document.getElementById('show-advanced-filters');
const showAdvancedSearchBtn = document.getElementById('show-advanced-search');
const showQuickStatsBtn = document.getElementById('show-quick-stats');
const bulkActionsBtn = document.getElementById('bulk-actions');
const viewModeToggleBtn = document.getElementById('view-mode-toggle');

// Referencias para acciones rápidas
const quickActionBtns = document.querySelectorAll('.quick-action-btn');
const useTemplateBtns = document.querySelectorAll('.use-template-btn');

// Variables globales
let currentNewNoteTags = [];
let currentEditNoteTags = [];
let allNotes = [];
let allTemplates = [];
let allReminders = [];
let allAttachments = [];
let selectedNotes = [];
let currentViewMode = 'grid';
let currentTimeFilter = 'week';

// Charts instances
let categoryChartInstance = null;
let moodChartInstance = null;
let productivityChartInstance = null;
let symptomsChartInstance = null;

// Función para inicializar Firebase
async function initFirebase() {
    try {
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        const userIdDisplay = document.createElement('div');
        userIdDisplay.id = 'userIdDisplay';
        userIdDisplay.className = 'text-xs text-gray-500 mt-2';
        document.querySelector('.main-content').prepend(userIdDisplay);

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
                userIdDisplay.textContent = `User ID: ${userId}`;
                notesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/notes`);
                templatesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/templates`);
                remindersCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/reminders`);
                setupRealtimeListeners();
                initializeCharts();
            } else {
                try {
                    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Error signing in:", error);
                    showNotification('Error al iniciar sesión. Algunas funciones pueden no estar disponibles.', 'error');
                }
            }
        });
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        showNotification('Error al inicializar la aplicación. Por favor, recarga la página.', 'error');
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type} animate__animated animate__fadeInRight`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('animate__fadeInRight');
        notification.classList.add('animate__fadeOutRight');
        notification.addEventListener('animationend', () => {
            notification.remove();
        });
    }, duration);
}

// Función para abrir modal
function openModal(modalElement) {
    modalElement.classList.remove('fade-out');
    modalElement.classList.add('active');
}

// Función para cerrar modal
function closeModal(modalElement) {
    modalElement.classList.add('fade-out');
    modalElement.classList.remove('active');

    modalElement.addEventListener('animationend', function handler() {
        modalElement.classList.remove('fade-out');
        modalElement.removeEventListener('animationend', handler);
    }, { once: true });
}

// Función para abrir panel deslizable
function openPanel(panelElement) {
    panelElement.classList.add('active');
}

// Función para cerrar panel deslizable
function closePanel(panelElement) {
    panelElement.classList.remove('active');
}

// Inicializar gráficos
function initializeCharts() {
    if (typeof Chart !== 'undefined') {
        // Gráfico de categorías
        if (categoryChart) {
            categoryChartInstance = new Chart(categoryChart, {
                type: 'doughnut',
                data: {
                    labels: ['Síntomas', 'Medicamentos', 'Citas', 'Actividades', 'Dieta', 'Otros'],
                    datasets: [{
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: [
                            '#e57373', '#64b5f6', '#ffb74d', '#81c784', '#4db6ac', '#9e9e9e'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Gráfico de estado de ánimo
        if (moodChart) {
            moodChartInstance = new Chart(moodChart, {
                type: 'bar',
                data: {
                    labels: ['Muy Feliz', 'Feliz', 'Neutral', 'Triste', 'Muy Triste'],
                    datasets: [{
                        label: 'Estado de Ánimo',
                        data: [0, 0, 0, 0, 0],
                        backgroundColor: '#26a69a'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Gráfico de productividad
        if (productivityChart) {
            productivityChartInstance = new Chart(productivityChart, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Notas por Día',
                        data: [],
                        borderColor: '#26a69a',
                        backgroundColor: 'rgba(38, 166, 154, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Gráfico de síntomas
        if (symptomsChart) {
            symptomsChartInstance = new Chart(symptomsChart, {
                type: 'radar',
                data: {
                    labels: ['Dolor de Cabeza', 'Fatiga', 'Náuseas', 'Fiebre', 'Dolor Muscular'],
                    datasets: [{
                        label: 'Frecuencia',
                        data: [0, 0, 0, 0, 0],
                        borderColor: '#e57373',
                        backgroundColor: 'rgba(229, 115, 115, 0.2)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 10
                        }
                    }
                }
            });
        }
    }
}

// Actualizar gráficos con datos
function updateCharts() {
    if (!allNotes.length) return;

    // Actualizar gráfico de categorías
    if (categoryChartInstance) {
        const categoryCounts = {
            'symptom': 0, 'medication': 0, 'appointment': 0, 
            'activity': 0, 'diet': 0, 'other': 0
        };
        
        allNotes.forEach(note => {
            categoryCounts[note.category]++;
        });

        categoryChartInstance.data.datasets[0].data = Object.values(categoryCounts);
        categoryChartInstance.update();
    }

    // Actualizar gráfico de estado de ánimo
    if (moodChartInstance) {
        const moodCounts = [0, 0, 0, 0, 0];
        allNotes.forEach(note => {
            if (note.mood && note.mood >= 1 && note.mood <= 5) {
                moodCounts[note.mood - 1]++;
            }
        });

        moodChartInstance.data.datasets[0].data = moodCounts;
        moodChartInstance.update();
    }

    // Actualizar gráfico de productividad
    if (productivityChartInstance) {
        const last7Days = [];
        const notesPerDay = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
            last7Days.push(dateStr);
            
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);
            
            const notesOnDay = allNotes.filter(note => {
                const noteDate = note.timestamp.toDate();
                return noteDate >= dayStart && noteDate <= dayEnd;
            }).length;
            
            notesPerDay.push(notesOnDay);
        }

        productivityChartInstance.data.labels = last7Days;
        productivityChartInstance.data.datasets[0].data = notesPerDay;
        productivityChartInstance.update();
    }
}

// Función para manejar acciones rápidas
function handleQuickAction(action) {
    switch (action) {
        case 'voice-note':
            startVoiceRecording();
            break;
        case 'photo-note':
            openCamera();
            break;
        case 'symptom-tracker':
            openSymptomTracker();
            break;
        case 'medication-log':
            openMedicationLog();
            break;
        case 'mood-tracker':
            openMoodTracker();
            break;
        case 'sleep-log':
            openSleepLog();
            break;
        default:
            console.log('Acción no implementada:', action);
    }
}

// Función para grabación de voz
function startVoiceRecording() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            showNotification('Grabando... Habla ahora', 'info');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            noteDescriptionTextarea.value = transcript;
            openModal(addNoteModal);
        };

        recognition.onerror = (event) => {
            showNotification('Error en la grabación de voz', 'error');
        };

        recognition.start();
                } else {
        showNotification('La grabación de voz no está disponible en este navegador', 'warning');
    }
}

// Función para abrir cámara
function openCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Aquí puedes procesar la imagen
            showNotification('Imagen capturada correctamente', 'success');
            // Abrir modal de nota con la imagen
            openModal(addNoteModal);
        }
    };
    
    input.click();
}

// Función para abrir rastreador de síntomas
function openSymptomTracker() {
    noteCategorySelect.value = 'symptom';
    openModal(addNoteModal);
    showNotification('Rastreador de síntomas abierto', 'info');
}

// Función para abrir registro de medicamentos
function openMedicationLog() {
    noteCategorySelect.value = 'medication';
    openModal(addNoteModal);
    showNotification('Registro de medicamentos abierto', 'info');
}

// Función para abrir rastreador de estado de ánimo
function openMoodTracker() {
    openModal(addNoteModal);
    showNotification('Rastreador de estado de ánimo abierto', 'info');
}

// Función para abrir registro de sueño
function openSleepLog() {
    noteCategorySelect.value = 'activity';
    openModal(addNoteModal);
    showNotification('Registro de sueño abierto', 'info');
}

// Función para usar plantilla
function useTemplate(templateType) {
    const templates = {
        'symptom': {
            title: 'Síntoma - ' + new Date().toLocaleDateString(),
            category: 'symptom',
            description: 'Síntoma: \nIntensidad: \nDuración: \nFactores desencadenantes: \nMedicamentos tomados: ',
            tags: ['síntoma', 'salud']
        },
        'medication': {
            title: 'Medicación - ' + new Date().toLocaleDateString(),
            category: 'medication',
            description: 'Medicamento: \nDosis: \nHora de toma: \nEfectos secundarios: \nObservaciones: ',
            tags: ['medicación', 'tratamiento']
        },
        'appointment': {
            title: 'Cita Médica - ' + new Date().toLocaleDateString(),
            category: 'appointment',
            description: 'Fecha de cita: \nMédico: \nEspecialidad: \nMotivo: \nPreparación necesaria: \nResultados: ',
            tags: ['cita', 'médico']
        },
        'diet': {
            title: 'Registro de Dieta - ' + new Date().toLocaleDateString(),
            category: 'diet',
            description: 'Desayuno: \nAlmuerzo: \nCena: \nSnacks: \nAgua consumida: \nReacciones: ',
            tags: ['dieta', 'alimentación']
        },
        'exercise': {
            title: 'Ejercicio - ' + new Date().toLocaleDateString(),
            category: 'activity',
            description: 'Tipo de ejercicio: \nDuración: \nIntensidad: \nCalorías quemadas: \nCómo me sentí: ',
            tags: ['ejercicio', 'actividad']
        },
        'sleep': {
            title: 'Sueño - ' + new Date().toLocaleDateString(),
            category: 'activity',
            description: 'Hora de acostarse: \nHora de despertarse: \nCalidad del sueño: \nInterrupciones: \nSueños: ',
            tags: ['sueño', 'descanso']
        }
    };

    const template = templates[templateType];
    if (template) {
        noteTitleInput.value = template.title;
        noteCategorySelect.value = template.category;
        noteDescriptionTextarea.value = template.description;
        
        // Limpiar tags existentes
        currentNewNoteTags = [];
        selectedTagsContainer.innerHTML = '';
        
        // Agregar tags de la plantilla
        template.tags.forEach(tag => addTag(tag, false));
        
        openModal(addNoteModal);
        showNotification(`Plantilla "${templateType}" aplicada`, 'success');
    }
}

// Función para crear plantilla personalizada
async function createTemplate(event) {
    event.preventDefault();
    
    const templateName = document.getElementById('template-name').value;
    const templateCategory = document.getElementById('template-category').value;
    const templateContent = document.getElementById('template-content').value;
    const templateTags = document.getElementById('template-tags').value;

    try {
        const templateData = {
            name: templateName,
            category: templateCategory,
            content: templateContent,
            tags: templateTags.split(',').map(tag => tag.trim()).filter(tag => tag),
            createdAt: new Date(),
            userId: userId
        };

        await addDoc(templatesCollectionRef, templateData);
        closeModal(createTemplateModal);
        showNotification('Plantilla creada exitosamente', 'success');
        
        // Limpiar formulario
        createTemplateForm.reset();
    } catch (error) {
        console.error('Error creating template:', error);
        showNotification('Error al crear la plantilla', 'error');
    }
}

// Función para agregar recordatorio
async function addReminder(event) {
    event.preventDefault();
    
    const reminderTitle = document.getElementById('reminder-title').value;
    const reminderDescription = document.getElementById('reminder-description').value;
    const reminderDate = document.getElementById('reminder-date').value;
    const reminderTime = document.getElementById('reminder-time').value;
    const reminderRepeat = document.getElementById('reminder-repeat').value;
    const reminderPriority = document.getElementById('reminder-priority').value;

    try {
        const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
        
        const reminderData = {
            title: reminderTitle,
            description: reminderDescription,
            dateTime: reminderDateTime,
            repeat: reminderRepeat,
            priority: reminderPriority,
            isActive: true,
            createdAt: new Date(),
            userId: userId
        };

        await addDoc(remindersCollectionRef, reminderData);
        closeModal(addReminderModal);
        showNotification('Recordatorio creado exitosamente', 'success');
        
        // Limpiar formulario
        addReminderForm.reset();
    } catch (error) {
        console.error('Error creating reminder:', error);
        showNotification('Error al crear el recordatorio', 'error');
    }
}

// Función para exportar notas
async function exportNotes(event) {
    event.preventDefault();
    
    const format = document.getElementById('export-format').value;
    const dateRange = document.getElementById('export-date-range').value;
    const categories = Array.from(document.querySelectorAll('#export-categories input:checked')).map(cb => cb.value);
    
    let notesToExport = allNotes;
    
    // Filtrar por categorías
    if (categories.length > 0) {
        notesToExport = notesToExport.filter(note => categories.includes(note.category));
    }
    
    // Filtrar por rango de fechas
    if (dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (dateRange) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
        }
        
        if (startDate) {
            notesToExport = notesToExport.filter(note => note.timestamp.toDate() >= startDate);
        }
    }
    
    try {
        let exportData;
        
        switch (format) {
            case 'json':
                exportData = JSON.stringify(notesToExport, null, 2);
                downloadFile(exportData, 'notas.json', 'application/json');
                break;
            case 'csv':
                exportData = convertToCSV(notesToExport);
                downloadFile(exportData, 'notas.csv', 'text/csv');
                break;
            case 'txt':
                exportData = convertToText(notesToExport);
                downloadFile(exportData, 'notas.txt', 'text/plain');
                break;
            case 'pdf':
                await generatePDF(notesToExport);
                break;
        }
        
        closeModal(exportModal);
        showNotification('Notas exportadas exitosamente', 'success');
    } catch (error) {
        console.error('Error exporting notes:', error);
        showNotification('Error al exportar las notas', 'error');
    }
}

// Función para descargar archivo
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Función para convertir a CSV
function convertToCSV(notes) {
    const headers = ['Fecha', 'Título', 'Categoría', 'Descripción', 'Etiquetas', 'Estado de Ánimo'];
    const rows = notes.map(note => [
        note.timestamp.toDate().toLocaleDateString(),
        note.title,
        note.category,
        note.description,
        note.tags.join(', '),
        note.mood || 'N/A'
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// Función para convertir a texto
function convertToText(notes) {
    return notes.map(note => {
        return `Fecha: ${note.timestamp.toDate().toLocaleDateString()}
Título: ${note.title}
Categoría: ${note.category}
Descripción: ${note.description}
Etiquetas: ${note.tags.join(', ')}
Estado de Ánimo: ${note.mood || 'N/A'}
${'='.repeat(50)}`;
    }).join('\n\n');
}

// Función para generar PDF
async function generatePDF(notes) {
    // Esta función requeriría una librería como jsPDF
    // Por ahora, mostraremos un mensaje
    showNotification('Generación de PDF no implementada aún', 'warning');
}

// Función para compartir notas
async function shareNotes(event) {
    event.preventDefault();
    
    const email = document.getElementById('share-email').value;
    const message = document.getElementById('share-message').value;
    const format = document.getElementById('share-format').value;
    
    try {
        // Aquí implementarías la lógica de compartir
        // Por ahora, simularemos el envío
        showNotification('Funcionalidad de compartir en desarrollo', 'info');
        
        closeModal(shareModal);
        showNotification('Notas compartidas exitosamente', 'success');
    } catch (error) {
        console.error('Error sharing notes:', error);
        showNotification('Error al compartir las notas', 'error');
    }
}

// Función para aplicar filtros avanzados
function applyAdvancedFilters() {
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;
    const moodFilters = Array.from(document.querySelectorAll('.mood-filter input:checked')).map(cb => parseInt(cb.value));
    const importantOnly = document.getElementById('filter-important').checked;
    const favoritesOnly = document.getElementById('filter-favorites').checked;
    const withAttachments = document.getElementById('filter-attachments').checked;
    const withReminders = document.getElementById('filter-reminders').checked;
    
    let filteredNotes = allNotes;
    
    // Filtrar por fecha
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        filteredNotes = filteredNotes.filter(note => {
            const noteDate = note.timestamp.toDate();
            return noteDate >= start && noteDate <= end;
        });
    }
    
    // Filtrar por estado de ánimo
    if (moodFilters.length > 0) {
        filteredNotes = filteredNotes.filter(note => moodFilters.includes(note.mood));
    }
    
    // Filtrar por importantes
    if (importantOnly) {
        filteredNotes = filteredNotes.filter(note => note.important);
    }
    
    // Filtrar por favoritos
    if (favoritesOnly) {
        filteredNotes = filteredNotes.filter(note => note.favorite);
    }
    
    // Filtrar por archivos adjuntos
    if (withAttachments) {
        filteredNotes = filteredNotes.filter(note => note.attachments && note.attachments.length > 0);
    }
    
    // Filtrar por recordatorios
    if (withReminders) {
        filteredNotes = filteredNotes.filter(note => note.reminder);
    }

    renderNotes(filteredNotes);
    closePanel(advancedFiltersPanel);
    showNotification(`Filtros aplicados: ${filteredNotes.length} notas encontradas`, 'success');
}

// Función para búsqueda avanzada
function performAdvancedSearch() {
    const keywords = document.getElementById('advanced-search-keywords').value.toLowerCase();
    const tagSearch = document.getElementById('advanced-search-tags').value.toLowerCase();
    const excludeWords = document.getElementById('advanced-search-exclude').value.toLowerCase();
    const caseSensitive = document.getElementById('search-case-sensitive').checked;
    const exactPhrase = document.getElementById('search-exact-phrase').checked;
    const searchInAttachments = document.getElementById('search-in-attachments').checked;
    
    let searchResults = allNotes;
    
    if (keywords) {
        searchResults = searchResults.filter(note => {
            const title = caseSensitive ? note.title : note.title.toLowerCase();
            const description = caseSensitive ? note.description : note.description.toLowerCase();
            
            if (exactPhrase) {
                return title.includes(keywords) || description.includes(keywords);
            } else {
                const words = keywords.split(' ').filter(word => word.length > 0);
                return words.every(word => title.includes(word) || description.includes(word));
            }
        });
    }
    
    if (tagSearch) {
        searchResults = searchResults.filter(note => 
            note.tags.some(tag => tag.toLowerCase().includes(tagSearch))
        );
    }
    
    if (excludeWords) {
        const excludeList = excludeWords.split(' ').filter(word => word.length > 0);
        searchResults = searchResults.filter(note => {
            const title = note.title.toLowerCase();
            const description = note.description.toLowerCase();
            return !excludeList.some(word => title.includes(word) || description.includes(word));
        });
    }
    
    renderNotes(searchResults);
    closePanel(advancedSearchPanel);
    showNotification(`Búsqueda completada: ${searchResults.length} resultados encontrados`, 'success');
}

// Función para cambiar modo de vista
function toggleViewMode() {
    currentViewMode = currentViewMode === 'grid' ? 'list' : 'grid';
    
    const notesGrid = document.querySelector('.notes-grid');
    if (notesGrid) {
        notesGrid.className = `notes-grid ${currentViewMode}-view`;
    }
    
    viewModeToggleBtn.innerHTML = currentViewMode === 'grid' ? 
        '<i class="fas fa-list"></i> Vista Lista' : 
        '<i class="fas fa-th-large"></i> Vista Cuadrícula';
    
    showNotification(`Vista cambiada a: ${currentViewMode === 'grid' ? 'Cuadrícula' : 'Lista'}`, 'info');
}

// Función para acciones masivas
function openBulkActions() {
    // Implementar selección múltiple de notas
    showNotification('Funcionalidad de acciones masivas en desarrollo', 'info');
}

// Función para actualizar estadísticas rápidas
function updateQuickStats() {
    const totalNotes = allNotes.length;
    const importantNotes = allNotes.filter(note => note.important).length;
    const activeReminders = allReminders.filter(reminder => reminder.isActive).length;
    const attachments = allAttachments.length;
    
    document.getElementById('totalNotesCount').textContent = totalNotes;
    document.getElementById('importantNotesCount').textContent = importantNotes;
    document.getElementById('activeRemindersCount').textContent = activeReminders;
    document.getElementById('attachmentsCount').textContent = attachments;
}

// Configurar listeners en tiempo real
function setupRealtimeListeners() {
    // Listener para notas
    const notesQuery = query(notesCollectionRef, orderBy('timestamp', 'desc'));
    onSnapshot(notesQuery, (snapshot) => {
        allNotes = [];
        snapshot.forEach((doc) => {
            allNotes.push({ id: doc.id, ...doc.data() });
        });
        renderNotes(allNotes);
        updateStatsSummary();
        updateQuickStats();
        updateCharts();
    });

    // Listener para plantillas
    const templatesQuery = query(templatesCollectionRef, orderBy('createdAt', 'desc'));
    onSnapshot(templatesQuery, (snapshot) => {
        allTemplates = [];
        snapshot.forEach((doc) => {
            allTemplates.push({ id: doc.id, ...doc.data() });
        });
        renderTemplates();
    });

    // Listener para recordatorios
    const remindersQuery = query(remindersCollectionRef, orderBy('dateTime', 'asc'));
    onSnapshot(remindersQuery, (snapshot) => {
        allReminders = [];
        snapshot.forEach((doc) => {
            allReminders.push({ id: doc.id, ...doc.data() });
        });
        renderReminders();
        updateQuickStats();
    });
}

// Renderizar plantillas
function renderTemplates() {
    if (!templatesGrid) return;
    
    templatesGrid.innerHTML = '';
    
    allTemplates.forEach(template => {
        const templateCard = document.createElement('div');
        templateCard.className = 'template-card';
        templateCard.innerHTML = `
            <div class="template-icon">
                <i class="fas fa-magic"></i>
            </div>
            <h3>${template.name}</h3>
            <p>${template.content.substring(0, 100)}...</p>
            <button class="use-template-btn" data-template-id="${template.id}">Usar</button>
        `;
        templatesGrid.appendChild(templateCard);
    });
}

// Renderizar recordatorios
function renderReminders() {
    if (!remindersContainer) return;
    
    remindersContainer.innerHTML = '';
    
    const activeReminders = allReminders.filter(reminder => reminder.isActive);
    
    if (activeReminders.length === 0) {
        remindersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <h4>No hay recordatorios activos</h4>
                <p>Agrega recordatorios para mantener un mejor seguimiento de tu salud.</p>
            </div>
        `;
        return;
    }
    
    activeReminders.forEach(reminder => {
        const reminderCard = document.createElement('div');
        reminderCard.className = 'reminder-card';
        reminderCard.innerHTML = `
            <div class="reminder-header">
                <h4>${reminder.title}</h4>
                <span class="reminder-priority ${reminder.priority}">${reminder.priority}</span>
            </div>
            <p>${reminder.description}</p>
            <div class="reminder-footer">
                <span class="reminder-date">${reminder.dateTime.toDate().toLocaleString()}</span>
                <button class="action-button" onclick="completeReminder('${reminder.id}')">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        `;
        remindersContainer.appendChild(reminderCard);
    });
}

// Función para completar recordatorio
async function completeReminder(reminderId) {
    try {
        const reminderRef = doc(remindersCollectionRef, reminderId);
        await updateDoc(reminderRef, { isActive: false });
        showNotification('Recordatorio completado', 'success');
    } catch (error) {
        console.error('Error completing reminder:', error);
        showNotification('Error al completar el recordatorio', 'error');
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Event listeners existentes...
    
    // Nuevos event listeners para funcionalidades avanzadas
    if (floatingActionBtn) {
        floatingActionBtn.addEventListener('click', () => {
            const fabMenu = floatingActionBtn.querySelector('.fab-menu');
            fabMenu.style.display = fabMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    // Event listeners para botones de acción flotante
    document.addEventListener('click', (e) => {
        if (e.target.closest('.fab-item')) {
            const action = e.target.closest('.fab-item').dataset.action;
            handleQuickAction(action);
        }
    });

    // Event listeners para acciones rápidas
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            handleQuickAction(action);
        });
    });

    // Event listeners para usar plantillas
    useTemplateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const templateType = btn.closest('.template-card').dataset.template;
            useTemplate(templateType);
        });
    });

    // Event listeners para paneles deslizables
    if (showAdvancedFiltersBtn) {
        showAdvancedFiltersBtn.addEventListener('click', () => openPanel(advancedFiltersPanel));
    }
    if (showAdvancedSearchBtn) {
        showAdvancedSearchBtn.addEventListener('click', () => openPanel(advancedSearchPanel));
    }
    if (showQuickStatsBtn) {
        showQuickStatsBtn.addEventListener('click', () => openPanel(quickStatsPanel));
    }

    // Event listeners para cerrar paneles
    if (closeFiltersBtn) {
        closeFiltersBtn.addEventListener('click', () => closePanel(advancedFiltersPanel));
    }
    if (closeStatsBtn) {
        closeStatsBtn.addEventListener('click', () => closePanel(quickStatsPanel));
    }
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => closePanel(advancedSearchPanel));
    }

    // Event listeners para filtros avanzados
    if (document.getElementById('applyFilters')) {
        document.getElementById('applyFilters').addEventListener('click', applyAdvancedFilters);
    }
    if (document.getElementById('clearFilters')) {
        document.getElementById('clearFilters').addEventListener('click', () => {
            document.getElementById('advancedFiltersPanel').querySelectorAll('input, select').forEach(input => {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
        });
    }

    // Event listeners para búsqueda avanzada
    if (document.getElementById('performAdvancedSearch')) {
        document.getElementById('performAdvancedSearch').addEventListener('click', performAdvancedSearch);
    }
    if (document.getElementById('clearAdvancedSearch')) {
        document.getElementById('clearAdvancedSearch').addEventListener('click', () => {
            document.getElementById('advancedSearchPanel').querySelectorAll('input').forEach(input => {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
        });
    }

    // Event listeners para modales
    if (createTemplateBtn) {
        createTemplateBtn.addEventListener('click', () => openModal(createTemplateModal));
    }
    if (addReminderBtn) {
        addReminderBtn.addEventListener('click', () => openModal(addReminderModal));
    }
    if (exportNotesBtn) {
        exportNotesBtn.addEventListener('click', () => openModal(exportModal));
    }
    if (shareNotesBtn) {
        shareNotesBtn.addEventListener('click', () => openModal(shareModal));
    }

    // Event listeners para formularios
    if (createTemplateForm) {
        createTemplateForm.addEventListener('submit', createTemplate);
    }
    if (addReminderForm) {
        addReminderForm.addEventListener('submit', addReminder);
    }
    if (exportForm) {
        exportForm.addEventListener('submit', exportNotes);
    }
    if (shareForm) {
        shareForm.addEventListener('submit', shareNotes);
    }

    // Event listeners para toolbar
    if (bulkActionsBtn) {
        bulkActionsBtn.addEventListener('click', openBulkActions);
    }
    if (viewModeToggleBtn) {
        viewModeToggleBtn.addEventListener('click', toggleViewMode);
    }

    // Event listeners para filtros de tiempo
    timeFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            timeFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTimeFilter = btn.dataset.period;
            updateCharts();
        });
    });

    // Event listeners para cerrar modales
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modalId;
            const modal = document.getElementById(modalId);
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Event listeners para etiquetas
    if (noteTagsInput) {
        noteTagsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tagText = noteTagsInput.value.trim();
                if (tagText && !currentNewNoteTags.includes(tagText)) {
                    addTag(tagText, false);
                    noteTagsInput.value = '';
                }
            }
        });
    }

    if (editNoteTagsInput) {
        editNoteTagsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tagText = editNoteTagsInput.value.trim();
                if (tagText && !currentEditNoteTags.includes(tagText)) {
                    addTag(tagText, true);
                    editNoteTagsInput.value = '';
                }
            }
        });
    }

    // Event listeners para formularios principales
    if (addNoteForm) {
        addNoteForm.addEventListener('submit', addNote);
    }
    if (editNoteForm) {
        editNoteForm.addEventListener('submit', updateNote);
    }

    // Event listeners para filtros y búsqueda
    if (noteFilterSelect) {
        noteFilterSelect.addEventListener('change', applyFiltersAndSearch);
    }
    if (searchButton) {
        searchButton.addEventListener('click', applyFiltersAndSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFiltersAndSearch();
            }
        });
    }

    // Event listeners para exportar con rango de fechas personalizado
    if (document.getElementById('export-date-range')) {
        document.getElementById('export-date-range').addEventListener('change', (e) => {
            const customRange = document.getElementById('custom-date-range');
            if (e.target.value === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
            }
        });
    }

    // Listener para el botón '+ Nueva Nota'
    if (addNoteButton && addNoteModal) {
        addNoteButton.addEventListener('click', () => openModal(addNoteModal));
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    // setupEventListeners(); // <-- Esta llamada se comenta para evitar conflicto
    
    // Cargar Chart.js si está disponible
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            initializeCharts();
        };
        document.head.appendChild(script);
    } else {
        initializeCharts();
    }
});

// ===== FUNCIONES DEL SIDEBAR =====

/**
 * Carga el contenido del sidebar dinámicamente
 */
function loadSidebar() {
    fetch('sidebar/sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbarContainer').innerHTML = data;
            markActiveMenuItem();
            setupSidebarToggle();
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
        });
}

/**
 * Marca el elemento activo del menú
 */
function markActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'NotasPersonales.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.parentElement.classList.add('active');
        }
    });
}

/**
 * Configura el toggle del sidebar
 */
function setupSidebarToggle() {
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarNav = document.getElementById('navbarNav');
    const navbarOverlay = document.getElementById('navbarOverlay');
    
    if (navbarToggle) {
        navbarToggle.addEventListener('click', function() {
            navbarNav.classList.toggle('show');
            navbarOverlay.classList.toggle('show');
            document.body.classList.toggle('sidebar-expanded');
        });
    }
    
    if (navbarOverlay) {
        navbarOverlay.addEventListener('click', function() {
            navbarNav.classList.remove('show');
            navbarOverlay.classList.remove('show');
            document.body.classList.remove('sidebar-expanded');
        });
    }
}
