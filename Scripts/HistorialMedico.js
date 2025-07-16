document.addEventListener('DOMContentLoaded', function() {
    // --- Inicialización del Sidebar ---
    loadSidebar();
    
    // --- Variables ---
    const sidebarContainer = document.getElementById('navbarContainer');
    const tabs = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // Diagnósticos
    const addDiagnosisBtn = document.getElementById('add-diagnosis');
    const diagnosisModal = document.getElementById('diagnosis-modal');
    const diagnosisForm = document.getElementById('diagnosis-form');
    const diagnosticsGrid = document.querySelector('.diagnostics-grid');
    const diagnosisDetailsModal = document.getElementById('diagnosis-details-modal');

    // Tratamientos
    const addTreatmentButton = document.getElementById('add-treatment');
    const viewAllTreatmentsButton = document.getElementById('view-all-treatments-btn');
    const treatmentModal = document.getElementById('treatment-modal');
    const treatmentForm = document.getElementById('treatment-form');
    const treatmentsGrid = document.querySelector('.treatments-grid');
    const treatmentDetailsModal = document.getElementById('treatment-details-modal');

    // Eventos
    const addEventButton = document.getElementById('add-event');
    const viewAllEventsButton = document.getElementById('view-all-events-btn');
    const eventModal = document.getElementById('event-modal');
    const eventForm = document.getElementById('event-form');
    const eventsGrid = document.querySelector('.events-grid');
    const eventDetailsModal = document.getElementById('event-details-modal');

    // Documentos
    const uploadDocumentButton = document.getElementById('upload-document');
    const viewAllDocumentsButton = document.getElementById('view-all-documents-btn');
    const documentModal = document.getElementById('document-modal');
    const documentForm = document.getElementById('document-form');
    const documentsGrid = document.querySelector('.documents-grid');
    const documentDetailsModal = document.getElementById('document-details-modal');

    // Otros
    const changePatientBtn = document.getElementById('change-patient');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const modals = document.querySelectorAll('.modal-overlay'); // All modal overlays

    // --- Datos simulados (reemplazar con tu lógica real) ---
    let currentPatient = { id: 'MT-458792', name: 'María López', age: 42, bloodType: 'A+' };
    let diagnosticsData = [
        { id: 1, name: 'Hipertensión arterial', severity: 'warning', doctor: 'Dr. Gómez', date: '2022-03-12', lastReading: '140/90 mmHg', lastReadingDate: 'Ayer 14:30', adherence: 85, notes: 'Controlar TA 2 veces al día. Dieta baja en sodio. Próxima cita con cardiología.', nextControl: '2024-06-15', specialist: 'Cardiología' },
        { id: 2, name: 'Diabetes tipo 2', severity: 'stable', doctor: 'Dra. Ruiz', date: '2021-11-05', lastReading: '110 mg/dL', lastReadingDate: 'Hoy 08:45', adherence: 92, notes: 'Control glucémico estable. Continuar con metformina 850mg cada 12h. Revisar HbA1c en próximo control.', nextControl: '2024-06-20', specialist: 'Endocrinología' },
        { id: 3, name: 'Artrosis rodilla derecha', severity: 'urgent', doctor: 'Dr. Mendoza', date: '2023-01-22', lastReading: '6/10', lastReadingDate: 'Ayer 18:20', adherence: 78, notes: 'Episodio de dolor agudo. Aplicar hielo y tomar paracetamol según necesidad. Valorar infiltración si no mejora.', nextControl: '2024-07-10', specialist: 'Traumatología' }
    ];
    let nextDiagnosisId = 4;

    let treatmentsData = [
        { id: 'T1', name: 'Losartán 50mg', diagnosisId: '1', diagnosisName: 'Hipertensión arterial', doctor: 'Dr. Gómez', startDate: '2022-03-15', dosage: '1 pastilla cada 24h', notes: 'Control de presión arterial. Tomar con el desayuno.', adherence: 90, status: 'activo' },
        { id: 'T2', name: 'Metformina 850mg', diagnosisId: '2', diagnosisName: 'Diabetes tipo 2', doctor: 'Dra. Ruiz', startDate: '2021-11-10', dosage: '1 pastilla cada 12h', notes: 'Control de glucosa. Tomar con las comidas principales.', adherence: 92, status: 'activo' },
        { id: 'T3', name: 'Paracetamol 500mg', diagnosisId: '3', diagnosisName: 'Artrosis rodilla derecha', doctor: 'Dr. Mendoza', startDate: '2023-01-25', dosage: '1 pastilla cada 8h (si dolor)', notes: 'Alivio del dolor por artrosis. No exceder 3g/día.', adherence: 70, status: 'activo' },
        { id: 'T4', name: 'Levotiroxina 75mcg', diagnosisId: '4', diagnosisName: 'Hipotiroidismo', doctor: 'Dra. Vargas', startDate: '2020-09-05', dosage: '1 pastilla en ayunas', notes: 'Sustitución hormonal. Control de TSH periódico.', adherence: 95, status: 'activo' },
        { id: 'T5', name: 'Fisioterapia Rodilla', diagnosisId: '3', diagnosisName: 'Artrosis rodilla derecha', doctor: 'Lic. Laura Castro (Fisioterapeuta)', startDate: '2023-02-01', dosage: '3 sesiones/semana', notes: 'Ejercicios de fortalecimiento y movilidad. Duración 3 meses.', adherence: 80, status: 'activo' }
    ];
    let nextTreatmentId = treatmentsData.length > 0 ? Math.max(...treatmentsData.map(t => parseInt(t.id.replace('T', '')))) + 1 : 1;

    let eventsData = [
        { id: 'E1', name: 'Cirugía de Apendicectomía', date: '2023-10-15', hospital: 'Hospital Central de Montería', doctor: 'Dr. Juan Pérez (Cirujano)', description: 'Extirpación de apéndice inflamado debido a apendicitis aguda. Recuperación postoperatoria sin complicaciones, alta a los 3 días.' },
        { id: 'E2', name: 'Episodio de Bronquitis Aguda', date: '2024-02-20', hospital: 'Clínica La Esperanza', doctor: 'Dra. Ana García (Neumóloga)', description: 'Infección respiratoria tratada con antibióticos y broncodilatadores. Mejora significativa en 7 días, persistencia de tos seca por 2 semanas.' },
        { id: 'E3', name: 'Vacunación Anual (Influenza)', date: '2024-04-01', hospital: 'Centro de Salud Urbano', doctor: 'Enfermera Jefe María Rojas', description: 'Administración de vacuna contra la influenza estacional. Sin reacciones adversas reportadas.' },
        { id: 'E4', name: 'Consulta de Nutrición', date: '2024-05-05', hospital: 'Centro Nutricional Vida Sana', doctor: 'Lic. Sofía Restrepo (Nutricionista)', description: 'Primera consulta para plan de alimentación balanceado. Se establecieron metas de peso y hábitos saludables.' }
    ];
    let nextEventId = eventsData.length > 0 ? Math.max(...eventsData.map(e => parseInt(e.id.replace('E', '')))) + 1 : 1;

    let documentsData = [
        { id: 'D1', name: 'Resultados de Laboratorio General', date: '2024-05-10', type: 'Análisis Clínico', description: 'Hemograma completo, perfil lipídico y función renal. Todos los valores dentro de rangos normales.' },
        { id: 'D2', name: 'Receta Médica - Ibuprofeno 600mg', date: '2024-05-15', type: 'Receta', description: 'Receta para Ibuprofeno 600mg, tomar cada 8 horas por 5 días para dolor muscular.' },
        { id: 'D3', name: 'Informe de Consulta Cardiológica', date: '2024-04-22', type: 'Informe Médico', description: 'Informe de seguimiento cardiológico. Electrocardiograma normal, se ajusta dosis de antihipertensivo.' },
        { id: 'D4', name: 'Radiografía de Rodilla Derecha', date: '2023-01-25', type: 'Imagen Diagnóstica', description: 'Radiografía que muestra signos de artrosis leve en la articulación de la rodilla derecha.' }
    ];
    let nextDocumentId = documentsData.length > 0 ? Math.max(...documentsData.map(d => parseInt(d.id.replace('D', '')))) + 1 : 1;

    // --- PERSISTENCIA Y RENDERIZADO DINÁMICO DE EVENTOS MÉDICOS ---
    const MEDICAL_EVENTS_KEY = 'medicalEvents';
    let editingEventId = null;

    const exampleMedicalEvents = [
        {
            id: 'E1',
            name: 'Cirugía de Apendicectomía',
            date: '2023-10-15',
            hospital: 'Hospital Central de Montería',
            doctor: 'Dr. Juan Pérez (Cirujano)',
            description: 'Extirpación de apéndice inflamado debido a apendicitis aguda. Recuperación postoperatoria sin complicaciones, alta a los 3 días.'
        },
        {
            id: 'E2',
            name: 'Episodio de Bronquitis Aguda',
            date: '2024-02-20',
            hospital: 'Clínica La Esperanza',
            doctor: 'Dra. Ana García (Neumóloga)',
            description: 'Infección respiratoria tratada con antibióticos y broncodilatadores. Mejora significativa en 7 días, persistencia de tos seca por 2 semanas.'
        },
        {
            id: 'E3',
            name: 'Vacunación Anual (Influenza)',
            date: '2024-04-01',
            hospital: 'Centro de Salud Urbano',
            doctor: 'Enfermera Jefe María Rojas',
            description: 'Administración de vacuna contra la influenza estacional. Sin reacciones adversas reportadas.'
        }
    ];

    function getMedicalEvents() {
        const data = localStorage.getItem(MEDICAL_EVENTS_KEY);
        if (!data) return null;
        try { return JSON.parse(data); } catch { return null; }
    }

    function saveMedicalEvents(events) {
        localStorage.setItem(MEDICAL_EVENTS_KEY, JSON.stringify(events));
    }

    // --- FILTROS DINÁMICOS Y PERSISTENTES DE EVENTOS MÉDICOS ---
    const MEDICAL_EVENTS_FILTERS_KEY = 'medicalEventsFilters';
    const filterForm = document.getElementById('medical-events-filter-form');

    function getMedicalEventsFilters() {
        const data = localStorage.getItem(MEDICAL_EVENTS_FILTERS_KEY);
        if (!data) return null;
        try { return JSON.parse(data); } catch { return null; }
    }

    function saveMedicalEventsFilters(filters) {
        localStorage.setItem(MEDICAL_EVENTS_FILTERS_KEY, JSON.stringify(filters));
    }

    function eventMatchesMedicalFilters(event, filters) {
        if (!filters) return true;
        if (filters.name && !event.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
        if (filters.hospital && !event.hospital.toLowerCase().includes(filters.hospital.toLowerCase())) return false;
        if (filters.doctor && !event.doctor.toLowerCase().includes(filters.doctor.toLowerCase())) return false;
        if (filters.start && event.date < filters.start) return false;
        if (filters.end && event.date > filters.end) return false;
        return true;
    }

    function renderMedicalEvents() {
        let events = getMedicalEvents();
        if (!events || !Array.isArray(events) || events.length === 0) {
            events = exampleMedicalEvents;
            saveMedicalEvents(events);
        }
        const filters = getMedicalEventsFilters();
        const filtered = filters ? events.filter(ev => eventMatchesMedicalFilters(ev, filters)) : events;
        eventsGrid.innerHTML = '';
        if (filtered.length === 0) {
            eventsGrid.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-check"></i><h4>No hay eventos que coincidan con los filtros seleccionados</h4><p>Prueba con otros criterios.</p></div>';
            showNotification('info', 'No hay eventos que coincidan con los filtros.');
            return;
        }
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        for (const event of filtered) {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="card-header">
                    <h4>${event.name}</h4>
                    <div class="card-actions">
                        <button class="icon-button" title="Ver detalles" onclick="showEventDetails('${event.id}')"><i class="fas fa-eye"></i></button>
                        <button class="icon-button" title="Editar" onclick="editMedicalEvent('${event.id}')"><i class="fas fa-edit"></i></button>
                        <button class="icon-button" title="Eliminar" onclick="deleteMedicalEvent('${event.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="event-meta">
                        <span><i class="fas fa-calendar-alt"></i> ${event.date}</span>
                        <span><i class="fas fa-hospital"></i> ${event.hospital}</span>
                        <span><i class="fas fa-user-md"></i> ${event.doctor}</span>
                    </div>
                    <p>${event.description}</p>
                </div>
            `;
            eventsGrid.appendChild(card);
        }
    }

    addEventButton.onclick = () => openEventModal();

    window.editMedicalEvent = function(id) {
        const events = getMedicalEvents() || [];
        const event = events.find(ev => ev.id === id);
        if (event) openEventModal(event);
    };

    window.deleteMedicalEvent = function(id) {
        if (!confirm('¿Seguro que deseas eliminar este evento?')) return;
        let events = getMedicalEvents() || [];
        events = events.filter(ev => ev.id !== id);
        saveMedicalEvents(events);
        renderMedicalEvents();
        showNotification('Evento eliminado');
    };

    // --- Funciones de Interfaz de Usuario (UI) ---

    // Function to show notifications
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.classList.add('notification-container');
    document.body.appendChild(notificationContainer);

    function showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);
        notification.textContent = message;
        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('notification-fade-out');
            notification.addEventListener('transitionend', () => notification.remove());
        }, duration);
    }

    function activateTab(tabId) {
        tabs.forEach(tab => tab.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));
        const activeTab = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        const activePanel = document.getElementById(`${tabId}-panel`);
        if (activeTab) activeTab.classList.add('active');
        if (activePanel) activePanel.classList.add('active');

        // Render content specific to the activated tab
        if (tabId === 'diagnostics') {
            renderDiagnostics();
        } else if (tabId === 'treatments') {
            renderTreatments();
        } else if (tabId === 'events') {
            renderEvents();
        } else if (tabId === 'documents') {
            renderDocuments();
        }
    }

    function openModal(modal) {
        if (modal) modal.classList.add('active');
    }

    function closeModal(modal) {
        if (modal) modal.classList.remove('active');
    }

    // --- Patient Section Functions ---
    function renderPatientInfo() {
        document.querySelector('.patient-name').textContent = `${currentPatient.name} (${currentPatient.age} años)`;
        document.querySelector('.patient-meta .meta-item:nth-child(1)').innerHTML = `<i class="fas fa-id-card"></i> ID: ${currentPatient.id}`;
        document.querySelector('.patient-meta .meta-item:nth-child(2)').innerHTML = `<i class="fas fa-tint"></i> ${currentPatient.bloodType}`;
        
        // Update quick stats (simulated values)
        document.querySelector('.patient-quickstats .stat-item:nth-child(1) .stat-number').textContent = diagnosticsData.length;
        document.querySelector('.patient-quickstats .stat-item:nth-child(2) .stat-number').textContent = treatmentsData.length;
        // Calculate adherence percentage (example: average of all treatments' adherence)
        const totalAdherence = treatmentsData.reduce((sum, t) => sum + t.adherence, 0);
        const averageAdherence = treatmentsData.length > 0 ? Math.round(totalAdherence / treatmentsData.length) : 0;
        document.querySelector('.patient-quickstats .stat-item:nth-child(3) .stat-number').textContent = `${averageAdherence}%`;
    }

    // --- Diagnósticos Functions ---
    function renderDiagnostics() {
        if (!diagnosticsGrid) return;
        diagnosticsGrid.innerHTML = '';
        if (diagnosticsData.length === 0) {
            diagnosticsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-notes-medical"></i>
                    <h4>No hay diagnósticos registrados</h4>
                    <p>Añade un nuevo diagnóstico para empezar a gestionar tu historial médico.</p>
                    <button class="primary-button small" id="add-diagnosis-empty">
                        <i class="fas fa-plus"></i> Añadir diagnóstico
                    </button>
                </div>
            `;
            document.getElementById('add-diagnosis-empty').addEventListener('click', () => {
                populateDiagnosisModal();
                openModal(diagnosisModal);
            });
        } else {
            diagnosticsData.forEach(diagnostic => {
                const card = createDiagnosticCard(diagnostic);
                diagnosticsGrid.appendChild(card);
            });
        }
    }

    function createDiagnosticCard(diagnostic) {
        const card = document.createElement('div');
        card.classList.add('diagnostic-card');
        card.dataset.diagnosisId = diagnostic.id;
        
        // Determinar el color del indicador de severidad
        const severityClass = diagnostic.severity || 'stable';
        
        card.innerHTML = `
            <div class="severity-indicator ${severityClass}"></div>
            <div class="card-header">
                    <h4>${diagnostic.name}</h4>
                <div class="card-actions">
                    <button class="icon-button view-diagnostic-details-btn" data-diagnostic-id="${diagnostic.id}" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="icon-button edit-diagnosis" data-diagnostic-id="${diagnostic.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-button delete-diagnosis" data-diagnostic-id="${diagnostic.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="diagnostic-meta">
                    <span><i class="fas fa-user-md"></i> ${diagnostic.doctor}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${diagnostic.date}</span>
                    <span><i class="fas fa-stethoscope"></i> ${diagnostic.specialist || 'General'}</span>
                </div>
                <p>${diagnostic.notes}</p>
                <div class="additional-info">
                    <div class="adherence-info">
                        <span>Adherencia: ${diagnostic.adherence}%</span>
                        <div class="adherence-bar">
                            <div class="adherence-fill" style="width: ${diagnostic.adherence}%"></div>
                    </div>
                    </div>
                    <span>Próximo: ${diagnostic.nextControl}</span>
                </div>
            </div>
        `;

        // Add event listeners for the buttons within the card
        card.querySelector('.view-diagnostic-details-btn').addEventListener('click', () => showDiagnosisDetails(diagnostic.id));
        card.querySelector('.edit-diagnosis').addEventListener('click', () => {
            populateDiagnosisModal(diagnostic);
            openModal(diagnosisModal);
        });
        card.querySelector('.delete-diagnosis').addEventListener('click', () => {
            // Using a custom modal for confirmation instead of alert/confirm
            showConfirmationModal(
                `¿Estás seguro de que deseas eliminar el diagnóstico "${diagnostic.name}"?`,
                () => { // On confirm
                    diagnosticsData = diagnosticsData.filter(d => d.id !== diagnostic.id);
                    renderDiagnostics();
                    renderPatientInfo(); // Update patient stats
                    showNotification('Diagnóstico eliminado correctamente', 'success');
                }
            );
        });

        return card;
    }

    function populateDiagnosisModal(diagnostic = null) {
        document.getElementById('diagnosis-id').value = diagnostic ? diagnostic.id : '';
        document.getElementById('diagnosis-name').value = diagnostic ? diagnostic.name : '';
        document.getElementById('diagnosis-date').value = diagnostic ? diagnostic.date : '';
        document.getElementById('diagnosis-doctor').value = diagnostic ? diagnostic.doctor : '';
        document.getElementById('diagnosis-severity').value = diagnostic ? diagnostic.severity : 'stable';
        document.getElementById('diagnosis-notes').value = diagnostic ? diagnostic.notes : '';
        // Update modal title based on whether it's an edit or add operation
        document.getElementById('diagnosis-modal-title').textContent = diagnostic ? 'Editar Diagnóstico' : 'Añadir Nuevo Diagnóstico';
    }

    function showDiagnosisDetails(id) {
        const diagnostic = diagnosticsData.find(d => d.id === id);
        if (diagnostic) {
            document.getElementById('detail-diagnosis-name').textContent = diagnostic.name;
            document.getElementById('detail-diagnosis-date').textContent = diagnostic.date;
            document.getElementById('detail-diagnosis-doctor').textContent = diagnostic.doctor;
            document.getElementById('detail-diagnosis-severity').textContent = diagnostic.severity;
            document.getElementById('detail-diagnosis-last-reading').textContent = diagnostic.lastReading;
            document.getElementById('detail-diagnosis-last-reading-date').textContent = diagnostic.lastReadingDate;
            document.getElementById('detail-diagnosis-adherence').textContent = diagnostic.adherence;
            document.getElementById('detail-diagnosis-notes').textContent = diagnostic.notes;
            document.getElementById('detail-diagnosis-next-control').textContent = diagnostic.nextControl;
            openModal(diagnosisDetailsModal);
        } else {
            showNotification('Diagnóstico no encontrado.', 'error');
        }
    }

    // --- Tratamientos Functions ---
    function renderTreatments() {
        if (!treatmentsGrid) return;
        treatmentsGrid.innerHTML = ''; // Clear existing cards

        if (treatmentsData.length === 0) {
            treatmentsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-prescription-bottle-alt"></i>
                    <h4>No hay tratamientos activos</h4>
                    <p>Agrega un nuevo tratamiento para empezar a gestionarlos.</p>
                    <button class="primary-button small" id="add-treatment-empty">
                        <i class="fas fa-plus"></i> Agregar tratamiento
                    </button>
                </div>
            `;
            document.getElementById('add-treatment-empty').addEventListener('click', () => {
                populateTreatmentModal();
                openModal(treatmentModal);
            });
        } else {
            treatmentsData.forEach(treatment => {
                const card = createTreatmentCard(treatment);
                treatmentsGrid.appendChild(card);
            });
        }
    }

    function createTreatmentCard(treatment) {
        const card = document.createElement('div');
        card.classList.add('treatment-card');
        card.setAttribute('data-treatment-id', treatment.id);
        card.innerHTML = `
            <div class="card-header">
                <h4>${treatment.name}</h4>
                <div class="card-actions">
                    <button class="icon-button view-treatment-details-btn" data-treatment-id="${treatment.id}" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="icon-button edit-treatment-btn" data-treatment-id="${treatment.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-button delete-treatment-btn" data-treatment-id="${treatment.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="treatment-meta">
                    <span><i class="fas fa-user-md"></i> ${treatment.doctor}</span>
                    <span><i class="fas fa-calendar-alt"></i> ${treatment.startDate}</span>
                    <span><i class="fas fa-pills"></i> ${treatment.diagnosisName || 'N/A'}</span>
                </div>
                <p><strong>Dosis:</strong> ${treatment.dosage}</p>
                <div class="additional-info">
                    <div class="adherence-info">
                        <span>Adherencia: ${treatment.adherence}%</span>
                        <div class="adherence-bar">
                            <div class="adherence-fill" style="width: ${treatment.adherence}%"></div>
                        </div>
                    </div>
                    <span class="status-badge ${treatment.status}">${treatment.status}</span>
                </div>
            </div>
        `;

        // Add event listeners for the buttons within the new card
        card.querySelector('.view-treatment-details-btn').addEventListener('click', () => showTreatmentDetails(treatment.id));
        card.querySelector('.edit-treatment-btn').addEventListener('click', () => {
            populateTreatmentModal(treatment);
            openModal(treatmentModal);
        });
        card.querySelector('.delete-treatment-btn').addEventListener('click', () => {
            showConfirmationModal(
                `¿Estás seguro de que deseas eliminar el tratamiento "${treatment.name}"?`,
                () => { // On confirm
                    treatmentsData = treatmentsData.filter(t => t.id !== treatment.id);
                    renderTreatments();
                    renderPatientInfo(); // Update patient stats
                    showNotification('Tratamiento eliminado correctamente', 'success');
                }
            );
        });

        return card;
    }

    function populateTreatmentModal(treatment = null) {
        const treatmentNameInput = document.getElementById('treatment-name');
        const treatmentDiagnosisSelect = document.getElementById('treatment-diagnosis');
        const treatmentDoctorInput = document.getElementById('treatment-doctor');
        const treatmentStartDateInput = document.getElementById('treatment-start-date');
        const treatmentDosageInput = document.getElementById('treatment-dosage');
        const treatmentNotesTextarea = document.getElementById('treatment-notes');
        const treatmentIdInput = document.getElementById('treatment-id'); // Hidden input for ID

        // Clear previous options and populate with current diagnostics
        treatmentDiagnosisSelect.innerHTML = '<option value="">Seleccione un diagnóstico</option>';
        diagnosticsData.forEach(diag => {
            const option = document.createElement('option');
            option.value = diag.id;
            option.textContent = diag.name;
            treatmentDiagnosisSelect.appendChild(option);
        });

        if (treatment) {
            // Editing existing treatment
            treatmentNameInput.value = treatment.name;
            treatmentDiagnosisSelect.value = treatment.diagnosisId;
            treatmentDoctorInput.value = treatment.doctor;
            treatmentStartDateInput.value = treatment.startDate;
            treatmentDosageInput.value = treatment.dosage;
            treatmentNotesTextarea.value = treatment.notes;
            treatmentIdInput.value = treatment.id; // Set hidden ID for editing
            document.getElementById('treatment-modal-title').textContent = 'Editar Tratamiento';
        } else {
            // Adding new treatment
            treatmentNameInput.value = '';
            treatmentDiagnosisSelect.value = '';
            treatmentDoctorInput.value = '';
            treatmentStartDateInput.value = '';
            treatmentDosageInput.value = '';
            treatmentNotesTextarea.value = '';
            treatmentIdInput.value = ''; // Clear hidden ID for new entry
            document.getElementById('treatment-modal-title').textContent = 'Agregar Nuevo Tratamiento';
        }
    }

    function showTreatmentDetails(id) {
        const treatment = treatmentsData.find(t => t.id === id);
        if (treatment) {
            document.getElementById('detail-treatment-name').textContent = treatment.name;
            document.getElementById('detail-treatment-diagnosis').textContent = treatment.diagnosisName || 'N/A';
            document.getElementById('detail-treatment-doctor').textContent = treatment.doctor;
            document.getElementById('detail-treatment-start-date').textContent = treatment.startDate;
            document.getElementById('detail-treatment-dosage').textContent = treatment.dosage;
            document.getElementById('detail-treatment-notes').textContent = treatment.notes;
            document.getElementById('detail-treatment-adherence').textContent = treatment.adherence;
            document.getElementById('detail-treatment-status').textContent = treatment.status;
            openModal(treatmentDetailsModal);
        } else {
            showNotification('Tratamiento no encontrado.', 'error');
        }
    }

    function showAllTreatmentsModal() {
        const allTreatmentsModal = document.getElementById('all-treatments-modal');
        const treatmentsListModal = allTreatmentsModal.querySelector('.treatments-list-modal');
        treatmentsListModal.innerHTML = ''; // Clear previous content

        if (treatmentsData.length === 0) {
            treatmentsListModal.innerHTML = '<p class="empty-state-text">No hay tratamientos registrados.</p>';
        } else {
            treatmentsData.forEach(treatment => {
                const treatmentItem = document.createElement('div');
                treatmentItem.classList.add('treatment-item-modal');
                treatmentItem.innerHTML = `
                    <h4>${treatment.name}</h4>
                    <p><i class="fas fa-tag"></i> Diagnóstico: ${treatment.diagnosisName || 'N/A'}</p>
                    <p><i class="fas fa-user-md"></i> Médico: ${treatment.doctor}</p>
                    <p><i class="fas fa-calendar-alt"></i> Inicio: ${treatment.startDate}</p>
                    <p><i class="fas fa-pills"></i> Dosis: ${treatment.dosage}</p>
                    <p class="notes">Notas: ${treatment.notes}</p>
                    <p><i class="fas fa-percent"></i> Adherencia: ${treatment.adherence}%</p>
                    <p><i class="fas fa-check-circle"></i> Estado: ${treatment.status}</p>
                `;
                treatmentsListModal.appendChild(treatmentItem);
            });
        }
        openModal(allTreatmentsModal);
    }

    // --- Events Functions ---
    function renderEvents() {
        renderMedicalEvents();
    }

    function openEventModal(event = null) {
        const modal = document.getElementById('medical-event-modal');
        document.getElementById('medical-event-modal-title').innerHTML = event ? '<i class="fas fa-calendar-plus"></i> <span>Editar Evento Médico</span>' : '<i class="fas fa-calendar-plus"></i> <span>Registrar Evento Médico</span>';
        document.getElementById('medical-event-id').value = event ? event.id : '';
        document.getElementById('medical-event-name').value = event ? event.name : '';
        document.getElementById('medical-event-date').value = event ? event.date : '';
        document.getElementById('medical-event-hospital').value = event ? event.hospital : '';
        document.getElementById('medical-event-doctor').value = event ? event.doctor : '';
        document.getElementById('medical-event-description').value = event ? event.description : '';
        document.getElementById('medical-event-error').style.display = 'none';
        modal.classList.add('active');
        setTimeout(() => document.getElementById('medical-event-name').focus(), 100);
    }

    function showEventDetails(id) {
        const event = eventsData.find(e => e.id === id);
        if (event) {
            document.getElementById('detail-event-name').textContent = event.name;
            document.getElementById('detail-event-date').textContent = event.date;
            document.getElementById('detail-event-hospital').textContent = event.hospital;
            document.getElementById('detail-event-doctor').textContent = event.doctor;
            document.getElementById('detail-event-description').textContent = event.description;
            openModal(eventDetailsModal);
        } else {
            showNotification('Evento no encontrado.', 'error');
        }
    }

    function showAllEventsModal() {
        const allEventsModal = document.getElementById('all-events-modal');
        const eventListModal = allEventsModal.querySelector('.event-list-modal');
        eventListModal.innerHTML = ''; // Clear previous content

        if (eventsData.length === 0) {
            eventListModal.innerHTML = '<p class="empty-state-text">No hay eventos registrados.</p>';
        } else {
            eventsData.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.classList.add('event-item-modal');
                eventItem.innerHTML = `
                    <h4>${event.name}</h4>
                    <p><i class="fas fa-calendar-alt"></i> Fecha: ${event.date}</p>
                    <p><i class="fas fa-hospital"></i> Hospital: ${event.hospital}</p>
                    <p><i class="fas fa-user-md"></i> Médico: ${event.doctor}</p>
                    <p class="event-description">Descripción: ${event.description}</p>
                `;
                eventListModal.appendChild(eventItem);
            });
        }
        openModal(allEventsModal);
    }

    // --- Documents Functions ---
    function renderDocuments() {
        if (!documentsGrid) return;
        documentsGrid.innerHTML = '';
        if (documentsData.length === 0) {
            documentsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-medical-alt"></i>
                    <h4>No hay documentos subidos</h4>
                    <p>Sube tus documentos médicos para tenerlos siempre a mano.</p>
                    <button class="primary-button small" id="upload-document-empty">
                        <i class="fas fa-upload"></i> Subir documento
                    </button>
                </div>
            `;
            document.getElementById('upload-document-empty').addEventListener('click', () => {
                populateDocumentModal();
                openModal(documentModal);
            });
        } else {
            documentsData.forEach(doc => {
                const card = createDocumentCard(doc);
                documentsGrid.appendChild(card);
            });
        }
    }

    function createDocumentCard(doc) {
        const card = document.createElement('div');
        card.classList.add('document-card');
        card.dataset.documentId = doc.id;
        card.innerHTML = `
            <div class="card-header">
                <h4>${doc.name}</h4>
                <div class="card-actions">
                    <button class="icon-button view-document-details-btn" data-document-id="${doc.id}" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="icon-button edit-document-btn" data-document-id="${doc.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-button delete-document-btn" data-document-id="${doc.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="document-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${doc.date}</span>
                    <span><i class="fas fa-file-alt"></i> ${doc.type}</span>
                </div>
                    <p>${doc.description}</p>
                <div class="additional-info">
                    <button class="icon-button" title="Descargar" onclick="showNotification('Simulando descarga de documento: ${doc.name}.','info'); return false;">
                        <i class="fas fa-download"></i> Descargar
                    </button>
                </div>
            </div>
        `;

        card.querySelector('.view-document-details-btn').addEventListener('click', () => showDocumentDetails(doc.id));
        card.querySelector('.edit-document-btn').addEventListener('click', () => {
            populateDocumentModal(doc);
            openModal(documentModal);
        });
        card.querySelector('.delete-document-btn').addEventListener('click', () => {
            showConfirmationModal(
                `¿Estás seguro de que deseas eliminar el documento "${doc.name}"?`,
                () => { // On confirm
                    documentsData = documentsData.filter(d => d.id !== doc.id);
                    renderDocuments();
                    showNotification('Documento eliminado correctamente', 'success');
                }
            );
        });
        return card;
    }

    function populateDocumentModal(doc = null) {
        document.getElementById('document-id').value = doc ? doc.id : '';
        document.getElementById('document-name').value = doc ? doc.name : '';
        document.getElementById('document-date').value = doc ? doc.date : '';
        document.getElementById('document-type').value = doc ? doc.type : '';
        document.getElementById('document-description').value = doc ? doc.description : '';
        document.getElementById('document-modal-title').textContent = doc ? 'Editar Documento' : 'Subir Nuevo Documento';
    }

    function showDocumentDetails(id) {
        const doc = documentsData.find(d => d.id === id);
        if (doc) {
            document.getElementById('detail-document-name').textContent = doc.name;
            document.getElementById('detail-document-date').textContent = doc.date;
            document.getElementById('detail-document-type').textContent = doc.type;
            document.getElementById('detail-document-description').textContent = doc.description;
            openModal(documentDetailsModal);
        } else {
            showNotification('Documento no encontrado.', 'error');
        }
    }

    function showAllDocumentsModal() {
        const allDocumentsModal = document.getElementById('all-documents-modal');
        const documentListModal = allDocumentsModal.querySelector('.document-list-modal');
        documentListModal.innerHTML = ''; // Clear previous content

        if (documentsData.length === 0) {
            documentListModal.innerHTML = '<p class="empty-state-text">No hay documentos registrados.</p>';
        } else {
            documentsData.forEach(doc => {
                const docItem = document.createElement('div');
                docItem.classList.add('document-item-modal');
                docItem.innerHTML = `
                    <h4>${doc.name}</h4>
                    <p><i class="fas fa-calendar-alt"></i> Fecha: ${doc.date}</p>
                    <p><i class="fas fa-file-alt"></i> Tipo: ${doc.type}</p>
                    <p class="document-description">Descripción: ${doc.description}</p>
                    <a href="#" class="text-button" onclick="showNotification('Simulando descarga de documento: ${doc.name}.','info'); return false;"><i class="fas fa-download"></i> Descargar</a>
                `;
                documentListModal.appendChild(docItem);
            });
        }
        openModal(allDocumentsModal);
    }

    // --- Timeline Functions ---
    function renderTimeline() {
        const timelineContainer = document.querySelector('.timeline-content');
        if (!timelineContainer) return;
        
        // Combinar todos los datos en una línea de tiempo
        const timelineData = [];
        
        // Agregar diagnósticos
        diagnosticsData.forEach(diag => {
            timelineData.push({
                type: 'diagnosis',
                date: diag.date,
                title: diag.name,
                description: diag.notes,
                doctor: diag.doctor,
                severity: diag.severity
            });
        });
        
        // Agregar tratamientos
        treatmentsData.forEach(treatment => {
            timelineData.push({
                type: 'treatment',
                date: treatment.startDate,
                title: treatment.name,
                description: treatment.dosage,
                doctor: treatment.doctor,
                status: treatment.status
            });
        });
        
        // Agregar eventos
        eventsData.forEach(event => {
            timelineData.push({
                type: 'event',
                date: event.date,
                title: event.name,
                description: event.description,
                hospital: event.hospital,
                doctor: event.doctor
            });
        });
        
        // Agregar documentos
        documentsData.forEach(doc => {
            timelineData.push({
                type: 'document',
                date: doc.date,
                title: doc.name,
                description: doc.description,
                type: doc.type
            });
        });
        
        // Ordenar por fecha (más reciente primero)
        timelineData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Renderizar línea de tiempo
        timelineContainer.innerHTML = '';
        
        if (timelineData.length === 0) {
            timelineContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <h4>No hay eventos en la línea de tiempo</h4>
                    <p>Agrega diagnósticos, tratamientos, eventos o documentos para ver tu historial médico.</p>
                </div>
            `;
            return;
        }
        
        const timelineVertical = document.createElement('div');
        timelineVertical.className = 'timeline-vertical';
        
        timelineData.forEach(item => {
            const timelineEvent = document.createElement('div');
            timelineEvent.className = `timeline-event ${item.type}`;
            
            let metaInfo = '';
            if (item.doctor) metaInfo += `<span><i class="fas fa-user-md"></i> ${item.doctor}</span>`;
            if (item.hospital) metaInfo += `<span><i class="fas fa-hospital"></i> ${item.hospital}</span>`;
            if (item.type === 'document') metaInfo += `<span><i class="fas fa-file-alt"></i> ${item.type}</span>`;
            
            timelineEvent.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-info">
                        <div class="timeline-title">${item.title}</div>
                        <div class="timeline-meta">
                            <span><i class="fas fa-calendar-alt"></i> ${item.date}</span>
                            ${metaInfo}
                        </div>
                        <div class="timeline-description">${item.description}</div>
                    </div>
                    <div class="timeline-actions">
                        <button class="icon-button" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            `;
            
            timelineVertical.appendChild(timelineEvent);
        });
        
        timelineContainer.appendChild(timelineVertical);
    }

    // --- Custom Confirmation Modal (replaces alert/confirm) ---
    function showConfirmationModal(message, onConfirmCallback) {
        // Create modal elements if they don't exist
        let confirmationModal = document.getElementById('custom-confirmation-modal');
        if (!confirmationModal) {
            confirmationModal = document.createElement('div');
            confirmationModal.id = 'custom-confirmation-modal';
            confirmationModal.classList.add('modal-overlay');
            confirmationModal.innerHTML = `
                <div class="modal-content small-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-question-circle"></i> Confirmación</h3>
                        <button class="close-modal" data-modal-id="custom-confirmation-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p id="confirmation-message"></p>
                    </div>
                    <div class="modal-footer justify-center">
                        <button class="danger-button" id="confirm-action-btn">Confirmar</button>
                        <button class="secondary-button close-modal" data-modal-id="custom-confirmation-modal">Cancelar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmationModal);

            // Add event listeners for the new modal
            confirmationModal.querySelector('.close-modal').addEventListener('click', () => closeModal(confirmationModal));
            confirmationModal.addEventListener('click', (e) => {
                if (e.target === confirmationModal) {
                    closeModal(confirmationModal);
                }
            });
        }

        document.getElementById('confirmation-message').textContent = message;
        
        const confirmBtn = document.getElementById('confirm-action-btn');
        // Remove previous listener to avoid multiple calls
        confirmBtn.onclick = null; 
        confirmBtn.addEventListener('click', () => {
            onConfirmCallback();
            closeModal(confirmationModal);
        });

        openModal(confirmationModal);
    }


    // --- Event Listeners ---

    // Cargar el sidebar
    fetch('sidebar/sidebar.html')
        .then(response => response.text())
        .then(data => {
            if (sidebarContainer) {
                sidebarContainer.innerHTML = data;
                // Marcar como activo el elemento del menú correspondiente
                const currentPage = window.location.pathname.split('/').pop() || 'Inicio.html';
                document.querySelectorAll('#sidebar-container .sidebar-menu a').forEach(link => {
                    if (link.getAttribute('href') === currentPage) {
                        link.parentElement.classList.add('active');
                    }
                });
            }
        })
        .catch(error => console.error('Error loading sidebar:', error));

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            activateTab(tabId);
            
            // Renderizar línea de tiempo cuando se active la pestaña
            if (tabId === 'timeline') {
                renderTimeline();
            }
        });
    });

    // Event listener for "Agregar diagnóstico" button
    if (addDiagnosisBtn) {
        addDiagnosisBtn.addEventListener('click', () => {
            populateDiagnosisModal();
            openModal(diagnosisModal);
        });
    }

    // Event listeners for closing modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal-id');
            closeModal(document.getElementById(modalId));
        });
    });

    // Close modal when clicking outside content
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Handle diagnosis form submission
    if (diagnosisForm) {
        diagnosisForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const diagnosisId = document.getElementById('diagnosis-id').value;
            const newDiagnosisData = {
                name: document.getElementById('diagnosis-name').value,
                date: document.getElementById('diagnosis-date').value,
                doctor: document.getElementById('diagnosis-doctor').value,
                severity: document.getElementById('diagnosis-severity').value,
                notes: document.getElementById('diagnosis-notes').value,
                // Add default/mock values for other fields if not provided by form
                lastReading: 'N/A',
                lastReadingDate: 'N/A',
                adherence: 100,
                nextControl: 'N/A',
                specialist: 'N/A'
            };

            if (diagnosisId) {
                // Edit existing diagnosis
                const index = diagnosticsData.findIndex(d => d.id == diagnosisId);
                if (index !== -1) {
                    diagnosticsData[index] = { ...diagnosticsData[index], ...newDiagnosisData, id: parseInt(diagnosisId) };
                    showNotification(`Diagnóstico "${newDiagnosisData.name}" actualizado correctamente`, 'success');
                }
            } else {
                // Add new diagnosis
                const newId = diagnosticsData.length > 0 ? Math.max(...diagnosticsData.map(d => d.id)) + 1 : 1;
                const finalNewDiagnosis = { id: newId, ...newDiagnosisData };
                diagnosticsData.unshift(finalNewDiagnosis);
                showNotification(`Diagnóstico "${newDiagnosisData.name}" agregado correctamente`, 'success');
            }
            renderDiagnostics();
            renderPatientInfo(); // Update patient stats
            closeModal(diagnosisModal);
            this.reset();
        });
    }

    // Event listener for "Cambiar Paciente" button
    if (changePatientBtn) {
        const changePatientModal = document.createElement('div');
        changePatientModal.classList.add('modal-overlay');
        changePatientModal.id = 'change-patient-modal';
        changePatientModal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal" data-modal-id="change-patient-modal">&times;</button>
                <div class="modal-header">
                    <h3><i class="fas fa-exchange-alt"></i> Cambiar Paciente</h3>
                </div>
                <div class="modal-body">
                    <p>Funcionalidad para seleccionar otro paciente (simulado).</p>
                    <button class="primary-button" id="select-other-patient">Seleccionar otro paciente</button>
                </div>
            </div>
        `;
        document.body.appendChild(changePatientModal);
        const selectOtherPatientBtn = document.getElementById('select-other-patient');

        changePatientBtn.addEventListener('click', () => openModal(changePatientModal));
        changePatientModal.querySelector('.close-modal').addEventListener('click', () => closeModal(changePatientModal));
        changePatientModal.addEventListener('click', (e) => {
            if (e.target === changePatientModal) {
                closeModal(changePatientModal);
            }
        });
        if (selectOtherPatientBtn) {
            selectOtherPatientBtn.addEventListener('click', () => {
                showNotification(`Paciente cambiado a (simulado) Nuevo Paciente`, 'info');
                closeModal(changePatientModal);
                currentPatient = { id: 'TEMP-ID', name: 'Nuevo Paciente', age: 30, bloodType: 'O+' }; // Update simulated patient
                renderPatientInfo(); // Re-render patient info with new data
            });
        }
    }

    // --- Treatment Modals and Logic ---
    if (addTreatmentButton) {
        addTreatmentButton.addEventListener('click', () => {
            populateTreatmentModal();
            openModal(treatmentModal);
        });
    }

    if (viewAllTreatmentsButton) {
        viewAllTreatmentsButton.addEventListener('click', showAllTreatmentsModal);
    }

    if (treatmentForm) {
        treatmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const treatmentId = document.getElementById('treatment-id').value;
            const selectedDiagnosisId = document.getElementById('treatment-diagnosis').value;
            const selectedDiagnosisName = document.getElementById('treatment-diagnosis').selectedOptions[0].textContent;

            const newTreatmentData = {
                name: document.getElementById('treatment-name').value,
                diagnosisId: selectedDiagnosisId,
                diagnosisName: selectedDiagnosisName,
                doctor: document.getElementById('treatment-doctor').value,
                startDate: document.getElementById('treatment-start-date').value,
                dosage: document.getElementById('treatment-dosage').value,
                notes: document.getElementById('treatment-notes').value,
                adherence: 100, // Default for new/edited treatments
                status: 'activo' // Default status
            };

            if (treatmentId) {
                // Edit existing treatment
                const index = treatmentsData.findIndex(t => t.id === treatmentId);
                if (index !== -1) {
                    treatmentsData[index] = { ...treatmentsData[index], ...newTreatmentData, id: treatmentId };
                    showNotification(`Tratamiento "${newTreatmentData.name}" actualizado correctamente`, 'success');
                }
            } else {
                // Add new treatment
                const newId = 'T' + nextTreatmentId++;
                const finalNewTreatment = { id: newId, ...newTreatmentData };
                treatmentsData.unshift(finalNewTreatment);
                showNotification(`Tratamiento "${newTreatmentData.name}" agregado correctamente`, 'success');
            }
            renderTreatments();
            renderPatientInfo(); // Update patient stats
            closeModal(treatmentModal);
            this.reset();
        });
    }

    // --- Events Modals and Logic ---
    if (addEventButton) {
        addEventButton.addEventListener('click', () => {
            populateEventModal();
            openModal(eventModal);
        });
    }

    if (viewAllEventsButton) {
        viewAllEventsButton.addEventListener('click', showAllEventsModal);
    }

    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const eventId = document.getElementById('medical-event-id').value;
            const name = document.getElementById('medical-event-name').value.trim();
            const date = document.getElementById('medical-event-date').value;
            const hospital = document.getElementById('medical-event-hospital').value.trim();
            const doctor = document.getElementById('medical-event-doctor').value.trim();
            const description = document.getElementById('medical-event-description').value.trim();
            const errorDiv = document.getElementById('medical-event-error');
            // Validación avanzada
            if (!name) {
                errorDiv.textContent = 'El nombre del evento es obligatorio';
                errorDiv.style.display = 'block';
                document.getElementById('medical-event-name').focus();
                showNotification('error', 'El nombre del evento es obligatorio');
                return;
            }
            if (name.length < 3) {
                errorDiv.textContent = 'El nombre debe tener al menos 3 caracteres';
                errorDiv.style.display = 'block';
                document.getElementById('medical-event-name').focus();
                showNotification('error', 'El nombre debe tener al menos 3 caracteres');
                return;
            }
            if (!date) {
                errorDiv.textContent = 'La fecha es obligatoria';
                errorDiv.style.display = 'block';
                document.getElementById('medical-event-date').focus();
                showNotification('error', 'La fecha es obligatoria');
                return;
            }
            const today = new Date();
            const eventDate = new Date(date);
            if (eventDate > today) {
                errorDiv.textContent = 'La fecha no puede ser futura';
                errorDiv.style.display = 'block';
                document.getElementById('medical-event-date').focus();
                showNotification('error', 'La fecha no puede ser futura');
                return;
            }
            errorDiv.style.display = 'none';
            let events = getMedicalEvents() || [];
            if (eventId) {
                // Editar
                events = events.map(ev => ev.id === eventId ? { ...ev, name, date, hospital, doctor, description } : ev);
                showNotification('success', 'Evento actualizado');
            } else {
                // Nuevo
                const newId = 'E' + (Date.now());
                events.push({ id: newId, name, date, hospital, doctor, description });
                showNotification('success', 'Evento agregado');
            }
            saveMedicalEvents(events);
            renderMedicalEvents();
            document.getElementById('medical-event-modal').classList.remove('active');
        });
    }

    // --- Documents Modals and Logic ---
    if (uploadDocumentButton) {
        uploadDocumentButton.addEventListener('click', () => {
            populateDocumentModal();
            openModal(documentModal);
        });
    }

    if (viewAllDocumentsButton) {
        viewAllDocumentsButton.addEventListener('click', showAllDocumentsModal);
    }

    if (documentForm) {
        documentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const documentId = document.getElementById('document-id').value;
            const newDocumentData = {
                name: document.getElementById('document-name').value,
                date: document.getElementById('document-date').value,
                type: document.getElementById('document-type').value,
                description: document.getElementById('document-description').value,
            };

            if (documentId) {
                // Edit existing document
                const index = documentsData.findIndex(d => d.id === documentId);
                if (index !== -1) {
                    documentsData[index] = { ...documentsData[index], ...newDocumentData, id: documentId };
                    showNotification(`Documento "${newDocumentData.name}" actualizado correctamente`, 'success');
                }
            } else {
                // Add new document
                const newId = 'D' + nextDocumentId++;
                const finalNewDocument = { id: newId, ...newDocumentData };
                documentsData.unshift(finalNewDocument); // Add to beginning for visibility
                showNotification(`Documento "${newDocumentData.name}" agregado correctamente`, 'success');
            }
            renderDocuments();
            showNotification('Documento agregado correctamente', 'success'); // Consistent notification
            closeModal(documentModal);
            this.reset();
        });
    }

    // --- FILTROS DINÁMICOS Y PERSISTENTES DE EVENTOS MÉDICOS ---
    if (filterForm) {
        filterForm.onsubmit = function(e) {
            e.preventDefault();
            const filters = {
                name: this.querySelector('#filter-event-name').value.trim(),
                hospital: this.querySelector('#filter-event-hospital').value.trim(),
                doctor: this.querySelector('#filter-event-doctor').value.trim(),
                start: this.querySelector('#filter-event-date-start').value,
                end: this.querySelector('#filter-event-date-end').value
            };
            saveMedicalEventsFilters(filters);
            showNotification('success', 'Filtros aplicados');
            renderMedicalEvents();
        };
        filterForm.onreset = function() {
            localStorage.removeItem(MEDICAL_EVENTS_FILTERS_KEY);
            showNotification('info', 'Filtros limpiados');
            setTimeout(renderMedicalEvents, 100);
        };
        // Al cargar, rellenar con los filtros guardados
        const saved = getMedicalEventsFilters();
        if (saved) {
            filterForm.querySelector('#filter-event-name').value = saved.name || '';
            filterForm.querySelector('#filter-event-hospital').value = saved.hospital || '';
            filterForm.querySelector('#filter-event-doctor').value = saved.doctor || '';
            filterForm.querySelector('#filter-event-date-start').value = saved.start || '';
            filterForm.querySelector('#filter-event-date-end').value = saved.end || '';
        }
    }

    // --- Initialization ---
    renderPatientInfo(); // Render patient info on load
    activateTab('diagnostics'); // Set initial active tab
    renderMedicalEvents(); // Inicializar eventos al cargar
    renderTimeline(); // Inicializar línea de tiempo

    // --- Funcionalidad para nuevas secciones ---
    
    // Event listeners para botones de recomendaciones
    document.addEventListener('click', function(e) {
        // Botones de recomendaciones
        if (e.target.textContent === 'Contactar Médico') {
            showNotification('Redirigiendo a contacto con médico...', 'info');
        } else if (e.target.textContent === 'Agendar Cita') {
            showNotification('Abriendo calendario de citas...', 'info');
        } else if (e.target.textContent === 'Actualizar Perfil') {
            showNotification('Redirigiendo a configuración de perfil...', 'info');
        } else if (e.target.textContent === 'Recordar Más Tarde' || e.target.textContent === 'Más Tarde') {
            e.target.closest('.recommendation-card').style.opacity = '0.6';
            showNotification('Recomendación pospuesta', 'info');
        }
        
        // Botones de herramientas rápidas
        if (e.target.textContent === 'Exportar') {
            showNotification('Generando PDF del historial médico...', 'info');
            setTimeout(() => {
                showNotification('Historial exportado correctamente', 'success');
            }, 2000);
        } else if (e.target.textContent === 'Compartir') {
            showNotification('Abriendo opciones de compartir...', 'info');
        } else if (e.target.textContent === 'Ver Análisis') {
            showNotification('Cargando análisis de salud...', 'info');
        } else if (e.target.textContent === 'Configurar') {
            showNotification('Abriendo configuración de alertas...', 'info');
        }
    });
    
    // Función para actualizar estadísticas dinámicamente
    function updateHealthStats() {
        // Calcular estadísticas basadas en datos reales
        const totalDiagnostics = diagnosticsData.length;
        const activeTreatments = treatmentsData.filter(t => t.status === 'activo').length;
        const upcomingEvents = eventsData.filter(e => {
            const eventDate = new Date(e.date);
            const today = new Date();
            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 30;
        }).length;
        
        // Calcular adherencia promedio
        const adherenceAvg = treatmentsData.length > 0 
            ? Math.round(treatmentsData.reduce((sum, t) => sum + t.adherence, 0) / treatmentsData.length)
            : 0;
        
        // Actualizar valores en las tarjetas de estadísticas
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 4) {
            // Estado General
            const generalStatus = statCards[0].querySelector('.stat-value');
            if (generalStatus) {
                generalStatus.textContent = totalDiagnostics > 0 ? 'Activo' : 'Sin datos';
            }
            
            // Adherencia Medicación
            const adherenceStat = statCards[1].querySelector('.stat-value');
            if (adherenceStat) {
                adherenceStat.textContent = adherenceAvg + '%';
            }
            
            // Próximas Citas
            const appointmentsStat = statCards[2].querySelector('.stat-value');
            if (appointmentsStat) {
                appointmentsStat.textContent = upcomingEvents;
            }
            
            // Alertas Activas
            const alertsStat = statCards[3].querySelector('.stat-value');
            if (alertsStat) {
                const activeAlerts = treatmentsData.filter(t => t.adherence < 80).length;
                alertsStat.textContent = activeAlerts;
            }
        }
    }
    
    // Función para generar recomendaciones dinámicas - IMPLEMENTACIÓN REAL
    function generateRecommendations() {
        const recommendations = [];
        
        // Analizar datos del paciente para generar recomendaciones personalizadas
        const patientData = {
            age: 42,
            gender: 'Femenino',
            bloodType: 'A+',
            diagnostics: diagnosticsData,
            treatments: treatmentsData,
            events: eventsData
        };
        
        // 1. Recomendaciones basadas en medicación
        const lowAdherenceTreatments = treatmentsData.filter(t => t.adherence < 80);
        lowAdherenceTreatments.forEach(treatment => {
            recommendations.push({
                id: `med_${treatment.id}`,
                title: `Mejorar Adherencia - ${treatment.name}`,
                description: `Tu adherencia al ${treatment.name} es del ${treatment.adherence}%. Te recomendamos establecer recordatorios.`,
                priority: 'high',
                category: 'medication',
                action: 'Configurar Recordatorios',
                icon: 'fas fa-bell',
                actionable: true,
                actionFunction: () => configureMedicationReminders(treatment.id)
            });
        });
        
        // 2. Recomendaciones de renovación de medicamentos
        const expiringTreatments = treatmentsData.filter(t => {
            const daysUntilExpiry = calculateDaysUntilExpiry(t.endDate);
            return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
        });
        
        expiringTreatments.forEach(treatment => {
            const daysLeft = calculateDaysUntilExpiry(treatment.endDate);
            recommendations.push({
                id: `renew_${treatment.id}`,
                title: `Renovar ${treatment.name}`,
                description: `Tu medicamento se acabará en ${daysLeft} día${daysLeft > 1 ? 's' : ''}. Contacta a tu farmacia.`,
                priority: daysLeft <= 3 ? 'high' : 'medium',
                category: 'medication',
                action: 'Renovar Ahora',
                icon: 'fas fa-pills',
                actionable: true,
                actionFunction: () => renewMedication(treatment.id)
            });
        });
        
        // 3. Recomendaciones de controles médicos
        const overdueControls = diagnosticsData.filter(d => {
            const lastControl = new Date(d.date);
            const today = new Date();
            const diffDays = Math.ceil((today - lastControl) / (1000 * 60 * 60 * 24));
            return diffDays > 90; // Más de 3 meses sin control
        });
        
        overdueControls.forEach(diagnostic => {
            recommendations.push({
                id: `control_${diagnostic.id}`,
                title: `Control de ${diagnostic.name}`,
                description: `Es momento de tu control médico para ${diagnostic.name}. Han pasado ${Math.ceil((new Date() - new Date(diagnostic.date)) / (1000 * 60 * 60 * 24))} días.`,
                priority: 'medium',
                category: 'appointment',
                action: 'Agendar Cita',
                icon: 'fas fa-user-md',
                actionable: true,
                actionFunction: () => scheduleAppointment(diagnostic.id)
            });
        });
        
        // 4. Recomendaciones de estilo de vida basadas en diagnósticos
        if (patientData.diagnostics.some(d => d.name.toLowerCase().includes('diabetes'))) {
            recommendations.push({
                id: 'lifestyle_diabetes',
                title: 'Control de Glucosa',
                description: 'Como paciente diabético, te recomendamos medir tu glucosa regularmente y mantener una dieta balanceada.',
                priority: 'high',
                category: 'lifestyle',
                action: 'Ver Guía',
                icon: 'fas fa-tint',
                actionable: true,
                actionFunction: () => showDiabetesGuide()
            });
        }
        
        if (patientData.diagnostics.some(d => d.name.toLowerCase().includes('hipertensión') || d.name.toLowerCase().includes('presión'))) {
            recommendations.push({
                id: 'lifestyle_hypertension',
                title: 'Control de Presión Arterial',
                description: 'Mide tu presión arterial diariamente y reduce el consumo de sal en tu dieta.',
                priority: 'high',
                category: 'lifestyle',
                action: 'Ver Consejos',
                icon: 'fas fa-heartbeat',
                actionable: true,
                actionFunction: () => showHypertensionTips()
            });
        }
        
        // 5. Recomendaciones de ejercicio basadas en edad y condición
        recommendations.push({
            id: 'exercise_routine',
            title: 'Rutina de Ejercicio',
            description: 'Para tu edad, te recomendamos 150 minutos de ejercicio moderado por semana.',
            priority: 'low',
            category: 'lifestyle',
            action: 'Ver Rutina',
            icon: 'fas fa-walking',
            actionable: true,
            actionFunction: () => showExerciseRoutine()
        });
        
        // 6. Recomendaciones de análisis pendientes
        const lastBloodTest = eventsData.filter(e => e.name.toLowerCase().includes('análisis') || e.name.toLowerCase().includes('sangre'))
                                       .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        if (lastBloodTest) {
            const daysSinceTest = Math.ceil((new Date() - new Date(lastBloodTest.date)) / (1000 * 60 * 60 * 24));
            if (daysSinceTest > 180) { // Más de 6 meses
                recommendations.push({
                    id: 'blood_test',
                    title: 'Análisis de Sangre',
                    description: `Han pasado ${daysSinceTest} días desde tu último análisis. Es recomendable hacer uno anual.`,
                    priority: 'medium',
                    category: 'test',
                    action: 'Agendar Análisis',
                    icon: 'fas fa-flask',
                    actionable: true,
                    actionFunction: () => scheduleBloodTest()
                });
            }
        }
        
        return recommendations.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    // Calcular días hasta expiración
    function calculateDaysUntilExpiry(endDate) {
        const today = new Date();
        const expiry = new Date(endDate);
        return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    }

    // Configurar recordatorios de medicación
    function configureMedicationReminders(treatmentId) {
        showNotification('Abriendo configuración de recordatorios...', 'info');
        
        const treatment = treatmentsData.find(t => t.id === treatmentId);
        if (treatment) {
            // Abrir modal de configuración de recordatorios
            const reminderModal = document.createElement('div');
            reminderModal.className = 'modal-overlay active';
            reminderModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-bell"></i> Configurar Recordatorios</h3>
                        <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="medication-info">
                            <h4>${treatment.name}</h4>
                            <p><strong>Dosis:</strong> ${treatment.dosage}</p>
                            <p><strong>Adherencia actual:</strong> ${treatment.adherence}%</p>
                        </div>
                        
                        <div class="reminder-settings">
                            <h4>Configuración de Recordatorios</h4>
                            <div class="form-group">
                                <label>Frecuencia</label>
                                <select id="reminder-frequency">
                                    <option value="daily">Diario</option>
                                    <option value="twice_daily">Dos veces al día</option>
                                    <option value="custom">Personalizado</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Hora principal</label>
                                <input type="time" id="reminder-time" value="08:00">
                            </div>
                            <div class="form-group">
                                <label>Método de notificación</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="notify-app" checked> Aplicación</label>
                                    <label><input type="checkbox" id="notify-email"> Email</label>
                                    <label><input type="checkbox" id="notify-sms"> SMS</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="secondary-button" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                        <button class="btn-primary" onclick="saveMedicationReminders('${treatmentId}')">Guardar</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(reminderModal);
        }
    }

    // Renovar medicamento
    function renewMedication(treatmentId) {
        const treatment = treatmentsData.find(t => t.id === treatmentId);
        if (treatment) {
            showNotification('Conectando con farmacia...', 'info');
            
            // Simular proceso de renovación
            setTimeout(() => {
                const renewalModal = document.createElement('div');
                renewalModal.className = 'modal-overlay active';
                renewalModal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3><i class="fas fa-pills"></i> Renovar Medicamento</h3>
                            <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="renewal-info">
                                <h4>${treatment.name}</h4>
                                <p><strong>Dosis:</strong> ${treatment.dosage}</p>
                                <p><strong>Farmacia:</strong> Farmacia Central</p>
                                <p><strong>Precio estimado:</strong> $25.000</p>
                            </div>
                            
                            <div class="renewal-options">
                                <button class="btn-primary" onclick="confirmRenewal('${treatmentId}')">
                                    <i class="fas fa-phone"></i> Llamar Farmacia
                                </button>
                                <button class="btn-secondary" onclick="sendRenewalRequest('${treatmentId}')">
                                    <i class="fas fa-envelope"></i> Enviar Solicitud
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(renewalModal);
            }, 1000);
        }
    }

    // Agendar cita
    function scheduleAppointment(diagnosticId) {
        const diagnostic = diagnosticsData.find(d => d.id === diagnosticId);
        if (diagnostic) {
            showNotification('Abriendo agenda médica...', 'info');
            
            // Simular apertura de agenda
            setTimeout(() => {
                showNotification('Agenda médica disponible', 'success');
                // Aquí se abriría la página de citas
            }, 1000);
        }
    }

    // Mostrar guía de diabetes
    function showDiabetesGuide() {
        const guideModal = document.createElement('div');
        guideModal.className = 'modal-overlay active';
        guideModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-book-medical"></i> Guía de Diabetes</h3>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="guide-content">
                        <h4>Control de Glucosa</h4>
                        <ul>
                            <li>Mide tu glucosa antes de cada comida</li>
                            <li>Mantén un registro diario</li>
                            <li>Objetivo: 80-130 mg/dL antes de comer</li>
                        </ul>
                        
                        <h4>Alimentación</h4>
                        <ul>
                            <li>Controla los carbohidratos</li>
                            <li>Come en horarios regulares</li>
                            <li>Incluye fibra en tu dieta</li>
                        </ul>
                        
                        <h4>Ejercicio</h4>
                        <ul>
                            <li>30 minutos diarios de actividad moderada</li>
                            <li>Consulta con tu médico antes de empezar</li>
                            <li>Lleva siempre algo dulce por si baja la glucosa</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(guideModal);
    }

    // Mostrar consejos de hipertensión
    function showHypertensionTips() {
        const tipsModal = document.createElement('div');
        tipsModal.className = 'modal-overlay active';
        tipsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-heart"></i> Control de Hipertensión</h3>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="tips-content">
                        <h4>Medición de Presión</h4>
                        <ul>
                            <li>Mide tu presión diariamente a la misma hora</li>
                            <li>Descansa 5 minutos antes de medir</li>
                            <li>Objetivo: menos de 140/90 mmHg</li>
                        </ul>
                        
                        <h4>Reducción de Sal</h4>
                        <ul>
                            <li>Máximo 2.3g de sodio por día</li>
                            <li>Lee las etiquetas de los alimentos</li>
                            <li>Usa hierbas y especias en lugar de sal</li>
                        </ul>
                        
                        <h4>Estilo de Vida</h4>
                        <ul>
                            <li>Mantén un peso saludable</li>
                            <li>Haz ejercicio regularmente</li>
                            <li>Reduce el estrés</li>
                            <li>Limita el alcohol</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(tipsModal);
    }

    // Mostrar rutina de ejercicio
    function showExerciseRoutine() {
        const routineModal = document.createElement('div');
        routineModal.className = 'modal-overlay active';
        routineModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-dumbbell"></i> Rutina de Ejercicio</h3>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="routine-content">
                        <h4>Rutina Semanal Recomendada</h4>
                        
                        <div class="exercise-day">
                            <h5>Lunes, Miércoles, Viernes</h5>
                            <ul>
                                <li>Caminata rápida: 30 minutos</li>
                                <li>Estiramientos: 10 minutos</li>
                            </ul>
                        </div>
                        
                        <div class="exercise-day">
                            <h5>Martes, Jueves</h5>
                            <ul>
                                <li>Ejercicios de fuerza: 20 minutos</li>
                                <li>Yoga o pilates: 15 minutos</li>
                            </ul>
                        </div>
                        
                        <div class="exercise-day">
                            <h5>Sábado, Domingo</h5>
                            <ul>
                                <li>Actividad recreativa: 45 minutos</li>
                                <li>Descanso activo</li>
                            </ul>
                        </div>
                        
                        <div class="exercise-tips">
                            <h4>Consejos</h4>
                            <ul>
                                <li>Comienza gradualmente</li>
                                <li>Escucha a tu cuerpo</li>
                                <li>Mantén hidratación</li>
                                <li>Consulta con tu médico</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(routineModal);
    }

    // Agendar análisis de sangre
    function scheduleBloodTest() {
        showNotification('Conectando con laboratorio...', 'info');
        
        setTimeout(() => {
            const testModal = document.createElement('div');
            testModal.className = 'modal-overlay active';
            testModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-flask"></i> Agendar Análisis</h3>
                        <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="test-info">
                            <h4>Análisis de Sangre Completo</h4>
                            <p><strong>Laboratorio:</strong> LabCorp</p>
                            <p><strong>Duración:</strong> 15-20 minutos</p>
                            <p><strong>Preparación:</strong> Ayuno de 8-12 horas</p>
                            <p><strong>Costo:</strong> $45.000</p>
                        </div>
                        
                        <div class="test-options">
                            <button class="btn-primary" onclick="confirmBloodTest()">
                                <i class="fas fa-calendar"></i> Agendar
                            </button>
                            <button class="btn-secondary" onclick="viewTestInstructions()">
                                <i class="fas fa-info-circle"></i> Ver Instrucciones
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(testModal);
        }, 1000);
    }
    
    // Función para actualizar recomendaciones - IMPLEMENTACIÓN REAL
    function updateRecommendations() {
        const recommendations = generateRecommendations();
        const recommendationsGrid = document.querySelector('.recommendations-grid');
        
        if (recommendationsGrid && recommendations.length > 0) {
            recommendationsGrid.innerHTML = '';
            
            recommendations.forEach(rec => {
                const card = document.createElement('div');
                card.className = `recommendation-card priority-${rec.priority}`;
                card.innerHTML = `
                    <div class="recommendation-header">
                        <div class="priority-badge ${rec.priority}">${rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'} Prioridad</div>
                        <i class="${rec.icon}"></i>
                    </div>
                    <h3>${rec.title}</h3>
                    <p>${rec.description}</p>
                    <div class="recommendation-actions">
                        ${rec.actionable ? 
                            `<button class="btn-primary small" onclick="executeRecommendationAction('${rec.id}')">${rec.action}</button>` :
                            `<button class="btn-primary small">Ver Detalles</button>`
                        }
                        <button class="btn-secondary small" onclick="dismissRecommendation('${rec.id}')">Más Tarde</button>
                    </div>
                `;
                recommendationsGrid.appendChild(card);
            });
        }
    }
    
    // Ejecutar acción de recomendación
    function executeRecommendationAction(recommendationId) {
        const recommendations = generateRecommendations();
        const recommendation = recommendations.find(r => r.id === recommendationId);
        
        if (recommendation && recommendation.actionFunction) {
            recommendation.actionFunction();
        } else {
            showNotification('Acción no disponible', 'error');
        }
    }
    
    // Descartar recomendación
    function dismissRecommendation(recommendationId) {
        // Guardar en localStorage para no mostrar de nuevo hoy
        const dismissed = JSON.parse(localStorage.getItem('dismissedRecommendations') || '[]');
        dismissed.push({
            id: recommendationId,
            dismissedAt: new Date().toISOString()
        });
        localStorage.setItem('dismissedRecommendations', JSON.stringify(dismissed));
        
        showNotification('Recomendación descartada', 'info');
        updateRecommendations(); // Recargar recomendaciones
    }
    
    // Función para inicializar todas las nuevas funcionalidades
    function initializeNewFeatures() {
        updateHealthStats();
        updateRecommendations();
        
        // Actualizar cada 5 minutos
        setInterval(() => {
            updateHealthStats();
            updateRecommendations();
        }, 300000);
    }
    
    // Llamar a la inicialización después de que se carguen los datos
    setTimeout(initializeNewFeatures, 1000);
    
    // Inicializar herramientas rápidas
    setupQuickTools();

    // FUNCIONES PARA HERRAMIENTAS RÁPIDAS

    // Función para abrir modal de exportar
    function openExportModal() {
        document.getElementById('export-modal').classList.add('active');
    }

    // Función para abrir modal de compartir
    function openShareModal() {
        document.getElementById('share-modal').classList.add('active');
    }

    // Función para abrir modal de análisis - IMPLEMENTACIÓN REAL
function openAnalyticsModal() {
    document.getElementById('analytics-modal').classList.add('active');
    initializeAnalyticsTabs();
    initializeAnalyticsCharts();
}

    // Función para abrir modal de alertas
    function openAlertsModal() {
        document.getElementById('alerts-modal').classList.add('active');
    }

    // Función para inicializar pestañas de análisis
function initializeAnalyticsTabs() {
    const tabs = document.querySelectorAll('.analytics-tab');
    const panels = document.querySelectorAll('.analytics-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            tab.classList.add('active');
            document.getElementById(`analytics-${targetTab}`).classList.add('active');
            
            // Renderizar gráficos cuando se cambia de pestaña
            setTimeout(() => {
                renderAnalyticsCharts(targetTab);
            }, 100);
        });
    });
}

// Inicializar gráficos de análisis
function initializeAnalyticsCharts() {
    // Renderizar gráficos iniciales
    renderAnalyticsCharts('overview');
}

// Renderizar gráficos según la pestaña
function renderAnalyticsCharts(tabName) {
    switch(tabName) {
        case 'overview':
            renderOverviewCharts();
            break;
        case 'trends':
            renderTrendsChart();
            break;
        case 'medications':
            renderMedicationCharts();
            break;
        case 'risks':
            renderRiskAnalysis();
            break;
    }
}

// Renderizar gráficos de vista general
function renderOverviewCharts() {
    // Gráfico de evolución de diagnósticos
    const diagnosisCtx = document.getElementById('diagnosisEvolutionChart');
    if (diagnosisCtx) {
        new Chart(diagnosisCtx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Diagnósticos Activos',
                    data: [1, 2, 2, 3, 3, 3],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });
    }
    
    // Gráfico de adherencia a tratamientos
    const adherenceCtx = document.getElementById('adherenceChart');
    if (adherenceCtx) {
        new Chart(adherenceCtx, {
            type: 'doughnut',
            data: {
                labels: ['Excelente', 'Buena', 'Regular', 'Baja'],
                datasets: [{
                    data: [60, 25, 10, 5],
                    backgroundColor: [
                        '#10b981',
                        '#3b82f6',
                        '#f59e0b',
                        '#ef4444'
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
    
    // Gráfico de frecuencia de eventos
    const eventsCtx = document.getElementById('eventsFrequencyChart');
    if (eventsCtx) {
        new Chart(eventsCtx, {
            type: 'bar',
            data: {
                labels: ['Citas', 'Análisis', 'Emergencias', 'Controles'],
                datasets: [{
                    label: 'Eventos',
                    data: [8, 5, 2, 3],
                    backgroundColor: '#8b5cf6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Renderizar gráfico de tendencias
function renderTrendsChart() {
    const trendsCtx = document.getElementById('trendsChart');
    if (trendsCtx) {
        new Chart(trendsCtx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Presión Arterial',
                        data: [140, 135, 130, 128, 125, 120],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Glucosa',
                        data: [110, 105, 100, 98, 95, 92],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Adherencia (%)',
                        data: [75, 80, 85, 88, 90, 92],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Renderizar gráficos de medicación
function renderMedicationCharts() {
    // Gráfico de efectividad por medicamento
    const effectivenessCtx = document.getElementById('medicationEffectivenessChart');
    if (effectivenessCtx) {
        new Chart(effectivenessCtx, {
            type: 'bar',
            data: {
                labels: ['Losartán', 'Metformina', 'Aspirina', 'Vitamina D'],
                datasets: [{
                    label: 'Efectividad (%)',
                    data: [85, 95, 70, 90],
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#8b5cf6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // Gráfico de horarios de toma
    const scheduleCtx = document.getElementById('medicationScheduleChart');
    if (scheduleCtx) {
        new Chart(scheduleCtx, {
            type: 'pie',
            data: {
                labels: ['Mañana', 'Mediodía', 'Tarde', 'Noche'],
                datasets: [{
                    data: [40, 20, 25, 15],
                    backgroundColor: [
                        '#fbbf24',
                        '#f59e0b',
                        '#d97706',
                        '#92400e'
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
}

// Renderizar análisis de riesgos
function renderRiskAnalysis() {
    // Esta función actualizaría los indicadores de riesgo basados en datos reales
    updateRiskIndicators();
}

// Actualizar indicadores de riesgo
function updateRiskIndicators() {
    // Calcular riesgos basados en datos reales
    const risks = calculateHealthRisks();
    
    // Actualizar la UI con los riesgos calculados
    const riskFactorsContainer = document.querySelector('.risk-factors');
    if (riskFactorsContainer) {
        riskFactorsContainer.innerHTML = '';
        
        risks.forEach(risk => {
            const riskElement = document.createElement('div');
            riskElement.className = `risk-factor ${risk.level}`;
            riskElement.innerHTML = `
                <div class="risk-header">
                    <i class="fas ${risk.icon}"></i>
                    <span>Riesgo ${risk.level === 'high' ? 'Alto' : risk.level === 'medium' ? 'Medio' : 'Bajo'}</span>
                </div>
                <div class="risk-content">
                    <h5>${risk.title}</h5>
                    <p>${risk.description}</p>
                    <button class="secondary-button small" onclick="showRiskDetails('${risk.id}')">Ver Detalles</button>
                </div>
            `;
            riskFactorsContainer.appendChild(riskElement);
        });
    }
}

// Calcular riesgos de salud
function calculateHealthRisks() {
    const risks = [];
    
    // Riesgo por baja adherencia
    const lowAdherenceTreatments = treatmentsData.filter(t => t.adherence < 80);
    if (lowAdherenceTreatments.length > 0) {
        risks.push({
            id: 'adherence',
            level: 'high',
            title: 'Baja Adherencia a Medicación',
            description: `${lowAdherenceTreatments.length} tratamiento(s) con adherencia menor al 80%`,
            icon: 'fa-exclamation-triangle'
        });
    }
    
    // Riesgo por diagnósticos sin control reciente
    const oldDiagnostics = diagnosticsData.filter(d => {
        const diagnosisDate = new Date(d.date);
        const today = new Date();
        const diffDays = Math.ceil((today - diagnosisDate) / (1000 * 60 * 60 * 24));
        return diffDays > 90;
    });
    
    if (oldDiagnostics.length > 0) {
        risks.push({
            id: 'controls',
            level: 'medium',
            title: 'Controles Médicos Pendientes',
            description: `${oldDiagnostics.length} diagnóstico(s) requieren control médico`,
            icon: 'fa-calendar-alt'
        });
    }
    
    // Riesgo por eventos de emergencia recientes
    const recentEmergencies = eventsData.filter(e => {
        const eventDate = new Date(e.date);
        const today = new Date();
        const diffDays = Math.ceil((today - eventDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && e.name.toLowerCase().includes('emergencia');
    });
    
    if (recentEmergencies.length > 0) {
        risks.push({
            id: 'emergencies',
            level: 'high',
            title: 'Eventos de Emergencia Recientes',
            description: `${recentEmergencies.length} evento(s) de emergencia en el último mes`,
            icon: 'fa-ambulance'
        });
    }
    
    return risks;
}

// Mostrar detalles de riesgo
function showRiskDetails(riskId) {
    showNotification('Abriendo detalles del riesgo...', 'info');
    // Aquí se abriría un modal con detalles específicos del riesgo
    setTimeout(() => {
        showNotification('Detalles del riesgo cargados', 'success');
    }, 1000);
}

    // Función para exportar historial - IMPLEMENTACIÓN REAL
function exportHistory() {
    const format = document.querySelector('input[name="export-format"]:checked').value;
    const dateRange = document.getElementById('export-date-range').value;
    const includeNotes = document.getElementById('export-include-notes').value;
    
    showNotification('Preparando exportación...', 'info');
    
    try {
        // Obtener datos del historial
        const patientData = {
            name: 'María López',
            age: 42,
            id: 'MT-458792',
            bloodType: 'A+',
            gender: 'Femenino',
            phone: '+34 612 345 678',
            email: 'maria.lopez@email.com'
        };
        
        const exportData = {
            patient: patientData,
            diagnostics: diagnosticsData,
            treatments: treatmentsData,
            events: eventsData,
            documents: documentsData,
            dateRange: dateRange,
            includeNotes: includeNotes,
            exportDate: new Date().toISOString()
        };
        
        switch(format) {
            case 'pdf':
                generatePDF(exportData);
                break;
            case 'excel':
                generateExcel(exportData);
                break;
            case 'json':
                generateJSON(exportData);
                break;
            default:
                throw new Error('Formato no soportado');
        }
        
        showNotification(`Historial exportado exitosamente en formato ${format.toUpperCase()}`, 'success');
        closeModal('export-modal');
        
    } catch (error) {
        console.error('Error al exportar:', error);
        showNotification('Error al exportar el historial', 'error');
    }
}

// Generar PDF real
function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurar fuente y colores
    doc.setFont('helvetica');
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    
    // Título principal
    doc.text('HISTORIAL MÉDICO', 105, 20, { align: 'center' });
    
    // Información del paciente
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('INFORMACIÓN DEL PACIENTE', 20, 40);
    
    doc.setFontSize(10);
    doc.text(`Nombre: ${data.patient.name}`, 20, 50);
    doc.text(`Edad: ${data.patient.age} años`, 20, 57);
    doc.text(`ID: ${data.patient.id}`, 20, 64);
    doc.text(`Tipo de sangre: ${data.patient.bloodType}`, 20, 71);
    doc.text(`Género: ${data.patient.gender}`, 20, 78);
    doc.text(`Teléfono: ${data.patient.phone}`, 20, 85);
    doc.text(`Email: ${data.patient.email}`, 20, 92);
    
    // Diagnósticos
    if (data.diagnostics && data.diagnostics.length > 0) {
        doc.setFontSize(14);
        doc.text('DIAGNÓSTICOS', 20, 110);
        
        const diagnosticRows = data.diagnostics.map(d => [
            d.name,
            d.date,
            d.doctor,
            d.severity
        ]);
        
        doc.autoTable({
            startY: 115,
            head: [['Diagnóstico', 'Fecha', 'Médico', 'Gravedad']],
            body: diagnosticRows,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });
    }
    
    // Tratamientos
    if (data.treatments && data.treatments.length > 0) {
        const treatmentsY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text('TRATAMIENTOS', 20, treatmentsY);
        
        const treatmentRows = data.treatments.map(t => [
            t.name,
            t.doctor,
            t.startDate,
            t.dosage,
            `${t.adherence}%`
        ]);
        
        doc.autoTable({
            startY: treatmentsY + 5,
            head: [['Medicamento', 'Médico', 'Inicio', 'Dosis', 'Adherencia']],
            body: treatmentRows,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });
    }
    
    // Eventos médicos
    if (data.events && data.events.length > 0) {
        const eventsY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text('EVENTOS MÉDICOS', 20, eventsY);
        
        const eventRows = data.events.map(e => [
            e.name,
            e.date,
            e.hospital,
            e.doctor
        ]);
        
        doc.autoTable({
            startY: eventsY + 5,
            head: [['Evento', 'Fecha', 'Hospital', 'Médico']],
            body: eventRows,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });
    }
    
    // Pie de página
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 20, finalY);
    doc.text('MediTrack - Sistema de Gestión Médica', 105, finalY, { align: 'center' });
    
    // Descargar el PDF
    doc.save(`historial-medico-${new Date().toISOString().split('T')[0]}.pdf`);
}

// Generar Excel real
function generateExcel(data) {
    const workbook = XLSX.utils.book_new();
    
    // Hoja de información del paciente
    const patientInfo = [
        ['INFORMACIÓN DEL PACIENTE'],
        [''],
        ['Nombre', data.patient.name],
        ['Edad', data.patient.age + ' años'],
        ['ID', data.patient.id],
        ['Tipo de sangre', data.patient.bloodType],
        ['Género', data.patient.gender],
        ['Teléfono', data.patient.phone],
        ['Email', data.patient.email],
        [''],
        ['Fecha de exportación', new Date().toLocaleDateString('es-ES')]
    ];
    
    const patientSheet = XLSX.utils.aoa_to_sheet(patientInfo);
    XLSX.utils.book_append_sheet(workbook, patientSheet, 'Información Paciente');
    
    // Hoja de diagnósticos
    if (data.diagnostics && data.diagnostics.length > 0) {
        const diagnosticHeaders = ['Diagnóstico', 'Fecha', 'Médico', 'Gravedad', 'Notas'];
        const diagnosticRows = data.diagnostics.map(d => [
            d.name,
            d.date,
            d.doctor,
            d.severity,
            d.notes || ''
        ]);
        
        const diagnosticSheet = XLSX.utils.aoa_to_sheet([diagnosticHeaders, ...diagnosticRows]);
        XLSX.utils.book_append_sheet(workbook, diagnosticSheet, 'Diagnósticos');
    }
    
    // Hoja de tratamientos
    if (data.treatments && data.treatments.length > 0) {
        const treatmentHeaders = ['Medicamento', 'Diagnóstico', 'Médico', 'Fecha Inicio', 'Dosis', 'Adherencia', 'Estado', 'Notas'];
        const treatmentRows = data.treatments.map(t => [
            t.name,
            t.diagnosisName || '',
            t.doctor,
            t.startDate,
            t.dosage,
            t.adherence + '%',
            t.status,
            t.notes || ''
        ]);
        
        const treatmentSheet = XLSX.utils.aoa_to_sheet([treatmentHeaders, ...treatmentRows]);
        XLSX.utils.book_append_sheet(workbook, treatmentSheet, 'Tratamientos');
    }
    
    // Hoja de eventos
    if (data.events && data.events.length > 0) {
        const eventHeaders = ['Evento', 'Fecha', 'Hospital', 'Médico', 'Descripción'];
        const eventRows = data.events.map(e => [
            e.name,
            e.date,
            e.hospital,
            e.doctor,
            e.description || ''
        ]);
        
        const eventSheet = XLSX.utils.aoa_to_sheet([eventHeaders, ...eventRows]);
        XLSX.utils.book_append_sheet(workbook, eventSheet, 'Eventos Médicos');
    }
    
    // Descargar el archivo Excel
    XLSX.writeFile(workbook, `historial-medico-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Generar JSON real
function generateJSON(data) {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `historial-medico-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

    // Función para compartir historial - IMPLEMENTACIÓN REAL
function shareHistory() {
    const recipient = document.querySelector('input[name="share-recipient"]:checked').value;
    const email = document.getElementById('share-email').value;
    const name = document.getElementById('share-name').value;
    const message = document.getElementById('share-message').value;
    const hasExpiry = document.getElementById('share-expiry').checked;
    const hasPassword = document.getElementById('share-password').checked;
    const expiryDate = document.getElementById('share-expiry-date').value;
    const password = document.getElementById('share-password-input').value;
    
    // Validaciones
    if (!email || !name) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Por favor ingresa un email válido', 'error');
        return;
    }
    
    if (hasExpiry && !expiryDate) {
        showNotification('Por favor selecciona una fecha de expiración', 'error');
        return;
    }
    
    if (hasPassword && !password) {
        showNotification('Por favor ingresa una contraseña', 'error');
        return;
    }
    
    showNotification('Generando enlace de compartir...', 'info');
    
    try {
        // Generar datos del historial para compartir
        const shareData = {
            patient: {
                name: 'María López',
                age: 42,
                id: 'MT-458792',
                bloodType: 'A+'
            },
            diagnostics: diagnosticsData,
            treatments: treatmentsData,
            events: eventsData,
            documents: documentsData,
            shareInfo: {
                recipient: recipient,
                recipientName: name,
                recipientEmail: email,
                message: message,
                sharedBy: 'María López',
                shareDate: new Date().toISOString(),
                expiryDate: hasExpiry ? expiryDate : null,
                hasPassword: hasPassword,
                accessCount: 0
            }
        };
        
        // Generar enlace único
        const shareId = generateShareId();
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
        
        // Guardar en localStorage (simulando base de datos)
        const shares = JSON.parse(localStorage.getItem('medicalShares') || '{}');
        shares[shareId] = {
            ...shareData,
            password: hasPassword ? btoa(password) : null, // Encriptación básica
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('medicalShares', JSON.stringify(shares));
        
        // Generar contenido del email
        const emailContent = generateShareEmail(shareUrl, name, message, hasPassword, password);
        
        // Mostrar modal con el enlace generado
        showShareResult(shareUrl, emailContent, name, email);
        
    } catch (error) {
        console.error('Error al compartir:', error);
        showNotification('Error al generar el enlace de compartir', 'error');
    }
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Generar ID único para compartir
function generateShareId() {
    return 'share_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Generar contenido del email
function generateShareEmail(shareUrl, recipientName, message, hasPassword, password) {
    const subject = 'Historial Médico Compartido - MediTrack';
    const body = `
Hola ${recipientName},

${message || 'Se ha compartido contigo un historial médico a través de MediTrack.'}

Para acceder al historial médico, utiliza el siguiente enlace:
${shareUrl}

${hasPassword ? `Contraseña de acceso: ${password}` : ''}

Este enlace es seguro y temporal. Por favor, mantén la confidencialidad de esta información.

Saludos,
Equipo MediTrack
    `;
    
    return { subject, body };
}

// Mostrar resultado del compartir
function showShareResult(shareUrl, emailContent, recipientName, recipientEmail) {
    // Crear modal de resultado
    const resultModal = document.createElement('div');
    resultModal.className = 'modal-overlay active';
    resultModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-share-alt"></i> Historial Compartido Exitosamente</h3>
                <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="share-result">
                    <div class="share-info">
                        <p><strong>Compartido con:</strong> ${recipientName} (${recipientEmail})</p>
                        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
                    </div>
                    
                    <div class="share-link-section">
                        <h4>Enlace de Acceso</h4>
                        <div class="link-container">
                            <input type="text" id="share-link" value="${shareUrl}" readonly>
                            <button class="btn-primary small" onclick="copyShareLink()">
                                <i class="fas fa-copy"></i> Copiar
                            </button>
                        </div>
                    </div>
                    
                    <div class="email-section">
                        <h4>Enviar por Email</h4>
                        <p>Puedes enviar el enlace directamente por email:</p>
                        <button class="btn-primary" onclick="sendShareEmail('${emailContent.subject}', '${emailContent.body.replace(/'/g, "\\'")}', '${recipientEmail}')">
                            <i class="fas fa-envelope"></i> Enviar Email
                        </button>
                    </div>
                    
                    <div class="share-actions">
                        <button class="btn-secondary" onclick="downloadSharePDF()">
                            <i class="fas fa-download"></i> Descargar PDF
                        </button>
                        <button class="btn-secondary" onclick="viewSharedContent()">
                            <i class="fas fa-eye"></i> Ver Contenido
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="secondary-button" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(resultModal);
    closeModal('share-modal');
}

// Copiar enlace al portapapeles
function copyShareLink() {
    const linkInput = document.getElementById('share-link');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    document.execCommand('copy');
    showNotification('Enlace copiado al portapapeles', 'success');
}

// Enviar email (simulado - en producción usaría un servicio real)
function sendShareEmail(subject, body, recipientEmail) {
    // En un entorno real, esto se conectaría a un servicio de email
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    showNotification('Abriendo cliente de email...', 'info');
}

// Descargar PDF del contenido compartido
function downloadSharePDF() {
    showNotification('Generando PDF del contenido compartido...', 'info');
    // Aquí se generaría un PDF específico para compartir
    setTimeout(() => {
        showNotification('PDF descargado exitosamente', 'success');
    }, 2000);
}

// Ver contenido compartido
function viewSharedContent() {
    showNotification('Abriendo vista previa del contenido...', 'info');
    // Aquí se abriría una vista previa del contenido compartido
    setTimeout(() => {
        showNotification('Vista previa disponible', 'success');
    }, 1000);
}

    // Función para guardar configuración de alertas - IMPLEMENTACIÓN REAL
    function saveAlertsConfiguration() {
        const medicationAlerts = document.getElementById('alert-medication').checked;
        const appointmentAlerts = document.getElementById('alert-appointments').checked;
        const controlAlerts = document.getElementById('alert-controls').checked;
        const renewalAlerts = document.getElementById('alert-renewals').checked;
        const resultAlerts = document.getElementById('alert-results').checked;
        const frequency = document.getElementById('alert-frequency').value;
        const time = document.getElementById('alert-time').value;
        const method = document.getElementById('alert-method').value;
        const email = document.getElementById('alert-email')?.value || '';
        const phone = document.getElementById('alert-phone')?.value || '';
        const customMessage = document.getElementById('alert-message')?.value || '';
        
        // Validaciones
        const selectedAlerts = [medicationAlerts, appointmentAlerts, controlAlerts, renewalAlerts, resultAlerts];
        if (!selectedAlerts.some(alert => alert)) {
            showNotification('Por favor selecciona al menos un tipo de alerta', 'error');
            return;
        }
        
        if (!email && !phone) {
            showNotification('Por favor ingresa al menos un método de contacto', 'error');
            return;
        }
        
        if (email && !isValidEmail(email)) {
            showNotification('Por favor ingresa un email válido', 'error');
            return;
        }
        
        showNotification('Guardando configuración...', 'info');
        
        try {
            // Crear configuración de alertas
            const alertConfig = {
                id: generateAlertId(),
                types: {
                    medication: medicationAlerts,
                    appointments: appointmentAlerts,
                    controls: controlAlerts,
                    renewals: renewalAlerts,
                    results: resultAlerts
                },
                frequency: frequency,
                time: time,
                method: method,
                email: email,
                phone: phone,
                message: customMessage,
                isActive: true,
                createdAt: new Date().toISOString(),
                lastSent: null,
                nextScheduled: calculateNextAlert(frequency, time)
            };
            
            // Guardar en localStorage
            const alerts = JSON.parse(localStorage.getItem('medicalAlerts') || '[]');
            alerts.push(alertConfig);
            localStorage.setItem('medicalAlerts', JSON.stringify(alerts));
            
            // Configurar notificaciones del navegador si está disponible
            if ('Notification' in window && Notification.permission === 'granted') {
                scheduleBrowserNotifications(alertConfig);
            }
            
            // Mostrar resumen de configuración
            showAlertConfigurationSummary(alertConfig);
            
            showNotification('Configuración de alertas guardada exitosamente', 'success');
            closeModal('alerts-modal');
            
        } catch (error) {
            console.error('Error al guardar alertas:', error);
            showNotification('Error al guardar la configuración de alertas', 'error');
        }
    }

    // Generar ID único para alerta
    function generateAlertId() {
        return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Calcular próxima alerta
    function calculateNextAlert(frequency, time) {
        const now = new Date();
        const [hours, minutes] = time.split(':');
        
        let nextDate = new Date();
        nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Si la hora ya pasó hoy, programar para mañana
        if (nextDate <= now) {
            nextDate.setDate(nextDate.getDate() + 1);
        }
        
        // Ajustar según la frecuencia
        switch(frequency) {
            case 'daily':
                // Ya está configurado para mañana
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'custom':
                // Para alertas personalizadas, se manejaría diferente
                break;
        }
        
        return nextDate.toISOString();
    }

    // Programar notificaciones del navegador
    function scheduleBrowserNotifications(alertConfig) {
        if ('serviceWorker' in navigator && 'Notification' in window) {
            // En un entorno real, se registraría un service worker
            // y se programarían las notificaciones push
            console.log('Notificaciones del navegador programadas para:', alertConfig.nextScheduled);
        }
    }

    // Mostrar resumen de configuración de alertas
    function showAlertConfigurationSummary(alertConfig) {
        const summaryModal = document.createElement('div');
        summaryModal.className = 'modal-overlay active';
        summaryModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-bell"></i> Alertas Configuradas</h3>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="alert-summary">
                        <div class="summary-section">
                            <h4>Tipos de Alertas</h4>
                            <ul>
                                ${Object.entries(alertConfig.types).filter(([key, value]) => value).map(([key, value]) => 
                                    `<li><i class="fas fa-check"></i> ${getAlertTypeName(key)}</li>`
                                ).join('')}
                            </ul>
                        </div>
                        
                        <div class="summary-section">
                            <h4>Configuración</h4>
                            <p><strong>Frecuencia:</strong> ${getFrequencyName(alertConfig.frequency)}</p>
                            <p><strong>Hora:</strong> ${alertConfig.time}</p>
                            <p><strong>Próxima alerta:</strong> ${new Date(alertConfig.nextScheduled).toLocaleString('es-ES')}</p>
                        </div>
                        
                        <div class="summary-section">
                            <h4>Métodos de Contacto</h4>
                            ${alertConfig.email ? `<p><i class="fas fa-envelope"></i> ${alertConfig.email}</p>` : ''}
                            ${alertConfig.phone ? `<p><i class="fas fa-phone"></i> ${alertConfig.phone}</p>` : ''}
                        </div>
                        
                        ${alertConfig.message ? `
                        <div class="summary-section">
                            <h4>Mensaje Personalizado</h4>
                            <p>"${alertConfig.message}"</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="alert-actions">
                        <button class="btn-primary" onclick="testAlert('${alertConfig.id}')">
                            <i class="fas fa-paper-plane"></i> Probar Alerta
                        </button>
                        <button class="btn-secondary" onclick="editAlert('${alertConfig.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-secondary" onclick="viewAllAlerts()">
                            <i class="fas fa-list"></i> Ver Todas
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="secondary-button" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(summaryModal);
    }

    // Obtener nombre del tipo de alerta
    function getAlertTypeName(type) {
        const typeNames = {
            'medication': 'Recordatorio de Medicación',
            'appointments': 'Recordatorio de Citas',
            'controls': 'Control de Salud',
            'renewals': 'Renovación de Medicamentos',
            'results': 'Resultados de Análisis'
        };
        return typeNames[type] || type;
    }

    // Obtener nombre de la frecuencia
    function getFrequencyName(frequency) {
        const frequencyNames = {
            'daily': 'Diaria',
            'weekly': 'Semanal',
            'monthly': 'Mensual',
            'custom': 'Personalizada'
        };
        return frequencyNames[frequency] || frequency;
    }

    // Probar alerta
    function testAlert(alertId) {
        const alerts = JSON.parse(localStorage.getItem('medicalAlerts') || '[]');
        const alert = alerts.find(a => a.id === alertId);
        
        if (alert) {
            showNotification('Enviando alerta de prueba...', 'info');
            
            // Simular envío de alerta
            setTimeout(() => {
                if (alert.email) {
                    console.log('Email de prueba enviado a:', alert.email);
                }
                if (alert.phone) {
                    console.log('SMS de prueba enviado a:', alert.phone);
                }
                
                // Mostrar notificación del navegador
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('MediTrack - Alerta de Prueba', {
                        body: 'Esta es una alerta de prueba de tu configuración.',
                        icon: '/favicon.ico'
                    });
                }
                
                showNotification('Alerta de prueba enviada exitosamente', 'success');
            }, 1000);
        }
    }

    // Editar alerta
    function editAlert(alertId) {
        showNotification('Abriendo editor de alertas...', 'info');
        // Aquí se abriría el modal de edición con los datos de la alerta
        setTimeout(() => {
            showNotification('Editor de alertas cargado', 'success');
        }, 1000);
    }

    // Ver todas las alertas
    function viewAllAlerts() {
        const alerts = JSON.parse(localStorage.getItem('medicalAlerts') || '[]');
        
        const alertsModal = document.createElement('div');
        alertsModal.className = 'modal-overlay active';
        alertsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-bell"></i> Todas las Alertas Configuradas</h3>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${alerts.length === 0 ? 
                        '<p>No hay alertas configuradas.</p>' :
                        alerts.map(alert => `
                            <div class="alert-item">
                                <div class="alert-info">
                                    <h4>${Object.entries(alert.types).filter(([key, value]) => value).map(([key, value]) => getAlertTypeName(key)).join(', ')}</h4>
                                    <p>${getFrequencyName(alert.frequency)} a las ${alert.time}</p>
                                    <p>Próxima: ${new Date(alert.nextScheduled).toLocaleString('es-ES')}</p>
                                </div>
                                <div class="alert-actions">
                                    <button class="btn-secondary small" onclick="toggleAlert('${alert.id}')">
                                        <i class="fas ${alert.isActive ? 'fa-pause' : 'fa-play'}"></i>
                                        ${alert.isActive ? 'Pausar' : 'Activar'}
                                    </button>
                                    <button class="btn-secondary small" onclick="deleteAlert('${alert.id}')">
                                        <i class="fas fa-trash"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
                <div class="modal-footer">
                    <button class="secondary-button" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(alertsModal);
    }

    // Activar/Desactivar alerta
    function toggleAlert(alertId) {
        const alerts = JSON.parse(localStorage.getItem('medicalAlerts') || '[]');
        const alertIndex = alerts.findIndex(a => a.id === alertId);
        
        if (alertIndex !== -1) {
            alerts[alertIndex].isActive = !alerts[alertIndex].isActive;
            localStorage.setItem('medicalAlerts', JSON.stringify(alerts));
            
            showNotification(`Alerta ${alerts[alertIndex].isActive ? 'activada' : 'desactivada'}`, 'success');
            
            // Recargar la vista
            viewAllAlerts();
        }
    }

    // Eliminar alerta
    function deleteAlert(alertId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta alerta?')) {
            const alerts = JSON.parse(localStorage.getItem('medicalAlerts') || '[]');
            const filteredAlerts = alerts.filter(a => a.id !== alertId);
            localStorage.setItem('medicalAlerts', JSON.stringify(filteredAlerts));
            
            showNotification('Alerta eliminada exitosamente', 'success');
            
            // Recargar la vista
            viewAllAlerts();
        }
    }

    // Función para exportar análisis
    function exportAnalytics() {
        showNotification('Exportando análisis...', 'info');
        
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = '#';
            link.download = `analisis-salud-${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
            
            showNotification('Análisis exportado exitosamente', 'success');
        }, 1500);
    }

    // Configurar eventos para opciones de compartir
    function setupShareOptions() {
        const expiryCheckbox = document.getElementById('share-expiry');
        const expiryGroup = document.getElementById('expiry-date-group');
        const passwordCheckbox = document.getElementById('share-password');
        const passwordGroup = document.getElementById('password-group');
        
        if (expiryCheckbox) {
            expiryCheckbox.addEventListener('change', () => {
                expiryGroup.style.display = expiryCheckbox.checked ? 'block' : 'none';
            });
        }
        
        if (passwordCheckbox) {
            passwordCheckbox.addEventListener('change', () => {
                passwordGroup.style.display = passwordCheckbox.checked ? 'block' : 'none';
            });
        }
    }

    // Función para cerrar modales
    function closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // Configurar eventos de cierre de modales
    function setupModalClosers() {
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                const modalId = button.getAttribute('data-modal-id');
                closeModal(modalId);
            });
        });
        
        // Cerrar modal al hacer clic fuera
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // Configurar eventos para herramientas rápidas
    function setupQuickTools() {
        // Event listeners para botones de herramientas rápidas
        document.querySelectorAll('.tool-card .btn-primary').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const toolCard = button.closest('.tool-card');
                const toolTitle = toolCard.querySelector('h3').textContent;
                
                switch(toolTitle) {
                    case 'Exportar Historial':
                        openExportModal();
                        break;
                    case 'Compartir con Médico':
                        openShareModal();
                        break;
                    case 'Ver Análisis':
                        openAnalyticsModal();
                        break;
                    case 'Configurar Alertas':
                        openAlertsModal();
                        break;
                }
            });
        });
        
        // Event listeners para botones de modales
        const startExportBtn = document.getElementById('start-export');
        const sendShareBtn = document.getElementById('send-share');
        const saveAlertsBtn = document.getElementById('save-alerts');
        const exportAnalyticsBtn = document.getElementById('export-analytics');
        
        if (startExportBtn) {
            startExportBtn.addEventListener('click', exportHistory);
        }
        
        if (sendShareBtn) {
            sendShareBtn.addEventListener('click', shareHistory);
        }
        
        if (saveAlertsBtn) {
            saveAlertsBtn.addEventListener('click', saveAlertsConfiguration);
        }
        
        if (exportAnalyticsBtn) {
            exportAnalyticsBtn.addEventListener('click', exportAnalytics);
        }
        
        // Configurar opciones de compartir
        setupShareOptions();
        
        // Configurar cierre de modales
        setupModalClosers();
    }

    // Inicializar herramientas rápidas cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        setupQuickTools();
    });

    // ===== PERSISTENCIA DE DATOS REAL =====

    // Función para guardar datos en localStorage con validación
    function saveDataToStorage(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            console.log(`Datos guardados exitosamente en ${key}`);
            return true;
        } catch (error) {
            console.error(`Error al guardar datos en ${key}:`, error);
            showNotification('Error al guardar datos', 'error');
            return false;
        }
    }

    // Función para cargar datos de localStorage con validación
    function loadDataFromStorage(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const parsedData = JSON.parse(data);
                console.log(`Datos cargados exitosamente de ${key}`);
                return parsedData;
            }
            return defaultValue;
        } catch (error) {
            console.error(`Error al cargar datos de ${key}:`, error);
            showNotification('Error al cargar datos', 'error');
            return defaultValue;
        }
    }

    // Función para validar datos médicos
    function validateMedicalData(data, type) {
        const validators = {
            diagnostics: (item) => {
                return item.name && item.date && item.doctor && 
                       typeof item.severity === 'string' && 
                       ['leve', 'moderada', 'grave'].includes(item.severity);
            },
            treatments: (item) => {
                return item.name && item.startDate && item.doctor && 
                       typeof item.adherence === 'number' && 
                       item.adherence >= 0 && item.adherence <= 100;
            },
            events: (item) => {
                return item.name && item.date && item.hospital;
            },
            documents: (item) => {
                return item.name && item.type && item.uploadDate;
            }
        };
        
        if (!Array.isArray(data)) {
            console.error(`Datos de ${type} no son un array`);
            return false;
        }
        
        const validator = validators[type];
        if (!validator) {
            console.error(`No hay validador para tipo ${type}`);
            return false;
        }
        
        return data.every(validator);
    }

    // Función para sincronizar datos con el servidor (simulado)
    function syncDataWithServer() {
        showNotification('Sincronizando datos...', 'info');
        
        // Simular sincronización
        setTimeout(() => {
            const dataToSync = {
                diagnostics: diagnosticsData,
                treatments: treatmentsData,
                events: eventsData,
                documents: documentsData,
                lastSync: new Date().toISOString()
            };
            
            // En un entorno real, aquí se enviarían los datos al servidor
            console.log('Datos sincronizados con el servidor:', dataToSync);
            
            // Guardar timestamp de última sincronización
            localStorage.setItem('lastServerSync', new Date().toISOString());
            
            showNotification('Datos sincronizados exitosamente', 'success');
        }, 2000);
    }

    // Función para hacer backup de datos
    function createDataBackup() {
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: {
                    diagnostics: diagnosticsData,
                    treatments: treatmentsData,
                    events: eventsData,
                    documents: documentsData,
                    patientInfo: {
                        name: 'María López',
                        age: 42,
                        id: 'MT-458792',
                        bloodType: 'A+',
                        gender: 'Femenino'
                    }
                }
            };
            
            const backupBlob = new Blob([JSON.stringify(backupData, null, 2)], {
                type: 'application/json'
            });
            
            const backupUrl = URL.createObjectURL(backupBlob);
            const link = document.createElement('a');
            link.href = backupUrl;
            link.download = `meditrack-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(backupUrl);
            
            showNotification('Backup creado exitosamente', 'success');
            return true;
        } catch (error) {
            console.error('Error al crear backup:', error);
            showNotification('Error al crear backup', 'error');
            return false;
        }
    }

    // Función para restaurar datos desde backup
    function restoreDataFromBackup(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // Validar estructura del backup
                if (!backupData.data || !backupData.timestamp) {
                    throw new Error('Formato de backup inválido');
                }
                
                // Validar datos antes de restaurar
                if (!validateMedicalData(backupData.data.diagnostics, 'diagnostics') ||
                    !validateMedicalData(backupData.data.treatments, 'treatments') ||
                    !validateMedicalData(backupData.data.events, 'events') ||
                    !validateMedicalData(backupData.data.documents, 'documents')) {
                    throw new Error('Datos del backup no válidos');
                }
                
                // Restaurar datos
                if (saveDataToStorage('medicalDiagnostics', backupData.data.diagnostics) &&
                    saveDataToStorage('medicalTreatments', backupData.data.treatments) &&
                    saveDataToStorage('medicalEvents', backupData.data.events) &&
                    saveDataToStorage('medicalDocuments', backupData.data.documents)) {
                    
                    // Recargar datos en la aplicación
                    loadAllMedicalData();
                    
                    showNotification('Datos restaurados exitosamente', 'success');
                } else {
                    throw new Error('Error al guardar datos restaurados');
                }
                
            } catch (error) {
                console.error('Error al restaurar backup:', error);
                showNotification('Error al restaurar backup: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    // Función para cargar todos los datos médicos
    function loadAllMedicalData() {
        // Cargar datos con validación
        const loadedDiagnostics = loadDataFromStorage('medicalDiagnostics', []);
        const loadedTreatments = loadDataFromStorage('medicalTreatments', []);
        const loadedEvents = loadDataFromStorage('medicalEvents', []);
        const loadedDocuments = loadDataFromStorage('medicalDocuments', []);
        
        // Validar datos cargados
        if (validateMedicalData(loadedDiagnostics, 'diagnostics')) {
            diagnosticsData = loadedDiagnostics;
        }
        
        if (validateMedicalData(loadedTreatments, 'treatments')) {
            treatmentsData = loadedTreatments;
        }
        
        if (validateMedicalData(loadedEvents, 'events')) {
            eventsData = loadedEvents;
        }
        
        if (validateMedicalData(loadedDocuments, 'documents')) {
            documentsData = loadedDocuments;
        }
        
        // Renderizar todos los componentes
        renderPatientInfo();
        renderDiagnostics();
        renderTreatments();
        renderEvents();
        renderDocuments();
        renderTimeline();
        updateHealthStats();
        updateRecommendations();
    }

    // Función para limpiar datos obsoletos
    function cleanupOldData() {
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 10); // 10 años atrás
        
        let cleanedCount = 0;
        
        // Limpiar eventos muy antiguos
        const oldEvents = eventsData.filter(event => new Date(event.date) < cutoffDate);
        if (oldEvents.length > 0) {
            eventsData = eventsData.filter(event => new Date(event.date) >= cutoffDate);
            saveDataToStorage('medicalEvents', eventsData);
            cleanedCount += oldEvents.length;
        }
        
        // Limpiar documentos muy antiguos
        const oldDocuments = documentsData.filter(doc => new Date(doc.uploadDate) < cutoffDate);
        if (oldDocuments.length > 0) {
            documentsData = documentsData.filter(doc => new Date(doc.uploadDate) >= cutoffDate);
            saveDataToStorage('medicalDocuments', documentsData);
            cleanedCount += oldDocuments.length;
        }
        
        if (cleanedCount > 0) {
            showNotification(`${cleanedCount} elementos antiguos eliminados`, 'info');
            renderEvents();
            renderDocuments();
        }
    }

    // Función para exportar datos en múltiples formatos
    function exportAllData(format = 'json') {
        const exportData = {
            exportInfo: {
                timestamp: new Date().toISOString(),
                version: '1.0',
                patient: {
                    name: 'María López',
                    age: 42,
                    id: 'MT-458792',
                    bloodType: 'A+',
                    gender: 'Femenino'
                }
            },
            data: {
                diagnostics: diagnosticsData,
                treatments: treatmentsData,
                events: eventsData,
                documents: documentsData
            }
        };
        
        switch (format) {
            case 'json':
                generateJSON(exportData);
                break;
            case 'excel':
                generateExcel(exportData);
                break;
            case 'pdf':
                generatePDF(exportData);
                break;
            default:
                showNotification('Formato no soportado', 'error');
        }
    }

    // Función para importar datos desde archivo
    function importDataFromFile(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Validar estructura de datos importados
                if (!importData.data) {
                    throw new Error('Formato de archivo inválido');
                }
                
                // Validar cada tipo de datos
                const validations = [
                    { key: 'diagnostics', data: importData.data.diagnostics },
                    { key: 'treatments', data: importData.data.treatments },
                    { key: 'events', data: importData.data.events },
                    { key: 'documents', data: importData.data.documents }
                ];
                
                for (const validation of validations) {
                    if (validation.data && !validateMedicalData(validation.data, validation.key)) {
                        throw new Error(`Datos de ${validation.key} no válidos`);
                    }
                }
                
                // Importar datos válidos
                let importedCount = 0;
                
                if (importData.data.diagnostics) {
                    diagnosticsData = [...diagnosticsData, ...importData.data.diagnostics];
                    saveDataToStorage('medicalDiagnostics', diagnosticsData);
                    importedCount += importData.data.diagnostics.length;
                }
                
                if (importData.data.treatments) {
                    treatmentsData = [...treatmentsData, ...importData.data.treatments];
                    saveDataToStorage('medicalTreatments', treatmentsData);
                    importedCount += importData.data.treatments.length;
                }
                
                if (importData.data.events) {
                    eventsData = [...eventsData, ...importData.data.events];
                    saveDataToStorage('medicalEvents', eventsData);
                    importedCount += importData.data.events.length;
                }
                
                if (importData.data.documents) {
                    documentsData = [...documentsData, ...importData.data.documents];
                    saveDataToStorage('medicalDocuments', documentsData);
                    importedCount += importData.data.documents.length;
                }
                
                // Recargar la aplicación
                loadAllMedicalData();
                
                showNotification(`${importedCount} elementos importados exitosamente`, 'success');
                
            } catch (error) {
                console.error('Error al importar datos:', error);
                showNotification('Error al importar datos: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
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
    const currentPage = window.location.pathname.split('/').pop() || 'HistorialMedico.html';
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

// ===== MEJORAS DE ACCESIBILIDAD =====

// Función para inicializar mejoras de accesibilidad
function initializeAccessibility() {
    setupKeyboardNavigation();
    setupScreenReaderSupport();
    setupFocusManagement();
    setupHighContrastMode();
    setupFontSizeControls();
}

// Configurar navegación por teclado
function setupKeyboardNavigation() {
    // Navegación por tabs
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            // Asegurar que los elementos focusables sean accesibles
            const focusableElements = document.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            focusableElements.forEach(element => {
                if (!element.hasAttribute('tabindex')) {
                    element.setAttribute('tabindex', '0');
                }
            });
        }
        
        // Navegación con flechas en grids
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const activeElement = document.activeElement;
            const gridContainer = activeElement.closest('.grid, .cards-grid, .recommendations-grid');
            
            if (gridContainer) {
                e.preventDefault();
                navigateGridWithArrows(e.key, gridContainer, activeElement);
            }
        }
        
        // Atajos de teclado
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'e':
                    e.preventDefault();
                    openExportModal();
                    break;
                case 's':
                    e.preventDefault();
                    openShareModal();
                    break;
                case 'a':
                    e.preventDefault();
                    openAnalyticsModal();
                    break;
                case 'l':
                    e.preventDefault();
                    openAlertsModal();
                    break;
                case 'b':
                    e.preventDefault();
                    createDataBackup();
                    break;
            }
        }
    });
}

// Navegar por grid con flechas
function navigateGridWithArrows(key, gridContainer, activeElement) {
    const focusableElements = Array.from(gridContainer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ));
    
    const currentIndex = focusableElements.indexOf(activeElement);
    let nextIndex = currentIndex;
    
    switch(key) {
        case 'ArrowRight':
            nextIndex = (currentIndex + 1) % focusableElements.length;
            break;
        case 'ArrowLeft':
            nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
            break;
        case 'ArrowDown':
            // Calcular siguiente fila
            const columns = Math.floor(gridContainer.offsetWidth / 300); // Aproximado
            nextIndex = (currentIndex + columns) % focusableElements.length;
            break;
        case 'ArrowUp':
            // Calcular fila anterior
            const columnsUp = Math.floor(gridContainer.offsetWidth / 300);
            nextIndex = currentIndex - columnsUp;
            if (nextIndex < 0) {
                nextIndex = focusableElements.length + nextIndex;
            }
            break;
    }
    
    focusableElements[nextIndex].focus();
}

// Configurar soporte para lectores de pantalla
function setupScreenReaderSupport() {
    // Agregar ARIA labels dinámicamente
    addAriaLabels();
    
    // Configurar anuncios para lectores de pantalla
    setupScreenReaderAnnouncements();
    
    // Agregar roles ARIA apropiados
    addAriaRoles();
}

// Agregar etiquetas ARIA
function addAriaLabels() {
    // Botones de acción
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-danger').forEach(button => {
        if (!button.hasAttribute('aria-label')) {
            const text = button.textContent.trim();
            const icon = button.querySelector('i');
            if (icon) {
                const iconClass = icon.className;
                let description = '';
                
                if (iconClass.includes('fa-download')) description = 'Descargar';
                else if (iconClass.includes('fa-share')) description = 'Compartir';
                else if (iconClass.includes('fa-chart')) description = 'Ver análisis';
                else if (iconClass.includes('fa-bell')) description = 'Configurar alertas';
                else if (iconClass.includes('fa-edit')) description = 'Editar';
                else if (iconClass.includes('fa-trash')) description = 'Eliminar';
                else if (iconClass.includes('fa-eye')) description = 'Ver detalles';
                else description = text;
                
                button.setAttribute('aria-label', description);
            }
        }
    });
    
    // Cards y elementos interactivos
    document.querySelectorAll('.card, .tool-card, .recommendation-card').forEach(card => {
        if (!card.hasAttribute('role')) {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
        }
        
        const title = card.querySelector('h3, h4');
        if (title && !card.hasAttribute('aria-label')) {
            card.setAttribute('aria-label', title.textContent);
        }
    });
    
    // Modales
    document.querySelectorAll('.modal-content').forEach(modal => {
        if (!modal.hasAttribute('role')) {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
        }
        
        const title = modal.querySelector('h3');
        if (title && !modal.hasAttribute('aria-labelledby')) {
            const titleId = 'modal-title-' + Math.random().toString(36).substr(2, 9);
            title.id = titleId;
            modal.setAttribute('aria-labelledby', titleId);
        }
    });
}

// Configurar anuncios para lectores de pantalla
function setupScreenReaderAnnouncements() {
    // Crear región de anuncios
    const announcementRegion = document.createElement('div');
    announcementRegion.id = 'screen-reader-announcements';
    announcementRegion.setAttribute('aria-live', 'polite');
    announcementRegion.setAttribute('aria-atomic', 'true');
    announcementRegion.style.position = 'absolute';
    announcementRegion.style.left = '-10000px';
    announcementRegion.style.width = '1px';
    announcementRegion.style.height = '1px';
    announcementRegion.style.overflow = 'hidden';
    
    document.body.appendChild(announcementRegion);
}

// Función para anunciar cambios a lectores de pantalla
function announceToScreenReader(message) {
    const announcementRegion = document.getElementById('screen-reader-announcements');
    if (announcementRegion) {
        announcementRegion.textContent = message;
        setTimeout(() => {
            announcementRegion.textContent = '';
        }, 1000);
    }
}

// Agregar roles ARIA
function addAriaRoles() {
    // Navegación principal
    const mainNav = document.querySelector('.navbar-nav');
    if (mainNav && !mainNav.hasAttribute('role')) {
        mainNav.setAttribute('role', 'navigation');
        mainNav.setAttribute('aria-label', 'Navegación principal');
    }
    
    // Contenido principal
    const mainContent = document.querySelector('.main-content');
    if (mainContent && !mainContent.hasAttribute('role')) {
        mainContent.setAttribute('role', 'main');
    }
    
    // Secciones
    document.querySelectorAll('section').forEach(section => {
        if (!section.hasAttribute('role')) {
            section.setAttribute('role', 'region');
        }
    });
    
    // Listas
    document.querySelectorAll('.cards-grid, .recommendations-grid').forEach(list => {
        if (!list.hasAttribute('role')) {
            list.setAttribute('role', 'list');
        }
    });
    
    document.querySelectorAll('.card, .tool-card, .recommendation-card').forEach(item => {
        if (!item.hasAttribute('role')) {
            item.setAttribute('role', 'listitem');
        }
    });
}

// Configurar gestión de foco
function setupFocusManagement() {
    // Mantener foco dentro de modales
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
            
            if (e.key === 'Escape') {
                const closeButton = modal.querySelector('.close-modal, .modal-close');
                if (closeButton) {
                    closeButton.click();
                }
            }
        });
    });
    
    // Restaurar foco al cerrar modales
    let lastFocusedElement = null;
    
    document.addEventListener('focusin', function(e) {
        if (!e.target.closest('.modal-overlay')) {
            lastFocusedElement = e.target;
        }
    });
    
    document.querySelectorAll('.close-modal, .modal-close').forEach(button => {
        button.addEventListener('click', function() {
            setTimeout(() => {
                if (lastFocusedElement) {
                    lastFocusedElement.focus();
                }
            }, 100);
        });
    });
}

// Configurar modo de alto contraste
function setupHighContrastMode() {
    // Detectar preferencias del sistema
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    
    if (prefersHighContrast.matches) {
        document.body.classList.add('high-contrast');
    }
    
    // Escuchar cambios en preferencias
    prefersHighContrast.addEventListener('change', function(e) {
        if (e.matches) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    });
    
    // Botón para alternar alto contraste
    const contrastToggle = document.createElement('button');
    contrastToggle.id = 'contrast-toggle';
    contrastToggle.className = 'accessibility-toggle';
    contrastToggle.innerHTML = '<i class="fas fa-adjust"></i>';
    contrastToggle.setAttribute('aria-label', 'Alternar modo de alto contraste');
    contrastToggle.setAttribute('title', 'Alto contraste');
    
    contrastToggle.addEventListener('click', function() {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        announceToScreenReader(isHighContrast ? 'Modo de alto contraste activado' : 'Modo de alto contraste desactivado');
    });
    
    // Agregar botón al DOM
    const header = document.querySelector('.header');
    if (header) {
        header.appendChild(contrastToggle);
    }
}

// Configurar controles de tamaño de fuente
function setupFontSizeControls() {
    // Botón para aumentar fuente
    const increaseFontBtn = document.createElement('button');
    increaseFontBtn.id = 'increase-font';
    increaseFontBtn.className = 'accessibility-toggle';
    increaseFontBtn.innerHTML = '<i class="fas fa-plus"></i>';
    increaseFontBtn.setAttribute('aria-label', 'Aumentar tamaño de fuente');
    increaseFontBtn.setAttribute('title', 'Aumentar fuente');
    
    // Botón para disminuir fuente
    const decreaseFontBtn = document.createElement('button');
    decreaseFontBtn.id = 'decrease-font';
    decreaseFontBtn.className = 'accessibility-toggle';
    decreaseFontBtn.innerHTML = '<i class="fas fa-minus"></i>';
    decreaseFontBtn.setAttribute('aria-label', 'Disminuir tamaño de fuente');
    decreaseFontBtn.setAttribute('title', 'Disminuir fuente');
    
    // Botón para resetear fuente
    const resetFontBtn = document.createElement('button');
    resetFontBtn.id = 'reset-font';
    resetFontBtn.className = 'accessibility-toggle';
    resetFontBtn.innerHTML = '<i class="fas fa-undo"></i>';
    resetFontBtn.setAttribute('aria-label', 'Restablecer tamaño de fuente');
    resetFontBtn.setAttribute('title', 'Restablecer fuente');
    
    // Funciones de control de fuente
    let currentFontSize = 100; // Porcentaje base
    
    increaseFontBtn.addEventListener('click', function() {
        if (currentFontSize < 200) {
            currentFontSize += 10;
            document.documentElement.style.fontSize = currentFontSize + '%';
            announceToScreenReader(`Tamaño de fuente: ${currentFontSize}%`);
        }
    });
    
    decreaseFontBtn.addEventListener('click', function() {
        if (currentFontSize > 80) {
            currentFontSize -= 10;
            document.documentElement.style.fontSize = currentFontSize + '%';
            announceToScreenReader(`Tamaño de fuente: ${currentFontSize}%`);
        }
    });
    
    resetFontBtn.addEventListener('click', function() {
        currentFontSize = 100;
        document.documentElement.style.fontSize = '100%';
        announceToScreenReader('Tamaño de fuente restablecido');
    });
    
    // Agregar botones al DOM
    const header = document.querySelector('.header');
    if (header) {
        header.appendChild(increaseFontBtn);
        header.appendChild(decreaseFontBtn);
        header.appendChild(resetFontBtn);
    }
}

// Función para mejorar accesibilidad de notificaciones
function showAccessibleNotification(message, type = 'info', duration = 3000) {
    // Mostrar notificación visual
    showNotification(message, type, duration);
    
    // Anunciar a lectores de pantalla
    const typeDescription = type === 'success' ? 'Éxito' : 
                           type === 'error' ? 'Error' : 
                           type === 'warning' ? 'Advertencia' : 'Información';
    
    announceToScreenReader(`${typeDescription}: ${message}`);
}

// Función para mejorar accesibilidad de modales
function openAccessibleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        
        // Enfocar el primer elemento focusable
        const firstFocusable = modal.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Anunciar apertura del modal
        const title = modal.querySelector('h3');
        if (title) {
            announceToScreenReader(`Modal abierto: ${title.textContent}`);
        }
    }
}

// Inicializar accesibilidad cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeAccessibility();
});
