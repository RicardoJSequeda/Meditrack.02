// RecordatoriosExtra.js - Versión avanzada
// Soporta: CRUD, plantillas, analytics, filtros, exportar, acciones rápidas, UI moderna
// Requiere: Chart.js, Firebase (opcional)

document.addEventListener('DOMContentLoaded', () => {
    // --- Inicialización del Sidebar ---
    loadSidebar();
    
    // --- Variables y Selectores ---
    let reminders = JSON.parse(localStorage.getItem('reminders')) || [];

    let completedReminders = JSON.parse(localStorage.getItem('completedReminders')) || [];
    let overdueReminders = JSON.parse(localStorage.getItem('overdueReminders')) || [];
    let analyticsData = {};
    let currentView = 'grid';
    let currentFilter = 'all';
    let searchQuery = '';
    let currentStatusView = 'active'; // Nuevo: vista por estado
    let calendarMonthOffset = 0;

    // Selectores principales
    const remindersGrid = document.getElementById('reminders-grid');
    const completedContainer = document.getElementById('completed-reminders-container');
    const overdueContainer = document.getElementById('overdue-reminders-container');
    const notificationContainer = document.getElementById('notification-container');
    const addReminderModal = document.getElementById('addReminderModal');
    const editReminderModal = document.getElementById('editReminderModal');

    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const advancedFiltersPanel = document.getElementById('advancedFiltersPanel');

    // --- Utilidades ---
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification show ${type}`;
        notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
        notificationContainer.appendChild(notification);
        setTimeout(() => notification.remove(), 3500);
    }

    function openModal(modal) { 
        modal.classList.add('active'); 
        
        // Si es el modal de agregar recordatorio, inicializar características mejoradas
        if (modal.id === 'addReminderModal') {
            setTimeout(() => {
                initializeEnhancedFeatures();
            }, 100);
        }
        
        // Establecer fecha mínima como hoy
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = modal.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            if (!input.value) {
                input.min = today;
                input.value = today;
            }
        });
    }
    
    function closeModal(modal) { 
        modal.classList.remove('active'); 
        // Limpiar formulario al cerrar
        if (modal === addReminderModal) {
            clearAddReminderForm();
            // Reinicializar el formulario para el próximo uso
            setTimeout(() => {
                initializeEnhancedFeatures();
            }, 100);
        }
    }
    
    document.querySelectorAll('.close-button').forEach(btn => {
        btn.onclick = () => closeModal(document.getElementById(btn.dataset.modalId));
    });

    // --- Persistencia de datos ---
    function saveReminders() {
        localStorage.setItem('reminders', JSON.stringify(reminders));
        updateStats();
    }

    function updateInsights() {
        // Próximo recordatorio (el más cercano en el futuro y activo)
        const now = new Date();
        const upcoming = reminders
            .filter(r => r.status === 'active' && new Date(r.date + 'T' + r.time) > now)
            .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))[0];
        const nextReminderEl = document.getElementById('insight-next-reminder');
        const nextCard = nextReminderEl.closest('.insight-card');
        nextReminderEl.textContent = upcoming
            ? `${upcoming.title} (${formatDate(upcoming.date)} ${upcoming.time})`
            : 'Sin próximos recordatorios';
        nextCard.classList.remove('insight-green', 'insight-red', 'insight-gray', 'insight-pulse');
        if (upcoming) {
            nextCard.classList.add('insight-green', 'insight-pulse');
        } else {
            nextCard.classList.add('insight-gray', 'insight-pulse');
        }

        // Esta semana
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const weekCount = reminders.filter(r => {
            const d = new Date(r.date);
            return d >= startOfWeek && d <= endOfWeek;
        }).length;
        const weekEl = document.getElementById('insight-this-week');
        const weekCard = weekEl.closest('.insight-card');
        weekEl.textContent = `${weekCount} recordatorios programados`;
        weekCard.classList.remove('insight-green', 'insight-gray', 'insight-pulse');
        if (weekCount > 0) {
            weekCard.classList.add('insight-green', 'insight-pulse');
        } else {
            weekCard.classList.add('insight-gray', 'insight-pulse');
        }

        // Adherencia (% completados sobre total)
        const total = reminders.length;
        const completed = reminders.filter(r => r.status === 'completed').length;
        const adherence = total > 0 ? Math.round((completed / total) * 100) : 0;
        const adherenceEl = document.getElementById('insight-adherence');
        const adherenceCard = adherenceEl.closest('.insight-card');
        adherenceEl.textContent = `${adherence}% de recordatorios completados`;
        adherenceCard.classList.remove('insight-green', 'insight-yellow', 'insight-red', 'insight-gray', 'insight-pulse');
        if (adherence >= 80) {
            adherenceCard.classList.add('insight-green', 'insight-pulse');
        } else if (adherence >= 50) {
            adherenceCard.classList.add('insight-yellow', 'insight-pulse');
        } else if (adherence > 0) {
            adherenceCard.classList.add('insight-red', 'insight-pulse');
        } else {
            adherenceCard.classList.add('insight-gray', 'insight-pulse');
        }

        // Pendientes (vencidos)
        const overdue = reminders.filter(r => r.status === 'overdue').length;
        const overdueEl = document.getElementById('insight-overdue');
        const overdueCard = overdueEl.closest('.insight-card');
        overdueEl.textContent = `${overdue} recordatorios vencidos`;
        overdueCard.classList.remove('insight-green', 'insight-red', 'insight-gray', 'insight-pulse');
        if (overdue > 0) {
            overdueCard.classList.add('insight-red', 'insight-pulse');
        } else {
            overdueCard.classList.add('insight-green', 'insight-pulse');
        }
        // Quitar la animación después de un tiempo para que pueda repetirse
        setTimeout(() => {
            [nextCard, weekCard, adherenceCard, overdueCard].forEach(card => card.classList.remove('insight-pulse'));
        }, 800);
    }

    function updateStats() {
        const totalReminders = reminders.length;
        const activeReminders = reminders.filter(r => r.status === 'active').length;
        const completedCount = reminders.filter(r => r.status === 'completed').length;
        
        document.getElementById('total-reminders-stat').innerHTML = `${totalReminders} <small>Recordatorios totales</small>`;
        document.getElementById('active-reminders-stat').innerHTML = `${activeReminders} <small>Activos hoy</small>`;
        document.getElementById('completed-reminders-stat').innerHTML = `${completedCount} <small>Completados</small>`;
        updateInsights();
    }

    // --- CRUD de Recordatorios ---
    function renderReminders() {
        remindersGrid.innerHTML = '';
        let filtered = reminders.filter(r => {
            // Filtro por estado
            if (currentStatusView === 'active') return r.status === 'active';
            if (currentStatusView === 'completed') return r.status === 'completed';
            if (currentStatusView === 'overdue') return r.status === 'overdue';
            // Filtros adicionales existentes
            if (currentFilter === 'all') return true;
            if (currentFilter === 'today') return isToday(r.date);
            if (currentFilter === 'week') return isThisWeek(r.date);
            if (currentFilter === 'month') return isThisMonth(r.date);
            if (currentFilter === 'medication') return r.category === 'medication';
            if (currentFilter === 'appointment') return r.category === 'appointment';
            if (currentFilter === 'measurement') return r.category === 'measurement';
            if (currentFilter === 'exercise') return r.category === 'exercise';
            if (currentFilter === 'water') return r.category === 'water';
            if (currentFilter === 'custom') return r.category === 'custom';
            return true;
        });
        
        if (searchQuery) {
            filtered = filtered.filter(r => 
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                r.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        if (filtered.length === 0) {
            remindersGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <h3>No hay recordatorios</h3>
                    <p>${searchQuery ? 'No se encontraron recordatorios con esa búsqueda.' : 'Crea tu primer recordatorio para comenzar.'}</p>
                    <button class="primary-button" onclick="openModal(addReminderModal)">
                        <i class="fas fa-plus"></i> Crear Recordatorio
                    </button>
                </div>
            `;
            return;
        }
        
        if (currentView === 'grid') {
            remindersGrid.className = 'reminders-grid';
        filtered.forEach(reminder => {
            const card = document.createElement('div');
            card.className = 'reminder-card';
            if (reminder.important) card.classList.add('urgent');
            if (reminder.status === 'completed') card.classList.add('completed');
            if (reminder.status === 'overdue') card.classList.add('overdue');
                
                const statusText = getStatusText(reminder.status);
                const priorityText = getPriorityText(reminder.priority);
                const dateFormatted = formatDate(reminder.date);
                
            card.innerHTML = `
                    <div class="reminder-header">
                        <div class="reminder-icon">
                <i class="${getIcon(reminder.category)}"></i>
                        </div>
                        <div class="reminder-meta">
                            <span class="badge ${reminder.status}">${statusText}</span>
                            <span class="badge priority-${reminder.priority}">${priorityText}</span>
                        </div>
                    </div>
                    <div class="reminder-content">
                        <h3 class="reminder-title">${reminder.title}</h3>
                        <p class="reminder-description">${reminder.description || 'Sin descripción'}</p>
                        <div class="reminder-details">
                            <div class="reminder-detail-item">
                                <i class="fas fa-calendar"></i>
                                <span>${dateFormatted}</span>
                            </div>
                            <div class="reminder-detail-item">
                                <i class="fas fa-clock"></i>
                                <span>${reminder.time}</span>
                            </div>
                            ${reminder.repeat !== 'none' ? `
                                <div class="reminder-detail-item">
                                    <i class="fas fa-redo"></i>
                                    <span>${getRepeatText(reminder.repeat)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                <div class="reminder-actions">
                        <button class="primary-button edit-reminder-btn" data-id="${reminder.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="secondary-button delete-reminder-btn" data-id="${reminder.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                        ${reminder.status === 'active' ? `
                            <button class="success-button complete-reminder-btn" data-id="${reminder.id}">
                                <i class="fas fa-check"></i> Completar
                            </button>
                        ` : ''}
                        <div class="status-dropdown-container">
                            <select class="status-dropdown" data-id="${reminder.id}">
                                <option value="active" ${reminder.status === 'active' ? 'selected' : ''}>Activo</option>
                                <option value="completed" ${reminder.status === 'completed' ? 'selected' : ''}>Completado</option>
                                <option value="overdue" ${reminder.status === 'overdue' ? 'selected' : ''}>Vencido</option>
                            </select>
                        </div>
                </div>
            `;
            remindersGrid.appendChild(card);
        });
        } else if (currentView === 'list') {
            remindersGrid.className = 'reminders-list';
            filtered.forEach(reminder => {
                const row = document.createElement('div');
                row.className = 'reminder-list-row';
                if (reminder.important) row.classList.add('urgent');
                if (reminder.status === 'completed') row.classList.add('completed');
                if (reminder.status === 'overdue') row.classList.add('overdue');
                row.innerHTML = `
                    <div class="reminder-list-main">
                        <span class="reminder-list-title">${reminder.title}</span>
                        <span class="reminder-list-date"><i class="fas fa-calendar"></i> ${formatDate(reminder.date)} ${reminder.time}</span>
                        <span class="reminder-list-status badge ${reminder.status}">${getStatusText(reminder.status)}</span>
                        <span class="reminder-list-priority badge priority-${reminder.priority}">${getPriorityText(reminder.priority)}</span>
                    </div>
                    <div class="reminder-list-actions">
                        <button class="primary-button edit-reminder-btn" data-id="${reminder.id}"><i class="fas fa-edit"></i></button>
                        <button class="secondary-button delete-reminder-btn" data-id="${reminder.id}"><i class="fas fa-trash"></i></button>
                        ${reminder.status === 'active' ? `<button class="success-button complete-reminder-btn" data-id="${reminder.id}"><i class="fas fa-check"></i></button>` : ''}
                        <select class="status-dropdown" data-id="${reminder.id}">
                            <option value="active" ${reminder.status === 'active' ? 'selected' : ''}>Activo</option>
                            <option value="completed" ${reminder.status === 'completed' ? 'selected' : ''}>Completado</option>
                            <option value="overdue" ${reminder.status === 'overdue' ? 'selected' : ''}>Vencido</option>
                        </select>
                    </div>
                `;
                remindersGrid.appendChild(row);
            });
        } else if (currentView === 'calendar') {
            remindersGrid.className = 'reminders-calendar';
            remindersGrid.innerHTML = renderCalendar(filtered);
            attachCalendarNavListeners();
        }
        attachReminderListeners();
        attachStatusDropdownListeners();
        updateInsights();
    }

    function attachReminderListeners() {
        document.querySelectorAll('.edit-reminder-btn').forEach(btn => btn.onclick = openEditModal);
        document.querySelectorAll('.delete-reminder-btn').forEach(btn => btn.onclick = openDeleteModal);
        document.querySelectorAll('.complete-reminder-btn').forEach(btn => btn.onclick = completeReminder);
    }

    function attachStatusDropdownListeners() {
        document.querySelectorAll('.status-dropdown').forEach(select => {
            select.onchange = function(e) {
                const id = parseInt(e.target.dataset.id);
                const newStatus = e.target.value;
                const reminder = reminders.find(r => r.id === id);
                if (reminder && ['active','completed','overdue'].includes(newStatus)) {
                    reminder.status = newStatus;
                    if (newStatus === 'completed') reminder.completedAt = new Date().toISOString();
                    saveReminders();
                    renderReminders();
                    setActiveStatusButton('show-' + newStatus);
                    currentStatusView = newStatus;
                    updateInsights();
                }
            };
        });
    }

    function openEditModal(e) {
        const id = parseInt(e.target.closest('.edit-reminder-btn').dataset.id);
        const reminder = reminders.find(r => r.id === id);
        if (!reminder) return;
        
        document.getElementById('edit-reminder-id').value = reminder.id;
        document.getElementById('edit-reminder-title').value = reminder.title;
        document.getElementById('edit-reminder-description').value = reminder.description;
        document.getElementById('edit-reminder-date').value = reminder.date;
        document.getElementById('edit-reminder-time').value = reminder.time;
        document.getElementById('edit-reminder-category').value = reminder.category;
        document.getElementById('edit-reminder-priority').value = reminder.priority;
        document.getElementById('edit-reminder-repeat').value = reminder.repeat;
        document.getElementById('edit-reminder-status').value = reminder.status;
        openModal(editReminderModal);
    }

    function openDeleteModal(e) {
        const id = parseInt(e.target.closest('.delete-reminder-btn').dataset.id);
        document.getElementById('delete-reminder-id').value = id;
        openModal(deleteConfirmModal);
    }

    function completeReminder(e) {
        const id = parseInt(e.target.closest('.complete-reminder-btn').dataset.id);
        const reminder = reminders.find(r => r.id === id);
        if (reminder) {
            reminder.status = 'completed';
            reminder.completedAt = new Date().toISOString();
            saveReminders();
            renderReminders();
            showNotification('Recordatorio marcado como completado', 'success');
            setActiveStatusButton('show-completed');
            currentStatusView = 'completed';
            updateInsights();
        }
    }

    // --- Acciones de Modales ---
    document.getElementById('add-new-reminder-button').onclick = () => openModal(addReminderModal);
    document.getElementById('save-edited-reminder-btn')?.addEventListener('click', saveEditedReminder);
    document.getElementById('confirm-delete')?.addEventListener('click', confirmDeleteReminder);

    // --- Limpiar formulario de nuevo recordatorio ---
    function clearAddReminderForm() {
        const form = document.getElementById('add-reminder-form');
        form.reset();
        
        // Establecer valores por defecto
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('reminder-date').value = today;
        document.getElementById('reminder-time').value = '09:00';
        document.getElementById('reminder-category').value = 'custom';
        document.getElementById('reminder-priority').value = 'medium';
        document.getElementById('reminder-repeat').value = 'none';
        document.getElementById('reminder-important').checked = false;
    }

    // --- Guardar nuevo recordatorio ---
    document.getElementById('add-reminder-form').onsubmit = function(e) {
        e.preventDefault();
        
        // Validación de campos
        const title = document.getElementById('reminder-title').value.trim();
        const description = document.getElementById('reminder-description').value.trim();
        const date = document.getElementById('reminder-date').value;
        const time = document.getElementById('reminder-time').value;
        const category = document.getElementById('reminder-category').value;
        const priority = document.getElementById('reminder-priority').value;
        const repeat = document.getElementById('reminder-repeat').value;
        const important = document.getElementById('reminder-important').checked;

        // Validaciones
        if (!title) {
            showNotification('El título es obligatorio', 'warning');
            document.getElementById('reminder-title').focus();
            return;
        }
        
        if (!date) {
            showNotification('La fecha es obligatoria', 'warning');
            document.getElementById('reminder-date').focus();
            return;
        }
        
        if (!time) {
            showNotification('La hora es obligatoria', 'warning');
            document.getElementById('reminder-time').focus();
            return;
        }

        // Validar que la fecha no sea anterior a hoy
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showNotification('No puedes crear recordatorios para fechas pasadas', 'warning');
            document.getElementById('reminder-date').focus();
            return;
        }

        // Crear el recordatorio
        const id = Date.now();
        const newReminder = {
            id,
            title,
            description,
            date,
            time,
            category,
            priority,
            repeat,
            important,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        reminders.push(newReminder);
        saveReminders();
        renderReminders();
        
        closeModal(addReminderModal);
        showNotification('Recordatorio creado exitosamente', 'success');
        updateInsights();
    };

    // --- Guardar edición ---
    function saveEditedReminder(e) {
        e.preventDefault();
        
        const id = parseInt(document.getElementById('edit-reminder-id').value);
        const title = document.getElementById('edit-reminder-title').value.trim();
        const description = document.getElementById('edit-reminder-description').value.trim();
        const date = document.getElementById('edit-reminder-date').value;
        const time = document.getElementById('edit-reminder-time').value;
        const category = document.getElementById('edit-reminder-category').value;
        const priority = document.getElementById('edit-reminder-priority').value;
        const repeat = document.getElementById('edit-reminder-repeat').value;
        const status = document.getElementById('edit-reminder-status').value;

        // Validaciones
        if (!title || !date || !time) {
            showNotification('Completa todos los campos obligatorios', 'warning');
            return;
        }

        reminders = reminders.map(r => 
            r.id === id ? { 
                ...r, 
                title, 
                description, 
                date, 
                time, 
                category, 
                priority, 
                repeat, 
                status,
                updatedAt: new Date().toISOString()
            } : r
        );
        
        saveReminders();
        renderReminders();
        closeModal(editReminderModal);
        showNotification('Recordatorio actualizado exitosamente', 'success');
        updateInsights();
    }

    // --- Confirmar eliminación ---
    function confirmDeleteReminder() {
        const id = parseInt(document.getElementById('delete-reminder-id').value);
        reminders = reminders.filter(r => r.id !== id);
        saveReminders();
        renderReminders();
        closeModal(deleteConfirmModal);
        showNotification('Recordatorio eliminado exitosamente', 'success');
    }

    // --- Filtros y búsqueda ---
    document.getElementById('reminder-filter').onchange = function(e) {
        currentFilter = e.target.value;
        renderReminders();
    };

    // --- Utilidades de fecha ---
    function isToday(dateStr) {
        const today = new Date();
        const d = new Date(dateStr);
        return d.toDateString() === today.toDateString();
    }
    
    function isThisWeek(dateStr) {
        const now = new Date();
        const d = new Date(dateStr);
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(weekStart); 
        weekEnd.setDate(weekStart.getDate() + 6);
        return d >= weekStart && d <= weekEnd;
    }
    
    function isThisMonth(dateStr) {
        const now = new Date();
        const d = new Date(dateStr);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    function getIcon(category) {
        switch(category) {
            case 'medication': return 'fas fa-pills';
            case 'appointment': return 'fas fa-calendar-check';
            case 'measurement': return 'fas fa-thermometer-half';
            case 'exercise': return 'fas fa-dumbbell';
            case 'water': return 'fas fa-tint';
            default: return 'fas fa-bell';
        }
    }
    
    function getStatusText(status) {
        switch(status) {
            case 'active': return 'Activo';
            case 'completed': return 'Completado';
            case 'overdue': return 'Vencido';
            case 'snoozed': return 'Pospuesto';
            case 'cancelled': return 'Cancelado';
            default: return 'Desconocido';
        }
    }
    
    function getPriorityText(priority) {
        switch(priority) {
            case 'low': return 'Baja';
            case 'medium': return 'Media';
            case 'high': return 'Alta';
            case 'urgent': return 'Urgente';
            default: return 'Media';
        }
    }
    
    function getRepeatText(repeat) {
        switch(repeat) {
            case 'daily': return 'Diario';
            case 'weekly': return 'Semanal';
            case 'monthly': return 'Mensual';
            case 'custom': return 'Personalizado';
            default: return 'No repetir';
        }
    }

    // --- Inicialización ---
    renderReminders();
    updateStats();
    
    // Cargar datos de ejemplo si no hay recordatorios
    if (reminders.length === 0) {
        const exampleReminders = [
            {
                id: Date.now() - 1000,
                title: 'Tomar Vitamina D',
                description: 'Recordatorio para tomar la vitamina D diaria',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                category: 'medication',
                priority: 'medium',
                repeat: 'daily',
                important: true,
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() - 2000,
                title: 'Cita con Dr. García',
                description: 'Revisión cardiológica anual',
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                time: '14:30',
                category: 'appointment',
                priority: 'high',
                repeat: 'none',
                important: true,
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];
        reminders = exampleReminders;
        saveReminders();
        renderReminders();
    }

    // --- Funcionalidad del Formulario por Pasos ---
    function initializeFormSteps() {
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const submitBtn = document.getElementById('submit-form');
        const progressSteps = document.querySelectorAll('.progress-step');
        const formSteps = document.querySelectorAll('.form-step');
        
        if (!nextBtn || !prevBtn || !submitBtn) {
            console.log('Botones de navegación no encontrados');
            return;
        }
        
        let currentStep = 1;
        const totalSteps = 3;

        function updateStep(step) {
            console.log('Actualizando al paso:', step);
            
            // Ocultar todos los pasos
            formSteps.forEach(s => s.classList.remove('active'));
            progressSteps.forEach(s => {
                s.classList.remove('active', 'completed');
            });

            // Mostrar paso actual
            const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
            if (currentStepElement) {
                currentStepElement.classList.add('active');
            }
            
            // Actualizar progreso
            for (let i = 1; i <= totalSteps; i++) {
                const progressStep = document.querySelector(`.progress-step[data-step="${i}"]`);
                if (progressStep) {
                    if (i < step) {
                        progressStep.classList.add('completed');
                    } else if (i === step) {
                        progressStep.classList.add('active');
                    }
                }
            }

            // Actualizar botones
            prevBtn.style.display = step === 1 ? 'none' : 'flex';
            nextBtn.style.display = step === totalSteps ? 'none' : 'flex';
            submitBtn.style.display = step === totalSteps ? 'flex' : 'none';
        }

        // Configurar botón siguiente
        nextBtn.onclick = function() {
            console.log('Botón siguiente clickeado');
            if (validateCurrentStep()) {
                currentStep = Math.min(currentStep + 1, totalSteps);
                updateStep(currentStep);
            }
        };

        // Configurar botón anterior
        prevBtn.onclick = function() {
            console.log('Botón anterior clickeado');
            currentStep = Math.max(currentStep - 1, 1);
            updateStep(currentStep);
        };

        function validateCurrentStep() {
            const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
            if (!currentStepElement) {
                console.log('No se encontró el elemento del paso actual');
                return false;
            }
            
            const requiredInputs = currentStepElement.querySelectorAll('[required]');
            let isValid = true;

            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                    showInputError(input, 'Este campo es requerido');
                } else {
                    input.classList.remove('error');
                    clearInputError(input);
                }
            });

            console.log('Validación del paso', currentStep, ':', isValid);
            return isValid;
        }

        function showInputError(input, message) {
            let errorDiv = input.parentNode.querySelector('.input-error');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'input-error';
                input.parentNode.appendChild(errorDiv);
            }
            errorDiv.textContent = message;
        }

        function clearInputError(input) {
            const errorDiv = input.parentNode.querySelector('.input-error');
            if (errorDiv) {
                errorDiv.remove();
            }
        }

        // Inicializar primer paso
        updateStep(1);
        console.log('FormSteps inicializado correctamente');
    }

    // --- Selectores Visuales ---
    function initializeVisualSelectors() {
        // Selector de categorías
        document.querySelectorAll('.category-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.category-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                document.getElementById('reminder-category').value = option.dataset.value;
            });
        });

        // Selector de repetición
        document.querySelectorAll('.repeat-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.repeat-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                document.getElementById('reminder-repeat').value = option.dataset.value;
            });
        });

        // Selector de prioridad
        document.querySelectorAll('.priority-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                document.getElementById('reminder-priority').value = option.dataset.value;
            });
        });
    }

    // --- Sistema de Etiquetas ---
    function initializeTagsSystem() {
        const tagsInput = document.getElementById('reminder-tags');
        const selectedTagsContainer = document.querySelector('.selected-tags');
        let selectedTags = [];

        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = tagsInput.value.trim();
                if (tag && !selectedTags.includes(tag)) {
                    selectedTags.push(tag);
                    renderTags();
                    tagsInput.value = '';
                }
            }
        });

        function renderTags() {
            selectedTagsContainer.innerHTML = selectedTags.map(tag => `
                <span class="tag">
                    ${tag}
                    <i class="fas fa-times remove-tag" data-tag="${tag}"></i>
                </span>
            `).join('');

            // Agregar listeners para eliminar etiquetas
            document.querySelectorAll('.remove-tag').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tagToRemove = e.target.dataset.tag;
                    selectedTags = selectedTags.filter(tag => tag !== tagToRemove);
                    renderTags();
                });
            });
        }

        // Limpiar etiquetas al cerrar modal
        document.querySelector('[data-modal-id="addReminderModal"]').addEventListener('click', () => {
            selectedTags = [];
            renderTags();
        });
    }

    // --- Mejoras en el Formulario ---
    function enhanceFormValidation() {
        const titleInput = document.getElementById('reminder-title');
        const descriptionInput = document.getElementById('reminder-description');

        // Validación en tiempo real para el título
        titleInput.addEventListener('input', () => {
            const value = titleInput.value.trim();
            if (value.length > 100) {
                titleInput.value = value.substring(0, 100);
            }
        });

        // Validación en tiempo real para la descripción
        descriptionInput.addEventListener('input', () => {
            const value = descriptionInput.value.trim();
            if (value.length > 200) {
                descriptionInput.value = value.substring(0, 200);
            }
        });

        // Establecer fecha mínima como hoy
        const dateInput = document.getElementById('reminder-date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        if (!dateInput.value) {
            dateInput.value = today;
        }
    }

    // --- Inicialización de Funcionalidades Mejoradas ---
    function initializeEnhancedFeatures() {
        // Verificar que los elementos existan antes de inicializar
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const submitBtn = document.getElementById('submit-form');
        
        if (nextBtn && prevBtn && submitBtn) {
            initializeFormSteps();
            initializeVisualSelectors();
            initializeTagsSystem();
            enhanceFormValidation();
        }
    }

    // --- Mejoras en la función clearAddReminderForm ---
    function clearAddReminderForm() {
        const form = document.getElementById('add-reminder-form');
        form.reset();
        
        // Resetear selectores visuales
        document.querySelectorAll('.category-option, .repeat-option, .priority-option').forEach(opt => {
            opt.classList.remove('active');
        });
        
        // Establecer valores por defecto
        const customCategory = document.querySelector('.category-option[data-value="custom"]');
        const noneRepeat = document.querySelector('.repeat-option[data-value="none"]');
        const mediumPriority = document.querySelector('.priority-option[data-value="medium"]');
        
        if (customCategory) customCategory.classList.add('active');
        if (noneRepeat) noneRepeat.classList.add('active');
        if (mediumPriority) mediumPriority.classList.add('active');
        
        // Limpiar etiquetas
        const selectedTags = document.querySelector('.selected-tags');
        if (selectedTags) selectedTags.innerHTML = '';
        
        // Resetear progreso del formulario
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index === 0) step.classList.add('active');
        });
        
        // Mostrar primer paso
        document.querySelectorAll('.form-step').forEach((step, index) => {
            step.classList.remove('active');
            if (index === 0) step.classList.add('active');
        });
        
        // Mostrar botón siguiente, ocultar otros
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const submitBtn = document.getElementById('submit-form');
        
        if (nextBtn) nextBtn.style.display = 'flex';
        if (prevBtn) prevBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'none';
        
        // Establecer fecha de hoy
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('reminder-date');
        if (dateInput) dateInput.value = today;
        
        // Limpiar errores
        document.querySelectorAll('.input-error').forEach(error => error.remove());
        document.querySelectorAll('.error').forEach(input => input.classList.remove('error'));
    }

    // Botones de filtro por estado
    document.getElementById('show-active').onclick = function() {
        currentStatusView = 'active';
        renderReminders();
        setActiveStatusButton('show-active');
    };
    document.getElementById('show-completed').onclick = function() {
        currentStatusView = 'completed';
        renderReminders();
        setActiveStatusButton('show-completed');
    };
    document.getElementById('show-overdue').onclick = function() {
        currentStatusView = 'overdue';
        renderReminders();
        setActiveStatusButton('show-overdue');
    };
    function setActiveStatusButton(id) {
        document.getElementById('show-active').classList.remove('active');
        document.getElementById('show-completed').classList.remove('active');
        document.getElementById('show-overdue').classList.remove('active');
        document.getElementById(id).classList.add('active');
    }

    // Botones de vista
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderReminders();
        };
    });

    function renderCalendar(reminders) {
        // Renderiza un calendario con navegación de meses
        const now = new Date();
        const displayDate = new Date(now.getFullYear(), now.getMonth() + calendarMonthOffset, 1);
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        let html = `<div class='calendar-nav'><button id='calendar-prev'>&lt;</button><span class='calendar-title'>${displayDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</span><button id='calendar-next'>&gt;</button></div>`;
        html += `<div class='calendar-grid'>`;
        html += `<div class='calendar-header'>
            <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
        </div>`;
        for (let i = 0; i < firstDay.getDay(); i++) html += `<div class='calendar-cell empty'></div>`;
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const dayReminders = reminders.filter(r => r.date === dateStr);
            html += `<div class='calendar-cell'><div class='calendar-date'>${d}</div>`;
            dayReminders.forEach(r => {
                html += `<div class='calendar-reminder badge ${r.status}'>${r.title}</div>`;
            });
            html += `</div>`;
        }
        html += `</div>`;
        return html;
    }

    function attachCalendarNavListeners() {
        const prev = document.getElementById('calendar-prev');
        const next = document.getElementById('calendar-next');
        if (prev) prev.onclick = () => { calendarMonthOffset--; renderReminders(); };
        if (next) next.onclick = () => { calendarMonthOffset++; renderReminders(); };
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
    const currentPage = window.location.pathname.split('/').pop() || 'RecordatoriosExtra.html';
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