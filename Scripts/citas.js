// === GESTOR DE DATOS ===
class DataManager {
    constructor() {
        this.storageKeys = {
            appointments: 'meditrack_appointments',
            doctors: 'meditrack_doctors',
            settings: 'meditrack_settings',
            filters: 'meditrack_filters',
            cache: 'meditrack_cache',
            session: 'meditrack_session'
        };
        
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
        this.init();
    }

    init() {
        this.setupStorageListeners();
        this.autoSave();
    }

    // === LOCAL STORAGE (Persistencia permanente) ===
    
    saveToLocalStorage(key, data) {
        try {
            const serializedData = JSON.stringify({
                data: data,
                timestamp: Date.now(),
                version: '1.0'
            });
            localStorage.setItem(key, serializedData);
            this.cache.set(key, data);
            return true;
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            return false;
        }
    }

    loadFromLocalStorage(key) {
        try {
            const cached = this.cache.get(key);
            if (cached) return cached;

            const stored = localStorage.getItem(key);
            if (!stored) return null;

            const parsed = JSON.parse(stored);
            
            // Validar versión y timestamp
            if (parsed.version !== '1.0') {
                console.warn('Versión de datos obsoleta, migrando...');
                return this.migrateData(parsed.data, parsed.version);
            }

            this.cache.set(key, parsed.data);
            return parsed.data;
        } catch (error) {
            console.error('Error cargando de localStorage:', error);
            return null;
        }
    }

    // === SESSION STORAGE (Persistencia de sesión) ===
    
    saveToSessionStorage(key, data) {
        try {
            const serializedData = JSON.stringify({
                data: data,
                timestamp: Date.now(),
                sessionId: this.getSessionId()
            });
            sessionStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error('Error guardando en sessionStorage:', error);
            return false;
        }
    }

    loadFromSessionStorage(key) {
        try {
            const stored = sessionStorage.getItem(key);
            if (!stored) return null;

            const parsed = JSON.parse(stored);
            
            // Validar que pertenece a la sesión actual
            if (parsed.sessionId !== this.getSessionId()) {
                sessionStorage.removeItem(key);
                return null;
            }

            return parsed.data;
        } catch (error) {
            console.error('Error cargando de sessionStorage:', error);
            return null;
        }
    }

    // === CACHÉ INTELIGENTE ===
    
    setCache(key, data, expiry = null) {
        const cacheData = {
            data: data,
            timestamp: Date.now(),
            expiry: expiry || (Date.now() + this.cacheExpiry)
        };
        this.cache.set(key, cacheData);
    }

    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    clearCache() {
        this.cache.clear();
    }

    // === GESTIÓN DE DATOS ESPECÍFICOS ===
    
    saveAppointments(appointments) {
        const success = this.saveToLocalStorage(this.storageKeys.appointments, appointments);
        if (success) {
            this.setCache('appointments', appointments);
            this.notifyDataChange('appointments', appointments);
        }
        return success;
    }

    loadAppointments() {
        let appointments = this.getCache('appointments');
        if (!appointments) {
            appointments = this.loadFromLocalStorage(this.storageKeys.appointments) || [];
        }
        return appointments;
    }

    saveDoctors(doctors) {
        return this.saveToLocalStorage(this.storageKeys.doctors, doctors);
    }

    loadDoctors() {
        return this.loadFromLocalStorage(this.storageKeys.doctors) || this.getDefaultDoctors();
    }

    saveSettings(settings) {
        return this.saveToLocalStorage(this.storageKeys.settings, settings);
    }

    loadSettings() {
        return this.loadFromLocalStorage(this.storageKeys.settings) || this.getDefaultSettings();
    }

    saveFilters(filters) {
        return this.saveToSessionStorage(this.storageKeys.filters, filters);
    }

    loadFilters() {
        return this.loadFromSessionStorage(this.storageKeys.filters) || this.getDefaultFilters();
    }

    // === DATOS POR DEFECTO ===
    
    getDefaultDoctors() {
        return [
            { id: 'dr-gonzalez', name: 'Dra. María González', specialty: 'Cardióloga', location: 'Clínica Central' },
            { id: 'dr-rodriguez', name: 'Dr. Carlos Rodríguez', specialty: 'Médico General', location: 'Centro Médico' },
            { id: 'dr-martinez', name: 'Dra. Ana Martínez', specialty: 'Dermatóloga', location: 'Hospital General' },
            { id: 'dr-perez', name: 'Dr. Luis Pérez', specialty: 'Oftalmólogo', location: 'Clínica Central' },
            { id: 'dr-restrepo', name: 'Dra. Sofía Restrepo', specialty: 'Cardióloga', location: 'Clínica Zayma' },
            { id: 'dr-rojas', name: 'Dr. Andrés Felipe Rojas', specialty: 'Oftalmólogo', location: 'Clínica Montería' }
        ];
    }

    getDefaultSettings() {
        return {
            theme: 'light',
            language: 'es',
            notifications: true,
            reminders: true,
            autoSave: true,
            cacheEnabled: true,
            sessionTimeout: 30 // minutos
        };
    }

    getDefaultFilters() {
        return {
            dateFrom: null,
            dateTo: null,
            type: 'all',
            status: 'all',
            location: '',
            doctor: '',
            urgency: 'all'
        };
    }

    // === GESTIÓN DE SESIÓN ===
    
    getSessionId() {
        let sessionId = sessionStorage.getItem('meditrack_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('meditrack_session_id', sessionId);
        }
        return sessionId;
    }

    // === MIGRACIÓN DE DATOS ===
    
    migrateData(data, version) {
        // Aquí se pueden agregar lógicas de migración cuando cambie la versión
        console.log(`Migrando datos de versión ${version} a 1.0`);
        return data;
    }

    // === NOTIFICACIONES DE CAMBIOS ===
    
    notifyDataChange(type, data) {
        const event = new CustomEvent('dataChange', {
            detail: { type, data, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }

    // === AUTO GUARDADO ===
    
    autoSave() {
        setInterval(() => {
            if (window.appointmentManager && window.appointmentManager.appointments) {
                this.saveAppointments(window.appointmentManager.appointments);
            }
        }, 30000); // Auto guardar cada 30 segundos
    }

    // === LIMPIEZA Y MANTENIMIENTO ===
    
    cleanup() {
        // Limpiar caché expirado
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (value.expiry && now > value.expiry) {
                this.cache.delete(key);
            }
        }

        // Limpiar localStorage antiguo (más de 30 días)
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        for (const key of Object.values(this.storageKeys)) {
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.timestamp && parsed.timestamp < thirtyDaysAgo) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    localStorage.removeItem(key);
                }
            }
        }
    }

    // === LISTENERS DE ALMACENAMIENTO ===
    
    setupStorageListeners() {
        // Escuchar cambios en localStorage de otras pestañas
        window.addEventListener('storage', (e) => {
            if (e.key && Object.values(this.storageKeys).includes(e.key)) {
                this.handleStorageChange(e.key, e.newValue, e.oldValue);
            }
        });

        // Limpiar caché periódicamente
        setInterval(() => this.cleanup(), 60000); // Cada minuto
    }

    handleStorageChange(key, newValue, oldValue) {
        if (newValue === oldValue) return;

        try {
            const parsed = JSON.parse(newValue);
            this.cache.set(key, parsed.data);
            this.notifyDataChange(key, parsed.data);
        } catch (error) {
            console.error('Error procesando cambio de almacenamiento:', error);
        }
    }

    // === EXPORTAR/IMPORTAR DATOS ===
    
    exportData() {
        const data = {
            appointments: this.loadAppointments(),
            doctors: this.loadDoctors(),
            settings: this.loadSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meditrack_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.version !== '1.0') {
                        reject(new Error('Versión de datos no compatible'));
                        return;
                    }

                    // Validar estructura de datos
                    if (!data.appointments || !Array.isArray(data.appointments)) {
                        reject(new Error('Formato de datos inválido'));
                        return;
                    }

                    // Guardar datos importados
                    this.saveAppointments(data.appointments);
                    if (data.doctors) this.saveDoctors(data.doctors);
                    if (data.settings) this.saveSettings(data.settings);

                    this.clearCache();
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Error leyendo archivo'));
            reader.readAsText(file);
        });
    }

    // === ESTADÍSTICAS DE ALMACENAMIENTO ===
    
    getStorageStats() {
        const stats = {
            localStorage: 0,
            sessionStorage: 0,
            cache: this.cache.size,
            totalItems: 0
        };

        // Calcular tamaño de localStorage
        for (const key of Object.values(this.storageKeys)) {
            const item = localStorage.getItem(key);
            if (item) {
                stats.localStorage += item.length;
                stats.totalItems++;
            }
        }

        // Calcular tamaño de sessionStorage
        for (const key of Object.values(this.storageKeys)) {
            const item = sessionStorage.getItem(key);
            if (item) {
                stats.sessionStorage += item.length;
                stats.totalItems++;
            }
        }

        return stats;
    }
}

// Clase principal para la gestión de citas
class AppointmentManager {
    constructor() {
        // Inicializar gestor de datos
        this.dataManager = new DataManager();
        
        // Cargar datos desde almacenamiento
        this.appointments = this.dataManager.loadAppointments();
        this.doctors = this.dataManager.loadDoctors();
        this.settings = this.dataManager.loadSettings();
        this.filters = this.dataManager.loadFilters();
        
        this.currentView = 'cards';
        this.currentFilter = 'all';
        this.calendar = null;
        this.countdownInterval = null;
        this.notificationContainer = null;
        
        // Configurar listeners para cambios de datos
        this.setupDataListeners();
        
        this.init();
    }

    init() {
        this.loadNavbar();
        this.loadAppointments();
        this.initializeComponents();
        this.attachEventListeners();
        this.renderDashboard();
        this.renderNextAppointmentHero();
        this.renderSummarySections();
        this.renderUpcomingAppointments(); // Renderizar próximas citas
        this.renderAppointments();
        this.renderHistory();
        this.startCountdown();
        updateAppointmentsStatus(); // Actualizar estado en el header
        this.updateQuickCards(); // Actualizar tarjetas rápidas
        
        // Mostrar notificación de datos cargados
        this.showNotification(`Datos cargados: ${this.appointments.length} citas`, 'success');
    }

    // Configurar listeners para cambios de datos
    setupDataListeners() {
        document.addEventListener('dataChange', (e) => {
            const { type, data } = e.detail;
            
            switch (type) {
                case 'appointments':
                    this.appointments = data;
                    this.renderUpcomingAppointments();
                    this.renderAppointments();
                    this.renderHistory();
                    this.updateCalendar();
                    break;
                case 'doctors':
                    this.doctors = data;
                    this.renderFrequentDoctors();
                    break;
                case 'settings':
                    this.settings = data;
                    this.applySettings();
                    break;
                case 'filters':
                    this.filters = data;
                    this.applyFilters();
                    break;
            }
        });
    }

    // Cargar el navbar superior
    async loadNavbar() {
        try {
            const response = await fetch('sidebar/sidebar.html');
            const navbarHtml = await response.text();
            
            const navbarContainer = document.getElementById('navbarContainer');
            if (navbarContainer) {
                navbarContainer.innerHTML = navbarHtml;
                
                // Cargar el CSS del navbar
                const navbarCSS = document.createElement('link');
                navbarCSS.rel = 'stylesheet';
                navbarCSS.href = 'sidebar/sidebar.css';
                document.head.appendChild(navbarCSS);
                
                // Cargar el JavaScript del navbar
                const navbarScript = document.createElement('script');
                navbarScript.src = 'sidebar/sidebar.js';
                document.head.appendChild(navbarScript);
                
                // Marcar la página actual como activa
                setTimeout(() => {
                    const currentPageLink = document.querySelector('[href="Citas.html"]');
                    if (currentPageLink) {
                        const navItem = currentPageLink.closest('.nav-item');
                        if (navItem) {
                            navItem.classList.add('active');
                        }
                    }
                    // Inicializar el sidebar
                    if (typeof initializeSidebar === 'function') {
                        initializeSidebar();
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error cargando el navbar:', error);
        }
    }

    // Cargar datos de citas
    loadAppointments() {
        // Los datos ya se cargaron en el constructor desde el DataManager
        if (!this.appointments || this.appointments.length === 0) {
            // Si no hay datos, cargar demo
        this.appointments = [
            {
                id: 'upcoming-0',
                title: 'Consulta cardiológica',
                type: 'specialist',
                    start: '2025-01-23T14:30:00',
                    end: '2025-01-23T15:15:00',
                location: 'Clínica Zayma, Consultorio 305, Montería',
                doctor: 'Dra. Sofía Restrepo (Cardióloga)',
                notes: 'Llevar resultados de electrocardiograma y análisis recientes.',
                status: 'urgent',
                priority: 'high'
            },
            {
                id: 'upcoming-1',
                title: 'Análisis de sangre',
                type: 'test',
                    start: '2025-01-24T09:00:00',
                    end: '2025-01-24T09:30:00',
                location: 'Laboratorio Clínico Continental, Montería',
                doctor: 'Lic. Enfermería Juan David',
                notes: 'Ayunas de 8 horas. Presentarse 15 minutos antes.',
                status: 'upcoming',
                priority: 'normal'
            },
            {
                id: 'upcoming-2',
                title: 'Revisión oftalmológica',
                type: 'specialist',
                    start: '2025-01-25T10:00:00',
                    end: '2025-01-25T10:45:00',
                location: 'Clínica Montería, Torre Médica, Montería',
                doctor: 'Dr. Andrés Felipe Rojas (Oftalmólogo)',
                notes: 'No usar lentes de contacto 24h antes.',
                status: 'upcoming',
                priority: 'normal'
            },
                {
                    id: 'upcoming-3',
                    title: 'Consulta general',
                    type: 'general',
                    start: '2025-01-26T16:00:00',
                    end: '2025-01-26T16:45:00',
                    location: 'Centro Médico Familiar, Montería',
                    doctor: 'Dra. María González',
                    notes: 'Revisión de rutina y control de medicamentos.',
                    status: 'upcoming',
                    priority: 'normal'
                },
                {
                    id: 'upcoming-4',
                    title: 'Vacunación COVID-19',
                    type: 'vaccine',
                    start: '2025-01-27T11:00:00',
                    end: '2025-01-27T11:30:00',
                    location: 'Centro de Vacunación Municipal, Montería',
                    doctor: 'Enfermera Ana Rodríguez',
                    notes: 'Llevar documento de identidad y carné de vacunación.',
                    status: 'upcoming',
                    priority: 'high'
                },
                {
                    id: 'upcoming-5',
                    title: 'Radiografía de tórax',
                    type: 'test',
                    start: '2025-01-28T08:30:00',
                    end: '2025-01-28T09:00:00',
                    location: 'Centro de Diagnóstico por Imágenes, Montería',
                    doctor: 'Dr. Carlos Mendoza (Radiólogo)',
                    notes: 'No comer 2 horas antes del examen.',
                status: 'upcoming',
                priority: 'normal'
            },
            {
                id: 'history-0',
                title: 'Consulta cardiológica',
                type: 'specialist',
                start: '2024-06-05T09:00:00',
                end: '2024-06-05T09:45:00',
                location: 'Clínica Zayma, Montería',
                doctor: 'Dr. Ricardo Vélez',
                notes: 'Revisión anual, todo en orden. Se recomienda seguimiento en 6 meses.',
                status: 'completed',
                priority: 'normal'
            },
            {
                id: 'history-1',
                title: 'Vacunación antigripal',
                type: 'vaccine',
                start: '2024-05-28T11:00:00',
                end: '2024-05-28T11:30:00',
                location: 'Centro de Salud La Granja, Montería',
                doctor: 'Enfermera Laura M.',
                notes: 'Vacuna antigripal aplicada. Sin reacciones adversas.',
                status: 'completed',
                priority: 'normal'
            },
            {
                id: 'history-2',
                title: 'Consulta general',
                type: 'general',
                start: '2024-05-20T16:00:00',
                end: '2024-05-20T16:45:00',
                location: 'Clínica Salud Total, Montería',
                doctor: 'Dra. Camila Soto',
                notes: 'Cancelada por indisposición del paciente. Se sugiere reprogramar.',
                status: 'canceled',
                priority: 'normal'
            },
            {
                id: 'history-3',
                title: 'Análisis de sangre',
                type: 'test',
                start: '2024-05-15T08:00:00',
                end: '2024-05-15T08:30:00',
                location: 'Laboratorio Clínico Continental, Montería',
                doctor: 'Laboratorio Clínico Continental',
                notes: 'Resultados de perfil lipídico y glicemia enviados por correo.',
                status: 'completed',
                priority: 'normal'
            }
        ];
            // Guardar los datos demo en localStorage
            this.saveToStorage();
        }
        
        // Asegurar que las citas próximas se muestren correctamente
        this.renderUpcomingAppointments();
    }

    // Inicializar componentes
    initializeComponents() {
        this.initializeDatePickers();
        this.initializeCalendar();
        this.initializeNotifications();
        this.initializeDoctorSuggestions();
        this.setupFormValidation(); // Agregar validación del formulario
        this.setupViewToggle(); // Agregar toggle de vista
        this.setupUpcomingSearch(); // Agregar búsqueda en tiempo real
        this.setupCarouselNavigation(); // Agregar navegación del carrusel
    }

    // Inicializar datepickers
    initializeDatePickers() {
        // Configuración para Flatpickr
        const dateConfig = {
            locale: 'es',
            dateFormat: 'd/m/Y',
            allowInput: true,
            clickOpens: true,
            theme: 'material_blue',
            minDate: 'today'
        };

        const timeConfig = {
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true,
            locale: 'es',
            minTime: '08:00',
            maxTime: '18:00'
        };

        // Inicializar datepickers
        flatpickr('.datepicker-modern', dateConfig);
        flatpickr('.timepicker-modern', timeConfig);
        flatpickr('#filter-date-from', dateConfig);
        flatpickr('#filter-date-to', dateConfig);
    }

    // Inicializar calendario
    initializeCalendar() {
        const calendarEl = document.getElementById('fullCalendar');
        if (calendarEl) {
            this.calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                locale: 'es',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                },
                events: this.getCalendarEvents(),
                eventClick: (info) => {
                    this.showAppointmentDetails(info.event.id);
                },
                eventDidMount: (info) => {
                    // Añadir tooltips personalizados
                    const event = info.event;
                    const status = event.extendedProps.status;
                    const color = this.getEventColor(status);
                    
                    info.el.style.backgroundColor = color;
                    info.el.style.borderColor = color;
                    info.el.style.color = '#fff';
                    
                    info.el.title = `${event.title}\nDoctor: ${event.extendedProps.doctor}\nUbicación: ${event.extendedProps.location}\nEstado: ${this.getStatusText(status)}`;
                },
                height: 'auto',
                aspectRatio: 1.8,
                dayMaxEvents: true,
                moreLinkClick: 'popover',
                eventTimeFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                },
                buttonText: {
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    list: 'Lista'
                },
                eventDisplay: 'block',
                eventClassNames: (arg) => {
                    const status = arg.event.extendedProps.status;
                    return [`appointment-${status}`, 'appointment-event'];
                }
            });
            this.calendar.render();
            
            // Agregar event listeners para cambio de vista
            this.attachCalendarViewListeners();
        }
    }

    attachCalendarViewListeners() {
        const viewButtons = document.querySelectorAll('.calendar-view-toggle .view-toggle-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                if (this.calendar && view) {
                    this.calendar.changeView(view);
                    
                    // Actualizar botones activos
                    viewButtons.forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                }
            });
        });
    }

    // Inicializar sugerencias de doctores
    initializeDoctorSuggestions() {
        const doctorInput = document.getElementById('appointment-doctor');
        const suggestionsContainer = document.getElementById('doctor-suggestions');
        
        if (doctorInput && suggestionsContainer) {
            // Limpiar sugerencias previas
            suggestionsContainer.innerHTML = '';
                    suggestionsContainer.style.display = 'none';
            
            doctorInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                
                // Mostrar todas las sugerencias si el campo está vacío
                if (query.length === 0) {
                    this.renderDoctorSuggestions(this.doctors, suggestionsContainer);
                    return;
                }

                // Filtrar doctores que coincidan con la búsqueda
                const filteredDoctors = this.doctors.filter(doctor => 
                    doctor.name.toLowerCase().includes(query) || 
                    doctor.specialty.toLowerCase().includes(query) ||
                    doctor.location.toLowerCase().includes(query)
                );

                this.renderDoctorSuggestions(filteredDoctors, suggestionsContainer);
            });

            // Mostrar sugerencias al hacer focus
            doctorInput.addEventListener('focus', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (query.length === 0) {
                    // Mostrar todos los doctores si el campo está vacío
                    this.renderDoctorSuggestions(this.doctors, suggestionsContainer);
                } else {
                    // Mostrar filtrados
                    const filteredDoctors = this.doctors.filter(doctor => 
                        doctor.name.toLowerCase().includes(query) || 
                        doctor.specialty.toLowerCase().includes(query) ||
                        doctor.location.toLowerCase().includes(query)
                    );
                    this.renderDoctorSuggestions(filteredDoctors, suggestionsContainer);
                }
            });

            // Ocultar sugerencias al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!doctorInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                    suggestionsContainer.style.display = 'none';
                }
            });

            // Navegación con teclado
            doctorInput.addEventListener('keydown', (e) => {
                const visibleSuggestions = suggestionsContainer.querySelectorAll('.doctor-suggestion-item');
                const currentIndex = Array.from(visibleSuggestions).findIndex(item => 
                    item.classList.contains('selected')
                );

                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        if (visibleSuggestions.length > 0) {
                            const nextIndex = (currentIndex + 1) % visibleSuggestions.length;
                            this.selectSuggestion(visibleSuggestions, nextIndex);
                        }
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        if (visibleSuggestions.length > 0) {
                            const prevIndex = currentIndex <= 0 ? visibleSuggestions.length - 1 : currentIndex - 1;
                            this.selectSuggestion(visibleSuggestions, prevIndex);
                        }
                        break;
                    case 'Enter':
                        e.preventDefault();
                        if (currentIndex >= 0 && visibleSuggestions[currentIndex]) {
                            const selectedDoctor = visibleSuggestions[currentIndex].getAttribute('data-doctor');
                            if (selectedDoctor) {
                                this.selectDoctor(selectedDoctor);
                            }
                        }
                        break;
                    case 'Escape':
                        suggestionsContainer.style.display = 'none';
                        break;
                }
            });
        }
    }

    // Seleccionar sugerencia con teclado
    selectSuggestion(suggestions, index) {
        suggestions.forEach((item, i) => {
            if (i === index) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // Renderizar sugerencias de doctores
    renderDoctorSuggestions(doctors, container) {
        if (!doctors || doctors.length === 0) {
            container.innerHTML = `
                <div class="doctor-suggestion-item no-results">
                    <div style="text-align: center; color: var(--text-muted); padding: 1rem;">
                        <i class="fas fa-search" style="margin-right: 0.5rem;"></i>
                        No se encontraron doctores
                    </div>
                </div>
            `;
            container.style.display = 'block';
            return;
        }

        container.innerHTML = doctors.map(doctor => `
            <div class="doctor-suggestion-item" 
                 onclick="selectDoctor('${doctor.name}')" 
                 data-doctor="${doctor.name}"
                 role="option"
                 tabindex="0">
                <div class="doctor-suggestion-content">
                    <div class="doctor-name">${doctor.name}</div>
                    <div class="doctor-details">
                        <span class="doctor-specialty">${doctor.specialty}</span>
                        <span class="doctor-location">• ${doctor.location}</span>
                    </div>
                </div>
                <div class="doctor-suggestion-icon">
                    <i class="fas fa-user-md"></i>
                </div>
            </div>
        `).join('');

        container.style.display = 'block';
        
        // Agregar eventos de hover para mejor UX
        const suggestionItems = container.querySelectorAll('.doctor-suggestion-item:not(.no-results)');
        suggestionItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                suggestionItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });
    }

    // Renderizar dashboard de próxima cita
    renderNextAppointmentHero() {
        const nextAppointment = this.getNextAppointment();
        if (!nextAppointment) {
            this.hideNextAppointmentHero();
            return;
        }

        // Actualizar contenido del hero
        document.getElementById('next-appointment-title').textContent = nextAppointment.title;
        document.getElementById('next-appointment-doctor').textContent = nextAppointment.doctor;
        document.getElementById('next-appointment-date').textContent = this.formatDate(nextAppointment.start);
        document.getElementById('next-appointment-location').textContent = nextAppointment.location;

        // Actualizar estado de urgencia
        const statusIndicator = document.querySelector('.status-indicator');
        if (nextAppointment.status === 'urgent') {
            statusIndicator.classList.add('urgent');
            statusIndicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Cita Urgente</span>';
        } else {
            statusIndicator.classList.remove('urgent');
            statusIndicator.innerHTML = '<i class="fas fa-calendar-check"></i><span>Cita Programada</span>';
        }
    }

    // Obtener próxima cita
    getNextAppointment() {
        const now = new Date();
        const upcomingAppointments = this.appointments.filter(apt => 
            new Date(apt.start) > now && apt.status !== 'canceled'
        );
        
        return upcomingAppointments.sort((a, b) => new Date(a.start) - new Date(b.start))[0];
    }

    // Ocultar hero de próxima cita
    hideNextAppointmentHero() {
        const hero = document.querySelector('.next-appointment-hero');
        if (hero) {
            hero.style.display = 'none';
        }
    }

    // Iniciar cuenta regresiva
    startCountdown() {
        const nextAppointment = this.getNextAppointment();
        if (!nextAppointment) return;

        this.updateCountdown(nextAppointment.start);
        
        this.countdownInterval = setInterval(() => {
            this.updateCountdown(nextAppointment.start);
        }, 60000); // Actualizar cada minuto
    }

    // Actualizar cuenta regresiva
    updateCountdown(appointmentDate) {
        const now = new Date();
        const appointment = new Date(appointmentDate);
        const diff = appointment - now;

        if (diff <= 0) {
            this.hideCountdown();
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('countdown-days').textContent = days.toString().padStart(2, '0');
        document.getElementById('countdown-hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('countdown-minutes').textContent = minutes.toString().padStart(2, '0');
    }

    // Ocultar cuenta regresiva
    hideCountdown() {
        const countdownContainer = document.getElementById('countdown-container');
        if (countdownContainer) {
            countdownContainer.style.display = 'none';
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }

    // Renderizar secciones de resumen
    renderSummarySections() {
        this.renderRecentAppointments();
        this.renderUpcomingAppointments();
        this.renderFrequentDoctors();
    }

    // Renderizar citas recientes
    renderRecentAppointments() {
        const recentAppointments = this.appointments
            .filter(apt => apt.status === 'completed')
            .sort((a, b) => new Date(b.start) - new Date(a.start))
            .slice(0, 3);

        const container = document.getElementById('recent-appointments-list');
        if (!container) return;

        if (recentAppointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No hay citas recientes</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentAppointments.map(apt => `
            <div class="summary-item" onclick="showAppointmentDetails('${apt.id}')">
                <div class="summary-item-icon">
                    <i class="${this.getAppointmentIcon(apt.title)}"></i>
                </div>
                <div class="summary-item-content">
                    <div class="summary-item-title">${apt.title}</div>
                    <div class="summary-item-details">${apt.doctor} • ${this.formatDate(apt.start)}</div>
                </div>
            </div>
        `).join('');
    }

    // Renderizar próximas citas
    renderUpcomingAppointments(appointments = null) {
        const carousel = document.getElementById('appointments-carousel');
        const emptyState = document.getElementById('upcoming-empty-state');
        const carouselWrapper = document.getElementById('upcoming-carousel-wrapper');
        const countElement = document.getElementById('upcoming-count');
        const listView = document.getElementById('upcoming-list');
        const listBody = document.getElementById('upcoming-list-body');
        
        console.log('renderUpcomingAppointments called');
        console.log('Elements found:', { carousel: !!carousel, emptyState: !!emptyState, carouselWrapper: !!carouselWrapper });
        
        if (!carousel || !emptyState || !carouselWrapper) {
            console.error('Required elements not found for upcoming appointments');
            return;
        }
        
        // Usar citas proporcionadas o filtrar del array principal
        const upcomingAppointments = appointments || this.appointments.filter(apt => 
            apt.status === 'upcoming' || apt.status === 'urgent'
        );
        
        console.log('Upcoming appointments found:', upcomingAppointments.length);
        console.log('All appointments:', this.appointments.length);
        console.log('Appointments statuses:', this.appointments.map(apt => ({ id: apt.id, status: apt.status, title: apt.title })));
        
        // Actualizar contador
        if (countElement) {
            countElement.textContent = upcomingAppointments.length;
            countElement.className = `badge ${upcomingAppointments.length > 0 ? 'badge-primary' : 'badge-secondary'}`;
        }
        
        // Mostrar estado vacío si no hay citas
        if (upcomingAppointments.length === 0) {
            carouselWrapper.style.display = 'none';
            if (listView) listView.style.display = 'none';
            emptyState.style.display = 'block';
            console.log('No upcoming appointments, showing empty state');
            return;
        }
        
        // Ocultar estado vacío y mostrar carrusel
        emptyState.style.display = 'none';
        carouselWrapper.style.display = 'block';
        
        // Limpiar carrusel
        carousel.innerHTML = '';
        
        // Crear tarjetas para carrusel
        upcomingAppointments.forEach((appointment, index) => {
            console.log(`Creating card for appointment ${index}:`, appointment.title);
            const card = this.createUpcomingAppointmentCard(appointment);
            carousel.appendChild(card);
        });
        
        // Actualizar vista de lista si existe
        if (listBody) {
            listBody.innerHTML = '';
            upcomingAppointments.forEach(appointment => {
                const listItem = this.createUpcomingAppointmentListItem(appointment);
                listBody.insertAdjacentHTML('beforeend', listItem);
            });
        }
        
        // Configurar navegación después de agregar las tarjetas
        setTimeout(() => {
            this.setupCarouselNavigation();
        }, 100);
        
        // Mostrar notificación de citas cargadas
        if (upcomingAppointments.length > 0) {
            console.log(`Citas próximas cargadas: ${upcomingAppointments.length} citas`);
        }
    }

    // Crear tarjeta de cita próxima para carrusel
    createUpcomingAppointmentCard(appointment) {
        const date = new Date(appointment.start);
        const timeUntil = this.getTimeUntil(appointment.start);
        const badgeClass = this.getBadgeClass(appointment.status);
        const badgeText = this.getBadgeText(appointment.status);
        const icon = this.getAppointmentIcon(appointment.title);
        const isUrgent = appointment.status === 'urgent';

        // Destacar el doctor en la parte superior
        const cardHTML = `
            <div class="upcoming-appointment-card ${appointment.status}" data-appointment-id="${appointment.id}">
                <div class="card-header">
                    <div class="appointment-doctor-highlight">
                        <i class="fas fa-user-md"></i>
                        <span class="doctor-name-highlight">${appointment.doctor}</span>
                    </div>
                    <div class="appointment-type ${appointment.status}">
                        <i class="${icon}"></i>
                        <span>${appointment.title}</span>
                    </div>
                    <div class="appointment-status">
                        <span class="status-badge ${badgeClass}">${badgeText}</span>
                        ${isUrgent ? '<i class="fas fa-exclamation-triangle urgent-indicator"></i>' : ''}
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="appointment-info">
                        <div class="info-row">
                            <i class="fas fa-calendar"></i>
                            <span>${this.formatDate(date)}</span>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-clock"></i>
                            <span>${this.formatTime(date)}</span>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${appointment.location}</span>
                        </div>
                    </div>
                    
                    <div class="time-remaining ${appointment.status}">
                        <i class="fas fa-hourglass-half"></i>
                        <span>${timeUntil}</span>
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="btn-modern btn-info-modern btn-sm-modern" onclick="appointmentManager.showAppointmentDetails('${appointment.id}')" title="Ver detalles de la cita">
                        <i class="fas fa-eye"></i>
                        <span>Ver detalles</span>
                    </button>
                    <button class="btn-modern btn-warning-modern btn-sm-modern" onclick="appointmentManager.rescheduleAppointment('${appointment.id}')" title="Reprogramar cita">
                        <i class="fas fa-calendar-pen"></i>
                        <span>Reprogramar</span>
                    </button>
                    <button class="btn-modern btn-cancel-modern btn-sm-modern" onclick="appointmentManager.cancelAppointment('${appointment.id}')" title="Cancelar cita">
                        <i class="fas fa-times"></i>
                        <span>Cancelar</span>
                    </button>
                </div>
                </div>
            `;

        // Crear elemento DOM
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHTML;
        return tempDiv.firstElementChild;
    }

    // Crear elemento de lista para cita próxima
    createUpcomingAppointmentListItem(appointment) {
        const date = new Date(appointment.start);
        const timeUntil = this.getTimeUntil(appointment.start);
        const badgeClass = this.getBadgeClass(appointment.status);
        const badgeText = this.getBadgeText(appointment.status);
        const icon = this.getAppointmentIcon(appointment.title);
        const isUrgent = appointment.status === 'urgent';

        return `
            <div class="upcoming-appointment-list-item ${appointment.status}" data-appointment-id="${appointment.id}">
                <div class="item-main">
                    <div class="item-header">
                        <div class="item-title">
                            <i class="${icon}"></i>
                            <h3>${appointment.title}</h3>
                            ${isUrgent ? '<i class="fas fa-exclamation-triangle urgent-indicator"></i>' : ''}
                        </div>
                        <div class="item-status">
                            <span class="status-badge ${badgeClass}">${badgeText}</span>
                        </div>
                    </div>
                    
                    <div class="item-details">
                        <div class="detail-row">
                            <span class="detail-label"><i class="fas fa-user-md"></i> Doctor:</span>
                            <span class="detail-value">${appointment.doctor}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label"><i class="fas fa-calendar"></i> Fecha:</span>
                            <span class="detail-value">${this.formatDate(date)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label"><i class="fas fa-clock"></i> Hora:</span>
                            <span class="detail-value">${this.formatTime(date)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label"><i class="fas fa-map-marker-alt"></i> Ubicación:</span>
                            <span class="detail-value">${appointment.location}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label"><i class="fas fa-hourglass-half"></i> Tiempo restante:</span>
                            <span class="detail-value ${appointment.status}">${timeUntil}</span>
                        </div>
                    </div>
                </div>
                
                <div class="item-actions">
                    <button class="btn-modern btn-info-modern btn-sm-modern" onclick="appointmentManager.showAppointmentDetails('${appointment.id}')" title="Ver detalles de la cita">
                        <i class="fas fa-eye"></i>
                        <span>Ver detalles</span>
                    </button>
                    <button class="btn-modern btn-warning-modern btn-sm-modern" onclick="appointmentManager.rescheduleAppointment('${appointment.id}')" title="Reprogramar cita">
                        <i class="fas fa-calendar-pen"></i>
                        <span>Reprogramar</span>
                    </button>
                    <button class="btn-modern btn-cancel-modern btn-sm-modern" onclick="appointmentManager.cancelAppointment('${appointment.id}')" title="Cancelar cita">
                        <i class="fas fa-times"></i>
                        <span>Cancelar</span>
                    </button>
                </div>
            </div>
        `;
    }

    // Configurar navegación del carrusel
    setupCarouselNavigation() {
        const carousel = document.getElementById('appointments-carousel');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');

        if (!carousel || !prevBtn || !nextBtn) return;

        // Calcular ancho dinámicamente
        const getCardWidth = () => {
            const cards = carousel.querySelectorAll('.upcoming-appointment-card');
            if (cards.length > 0) {
                return cards[0].offsetWidth + 24; // 24px de gap
            }
            return 340; // fallback
        };

        // Calcular cuántas tarjetas son visibles
        const getVisibleCards = () => {
            const cardWidth = getCardWidth();
            return Math.floor(carousel.clientWidth / cardWidth);
        };

        const scrollToCard = (direction) => {
            const cardWidth = getCardWidth();
            const visibleCards = getVisibleCards();
            const scrollAmount = direction === 'next' ? cardWidth * visibleCards : -cardWidth * visibleCards;
            
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        };

        prevBtn.onclick = () => scrollToCard('prev');
        nextBtn.onclick = () => scrollToCard('next');

        // Navegación por teclado
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                scrollToCard('prev');
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                scrollToCard('next');
            }
        });

        // Hacer el carrusel focusable para navegación por teclado
        carousel.setAttribute('tabindex', '0');
        carousel.setAttribute('role', 'region');
        carousel.setAttribute('aria-label', 'Carrusel de citas próximas');

        // Mostrar/ocultar flechas según la posición del scroll
        const updateArrows = () => {
            const isAtStart = carousel.scrollLeft <= 0;
            const isAtEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 5; // 5px de tolerancia
            
            prevBtn.style.opacity = isAtStart ? '0.5' : '1';
            prevBtn.disabled = isAtStart;
            prevBtn.setAttribute('aria-hidden', isAtStart);
            
            nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
            nextBtn.disabled = isAtEnd;
            nextBtn.setAttribute('aria-hidden', isAtEnd);
        };

        // Indicadores de página
        const updatePageIndicators = () => {
            const totalCards = carousel.querySelectorAll('.upcoming-appointment-card').length;
            const visibleCards = getVisibleCards();
            const currentPage = Math.floor(carousel.scrollLeft / getCardWidth());
            const totalPages = Math.ceil(totalCards / visibleCards);
            
            this.updatePageIndicators(currentPage, totalPages);
        };

        carousel.addEventListener('scroll', () => {
            updateArrows();
            updatePageIndicators();
        });

        // Estado inicial
        updateArrows();
        updatePageIndicators();

        // Manejar resize de ventana
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateArrows();
                updatePageIndicators();
            }, 250);
        });
    }

    // Actualizar indicadores de página
    updatePageIndicators(currentPage, totalPages) {
        let indicatorsContainer = document.getElementById('carousel-indicators');
        
        if (!indicatorsContainer) {
            indicatorsContainer = document.createElement('div');
            indicatorsContainer.className = 'carousel-indicators';
            indicatorsContainer.id = 'carousel-indicators';
            indicatorsContainer.setAttribute('role', 'tablist');
            indicatorsContainer.setAttribute('aria-label', 'Navegación del carrusel');
            
            const carouselWrapper = document.querySelector('.appointments-carousel-wrapper');
            if (carouselWrapper) {
                carouselWrapper.appendChild(indicatorsContainer);
            }
        }
        
        // Solo mostrar indicadores si hay más de una página
        if (totalPages <= 1) {
            indicatorsContainer.style.display = 'none';
            return;
        }

        indicatorsContainer.style.display = 'flex';
        indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i < totalPages; i++) {
            const indicator = document.createElement('button');
            indicator.className = `indicator ${i === currentPage ? 'active' : ''}`;
            indicator.setAttribute('role', 'tab');
            indicator.setAttribute('aria-selected', i === currentPage);
            indicator.setAttribute('aria-label', `Página ${i + 1} de ${totalPages}`);
            indicator.onclick = () => this.goToPage(i);
            indicatorsContainer.appendChild(indicator);
        }
    }

    // Ir a página específica
    goToPage(pageIndex) {
        const carousel = document.getElementById('appointments-carousel');
        if (!carousel) return;
        
        const cardWidth = this.getCardWidth();
        const visibleCards = this.getVisibleCards();
        const scrollPosition = pageIndex * cardWidth * visibleCards;
        
        carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }

    // Obtener ancho de tarjeta (método auxiliar)
    getCardWidth() {
        const carousel = document.getElementById('appointments-carousel');
        if (!carousel) return 340;
        
        const cards = carousel.querySelectorAll('.upcoming-appointment-card');
        if (cards.length > 0) {
            return cards[0].offsetWidth + 24; // 24px de gap
        }
        return 340; // fallback
    }

    // Obtener tarjetas visibles (método auxiliar)
    getVisibleCards() {
        const carousel = document.getElementById('appointments-carousel');
        if (!carousel) return 1;
        
        const cardWidth = this.getCardWidth();
        return Math.floor(carousel.clientWidth / cardWidth);
    }

    // Configurar toggle de vista
    setupViewToggle() {
        const toggleButtons = document.querySelectorAll('.view-toggle-btn');
        const carouselWrapper = document.getElementById('upcoming-carousel-wrapper');
        const listView = document.getElementById('upcoming-list');
        
        if (!toggleButtons.length || !carouselWrapper || !listView) return;

        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const view = button.getAttribute('data-view');
                
                // Actualizar botones activos
                toggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Cambiar vista con animación
                this.switchUpcomingView(view);
            });
        });
    }

    // Cambiar vista de citas próximas
    switchUpcomingView(view) {
        const carouselWrapper = document.getElementById('upcoming-carousel-wrapper');
        const listView = document.getElementById('upcoming-list');
        
        if (!carouselWrapper || !listView) return;
        
        // Ocultar ambas vistas primero
        carouselWrapper.style.opacity = '0';
        listView.style.opacity = '0';
        
        setTimeout(() => {
            if (view === 'carousel') {
                carouselWrapper.classList.remove('hidden');
                listView.classList.add('hidden');
                
                // Renderizar carrusel si no tiene contenido
                const carousel = document.getElementById('appointments-carousel');
                if (carousel && carousel.children.length === 0) {
                    this.renderUpcomingAppointments();
                }
                
                // Mostrar carrusel
                setTimeout(() => {
                    carouselWrapper.style.opacity = '1';
                    this.setupCarouselNavigation();
                }, 50);
                
            } else if (view === 'list') {
                listView.classList.remove('hidden');
                carouselWrapper.classList.add('hidden');
                
                // Renderizar lista si no tiene contenido
                const listBody = document.getElementById('upcoming-list-body');
                if (listBody && listBody.children.length === 0) {
                    this.renderUpcomingList();
                }
                
                // Mostrar lista
                setTimeout(() => {
                    listView.style.opacity = '1';
                }, 50);
            }
        }, 150);
    }

    // Renderizar vista de lista
    renderUpcomingList() {
        const listBody = document.getElementById('upcoming-list-body');
        if (!listBody) return;
        
        const upcomingAppointments = this.appointments.filter(apt => 
            apt.status === 'upcoming' || apt.status === 'urgent'
        );
        
        if (upcomingAppointments.length === 0) {
            listBody.innerHTML = `
                <div class="empty-list-message">
                    <i class="fas fa-calendar-times"></i>
                    <p>No hay citas próximas para mostrar</p>
                </div>
            `;
            return;
        }
        
        listBody.innerHTML = upcomingAppointments.map(appointment => `
            <div class="list-item" data-appointment-id="${appointment.id}">
                <div class="list-column">
                    <div class="appointment-type">
                        <i class="${this.getAppointmentIcon(appointment.title)}"></i>
                        <span>${this.getTypeLabel(appointment.type)}</span>
                    </div>
                </div>
                <div class="list-column">
                    <span class="doctor-name">${appointment.doctor}</span>
                </div>
                <div class="list-column">
                    <span class="appointment-date">${this.formatDate(appointment.start)}</span>
                </div>
                <div class="list-column">
                    <span class="appointment-time">${this.formatTime(appointment.start)}</span>
                </div>
                <div class="list-column">
                    <span class="status-badge ${this.getBadgeClass(appointment.status)}">
                        ${this.getBadgeText(appointment.status)}
                    </span>
                </div>
                <div class="list-column">
                    <div class="list-actions">
                        <button class="btn-icon" onclick="handleUpcomingAction('details', ${appointment.id})" aria-label="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="handleUpcomingAction('reschedule', ${appointment.id})" aria-label="Reprogramar">
                            <i class="fas fa-calendar-alt"></i>
                        </button>
                        <button class="btn-icon" onclick="handleUpcomingAction('cancel', ${appointment.id})" aria-label="Cancelar">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Reprogramar cita
    rescheduleAppointment(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) {
            this.showNotification('Cita no encontrada', 'error');
            return;
        }

        // Llenar el modal de reprogramación con los datos actuales
        this.fillRescheduleModal(appointment);
        this.openModal('modalReprogramarCita');
    }

    // Cancelar cita
    cancelAppointment(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) {
            this.showNotification('Cita no encontrada', 'error');
            return;
        }

        // Confirmar cancelación
        if (confirm(`¿Estás seguro de que quieres cancelar la cita "${appointment.title}"?`)) {
            appointment.status = 'canceled';
            this.saveToStorage();
            this.updateCalendar();
            this.renderUpcomingAppointments();
            this.showNotification('Cita cancelada exitosamente', 'success');
        }
    }

    // Llenar modal de reprogramación
    fillRescheduleModal(appointment) {
        const date = new Date(appointment.start);
        
        // Llenar campos del modal
        const dateInput = document.getElementById('reschedule-date');
        const timeInput = document.getElementById('reschedule-time');
        const doctorInput = document.getElementById('reschedule-doctor');
        const locationInput = document.getElementById('reschedule-location');
        const notesInput = document.getElementById('reschedule-notes');

        if (dateInput) dateInput.value = this.formatDateForInput(date);
        if (timeInput) timeInput.value = this.formatTimeForInput(date);
        if (doctorInput) doctorInput.value = appointment.doctor;
        if (locationInput) locationInput.value = appointment.location;
        if (notesInput) notesInput.value = appointment.notes || '';

        // Guardar ID de la cita a reprogramar
        const form = document.getElementById('reschedule-form');
        if (form) form.dataset.appointmentId = appointment.id;
    }

    // Formatear fecha para input
    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    // Formatear hora para input
    formatTimeForInput(date) {
        return date.toTimeString().slice(0, 5);
    }

    // Renderizar doctores frecuentes
    renderFrequentDoctors() {
        const doctorFrequency = {};
        this.appointments.forEach(apt => {
            if (apt.doctor) {
                doctorFrequency[apt.doctor] = (doctorFrequency[apt.doctor] || 0) + 1;
            }
        });

        const frequentDoctors = Object.entries(doctorFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 4)
            .map(([doctor]) => doctor);

        const container = document.getElementById('frequent-doctors-list');
        if (!container) return;

        if (frequentDoctors.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-md"></i>
                    <p>No hay doctores frecuentes</p>
                </div>
            `;
            return;
        }

        container.innerHTML = frequentDoctors.map(doctor => `
            <div class="summary-item" onclick="quickAppointment('${doctor}')">
                <div class="summary-item-icon">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="summary-item-content">
                    <div class="summary-item-title">${doctor}</div>
                    <div class="summary-item-details">Cita rápida</div>
                </div>
            </div>
        `).join('');
    }

    // Obtener eventos del calendario
    getCalendarEvents() {
        return this.appointments.map(appointment => ({
            id: appointment.id,
            title: appointment.title,
            start: appointment.start,
            end: appointment.end,
            backgroundColor: this.getEventColor(appointment.status),
            borderColor: this.getEventColor(appointment.status),
            textColor: '#ffffff',
            extendedProps: {
                status: appointment.status,
                type: appointment.type,
                location: appointment.location,
                doctor: appointment.doctor,
                notes: appointment.notes,
                priority: appointment.priority
            }
        }));
    }

    // Obtener color del evento según estado
    getEventColor(status) {
        const colors = {
            'urgent': '#ef4444',
            'upcoming': '#3b82f6',
            'completed': '#10b981',
            'canceled': '#6b7280'
        };
        return colors[status] || '#3b82f6';
    }

    // Inicializar notificaciones
    initializeNotifications() {
        // Crear contenedor de notificaciones si no existe
        if (!document.querySelector('.notification-container')) {
            const notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'info', duration = 3000) {
        const container = document.querySelector('.notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getNotificationIcon(type);
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Mostrar con animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-remover después del tiempo especificado
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    // Obtener ícono de notificación
    getNotificationIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Adjuntar event listeners
    attachEventListeners() {
        this.attachFilterListeners();
        this.attachViewListeners();
        this.attachModalListeners();
        this.attachFormListeners();
        this.attachQuickActionListeners();
        this.attachActionListeners();
    }

    // Adjuntar listeners de filtros
    attachFilterListeners() {
        // Toggle de filtros
        const toggleBtn = document.getElementById('toggle-filters');
        const filtersContent = document.getElementById('filters-content');
        
        if (toggleBtn && filtersContent) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = filtersContent.classList.contains('hidden');
                filtersContent.classList.toggle('hidden', !isHidden);
                
                const icon = toggleBtn.querySelector('i');
                const text = toggleBtn.querySelector('span');
                
                if (isHidden) {
                    icon.className = 'fas fa-chevron-up';
                    text.textContent = 'Ocultar filtros';
                } else {
                    icon.className = 'fas fa-chevron-down';
                    text.textContent = 'Mostrar filtros';
                }
            });
        }

        // Botones de filtros
        const applyFiltersBtn = document.getElementById('apply-filters');
        const resetFiltersBtn = document.getElementById('reset-filters');
        
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }
        
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => this.resetFilters());
        }
    }

    // Adjuntar listeners de vista
    attachViewListeners() {
        const viewToggleBtns = document.querySelectorAll('.view-toggle-btn-modern');
        
        viewToggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                this.switchView(view);
            });
        });

        // Botón de calendario
        const calendarBtn = document.getElementById('view-calendar');
        if (calendarBtn) {
            calendarBtn.addEventListener('click', () => {
                this.openModal('modalVerCalendario');
                if (this.calendar) {
                    this.calendar.render();
                }
            });
        }
    }

    // Adjuntar listeners de modales
    attachModalListeners() {
        // Botones de cerrar modal
        document.querySelectorAll('.modal-close-modern').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal-id');
                this.closeModal(modalId);
            });
        });

        // Cerrar modal con overlay
        document.querySelectorAll('.modal-overlay-modern').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    const modal = overlay.closest('.modal-modern');
                    if (modal) {
                        this.closeModal(modal.id);
                    }
                }
            });
        });

        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal-modern.show');
                if (openModal) {
                    this.closeModal(openModal.id);
                }
            }
        });
    }

    // Adjuntar listeners de formularios
    attachFormListeners() {
        // Formulario nueva cita
        const newAppointmentForm = document.getElementById('new-appointment-form');
        if (newAppointmentForm) {
            newAppointmentForm.addEventListener('submit', (e) => this.handleNewAppointment(e));
            // Validación en tiempo real
            const fields = newAppointmentForm.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                field.addEventListener('input', () => {
                    if (!field.checkValidity()) {
                        field.classList.add('invalid');
                    } else {
                        field.classList.remove('invalid');
                    }
                });
            });
        }
        // Formulario reprogramar
        const rescheduleForm = document.getElementById('reschedule-form');
        if (rescheduleForm) {
            rescheduleForm.addEventListener('submit', (e) => this.handleReschedule(e));
        }
        // Formulario cancelar
        const cancelForm = document.getElementById('cancel-form');
        if (cancelForm) {
            cancelForm.addEventListener('submit', (e) => this.handleCancel(e));
        }
    }

    // Adjuntar listeners de acciones rápidas
    attachQuickActionListeners() {
        const quickActions = {
            'new-appointment-btn': () => this.openModal('modalNuevaCita'),
            'sync-calendar-btn': () => this.showNotification('Sincronización con calendario iniciada', 'info'),
            'medical-centers-btn': () => this.showNotification('Cargando centros médicos...', 'info'),
            'reminders-btn': () => this.showNotification('Configurando recordatorios...', 'info')
        };

        Object.entries(quickActions).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    // Adjuntar listeners de acciones
    attachActionListeners() {
        // Botones de exportar e imprimir
        const exportBtn = document.getElementById('export-history');
        const printBtn = document.getElementById('print-history');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportHistory());
        }
        
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printHistory());
        }
    }

    // Aplicar filtros
    applyFilters() {
        const dateFrom = document.getElementById('filter-date-from')?.value;
        const dateTo = document.getElementById('filter-date-to')?.value;
        const type = document.getElementById('filter-type')?.value;
        const status = document.getElementById('filter-status')?.value;
        const doctor = document.getElementById('filter-doctor')?.value;

        // Actualizar filtros
        this.filters = {
            dateFrom: dateFrom ? this.parseDate(dateFrom) : null,
            dateTo: dateTo ? this.parseDate(dateTo) : null,
            type: type || 'all',
            status: status || 'all',
            doctor: doctor || ''
        };

        // Aplicar filtros
        const filteredAppointments = this.getFilteredAppointments();
        
        // Actualizar UI
        this.renderAppointments(filteredAppointments);
        this.renderHistory(filteredAppointments);
        
        // Actualizar calendario si existe
        if (this.calendar) {
            this.calendar.removeAllEvents();
            this.calendar.addEventSource(this.getCalendarEvents(filteredAppointments));
        }

        this.showNotification('Filtros aplicados', 'success');
    }

    resetFilters() {
        // Limpiar campos de filtro
        const filterInputs = [
            'filter-date-from',
            'filter-date-to', 
            'filter-type',
            'filter-status',
            'filter-doctor'
        ];

        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'SELECT') {
                    element.selectedIndex = 0;
                } else {
                    element.value = '';
                }
            }
        });

        // Resetear filtros
        this.filters = {
            dateFrom: null,
            dateTo: null,
            type: 'all',
            status: 'all',
            doctor: ''
        };

        // Actualizar UI
        this.renderAppointments();
        this.renderHistory();
        
        // Actualizar calendario
        if (this.calendar) {
            this.calendar.removeAllEvents();
            this.calendar.addEventSource(this.getCalendarEvents());
        }

        this.showNotification('Filtros limpiados', 'info');
    }

    parseDate(dateString) {
        if (!dateString) return null;
        const [day, month, year] = dateString.split('/');
        return new Date(year, month - 1, day);
    }

    getFilteredAppointments() {
        return this.appointments.filter(apt => {
            // Filtro por fecha
            if (this.filters.dateFrom && new Date(apt.start) < this.filters.dateFrom) {
                return false;
            }
            if (this.filters.dateTo && new Date(apt.start) > this.filters.dateTo) {
                return false;
            }

            // Filtro por tipo
            if (this.filters.type !== 'all' && apt.type !== this.filters.type) {
                return false;
            }

            // Filtro por estado
            if (this.filters.status !== 'all' && apt.status !== this.filters.status) {
                return false;
            }

            // Filtro por doctor
            if (this.filters.doctor && !apt.doctor.toLowerCase().includes(this.filters.doctor.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    // Cambiar vista
    switchView(view) {
        this.currentView = view;
        
        // Actualizar botones
        document.querySelectorAll('.view-toggle-btn-modern').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === view);
        });

        // Mostrar/ocultar contenedores
        const gridContainer = document.getElementById('appointments-grid');
        const listContainer = document.getElementById('appointments-list');
        
        if (view === 'cards') {
            gridContainer.classList.remove('hidden');
            listContainer.classList.add('hidden');
        } else {
            gridContainer.classList.add('hidden');
            listContainer.classList.remove('hidden');
        }

        this.renderAppointments();
    }

    // Abrir modal
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }

    // Cerrar modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    // Renderizar dashboard
    renderDashboard() {
        const stats = this.calculateStats();
        
        // Actualizar números
        document.getElementById('total-appointments').textContent = stats.total;
        document.getElementById('urgent-appointments').textContent = stats.urgent;
        document.getElementById('completed-appointments').textContent = stats.completed;
        document.getElementById('upcoming-appointments').textContent = stats.upcoming;
        
        // Actualizar contadores
        document.getElementById('upcoming-count').textContent = `${stats.upcoming} citas programadas`;
        document.getElementById('history-count').textContent = `${stats.completed + stats.canceled} citas en el historial`;
    }

    // Calcular estadísticas
    calculateStats() {
        const now = new Date();
        const stats = {
            total: this.appointments.length,
            urgent: 0,
            completed: 0,
            upcoming: 0,
            canceled: 0
        };

        this.appointments.forEach(appointment => {
            const appointmentDate = new Date(appointment.start);
            
            switch (appointment.status) {
                case 'urgent':
                    stats.urgent++;
                    break;
                case 'completed':
                    stats.completed++;
                    break;
                case 'upcoming':
                    if (appointmentDate > now) {
                        stats.upcoming++;
                    }
                    break;
                case 'canceled':
                    stats.canceled++;
                    break;
            }
        });

        return stats;
    }

    // Renderizar citas
    renderAppointments(appointments = null) {
        const apts = appointments || this.getFilteredAppointments('upcoming');
        const carouselContainer = document.getElementById('appointments-carousel');
        const listContainer = document.getElementById('appointments-list');
        if (carouselContainer) {
            carouselContainer.innerHTML = apts.map(apt => this.createAppointmentCard(apt)).join('');
        }
        if (listContainer) {
            listContainer.innerHTML = apts.map(apt => this.createAppointmentListItem(apt)).join('');
        }
        this.attachCarouselNavigation();
    }

    attachCarouselNavigation() {
        const carousel = document.getElementById('appointments-carousel');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        if (!carousel || !prevBtn || !nextBtn) return;
        prevBtn.onclick = () => { carousel.scrollBy({ left: -340, behavior: 'smooth' }); };
        nextBtn.onclick = () => { carousel.scrollBy({ left: 340, behavior: 'smooth' }); };
    }

    // Renderizar tarjetas de citas
    createAppointmentCard(appointment) {
        const date = new Date(appointment.start);
        const badgeClass = this.getBadgeClass(appointment.status);
        const badgeText = this.getBadgeText(appointment.status);
        const icon = this.getAppointmentIcon(appointment.title);

        return `
            <div class="metric-card ${appointment.status}" data-appointment-id="${appointment.id}">
                <div class="metric-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="metric-content">
                    <div class="metric-number">${this.formatTime(date)}</div>
                    <div class="metric-label">${appointment.title}</div>
                    <div class="metric-trend ${appointment.status}">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${appointment.location}</span>
                    </div>
                </div>
                <div class="metric-chart">
                    <div class="chart-bar ${appointment.status}" style="height: ${this.getPriorityHeight(appointment.priority)}%"></div>
                </div>
                <div class="card-actions">
                    <button class="btn-modern btn-secondary-modern small" onclick="appointmentManager.showAppointmentDetails('${appointment.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-modern btn-primary-modern small" onclick="appointmentManager.openModal('modalReprogramarCita')">
                        <i class="fas fa-calendar-pen"></i>
                    </button>
                    <button class="btn-modern btn-danger-modern small" onclick="appointmentManager.openModal('modalCancelarCita')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Renderizar lista de citas
    createAppointmentListItem(appointment) {
        const date = new Date(appointment.start);
        const badgeClass = this.getBadgeClass(appointment.status);
        const badgeText = this.getBadgeText(appointment.status);

        return `
            <div class="appointment-list-item ${appointment.status}" data-appointment-id="${appointment.id}">
                <div class="item-main">
                    <div class="item-title">
                        <h3>${appointment.title}</h3>
                        <span class="badge ${badgeClass}">${badgeText}</span>
                        </div>
                    <div class="item-details">
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(date)}</span>
                        <span><i class="fas fa-clock"></i> ${this.formatTime(date)}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${appointment.location}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-modern btn-secondary-modern small" onclick="appointmentManager.showAppointmentDetails('${appointment.id}')">
                        <i class="fas fa-eye"></i>
                        </button>
                    <button class="btn-modern btn-primary-modern small" onclick="appointmentManager.openModal('modalReprogramarCita')">
                        <i class="fas fa-calendar-pen"></i>
                        </button>
                    <button class="btn-modern btn-danger-modern small" onclick="appointmentManager.openModal('modalCancelarCita')">
                        <i class="fas fa-times"></i>
                        </button>
                </div>
            </div>
        `;
    }

    // Renderizar historial
    renderHistory(appointments = null) {
        const apts = appointments || this.getFilteredAppointments('completed');
        const tbody = document.querySelector('.history-table tbody');
        
        if (tbody) {
            tbody.innerHTML = apts.map(apt => this.createHistoryRow(apt)).join('');
        }
    }

    // Crear fila de historial
    createHistoryRow(appointment) {
        const date = new Date(appointment.start);
        const statusText = this.getStatusText(appointment.status);
        const statusClass = this.getBadgeClass(appointment.status);

        return `
            <tr data-appointment-id="${appointment.id}">
                <td>
                    <div class="date-info">
                        <div class="date-main">${this.formatDate(date)}</div>
                        <div class="date-time">${this.formatTime(date)}</div>
                    </div>
                </td>
                <td>
                    <div class="type-info">
                        <i class="${this.getAppointmentIcon(appointment.title)}"></i>
                        <span>${appointment.title}</span>
                    </div>
                </td>
                <td>${appointment.doctor}</td>
                <td>${appointment.location}</td>
                <td>
                    <span class="badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-modern btn-secondary-modern small" onclick="appointmentManager.showAppointmentDetails('${appointment.id}')" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    </td>
            </tr>
        `;
    }

    // Obtener clase de badge
    getBadgeClass(status) {
        const classes = {
            'urgent': 'urgent',
            'upcoming': 'upcoming',
            'completed': 'completed',
            'canceled': 'canceled'
        };
        return classes[status] || 'upcoming';
    }

    // Obtener texto de badge
    getBadgeText(status) {
        const texts = {
            'urgent': 'Urgente',
            'upcoming': 'Próxima',
            'completed': 'Completada',
            'canceled': 'Cancelada'
        };
        return texts[status] || 'Próxima';
    }

    // Obtener texto de estado
    getStatusText(status) {
        const statuses = {
            'upcoming': 'Próxima',
            'urgent': 'Urgente',
            'completed': 'Completada',
            'canceled': 'Cancelada'
        };
        return statuses[status] || status;
    }

    // Obtener ícono de cita
    getAppointmentIcon(title) {
        const icons = {
            'Consulta': 'fas fa-stethoscope',
            'Análisis': 'fas fa-flask',
            'Vacunación': 'fas fa-syringe',
            'Revisión': 'fas fa-eye',
            'Pruebas': 'fas fa-vial',
            'Urgencia': 'fas fa-ambulance'
        };

        for (const [key, icon] of Object.entries(icons)) {
            if (title.toLowerCase().includes(key.toLowerCase())) {
                return icon;
            }
        }
        return 'fas fa-calendar-check';
    }

    // Obtener altura de prioridad
    getPriorityHeight(priority) {
        const heights = {
            'urgent': 100,
            'high': 80,
            'normal': 60,
            'low': 40
        };
        return heights[priority] || 60;
    }

    // Manejadores de eventos
    handleNewAppointment(event) {
        event.preventDefault();
        
        const form = event.target;
        
        // Validar formulario antes de procesar
        if (!this.validateForm(form)) {
            return;
        }
        
        // Obtener datos del formulario
        const type = form.querySelector('#appointment-type').value;
        const doctor = form.querySelector('#appointment-doctor').value;
        const date = form.querySelector('#appointment-date').value;
        const time = form.querySelector('#appointment-time').value;
        const location = form.querySelector('#appointment-location').value;
        const urgency = form.querySelector('input[name="urgency"]:checked')?.value || 'normal';
        const notes = form.querySelector('#appointment-notes').value;
        
        // Recordatorios
        const reminder24h = form.querySelector('#reminder-24h')?.checked || false;
        const reminder1h = form.querySelector('#reminder-1h')?.checked || false;
        const reminder15min = form.querySelector('#reminder-15min')?.checked || false;
        
        // Integraciones
        const addToCalendar = form.querySelector('#add-to-calendar')?.checked || false;
        const shareWithFamily = form.querySelector('#share-with-family')?.checked || false;

        try {
            // Crear objeto cita
            const startDateTime = this.formatDateForStorage(date, time);
            const newAppointment = {
                id: 'apt-' + Date.now(),
                title: this.getAppointmentTitle(type),
                type,
                start: startDateTime,
                end: this.calculateEndTime(startDateTime),
                location,
                doctor,
                notes,
                status: urgency === 'emergency' ? 'urgent' : 'upcoming',
                priority: urgency,
                reminders: { reminder24h, reminder1h, reminder15min },
                integrations: { addToCalendar, shareWithFamily }
            };
            
            // Agregar y guardar
            this.appointments.push(newAppointment);
            this.saveToStorage();
            
            // Mostrar notificación de éxito
        this.showNotification('Cita creada exitosamente', 'success');
            
            // Cerrar modal y limpiar formulario
        this.closeModal('modalNuevaCita');
            form.reset();
            
            // Limpiar validaciones
            form.querySelectorAll('.validation-message').forEach(msg => msg.remove());
            form.querySelectorAll('.error, .success').forEach(field => {
                field.classList.remove('error', 'success');
            });
            
            // Recargar datos y actualizar interfaz
        this.renderDashboard();
            this.renderNextAppointmentHero();
            this.renderSummarySections();
            this.renderUpcomingAppointments();
        this.renderAppointments();
            this.updateCalendar();
            updateAppointmentsStatus();
            
            // Procesar integraciones si están habilitadas
            if (addToCalendar) {
                this.addToCalendar(newAppointment);
            }
            
            if (shareWithFamily) {
                this.shareWithFamily(newAppointment);
            }
            
        } catch (error) {
            console.error('Error al crear la cita:', error);
            this.showNotification('Error al crear la cita. Por favor, intenta de nuevo.', 'error');
        }
    }

    // Utilidad para formatear fecha y hora a ISO
    formatDateForStorage(date, time) {
        // date: dd/mm/yyyy, time: HH:MM
        const [day, month, year] = date.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}:00`;
    }
    // Utilidad para obtener título según tipo
    getAppointmentTitle(type) {
        switch(type) {
            case 'general': return 'Consulta general';
            case 'specialist': return 'Especialista';
            case 'test': return 'Pruebas médicas';
            case 'vaccine': return 'Vacunación';
            case 'followup': return 'Seguimiento';
            case 'emergency': return 'Urgencia';
            default: return 'Cita médica';
        }
    }
    // Utilidad para calcular hora de fin (por defecto +45min)
    calculateEndTime(start) {
        const date = new Date(start);
        date.setMinutes(date.getMinutes() + 45);
        return date.toISOString().slice(0,16);
    }

    // Utilidad para formatear fecha
    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Utilidad para formatear hora
    formatTime(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    handleReschedule(event) {
        event.preventDefault();
        
        this.showNotification('Cita reprogramada exitosamente', 'success');
        this.closeModal('modalReprogramarCita');
    }

    handleCancel(event) {
        event.preventDefault();
        
        this.showNotification('Cita cancelada exitosamente', 'warning');
        this.closeModal('modalCancelarCita');
    }

    // Mostrar detalles de cita
    showAppointmentDetails(appointmentId) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (!appointment) {
            this.showNotification('Cita no encontrada', 'error');
            return;
        }

        // Llenar el modal con la información de la cita
        this.fillAppointmentDetailsModal(appointment);
        
        // Abrir el modal
        openModal('modalDetallesCita');
    }

    // Llenar el modal de detalles con la información de la cita
    fillAppointmentDetailsModal(appointment) {
        const date = new Date(appointment.start);
        // Información general
        document.getElementById('detail-appointment-title').textContent = appointment.title;
        document.getElementById('detail-appointment-subtitle').textContent = `Cita con ${appointment.doctor}`;
        // Detalles específicos
        document.getElementById('detail-type').textContent = appointment.title;
        document.getElementById('detail-doctor').textContent = appointment.doctor;
        document.getElementById('detail-datetime').textContent = `${this.formatDate(date)} a las ${this.formatTime(date)}`;
        document.getElementById('detail-location').textContent = appointment.location;
        // Mostrar especialidad si existe
        const specialtyElement = document.getElementById('detail-specialty');
        if (specialtyElement) {
            specialtyElement.textContent = appointment.specialty || '';
            specialtyElement.parentElement.style.display = appointment.specialty ? '' : 'none';
        }
        // Notas
        const notesElement = document.getElementById('detail-notes');
        if (notesElement) {
            notesElement.textContent = appointment.notes || 'No hay notas adicionales para esta cita.';
        }
        // Recordatorios
        this.renderAppointmentReminders(appointment);
        // Guardar el ID de la cita para las acciones
        this.currentDetailAppointmentId = appointment.id;
    }

    // Renderizar recordatorios de la cita
    renderAppointmentReminders(appointment) {
        const remindersContainer = document.getElementById('detail-reminders');
        if (!remindersContainer) return;

        // Simular recordatorios (en una implementación real, estos vendrían de la base de datos)
        const reminders = [
            { time: '24 horas antes', date: this.getReminderDate(appointment.start, -24), type: 'check' },
            { time: '1 hora antes', date: this.getReminderDate(appointment.start, -1), type: 'clock' }
        ];

        remindersContainer.innerHTML = reminders.map(reminder => `
            <div class="reminder-item">
                <i class="fas fa-${reminder.type === 'check' ? 'check-circle' : 'clock'}"></i>
                <span>${reminder.time} - ${reminder.date}</span>
                </div>
        `).join('');
    }

    // Calcular fecha de recordatorio
    getReminderDate(appointmentDate, hoursOffset) {
        const date = new Date(appointmentDate);
        date.setHours(date.getHours() + hoursOffset);
        return this.formatDate(date) + ' ' + this.formatTime(date);
    }

    // Exportar historial
    exportHistory() {
        const historyAppointments = this.getFilteredAppointments('history');
        const csv = this.generateCSV(historyAppointments);
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'historial_citas.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Historial exportado exitosamente', 'success');
    }

    // Generar CSV
    generateCSV(appointments) {
        const headers = ['Fecha', 'Hora', 'Tipo', 'Profesional', 'Ubicación', 'Estado', 'Notas'];
        const rows = appointments.map(a => [
            this.formatDate(new Date(a.start)),
            this.formatTime(new Date(a.start)),
            a.title,
            a.doctor,
            a.location,
            this.getStatusText(a.status),
            a.notes || ''
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
    }

    // Imprimir historial
    printHistory() {
        window.print();
        this.showNotification('Preparando para impresión...', 'info');
    }

    // === PERSISTENCIA DE DATOS CON DATAMANAGER ===

    saveToStorage() {
        return this.dataManager.saveAppointments(this.appointments);
    }

    loadFromStorage() {
        this.appointments = this.dataManager.loadAppointments();
        return this.appointments;
    }

    // Guardar filtros
    saveFilters() {
        return this.dataManager.saveFilters(this.filters);
    }

    // Guardar configuración
    saveSettings() {
        return this.dataManager.saveSettings(this.settings);
    }

    // Guardar doctores
    saveDoctors() {
        return this.dataManager.saveDoctors(this.doctors);
    }

    // Aplicar configuración
    applySettings() {
        if (this.settings.theme) {
            document.body.setAttribute('data-theme', this.settings.theme);
        }
        
        if (this.settings.notifications === false) {
            // Desactivar notificaciones
            this.notificationContainer?.classList.add('disabled');
        }
    }

    // Aplicar filtros guardados
    applyFilters() {
        // Restaurar valores de filtros en la UI
        const filterElements = {
            'filter-date-from': this.filters.dateFrom,
            'filter-date-to': this.filters.dateTo,
            'filter-type': this.filters.type,
            'filter-status': this.filters.status,
            'filter-doctor': this.filters.doctor,
            'filter-location': this.filters.location
        };

        Object.entries(filterElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value) {
                element.value = value;
            }
        });
    }

    // Funciones para las tarjetas de acciones rápidas
    filterAppointments(filter) {
        showNotification(`Filtrando citas: ${filter}`, 'info');
        
        // Actualizar el filtro actual
        this.currentFilter = filter;
        
        // Aplicar filtros
        this.applyFilters();
        
        // Actualizar la vista
        this.renderAppointments();
        
        showNotification(`Mostrando citas ${filter}`, 'success');
    }

    viewHistory() {
        showNotification('Abriendo historial de citas...', 'info');
        
        // Aquí se abriría la sección de historial
        // Por ahora, simulamos la acción
        setTimeout(() => {
            // Scroll a la sección de historial si existe
            const historySection = document.querySelector('.appointments-history');
            if (historySection) {
                historySection.scrollIntoView({ behavior: 'smooth' });
            }
            showNotification('Historial de citas cargado', 'success');
        }, 1000);
    }

    // Actualizar las tarjetas de acciones rápidas
    updateQuickCards() {
        const nextAppointment = this.getNextAppointment();
        const urgentAppointments = this.appointments.filter(apt => apt.status === 'urgent');
        const completedAppointments = this.appointments.filter(apt => apt.status === 'completed');
        
        // Actualizar tarjeta de próxima cita
        if (nextAppointment) {
            const nextAppointmentCard = document.getElementById('nextAppointmentCard');
            if (nextAppointmentCard) {
                const timeUntil = this.getTimeUntil(nextAppointment.start);
                document.getElementById('nextAppointmentTime').textContent = timeUntil;
                document.getElementById('nextAppointmentName').textContent = nextAppointment.title;
                document.getElementById('nextAppointmentDoctor').textContent = nextAppointment.doctor;
            }
        }
        
        // Actualizar tarjeta de citas urgentes
        const urgentAppointmentsCard = document.getElementById('urgentAppointmentsCard');
        if (urgentAppointmentsCard) {
            document.getElementById('urgentCount').textContent = `${urgentAppointments.length} pendientes`;
            
            if (urgentAppointments.length > 0) {
                const nextUrgent = urgentAppointments[0];
                const urgentDate = new Date(nextUrgent.start);
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                let urgentTimeText = '';
                if (urgentDate.toDateString() === today.toDateString()) {
                    urgentTimeText = 'Hoy';
                } else if (urgentDate.toDateString() === tomorrow.toDateString()) {
                    urgentTimeText = 'Mañana';
                } else {
                    urgentTimeText = urgentDate.toLocaleDateString('es-ES', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                    });
                }
                
                document.getElementById('urgentTime').textContent = urgentTimeText;
            }
        }
        
        // Actualizar tarjeta de historial
        const recentHistoryCard = document.getElementById('recentHistoryCard');
        if (recentHistoryCard) {
            const recentCompleted = completedAppointments.slice(0, 3);
            document.getElementById('recentCount').textContent = `${recentCompleted.length} completadas`;
            document.getElementById('historyTime').textContent = 'Este mes';
        }
    }

    // Función para obtener el tiempo hasta una fecha
    getTimeUntil(dateString) {
        const now = new Date();
        const targetDate = new Date(dateString);
        const diffTime = targetDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'Pasada';
        } else if (diffDays === 0) {
            return 'Hoy';
        } else if (diffDays === 1) {
            return 'Mañana';
        } else if (diffDays < 7) {
            return `En ${diffDays} días`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `En ${weeks} semana${weeks > 1 ? 's' : ''}`;
        } else {
            const months = Math.floor(diffDays / 30);
            return `En ${months} mes${months > 1 ? 'es' : ''}`;
        }
    }

    // Función para manejar estados de carga en botones
    setButtonLoading(button, isLoading = true) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            button.removeAttribute('aria-busy');
        }
    }

    // Función para mostrar feedback visual en botones
    showButtonFeedback(button, type = 'success', message = '') {
        const originalText = button.innerHTML;
        const originalClasses = button.className;
        
        // Cambiar temporalmente el estilo del botón
        if (type === 'success') {
            button.className = button.className.replace(/btn-\w+-modern/, 'btn-success-modern');
        } else if (type === 'error') {
            button.className = button.className.replace(/btn-\w+-modern/, 'btn-cancel-modern');
        }
        
        // Mostrar mensaje si se proporciona
        if (message) {
            button.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'times'}"></i><span>${message}</span>`;
        }
        
        // Restaurar después de 2 segundos
        setTimeout(() => {
            button.className = originalClasses;
            button.innerHTML = originalText;
        }, 2000);
    }



    // Función para actualizar el calendario cuando se agregan nuevas citas
    updateCalendar() {
        if (this.calendar) {
            this.calendar.removeAllEvents();
            this.calendar.addEventSource(this.getCalendarEvents());
        }
    }

    // Validación en tiempo real del formulario
    setupFormValidation() {
        const form = document.getElementById('new-appointment-form');
        if (!form) return;

        const fields = form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            // Validar al perder el foco
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            // Validar al escribir (para campos de texto)
            if (field.type === 'text' || field.type === 'textarea') {
                field.addEventListener('input', () => {
                    this.validateField(field);
                });
            }
            
            // Validar al cambiar (para selects y radios)
            if (field.type === 'select-one' || field.type === 'radio') {
                field.addEventListener('change', () => {
                    this.validateField(field);
                });
            }
        });

        // Validar todo el formulario al enviar
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm(form)) {
                this.handleNewAppointment(e);
            }
        });
    }

    // Validar un campo específico
    validateField(field) {
        const fieldName = field.name || field.id;
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Remover mensajes de validación previos
        this.clearFieldValidation(field);

        // Validaciones específicas por campo
        switch (fieldName) {
            case 'appointment-type':
                if (!value) {
                    isValid = false;
                    message = 'Debes seleccionar un tipo de cita';
                }
                break;
                
            case 'appointment-doctor':
                if (!value) {
                    isValid = false;
                    message = 'Debes ingresar el nombre del doctor';
                } else if (value.length < 3) {
                    isValid = false;
                    message = 'El nombre del doctor debe tener al menos 3 caracteres';
                }
                break;
                
            case 'appointment-date':
                if (!value) {
                    isValid = false;
                    message = 'Debes seleccionar una fecha';
                } else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate < today) {
                        isValid = false;
                        message = 'La fecha debe ser futura';
                    }
                }
                break;
                
            case 'appointment-time':
                if (!value) {
                    isValid = false;
                    message = 'Debes seleccionar una hora';
                }
                break;
                
            case 'appointment-location':
                if (!value) {
                    isValid = false;
                    message = 'Debes seleccionar una ubicación';
                }
                break;
                
            case 'appointment-notes':
                if (value.length > 500) {
                    isValid = false;
                    message = 'Las notas no pueden exceder 500 caracteres';
                }
                break;
        }

        // Mostrar resultado de validación
        this.showFieldValidation(field, isValid, message);
        
        return isValid;
    }

    // Validar todo el formulario
    validateForm(form) {
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showNotification('Por favor, corrige los errores en el formulario', 'error');
        }

        return isValid;
    }

    // Mostrar mensaje de validación
    showFieldValidation(field, isValid, message) {
        // Remover clases previas
        field.classList.remove('error', 'success');
        
        // Agregar clase según resultado
        if (isValid) {
            field.classList.add('success');
        } else {
            field.classList.add('error');
        }

        // Crear o actualizar mensaje de validación
        let validationMessage = field.parentNode.querySelector('.validation-message');
        
        if (!validationMessage) {
            validationMessage = document.createElement('div');
            validationMessage.className = 'validation-message';
            field.parentNode.appendChild(validationMessage);
        }

        if (isValid) {
            validationMessage.className = 'validation-message success';
            validationMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Campo válido</span>
            `;
        } else {
            validationMessage.className = 'validation-message error';
            validationMessage.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            `;
        }
    }

    // Limpiar mensaje de validación
    clearFieldValidation(field) {
        field.classList.remove('error', 'success');
        
        const validationMessage = field.parentNode.querySelector('.validation-message');
        if (validationMessage) {
            validationMessage.remove();
        }
    }

    // Función para agregar cita al calendario
    addToCalendar(appointment) {
        try {
            // Crear evento para calendario
            const event = {
                title: appointment.title,
                start: appointment.start,
                end: appointment.end,
                location: appointment.location,
                description: `Cita médica con ${appointment.doctor}\n${appointment.notes || ''}`
            };
            
            // Generar URL para Google Calendar
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start.replace(/[-:]/g, '').replace('T', 'T')}/${event.end.replace(/[-:]/g, '').replace('T', 'T')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
            
            // Abrir en nueva pestaña
            window.open(googleCalendarUrl, '_blank');
            
            this.showNotification('Evento agregado al calendario', 'success');
        } catch (error) {
            console.error('Error al agregar al calendario:', error);
            this.showNotification('Error al agregar al calendario', 'error');
        }
    }

    // Función para compartir con familiares
    shareWithFamily(appointment) {
        try {
            // Crear mensaje para compartir
            const message = `Nueva cita médica programada:\n\n` +
                          `📅 ${appointment.title}\n` +
                          `👨‍⚕️ ${appointment.doctor}\n` +
                          `📅 ${this.formatDate(new Date(appointment.start))} a las ${this.formatTime(new Date(appointment.start))}\n` +
                          `📍 ${appointment.location}\n` +
                          `${appointment.notes ? `📝 ${appointment.notes}\n` : ''}` +
                          `\nRecordatorio: ${appointment.location}`;
            
            // Intentar compartir usando Web Share API si está disponible
            if (navigator.share) {
                navigator.share({
                    title: 'Nueva Cita Médica',
                    text: message,
                    url: window.location.href
                }).then(() => {
                    this.showNotification('Cita compartida con familiares', 'success');
                }).catch((error) => {
                    console.log('Error al compartir:', error);
                    this.fallbackShare(message);
                });
            } else {
                this.fallbackShare(message);
            }
        } catch (error) {
            console.error('Error al compartir:', error);
            this.showNotification('Error al compartir la cita', 'error');
        }
    }

    // Método alternativo para compartir
    fallbackShare(message) {
        // Crear un área de texto temporal para copiar
        const textArea = document.createElement('textarea');
        textArea.value = message;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Información de la cita copiada al portapapeles', 'success');
        } catch (err) {
            this.showNotification('No se pudo copiar la información', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    // Aplicar filtros a citas próximas
    applyFiltersToUpcoming() {
        const filters = this.getCurrentFilters();
        let filteredAppointments = this.appointments.filter(apt => 
            apt.status === 'upcoming' || apt.status === 'urgent'
        );

        // Filtrar por tipo
        if (filters.type && filters.type !== 'all') {
            filteredAppointments = filteredAppointments.filter(apt => apt.type === filters.type);
        }

        // Filtrar por doctor
        if (filters.doctor && filters.doctor.trim()) {
            filteredAppointments = filteredAppointments.filter(apt => 
                apt.doctor.toLowerCase().includes(filters.doctor.toLowerCase())
            );
        }

        // Filtrar por fecha
        if (filters.dateFrom || filters.dateTo) {
            filteredAppointments = filteredAppointments.filter(apt => {
                const aptDate = new Date(apt.start);
                const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
                const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
                
                if (fromDate && aptDate < fromDate) return false;
                if (toDate && aptDate > toDate) return false;
                return true;
            });
        }

        // Filtrar por estado
        if (filters.status && filters.status !== 'all') {
            filteredAppointments = filteredAppointments.filter(apt => apt.status === filters.status);
        }

        // Renderizar con filtros aplicados
        this.renderUpcomingAppointments(filteredAppointments);
        
        // Mostrar notificación de resultados
        const count = filteredAppointments.length;
        if (count === 0) {
            this.showNotification('No se encontraron citas con los filtros aplicados', 'info');
        } else {
            this.showNotification(`Mostrando ${count} cita${count === 1 ? '' : 's'}`, 'success');
        }
    }

    // Obtener filtros actuales
    getCurrentFilters() {
        return {
            dateFrom: document.getElementById('filter-date-from')?.value || null,
            dateTo: document.getElementById('filter-date-to')?.value || null,
            type: document.getElementById('filter-type')?.value || 'all',
            status: document.getElementById('filter-status')?.value || 'all',
            doctor: document.getElementById('filter-doctor')?.value || ''
        };
    }

    // Limpiar filtros de citas próximas
    clearUpcomingFilters() {
        // Limpiar campos de filtro
        const filterFields = [
            'filter-date-from',
            'filter-date-to', 
            'filter-type',
            'filter-status',
            'filter-doctor'
        ];

        filterFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.tagName === 'SELECT') {
                    field.value = 'all';
                } else {
                    field.value = '';
                }
            }
        });

        // Renderizar todas las citas próximas
        this.renderUpcomingAppointments();
        this.showNotification('Filtros limpiados', 'success');
    }

    // Búsqueda en tiempo real para citas próximas
    setupUpcomingSearch() {
        const searchInput = document.getElementById('upcoming-search');
        if (!searchInput) return;
        
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                const query = e.target.value.toLowerCase().trim();
                const cards = document.querySelectorAll('.upcoming-appointment-card');
                
                if (cards.length === 0) return;
                
                let visibleCount = 0;
                
                cards.forEach(card => {
                    const title = card.querySelector('.appointment-type span')?.textContent.toLowerCase() || '';
                    const doctor = card.querySelector('.info-row span')?.textContent.toLowerCase() || '';
                    const locationElements = card.querySelectorAll('.info-row span');
                    const location = locationElements.length > 3 ? locationElements[3].textContent.toLowerCase() : '';
                    
                    const matches = title.includes(query) || doctor.includes(query) || location.includes(query);
                    card.style.display = matches ? 'block' : 'none';
                    
                    if (matches) visibleCount++;
                });
                
                // Mostrar estado vacío si no hay resultados
                if (visibleCount === 0 && query) {
                    this.showNoResultsMessage(query);
                } else if (visibleCount > 0 && query) {
                    this.hideNoResultsMessage();
                } else if (query === '') {
                    this.hideNoResultsMessage();
                    cards.forEach(card => card.style.display = 'block');
                }
            }, 300);
        });
    }

    // Mostrar mensaje de no resultados
    showNoResultsMessage(query) {
        let noResultsContainer = document.getElementById('no-results-message');
        
        if (!noResultsContainer) {
            noResultsContainer = document.createElement('div');
            noResultsContainer.id = 'no-results-message';
            noResultsContainer.className = 'empty-state enhanced';
            
            const carouselContainer = document.querySelector('.appointments-carousel-wrapper');
            if (carouselContainer) {
                carouselContainer.appendChild(noResultsContainer);
            }
        }
        
        noResultsContainer.innerHTML = `
            <div class="empty-icon">
                <i class="fas fa-search"></i>
            </div>
            <h3>No se encontraron resultados</h3>
            <p>No hay citas que coincidan con "${query}"</p>
            <button class="btn btn-secondary" onclick="clearUpcomingSearch()">
                <i class="fas fa-times"></i>
                Limpiar búsqueda
            </button>
        `;
        
        noResultsContainer.style.display = 'block';
    }

    // Ocultar mensaje de no resultados
    hideNoResultsMessage() {
        const noResultsContainer = document.getElementById('no-results-message');
        if (noResultsContainer) {
            noResultsContainer.style.display = 'none';
        }
    }

    // Manejar acciones de citas próximas
    handleUpcomingAction(action, appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) {
            this.showNotification('Cita no encontrada', 'error');
            return;
        }

        switch (action) {
            case 'reschedule':
                this.openRescheduleModal(appointment);
                break;
            case 'cancel':
                this.openCancelModal(appointment);
                break;
            case 'details':
                this.showAppointmentDetails(appointmentId);
                break;
            case 'reminder':
                this.toggleReminder(appointment);
                break;
            case 'share':
                this.shareAppointment(appointment);
                break;
            case 'calendar':
                this.addToCalendar(appointment);
                break;
            default:
                console.warn('Acción no reconocida:', action);
        }
    }

    // Abrir modal de reprogramación
    openRescheduleModal(appointment) {
        // Crear modal dinámicamente
        const modalHTML = `
            <div class="modal-overlay" id="reschedule-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Reprogramar Cita</h3>
                        <button class="modal-close" onclick="closeRescheduleModal()" aria-label="Cerrar modal">
                            <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="current-appointment-info">
                            <h4>Cita Actual</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="label">Tipo:</span>
                                    <span class="value">${this.getTypeLabel(appointment.type)}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Doctor:</span>
                                    <span class="value">${appointment.doctor}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Fecha Actual:</span>
                                    <span class="value">${this.formatDate(appointment.start)}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Hora:</span>
                                    <span class="value">${this.formatTime(appointment.start)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <form id="reschedule-form" class="reschedule-form">
                            <div class="form-group">
                                <label for="new-date">Nueva Fecha</label>
                                <input type="date" id="new-date" required min="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label for="new-time">Nueva Hora</label>
                                <input type="time" id="new-time" required>
                            </div>
                            <div class="form-group">
                                <label for="reschedule-reason">Motivo (opcional)</label>
                                <textarea id="reschedule-reason" placeholder="¿Por qué necesitas reprogramar esta cita?"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeRescheduleModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="confirmReschedule(${appointment.id})">
                            <i class="fas fa-calendar-check"></i>
                            Confirmar Reprogramación
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configurar fecha mínima y hora por defecto
        const dateInput = document.getElementById('new-date');
        const timeInput = document.getElementById('new-time');
        
        if (dateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.min = tomorrow.toISOString().split('T')[0];
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }
        
        if (timeInput) {
            timeInput.value = '09:00';
        }

        // Mostrar modal
        document.getElementById('reschedule-modal').style.display = 'flex';
    }

    // Abrir modal de cancelación
    openCancelModal(appointment) {
        const modalHTML = `
            <div class="modal-overlay" id="cancel-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Cancelar Cita</h3>
                        <button class="modal-close" onclick="closeCancelModal()" aria-label="Cerrar modal">
                            <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="warning-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>¿Estás seguro de que quieres cancelar esta cita?</p>
                        </div>
                        
                        <div class="appointment-details">
                            <h4>Detalles de la Cita</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="label">Tipo:</span>
                                    <span class="value">${this.getTypeLabel(appointment.type)}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Doctor:</span>
                                    <span class="value">${appointment.doctor}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Fecha:</span>
                                    <span class="value">${this.formatDate(appointment.start)}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Hora:</span>
                                    <span class="value">${this.formatTime(appointment.start)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="cancel-reason">Motivo de cancelación</label>
                            <select id="cancel-reason" required>
                                <option value="">Seleccionar motivo</option>
                                <option value="personal">Asunto personal</option>
                                <option value="health">Problema de salud</option>
                                <option value="schedule">Conflicto de horario</option>
                                <option value="emergency">Emergencia</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="cancel-notes">Notas adicionales (opcional)</label>
                            <textarea id="cancel-notes" placeholder="Proporciona más detalles sobre la cancelación"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeCancelModal()">Mantener Cita</button>
                        <button class="btn btn-danger" onclick="confirmCancel(${appointment.id})">
                            <i class="fas fa-times"></i>
                            Confirmar Cancelación
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('cancel-modal').style.display = 'flex';
    }

    // Confirmar reprogramación
    confirmReschedule(appointmentId) {
        const form = document.getElementById('reschedule-form');
        const newDate = document.getElementById('new-date').value;
        const newTime = document.getElementById('new-time').value;
        const reason = document.getElementById('reschedule-reason').value;

        if (!newDate || !newTime) {
            this.showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        const newDateTime = new Date(`${newDate}T${newTime}`);
        
        // Validar que la nueva fecha sea futura
        if (newDateTime <= new Date()) {
            this.showNotification('La nueva fecha debe ser futura', 'error');
            return;
        }

        // Actualizar cita
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            const oldDateTime = appointment.start;
            appointment.start = newDateTime.toISOString();
            appointment.end = new Date(newDateTime.getTime() + 30 * 60000).toISOString(); // +30 min
            appointment.rescheduleReason = reason;
            appointment.lastModified = new Date().toISOString();

            // Guardar cambios
            this.saveAppointments();
            
            // Actualizar UI
            this.renderUpcomingAppointments();
            this.updateCalendar();
            
            // Cerrar modal
            this.closeRescheduleModal();
            
            // Mostrar notificación
            this.showNotification('Cita reprogramada exitosamente', 'success');
            
            // Enviar notificación al doctor (simulado)
            this.sendRescheduleNotification(appointment, oldDateTime);
        }
    }

    // Confirmar cancelación
    confirmCancel(appointmentId) {
        const reason = document.getElementById('cancel-reason').value;
        const notes = document.getElementById('cancel-notes').value;

        if (!reason) {
            this.showNotification('Por favor selecciona un motivo de cancelación', 'error');
            return;
        }

        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            appointment.status = 'cancelled';
            appointment.cancelReason = reason;
            appointment.cancelNotes = notes;
            appointment.cancelledAt = new Date().toISOString();

            // Guardar cambios
            this.saveAppointments();
            
            // Actualizar UI
            this.renderUpcomingAppointments();
            this.updateCalendar();
            
            // Cerrar modal
            this.closeCancelModal();
            
            // Mostrar notificación
            this.showNotification('Cita cancelada exitosamente', 'success');
            
            // Enviar notificación al doctor (simulado)
            this.sendCancelNotification(appointment);
        }
    }

    // Alternar recordatorio
    toggleReminder(appointment) {
        appointment.reminderEnabled = !appointment.reminderEnabled;
        
        if (appointment.reminderEnabled) {
            this.scheduleReminder(appointment);
            this.showNotification('Recordatorio activado', 'success');
        } else {
            this.cancelReminder(appointment);
            this.showNotification('Recordatorio desactivado', 'info');
        }
        
        this.saveAppointments();
        this.renderUpcomingAppointments();
    }

    // Programar recordatorio
    scheduleReminder(appointment) {
        const appointmentTime = new Date(appointment.start);
        const reminderTime = new Date(appointmentTime.getTime() - 60 * 60 * 1000); // 1 hora antes
        
        if (reminderTime > new Date()) {
            const timeoutId = setTimeout(() => {
                this.showReminderNotification(appointment);
            }, reminderTime.getTime() - Date.now());
            
            appointment.reminderTimeoutId = timeoutId;
        }
    }

    // Cancelar recordatorio
    cancelReminder(appointment) {
        if (appointment.reminderTimeoutId) {
            clearTimeout(appointment.reminderTimeoutId);
            appointment.reminderTimeoutId = null;
        }
    }

    // Mostrar notificación de recordatorio
    showReminderNotification(appointment) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Recordatorio de Cita', {
                body: `Tienes una cita en 1 hora: ${appointment.title} con ${appointment.doctor}`,
                icon: '/favicon.ico',
                tag: `appointment-${appointment.id}`
            });
        }
        
        this.showNotification(`Recordatorio: Cita en 1 hora con ${appointment.doctor}`, 'info');
    }

    // Compartir cita
    shareAppointment(appointment) {
        if (navigator.share) {
            navigator.share({
                title: 'Mi Cita Médica',
                text: `Tengo una cita: ${appointment.title} con ${appointment.doctor} el ${this.formatDate(appointment.start)} a las ${this.formatTime(appointment.start)}`,
                url: window.location.href
            });
        } else {
            // Fallback: copiar al portapapeles
            const text = `Cita: ${appointment.title} con ${appointment.doctor} - ${this.formatDate(appointment.start)} ${this.formatTime(appointment.start)}`;
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Información de la cita copiada al portapapeles', 'success');
            });
        }
    }

    // Enviar notificación de reprogramación (simulado)
    sendRescheduleNotification(appointment, oldDateTime) {
        console.log(`Notificación enviada al doctor ${appointment.doctor}: Cita reprogramada de ${oldDateTime} a ${appointment.start}`);
        // Aquí se integraría con el sistema de notificaciones del doctor
    }

    // Enviar notificación de cancelación (simulado)
    sendCancelNotification(appointment) {
        console.log(`Notificación enviada al doctor ${appointment.doctor}: Cita cancelada`);
        // Aquí se integraría con el sistema de notificaciones del doctor
    }

    // Cerrar modal de reprogramación
    closeRescheduleModal() {
        const modal = document.getElementById('reschedule-modal');
        if (modal) {
            modal.remove();
        }
    }

    // Cerrar modal de cancelación
    closeCancelModal() {
        const modal = document.getElementById('cancel-modal');
        if (modal) {
            modal.remove();
        }
    }

}

// Funciones globales para los botones
window.confirmReschedule = function(appointmentId) {
    if (window.appointmentManager) {
        window.appointmentManager.confirmReschedule(appointmentId);
    }
};

window.confirmCancel = function(appointmentId) {
    if (window.appointmentManager) {
        window.appointmentManager.confirmCancel(appointmentId);
    }
};

window.closeRescheduleModal = function() {
    if (window.appointmentManager) {
        window.appointmentManager.closeRescheduleModal();
    }
};

window.closeCancelModal = function() {
    if (window.appointmentManager) {
        window.appointmentManager.closeCancelModal();
    }
};

window.clearUpcomingSearch = function() {
    if (window.appointmentManager) {
        const searchInput = document.getElementById('upcoming-search');
        if (searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
        }
    }
};

// Función global para manejar acciones de citas próximas
window.handleUpcomingAction = function(action, appointmentId) {
    if (window.appointmentManager) {
        window.appointmentManager.handleUpcomingAction(action, appointmentId);
    }
};

// === FUNCIONES GLOBALES DE PERSISTENCIA ===

// Exportar datos
window.exportAppointmentData = function() {
    if (window.appointmentManager && window.appointmentManager.dataManager) {
        window.appointmentManager.dataManager.exportData();
        window.appointmentManager.showNotification('Datos exportados exitosamente', 'success');
    }
};

// Importar datos
window.importAppointmentData = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file && window.appointmentManager && window.appointmentManager.dataManager) {
            window.appointmentManager.dataManager.importData(file)
                .then(() => {
                    window.appointmentManager.showNotification('Datos importados exitosamente', 'success');
                    // Recargar la página para aplicar los cambios
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                })
                .catch(error => {
                    window.appointmentManager.showNotification(`Error al importar: ${error.message}`, 'error');
                });
        }
    };
    input.click();
};

// Limpiar todos los datos
window.clearAllData = function() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
        if (window.appointmentManager && window.appointmentManager.dataManager) {
            // Limpiar localStorage
            Object.values(window.appointmentManager.dataManager.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Limpiar sessionStorage
            Object.values(window.appointmentManager.dataManager.storageKeys).forEach(key => {
                sessionStorage.removeItem(key);
            });
            
            // Limpiar caché
            window.appointmentManager.dataManager.clearCache();
            
            window.appointmentManager.showNotification('Todos los datos han sido eliminados', 'success');
            
            // Recargar la página
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
};

// Mostrar estadísticas de almacenamiento
window.showStorageStats = function() {
    if (window.appointmentManager && window.appointmentManager.dataManager) {
        const stats = window.appointmentManager.dataManager.getStorageStats();
        const message = `
            Estadísticas de almacenamiento:
            • localStorage: ${(stats.localStorage / 1024).toFixed(2)} KB
            • sessionStorage: ${(stats.sessionStorage / 1024).toFixed(2)} KB
            • Caché: ${stats.cache} elementos
            • Total de elementos: ${stats.totalItems}
        `;
        alert(message);
    }
};

// === INICIALIZACIÓN GLOBAL ===

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el gestor de citas
    window.appointmentManager = new AppointmentManager();
    
    // Mostrar notificación de bienvenida
    setTimeout(() => {
        if (window.appointmentManager) {
            window.appointmentManager.showNotification('Página de citas cargada correctamente', 'success');
        }
    }, 1000);
});

// Función global para abrir modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Función global para cerrar modales
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Cerrar modales al hacer clic fuera
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
});

// Cerrar modales con Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            openModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
});

// === FUNCIONES GLOBALES PARA INTERACCIÓN UI ===

window.showAppointmentDetails = function(appointmentId) {
    if (!window.appointmentManager) return;
    window.appointmentManager.showAppointmentDetails(appointmentId);
};

// Corregir el bug: agregar función viewDetails que llame a showAppointmentDetails
window.viewDetails = function(appointmentId) {
    if (!window.appointmentManager) return;
    window.appointmentManager.showAppointmentDetails(appointmentId);
};

window.rescheduleNextAppointment = function() {
    const next = window.appointmentManager.getNextAppointment();
    if (next) {
        window.appointmentManager.editAppointment(next.id);
    }
};

window.viewNextAppointmentDetails = function() {
    const next = window.appointmentManager.getNextAppointment();
    if (next) {
        window.appointmentManager.showAppointmentDetails(next.id);
    }
};

window.quickAppointment = function(doctorName) {
    // Rellena el modal de nueva cita con el doctor seleccionado
    const doctorInput = document.getElementById('appointment-doctor');
    if (doctorInput) {
        doctorInput.value = doctorName;
        closeModal('modalDetallesCita');
        openModal('modalNuevaCita');
    }
};

window.selectDoctor = function(doctorName) {
    const doctorInput = document.getElementById('appointment-doctor');
    const suggestions = document.getElementById('doctor-suggestions');
    
    if (doctorInput) {
        doctorInput.value = doctorName;
        // Disparar evento input para validación
        doctorInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (suggestions) {
        suggestions.style.display = 'none';
    }
    
    // Mostrar notificación de selección
    if (window.appointmentManager) {
        window.appointmentManager.showNotification(`Doctor seleccionado: ${doctorName}`, 'success');
    }
};

window.viewAllRecent = function() {
    // Scroll al historial de citas
    const section = document.querySelector('.appointments-history');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
};

window.viewAllUpcoming = function() {
    // Scroll a la sección de próximas citas
    const section = document.querySelector('.upcoming-appointments');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
};

window.viewAllDoctors = function() {
    // Scroll a la sección de resumen de doctores
    const section = document.querySelector('.appointments-summary');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
};

// === FUNCIONES DE CALENDARIO ===

window.todayCalendar = function() {
    if (window.appointmentManager && window.appointmentManager.calendar) {
        window.appointmentManager.calendar.today();
    }
};

window.openCalendar = function() {
    // Scroll a la sección del calendario
    const section = document.querySelector('.calendar-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
};

// === FUNCIONES DE RECORDATORIOS Y TELEMEDICINA ===

window.openReminders = function() {
    // Redirigir a la página de recordatorios
    window.location.href = 'RecordatoriosExtra.html';
};

window.openTelemedicine = function() {
    // Simular apertura de telemedicina
    if (window.appointmentManager) {
        window.appointmentManager.showNotification('Conectando con telemedicina...', 'info');
    }
};

// === FUNCIONES DE FILTROS ===

window.clearFilters = function() {
    if (window.appointmentManager) {
        window.appointmentManager.resetFilters();
    }
};

window.applyFilters = function() {
    if (window.appointmentManager) {
        window.appointmentManager.applyFilters();
    }
};

// === FUNCIONES DE HISTORIAL ===

window.viewDetails = function(appointmentId) {
    if (window.appointmentManager) {
        window.appointmentManager.showAppointmentDetails(appointmentId);
    }
};

// === FUNCIONES DE ACCIONES RÁPIDAS ===

window.openCalendar = function() {
    const section = document.querySelector('.calendar-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
};

// === MODAL DE DETALLES DE CITA ===
AppointmentManager.prototype.showAppointmentDetails = function(appointmentId) {
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (!apt) return;
    // Rellenar el modal con los datos de la cita
    document.getElementById('detail-appointment-title').textContent = apt.title;
    document.getElementById('detail-type').textContent = this.getStatusText(apt.type);
    document.getElementById('detail-doctor').textContent = apt.doctor;
    document.getElementById('detail-datetime').textContent = this.formatDate(apt.start) + ' ' + this.formatTime(apt.start);
    document.getElementById('detail-location').textContent = apt.location;
    document.getElementById('detail-notes').textContent = apt.notes || 'Sin notas.';
    // Recordatorios (simulado)
    document.getElementById('detail-reminders').innerHTML = `
        <div class="reminder-item">
            <i class="fas fa-check-circle"></i>
            <span>24 horas antes - ${this.formatDate(this.addHours(apt.start, -24))} ${this.formatTime(this.addHours(apt.start, -24))}</span>
        </div>
        <div class="reminder-item">
            <i class="fas fa-clock"></i>
            <span>1 hora antes - ${this.formatDate(this.addHours(apt.start, -1))} ${this.formatTime(this.addHours(apt.start, -1))}</span>
        </div>
    `;
    openModal('modalDetallesCita');
};

AppointmentManager.prototype.addHours = function(dateString, hours) {
    const date = new Date(dateString);
    date.setHours(date.getHours() + hours);
    return date;
};

// === MODAL DE EDICIÓN DE CITA (simulado) ===
AppointmentManager.prototype.editAppointment = function(appointmentId) {
    // Para demo: solo abre el modal de nueva cita con los datos rellenados
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (!apt) return;
    openModal('modalNuevaCita');
    document.getElementById('appointment-type').value = apt.type;
    document.getElementById('appointment-doctor').value = apt.doctor;
    document.getElementById('appointment-date').value = this.formatDateInput(apt.start);
    document.getElementById('appointment-time').value = this.formatTime(apt.start);
    document.getElementById('appointment-location').value = this.getLocationValue(apt.location);
    document.getElementById('appointment-notes').value = apt.notes || '';
    // Prioridad
    const urgency = apt.status === 'urgent' ? 'urgent' : (apt.status === 'emergency' ? 'emergency' : 'normal');
    document.querySelectorAll('input[name="urgency"]').forEach(r => r.checked = (r.value === urgency));
};

AppointmentManager.prototype.formatDateInput = function(dateString) {
    const d = new Date(dateString);
    return d.toISOString().slice(0,10).split('-').reverse().join('/');
};

AppointmentManager.prototype.getLocationValue = function(locationString) {
    if (!locationString) return '';
    if (locationString.toLowerCase().includes('clínica central')) return 'clinica-central';
    if (locationString.toLowerCase().includes('centro médico')) return 'centro-medico';
    if (locationString.toLowerCase().includes('hospital general')) return 'hospital-general';
    if (locationString.toLowerCase().includes('laboratorio')) return 'laboratorio';
    return '';
};

// === FUNCIONES CRUD PARA CITAS ===

// Guardar nueva cita
window.saveAppointment = function() {
    if (!window.appointmentManager) return;
    window.appointmentManager.saveNewAppointment();
};

// Cancelar cita
window.cancelAppointment = function(appointmentId) {
    if (!window.appointmentManager) return;
    window.appointmentManager.cancelAppointment(appointmentId);
};

// Confirmar cancelación
window.confirmCancelAppointment = function() {
    if (!window.appointmentManager) return;
    window.appointmentManager.confirmCancelAppointment();
};

// Editar cita desde modal de detalles
window.editAppointment = function() {
    if (!window.appointmentManager) return;
    window.appointmentManager.editCurrentAppointment();
};

// Funciones adicionales del modal de detalles
window.rescheduleAppointment = function() {
    if (!window.appointmentManager) return;
    window.appointmentManager.rescheduleCurrentAppointment();
};

window.addToCalendar = function() {
    window.appointmentManager.showNotification('Añadido a calendario personal', 'success');
};

window.shareAppointment = function() {
    window.appointmentManager.showNotification('Compartiendo cita...', 'info');
};

window.addToMedicalHistory = function() {
    window.appointmentManager.showNotification('Añadido al historial médico', 'success');
};

window.editNotes = function() {
    window.appointmentManager.showNotification('Editando notas...', 'info');
};

// === IMPLEMENTACIÓN CRUD ===

AppointmentManager.prototype.saveNewAppointment = function() {
    const form = document.getElementById('appointmentForm');
    if (!form || !form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Recoger datos del formulario
    const formData = this.getFormData();
    if (!formData) return;

    // Crear nueva cita
    const newAppointment = {
        id: 'appointment-' + Date.now(),
        title: formData.title,
        type: formData.type,
        start: formData.start,
        end: formData.end,
        location: formData.location,
        doctor: formData.doctor,
        notes: formData.notes,
        status: formData.urgency === 'emergency' ? 'urgent' : 'upcoming',
        priority: formData.urgency === 'emergency' ? 'high' : (formData.urgency === 'urgent' ? 'medium' : 'normal')
    };

    // Añadir a la lista
    this.appointments.push(newAppointment);
    
    // Guardar en localStorage
    this.saveToStorage();
    
    // Actualizar UI
    this.updateAllComponents();
    
    // Cerrar modal y mostrar notificación
    closeModal('modalNuevaCita');
    this.showNotification('Cita guardada exitosamente', 'success');
    
    // Limpiar formulario
    this.clearForm();
};

AppointmentManager.prototype.getFormData = function() {
    const type = document.getElementById('appointment-type').value;
    const doctor = document.getElementById('appointment-doctor').value;
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;
    const location = document.getElementById('appointment-location').value;
    const notes = document.getElementById('appointment-notes').value;
    const urgency = document.querySelector('input[name="urgency"]:checked')?.value || 'normal';

    if (!type || !doctor || !date || !time || !location) {
        this.showNotification('Por favor completa todos los campos obligatorios', 'error');
        return null;
    }

    // Generar título basado en tipo
    const titles = {
        'general': 'Consulta General',
        'specialist': 'Consulta Especializada',
        'test': 'Pruebas Médicas',
        'vaccine': 'Vacunación',
        'followup': 'Seguimiento',
        'emergency': 'Consulta de Urgencia'
    };

    // Convertir fecha y hora
    const [day, month, year] = date.split('/');
    const [hour, minute] = time.split(':');
    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + 45 * 60000); // 45 minutos después

    return {
        title: titles[type] || 'Nueva Cita',
        type: type,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        location: this.getLocationText(location),
        doctor: doctor,
        notes: notes,
        urgency: urgency
    };
};

AppointmentManager.prototype.getLocationText = function(locationValue) {
    const locations = {
        'clinica-central': 'Clínica Central, Montería',
        'centro-medico': 'Centro Médico, Montería',
        'hospital-general': 'Hospital General, Montería',
        'laboratorio': 'Laboratorio Central, Montería'
    };
    return locations[locationValue] || locationValue;
};

AppointmentManager.prototype.clearForm = function() {
    const form = document.getElementById('appointmentForm');
    if (form) form.reset();
    
    // Limpiar campos específicos
    const doctorInput = document.getElementById('appointment-doctor');
    if (doctorInput) doctorInput.value = '';
    
    const notesInput = document.getElementById('appointment-notes');
    if (notesInput) notesInput.value = '';
};

AppointmentManager.prototype.cancelAppointment = function(appointmentId) {
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (!apt) {
        this.showNotification('Cita no encontrada', 'error');
        return;
    }

    // Llenar modal de confirmación
    this.fillCancelModal(apt);
    
    // Abrir el modal
    openModal('modalCancelarCita');
};

// Llenar el modal de cancelación
AppointmentManager.prototype.fillCancelModal = function(appointment) {
    const date = new Date(appointment.start);
    
    // Actualizar información en el modal
    document.getElementById('cancel-appointment-title').textContent = appointment.title;
    document.getElementById('cancel-appointment-details').textContent = `${appointment.doctor} - ${this.formatDate(date)} a las ${this.formatTime(date)}`;
    
    // Guardar el ID de la cita para confirmación
    this.cancelAppointmentId = appointment.id;
};

AppointmentManager.prototype.confirmCancelAppointment = function() {
    if (!this.cancelAppointmentId) return;

    const aptIndex = this.appointments.findIndex(a => a.id === this.cancelAppointmentId);
    if (aptIndex === -1) return;

    // Obtener el botón de confirmar del modal
    const confirmButton = document.querySelector('#modalCancelarCita .btn-confirm-cancel');
    
    if (confirmButton) {
        this.setButtonLoading(confirmButton, true);
    }

    // Simular un pequeño delay para mostrar el estado de carga
    setTimeout(() => {
    // Cambiar estado a cancelado
    this.appointments[aptIndex].status = 'canceled';
    
    // Guardar en localStorage
    this.saveToStorage();
    
    // Actualizar UI
    this.updateAllComponents();
        
        if (confirmButton) {
            this.setButtonLoading(confirmButton, false);
            this.showButtonFeedback(confirmButton, 'success', 'Cancelada');
        }
    
    // Cerrar modal y mostrar notificación
        setTimeout(() => {
    closeModal('modalCancelarCita');
    this.showNotification('Cita cancelada exitosamente', 'success');
        }, 1000);
    
    this.cancelAppointmentId = null;
    }, 500);
};

// === FUNCIONES PARA ACCIONES DEL MODAL DE DETALLES ===

// Función para editar notas desde el modal de detalles
AppointmentManager.prototype.editNotes = function() {
    const notesElement = document.getElementById('detail-notes');
    if (!notesElement) return;

    const currentNotes = notesElement.textContent;
    const newNotes = prompt('Editar notas de la cita:', currentNotes);
    
    if (newNotes !== null && newNotes !== currentNotes) {
        // Actualizar las notas en la cita
        if (this.currentDetailAppointmentId) {
            const appointment = this.appointments.find(a => a.id === this.currentDetailAppointmentId);
            if (appointment) {
                appointment.notes = newNotes;
                this.saveToStorage();
                notesElement.textContent = newNotes;
                this.showNotification('Notas actualizadas exitosamente', 'success');
            }
        }
    }
};

// Función para añadir al historial médico
AppointmentManager.prototype.addToMedicalHistory = function() {
    if (!this.currentDetailAppointmentId) return;
    
    const appointment = this.appointments.find(a => a.id === this.currentDetailAppointmentId);
    if (!appointment) return;

    // Simular añadir al historial médico
    this.showNotification('Cita añadida al historial médico', 'success');
    
    // Aquí se podría implementar la lógica para guardar en el historial médico
    // Por ejemplo, redirigir a la página de historial médico o abrir un modal
};

// Función para reprogramar desde el modal de detalles
AppointmentManager.prototype.rescheduleAppointment = function() {
    if (!this.currentDetailAppointmentId) return;
    
    const appointment = this.appointments.find(a => a.id === this.currentDetailAppointmentId);
    if (!appointment) return;

    // Cerrar el modal de detalles
    closeModal('modalDetallesCita');
    
    // Abrir el modal de reprogramación
    this.openRescheduleModal(appointment);
};

// Función para añadir al calendario desde el modal de detalles
AppointmentManager.prototype.addToCalendar = function() {
    if (!this.currentDetailAppointmentId) return;
    
    const appointment = this.appointments.find(a => a.id === this.currentDetailAppointmentId);
    if (!appointment) return;

    // Simular añadir al calendario
    this.showNotification('Cita añadida al calendario', 'success');
    
    // Aquí se podría implementar la lógica para añadir al calendario del sistema
    // Por ejemplo, usar la API de calendario del navegador
};

// Función para compartir cita desde el modal de detalles
AppointmentManager.prototype.shareAppointment = function() {
    if (!this.currentDetailAppointmentId) return;
    
    const appointment = this.appointments.find(a => a.id === this.currentDetailAppointmentId);
    if (!appointment) return;

    // Crear mensaje para compartir
    const date = new Date(appointment.start);
    const message = `Cita médica: ${appointment.title} con ${appointment.doctor} el ${this.formatDate(date)} a las ${this.formatTime(date)} en ${appointment.location}`;
    
    // Intentar usar la API de Web Share si está disponible
    if (navigator.share) {
        navigator.share({
            title: 'Mi Cita Médica',
            text: message,
            url: window.location.href
        }).then(() => {
            this.showNotification('Cita compartida exitosamente', 'success');
        }).catch((error) => {
            console.log('Error al compartir:', error);
            this.fallbackShare(message);
        });
    } else {
        this.fallbackShare(message);
    }
};

// Función para editar cita desde el modal de detalles
AppointmentManager.prototype.editAppointment = function() {
    if (!this.currentDetailAppointmentId) return;
    
    const appointment = this.appointments.find(a => a.id === this.currentDetailAppointmentId);
    if (!appointment) return;

    // Cerrar el modal de detalles
    closeModal('modalDetallesCita');
    
    // Aquí se podría implementar la lógica para editar la cita
    // Por ejemplo, abrir el modal de nueva cita con los datos precargados
    this.showNotification('Función de edición en desarrollo', 'info');
};

AppointmentManager.prototype.editCurrentAppointment = function() {
    // Obtener la cita actual del modal de detalles
    const title = document.getElementById('detail-appointment-title').textContent;
    const apt = this.appointments.find(a => a.title === title);
    
    if (apt) {
        closeModal('modalDetallesCita');
        this.editAppointment(apt.id);
    }
};

AppointmentManager.prototype.rescheduleCurrentAppointment = function() {
    // Similar a editar, pero enfocado en fecha/hora
    const title = document.getElementById('detail-appointment-title').textContent;
    const apt = this.appointments.find(a => a.title === title);
    
    if (apt) {
        closeModal('modalDetallesCita');
        this.editAppointment(apt.id);
        // Enfocar en campos de fecha/hora
        setTimeout(() => {
            const dateInput = document.getElementById('appointment-date');
            if (dateInput) dateInput.focus();
        }, 100);
    }
};

// === ACTUALIZACIÓN DE COMPONENTES ===

AppointmentManager.prototype.updateAllComponents = function() {
    // Actualizar dashboard
    this.renderDashboard();
    
    // Actualizar hero de próxima cita
    this.renderNextAppointmentHero();
    
    // Actualizar resúmenes
    this.renderSummarySections();
    
    // Actualizar lista de citas
    this.renderAppointments();
    
    // Actualizar historial
    this.renderHistory();
    
    // Actualizar calendario
    if (this.calendar) {
        this.calendar.removeAllEvents();
        this.calendar.addEventSource(this.getCalendarEvents());
    }
    
    // Reiniciar cuenta regresiva
    this.startCountdown();
};

// === MEJORAS EN RENDERIZADO ===

AppointmentManager.prototype.renderDashboard = function() {
    const stats = this.calculateStats();
    
    // Actualizar métricas
    const elements = {
        'total-appointments': stats.total,
        'urgent-appointments': stats.urgent,
        'completed-appointments': stats.completed,
        'upcoming-appointments': stats.upcoming
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
};

AppointmentManager.prototype.calculateStats = function() {
    const now = new Date();
    
    return {
        total: this.appointments.length,
        urgent: this.appointments.filter(a => a.status === 'urgent').length,
        completed: this.appointments.filter(a => a.status === 'completed').length,
        upcoming: this.appointments.filter(a => 
            new Date(a.start) > now && a.status !== 'canceled'
        ).length
    };
};

// === MEJORAS EN NOTIFICACIONES ===

AppointmentManager.prototype.showNotification = function(message, type = 'info', duration = 3000) {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()" aria-label="Cerrar notificación">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-remover
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
};

// ===== GESTIÓN DE ESTADOS DE CARGA =====

class LoadingManager {
    constructor() {
        this.loadingStates = new Map();
    }

    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
            const skeletonId = `skeleton-${elementId.replace('next-appointment-', '')}`;
            const skeleton = document.getElementById(skeletonId);
            if (skeleton) {
                skeleton.style.display = 'block';
            }
            this.loadingStates.set(elementId, true);
        }
    }

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
            const skeletonId = `skeleton-${elementId.replace('next-appointment-', '')}`;
            const skeleton = document.getElementById(skeletonId);
            if (skeleton) {
                skeleton.style.display = 'none';
            }
            this.loadingStates.set(elementId, false);
        }
    }

    showLoadingOverlay(container) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        container.style.position = 'relative';
        container.appendChild(overlay);
    }

    hideLoadingOverlay(container) {
        const overlay = container.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// ===== VALIDACIÓN DE FORMULARIOS MEJORADA =====

class FormValidator {
    constructor() {
        this.validationRules = {
            required: (value) => value.trim() !== '',
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            phone: (value) => /^[\d\s\-\+\(\)]+$/.test(value),
            date: (value) => new Date(value) > new Date(),
            time: (value) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)
        };
    }

    validateField(field, rules = []) {
        const value = field.value;
        const fieldName = field.name || field.id;
        let isValid = true;
        let errorMessage = '';

        // Limpiar validaciones previas
        this.clearFieldValidation(field);

        // Aplicar reglas de validación
        for (const rule of rules) {
            if (this.validationRules[rule]) {
                if (!this.validationRules[rule](value)) {
                    isValid = false;
                    errorMessage = this.getErrorMessage(fieldName, rule);
                    break;
                }
            }
        }

        // Mostrar resultado de validación
        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    validateForm(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let isFormValid = true;

        fields.forEach(field => {
            const rules = this.getFieldRules(field);
            if (rules.length > 0) {
                const isValid = this.validateField(field, rules);
                if (!isValid) {
                    isFormValid = false;
                }
            }
        });

        return isFormValid;
    }

    getFieldRules(field) {
        const rules = [];
        const required = field.hasAttribute('required');
        const type = field.type || field.tagName.toLowerCase();

        if (required) rules.push('required');
        if (type === 'email') rules.push('email');
        if (type === 'tel') rules.push('phone');
        if (type === 'date') rules.push('date');
        if (type === 'time') rules.push('time');

        return rules;
    }

    showFieldValidation(field, isValid, message) {
        field.classList.toggle('valid', isValid);
        field.classList.toggle('invalid', !isValid);

        // Crear o actualizar mensaje de validación
        let validationMessage = field.parentNode.querySelector('.validation-message');
        if (!validationMessage) {
            validationMessage = document.createElement('div');
            validationMessage.className = 'validation-message';
            field.parentNode.appendChild(validationMessage);
        }

        if (!isValid) {
            validationMessage.className = 'validation-message error';
            validationMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
        } else {
            validationMessage.className = 'validation-message success';
            validationMessage.innerHTML = `<i class="fas fa-check-circle"></i><span>Campo válido</span>`;
        }
    }

    clearFieldValidation(field) {
        field.classList.remove('valid', 'invalid');
        const validationMessage = field.parentNode.querySelector('.validation-message');
        if (validationMessage) {
            validationMessage.remove();
        }
    }

    getErrorMessage(fieldName, rule) {
        const messages = {
            required: 'Este campo es obligatorio',
            email: 'Ingresa un email válido',
            phone: 'Ingresa un número de teléfono válido',
            date: 'La fecha debe ser futura',
            time: 'Ingresa una hora válida'
        };
        return messages[rule] || 'Campo inválido';
    }
}

// ===== MEJORAS DE ACCESIBILIDAD =====

class AccessibilityManager {
    constructor() {
        this.currentFocus = null;
        this.init();
    }

    init() {
        // Manejar navegación por teclado
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        
        // Manejar focus management
        document.addEventListener('focusin', (e) => this.handleFocusIn(e));
        document.addEventListener('focusout', (e) => this.handleFocusOut(e));
        
        // ARIA live regions para anuncios
        this.createLiveRegion();
    }

    handleKeyboardNavigation(e) {
        // Escape para cerrar modales
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal.id);
            }
        }

        // Enter/Space para activar elementos
        if (e.key === 'Enter' || e.key === ' ') {
            const target = e.target;
            if (target.classList.contains('appointment-card') || 
                target.classList.contains('action-card')) {
                e.preventDefault();
                target.click();
            }
        }
    }

    handleFocusIn(e) {
        this.currentFocus = e.target;
        
        // Anunciar cambios importantes
        if (e.target.classList.contains('appointment-card')) {
            this.announce(`Cita con ${e.target.querySelector('.doctor-name')?.textContent || 'médico'} el ${e.target.querySelector('.appointment-date')?.textContent || 'fecha'}`);
        }
    }

    handleFocusOut(e) {
        // Guardar el último elemento con focus para navegación
        this.lastFocus = e.target;
    }

    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
        this.liveRegion = liveRegion;
    }

    announce(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
            setTimeout(() => {
                this.liveRegion.textContent = '';
            }, 1000);
        }
    }

    trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        container.addEventListener('keydown', (e) => {
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
        });
    }
}

// ===== INSTANCIAS GLOBALES =====

const loadingManager = new LoadingManager();
const formValidator = new FormValidator();
const accessibilityManager = new AccessibilityManager();

// ===== FUNCIONES DE CARGA MEJORADAS =====

function showPageLoading() {
    loadingManager.showLoading('next-appointment-hero');
    loadingManager.showLoading('metrics-dashboard');
    
    // Simular carga de datos
    setTimeout(() => {
        hidePageLoading();
    }, 1500);
}

function hidePageLoading() {
    loadingManager.hideLoading('next-appointment-hero');
    loadingManager.hideLoading('metrics-dashboard');
    
    // Animar entrada de contenido
    const elements = document.querySelectorAll('.next-appointment-hero, .metrics-dashboard');
    elements.forEach(element => {
        element.classList.add('fade-in');
    });
}

// ===== FUNCIONES DE VALIDACIÓN MEJORADAS =====

function validateAppointmentForm() {
    const form = document.getElementById('appointment-form');
    return formValidator.validateForm(form);
}

function setupFormValidation() {
    const form = document.getElementById('appointment-form');
    if (!form) return;

    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        field.addEventListener('blur', () => {
            const rules = formValidator.getFieldRules(field);
            if (rules.length > 0) {
                formValidator.validateField(field, rules);
            }
        });

        field.addEventListener('input', () => {
            if (field.classList.contains('invalid')) {
                const rules = formValidator.getFieldRules(field);
                formValidator.validateField(field, rules);
            }
        });
    });
}

// ===== FUNCIONES DE ACCESIBILIDAD =====

function announceAppointmentCreated(appointment) {
    accessibilityManager.announce(`Cita creada exitosamente con ${appointment.doctor} para el ${appointment.date}`);
}

function announceAppointmentUpdated(appointment) {
    accessibilityManager.announce(`Cita actualizada exitosamente con ${appointment.doctor} para el ${appointment.date}`);
}

function announceAppointmentDeleted() {
    accessibilityManager.announce('Cita eliminada exitosamente');
}

// ===== MEJORAS EN FUNCIONES EXISTENTES =====

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        
        // Trap focus en el modal
        accessibilityManager.trapFocus(modal);
        
        // Focus en el primer elemento interactivo
        const firstFocusable = modal.querySelector('input, button, select, textarea');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Anunciar apertura del modal
        accessibilityManager.announce(`Modal ${modal.querySelector('h2')?.textContent || 'abierto'}`);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        // Restaurar focus
        if (accessibilityManager.lastFocus) {
            accessibilityManager.lastFocus.focus();
        }
        
        // Anunciar cierre del modal
        accessibilityManager.announce('Modal cerrado');
    }
}

// ===== INICIALIZACIÓN MEJORADA =====

document.addEventListener('DOMContentLoaded', function() {
    // Mostrar estado de carga inicial
    showPageLoading();
    
    // Inicializar componentes
    initializeSidebar();
    setupFormValidation();
    
    // Inicializar gestor de citas
    if (typeof appointmentManager !== 'undefined') {
        appointmentManager.init();
    }
    
    // Configurar eventos de accesibilidad
    setupAccessibilityEvents();
});

function setupAccessibilityEvents() {
    // Mejorar navegación por teclado en tarjetas
    const cards = document.querySelectorAll('.appointment-card, .action-card');
    cards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
    });
    
    // Mejorar anuncios de estado
    const statusElements = document.querySelectorAll('.status-indicator, .reminder-status');
    statusElements.forEach(element => {
        element.setAttribute('aria-live', 'polite');
    });
}

// ===== FUNCIONES DE UTILIDAD MEJORADAS =====

function showNotification(message, type = 'info', duration = 5000) {
    const notification = createNotification(message, type);
    document.body.appendChild(notification);
    
    // Anunciar notificación
    accessibilityManager.announce(message);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-ocultar
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

function createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()" aria-label="Cerrar notificación">
            <i class="fas fa-times"></i>
        </button>
    `;
    return notification;
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ===== MEJORAS EN EL GESTOR DE CITAS =====

// Extender AppointmentManager con nuevas funcionalidades
if (typeof AppointmentManager !== 'undefined') {
    AppointmentManager.prototype.showLoading = function() {
        const container = document.querySelector('.appointments-container');
        if (container) {
            loadingManager.showLoadingOverlay(container);
        }
    };

    AppointmentManager.prototype.hideLoading = function() {
        const container = document.querySelector('.appointments-container');
        if (container) {
            loadingManager.hideLoadingOverlay(container);
        }
    };

    AppointmentManager.prototype.validateAppointment = function(appointment) {
        const requiredFields = ['title', 'doctor', 'date', 'time'];
        const errors = [];

        requiredFields.forEach(field => {
            if (!appointment[field] || appointment[field].trim() === '') {
                errors.push(`El campo ${field} es obligatorio`);
            }
        });

        if (appointment.date && new Date(appointment.date) <= new Date()) {
            errors.push('La fecha debe ser futura');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
}
    
// Funciones globales para acciones del header y hero
function refreshAppointments() {
    showNotification('Actualizando citas...', 'info');
    
    // Simular actualización
    setTimeout(() => {
        appointmentManager.loadAppointments();
        appointmentManager.renderDashboard();
        appointmentManager.renderNextAppointmentHero();
        appointmentManager.renderSummarySections();
        appointmentManager.renderAppointments();
        showNotification('Citas actualizadas correctamente', 'success');
    }, 1000);
}

function exportAppointments() {
    if (!window.appointmentManager) {
        showNotification('Error: Gestor de citas no disponible', 'error');
        return;
    }
    
    const appointments = window.appointmentManager.appointments;
    
    if (!appointments || appointments.length === 0) {
        showNotification('No hay citas para exportar', 'warning');
        return;
    }
    
    showNotification('Preparando exportación...', 'info');
    
    // Simular exportación
    setTimeout(() => {
        try {
            const csv = window.appointmentManager.generateCSV(appointments);
        
        // Crear y descargar archivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `citas_medicas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
            // Limpiar URL
            URL.revokeObjectURL(url);
            
            showNotification(`Archivo exportado correctamente (${appointments.length} citas)`, 'success');
        } catch (error) {
            console.error('Error al exportar:', error);
            showNotification('Error al exportar el archivo', 'error');
        }
    }, 1500);
}

function addToCalendar() {
    const nextAppointment = appointmentManager.getNextAppointment();
    if (!nextAppointment) {
        showNotification('No hay citas próximas para agregar', 'warning');
        return;
    }
    
    // Crear evento para calendario
    const event = {
        title: nextAppointment.title,
        start: nextAppointment.start,
        end: nextAppointment.end,
        location: nextAppointment.location,
        description: `Cita médica con ${nextAppointment.doctor}\n${nextAppointment.notes || ''}`
    };
    
    // Generar URL para Google Calendar
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start.replace(/[-:]/g, '').replace('T', 'T')}/${event.end.replace(/[-:]/g, '').replace('T', 'T')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    // Abrir en nueva pestaña
    window.open(googleCalendarUrl, '_blank');
    
    showNotification('Evento agregado al calendario', 'success');
}

function rescheduleNextAppointment() {
    const nextAppointment = appointmentManager.getNextAppointment();
    if (!nextAppointment) {
        showNotification('No hay citas próximas para reprogramar', 'warning');
        return;
    }
    
    showNotification('Abriendo formulario de reprogramación...', 'info');
    
    // Aquí se abriría el modal de reprogramación
    // Por ahora, simulamos la acción
    setTimeout(() => {
        showNotification('Función de reprogramación en desarrollo', 'info');
    }, 1000);
}

function viewNextAppointmentDetails() {
    const nextAppointment = appointmentManager.getNextAppointment();
    if (!nextAppointment) {
        showNotification('No hay citas próximas para ver', 'warning');
        return;
    }
    
    // Mostrar detalles de la cita
    const details = `
        <strong>${nextAppointment.title}</strong><br>
        <strong>Doctor:</strong> ${nextAppointment.doctor}<br>
        <strong>Fecha:</strong> ${new Date(nextAppointment.start).toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}<br>
        <strong>Ubicación:</strong> ${nextAppointment.location}<br>
        <strong>Notas:</strong> ${nextAppointment.notes || 'Sin notas adicionales'}
    `;
    
    // Crear modal temporal para mostrar detalles
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Detalles de la Cita</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div style="line-height: 1.8;">${details}</div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                <button class="btn btn-primary" onclick="rescheduleNextAppointment()">Reprogramar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Actualizar el estado de las citas en el header
function updateAppointmentsStatus() {
    const upcomingCount = appointmentManager.appointments.filter(apt => apt.status === 'upcoming').length;
    const urgentCount = appointmentManager.appointments.filter(apt => apt.status === 'urgent').length;
    
    const statusIndicator = document.getElementById('appointmentsStatusIndicator');
    const statusText = document.getElementById('appointmentsStatusText');
    
    if (statusIndicator && statusText) {
        if (urgentCount > 0) {
            statusIndicator.className = 'status-indicator urgent';
            statusIndicator.innerHTML = `<i class="fas fa-exclamation-triangle"></i>`;
            statusText.textContent = `${urgentCount} cita(s) urgente(s)`;
        } else if (upcomingCount > 0) {
            statusIndicator.className = 'status-indicator';
            statusIndicator.innerHTML = `<i class="fas fa-calendar-check"></i>`;
            statusText.textContent = `${upcomingCount} cita(s) próxima(s)`;
        } else {
            statusIndicator.className = 'status-indicator';
            statusIndicator.innerHTML = `<i class="fas fa-check-circle"></i>`;
            statusText.textContent = 'Sin citas próximas';
        }
    }
}

    // Función para limpiar datos y recargar demo (para testing)
    function clearAllData() {
        if (confirm('¿Estás seguro de que quieres limpiar todos los datos? Esto cargará los datos de demostración.')) {
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
        }
    }

    // Función para mostrar estadísticas de almacenamiento
    function showStorageStats() {
        const stats = appointmentManager.dataManager.getStorageStats();
        const message = `
            Estadísticas de almacenamiento:
            • localStorage: ${(stats.localStorage / 1024).toFixed(2)} KB
            • sessionStorage: ${(stats.sessionStorage / 1024).toFixed(2)} KB
            • Caché: ${stats.cache} elementos
            • Total de elementos: ${stats.totalItems}
            • Citas guardadas: ${appointmentManager.appointments.length}
        `;
        alert(message);
}

// === FUNCIONES GLOBALES PARA ACCIONES DEL MODAL ===

// Función global para editar notas
window.editNotes = function() {
    if (window.appointmentManager) {
        window.appointmentManager.editNotes();
    }
};

// Función global para añadir al historial médico
window.addToMedicalHistory = function() {
    if (window.appointmentManager) {
        window.appointmentManager.addToMedicalHistory();
    }
};

// Función global para reprogramar cita
window.rescheduleAppointment = function() {
    if (window.appointmentManager) {
        window.appointmentManager.rescheduleAppointment();
    }
};

// Función global para añadir al calendario
window.addToCalendar = function() {
    if (window.appointmentManager) {
        window.appointmentManager.addToCalendar();
    }
};

// Función global para compartir cita
window.shareAppointment = function() {
    if (window.appointmentManager) {
        window.appointmentManager.shareAppointment();
    }
};

// Función global para editar cita
window.editAppointment = function() {
    if (window.appointmentManager) {
        window.appointmentManager.editAppointment();
    }
};
    
