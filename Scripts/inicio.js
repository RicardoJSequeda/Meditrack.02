// ===== SISTEMA PRINCIPAL DE MEDITRACK =====
class MediTrackApp {
    constructor() {
        this.currentDate = new Date();
        this.notifications = [];
        this.init();
    }

    init() {
        this.loadNavbar();
        this.setupEventListeners();
        this.initializeCharts();
        this.setupCalendar();
        this.setupFAQ();
        this.showWelcomeAnimation();
        this.startRealTimeUpdates();
        this.initializePersonalizedDashboard();
        this.loadUserData();
        this.initializeMiniCharts();
        this.setupNotifications();
        this.setupChatFunctionality(); // Agregar la llamada a setupChatFunctionality
        this.setupTelemedicineFunctionality();
    }

    // ===== CARGA DEL NAVBAR SUPERIOR =====
    async loadNavbar() {
        try {
            const response = await fetch('sidebar/sidebar.html');
            if (!response.ok) {
                console.error('No se pudo cargar sidebar/sidebar.html:', response.status);
                return;
            }
            const navbarHtml = await response.text();
            const navbarContainer = document.getElementById('navbarContainer');
            if (navbarContainer) {
                navbarContainer.innerHTML = navbarHtml;
                console.log('Sidebar HTML insertado correctamente');
                // Cargar el CSS del navbar
                if (!document.querySelector('link[href="sidebar/sidebar.css"]')) {
                const navbarCSS = document.createElement('link');
                navbarCSS.rel = 'stylesheet';
                navbarCSS.href = 'sidebar/sidebar.css';
                document.head.appendChild(navbarCSS);
                }
                // Cargar el JavaScript del navbar solo si no existe
                if (!document.querySelector('script[src="sidebar/sidebar.js"]')) {
                const navbarScript = document.createElement('script');
                navbarScript.src = 'sidebar/sidebar.js';
                    navbarScript.onload = () => {
                        setTimeout(() => {
                            if (window.initializeSidebar) {
                                window.initializeSidebar();
                            }
                            this.marcarPaginaActiva();
                            this.setupSidebarToggle();
                        }, 200);
                    };
                document.head.appendChild(navbarScript);
                } else {
                setTimeout(() => {
                        if (window.initializeSidebar) {
                            window.initializeSidebar();
                        }
                        this.marcarPaginaActiva();
                this.setupSidebarToggle();
                    }, 200);
                }
            } else {
                console.error('No se encontró el contenedor #navbarContainer');
            }
        } catch (error) {
            console.error('Error cargando el navbar:', error);
        }
    }

    // Nueva función para marcar la página activa
    marcarPaginaActiva() {
        const currentPage = window.location.pathname.split('/').pop() || 'Inicio.html';
        const currentPageLink = document.querySelector(`[href="${currentPage}"]`);
        if (currentPageLink) {
            const navItem = currentPageLink.closest('.nav-item');
            if (navItem) {
                navItem.classList.add('active');
            }
        }
    }

    // ===== CONFIGURACIÓN DE EVENT LISTENERS =====
    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link);
            });
        });

        // Botones de acción rápida
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleQuickAction(btn);
            });
        });

        // Tarjetas de resumen
        document.querySelectorAll('.summary-card').forEach(card => {
            card.addEventListener('click', () => {
                this.handleSummaryCardClick(card);
            });
        });

        // Botones de métricas avanzadas
        this.setupAdvancedMetricsEvents();

        // Calendario
        this.setupCalendarEvents();

        // Comunicación médica
        this.setupCommunicationEvents();

        // Modales
        this.setupModalEvents();

        // Consejos de salud
        document.getElementById('generateTipBtn')?.addEventListener('click', () => {
            this.generateNewHealthTip();
        });

        // Actualizar datos
        document.querySelector('.health-summary .btn')?.addEventListener('click', () => {
            this.refreshHealthData();
        });
    }

    // ===== MANEJO DE NAVEGACIÓN =====
    handleNavigation(link) {
        // Remover clase activa de todos los enlaces
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        // Agregar clase activa al enlace clickeado
        link.classList.add('active');
        
        // Animación de transición
        this.animatePageTransition();
        
        // Simular navegación (en una app real, aquí iría la navegación real)
        this.showNotification('Navegación', 'Funcionalidad en desarrollo', 'info');
    }

    // ===== MANEJO DE ACCIONES RÁPIDAS =====
    handleQuickAction(btn) {
        const action = btn.querySelector('span').textContent.toLowerCase();
        
        // Animación de click
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);

        switch(action) {
            case 'registrar peso':
                this.openModal('modalPeso');
                break;
            case 'medir glucosa':
                this.openModal('modalGlucosa');
                break;
            case 'frecuencia cardíaca':
                this.openModal('modalFrecuenciaCardiaca');
                break;
            case 'temperatura':
                this.openModal('modalTemperatura');
                break;
            case 'oxígeno en sangre':
                this.openModal('modalOxigenoSangre');
                break;
            case 'calidad del sueño':
                this.openModal('modalCalidadSueno');
                break;
            case 'actividad física':
                this.openModal('modalActividadFisica');
                break;
            default:
                this.showNotification('Acción', 'Funcionalidad en desarrollo', 'info');
        }
    }

    // ===== MANEJO DE TARJETAS DE RESUMEN =====
    handleSummaryCardClick(card) {
        const cardType = Array.from(card.classList).find(cls => 
            ['medication', 'blood-pressure', 'adherence', 'appointments'].includes(cls)
        );

        // Animación de click
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);

        switch(cardType) {
            case 'medication':
                this.showMedicationDetails();
                break;
            case 'blood-pressure':
                this.showBloodPressureHistory();
                break;
            case 'adherence':
                this.showAdherenceDetails();
                break;
            case 'appointments':
                this.showAppointmentDetails();
                break;
        }
    }

    // ===== MÉTRICAS AVANZADAS =====
    setupAdvancedMetricsEvents() {
        // Selector de rango de tiempo
        document.getElementById('timeRangeSelector')?.addEventListener('change', (e) => {
            this.updateMetricsData(e.target.value);
        });

        // Botón de exportar
        document.getElementById('exportDataBtn')?.addEventListener('click', () => {
            this.exportHealthData();
        });

        // Botones de detalles
        document.getElementById('trendsDetailsBtn')?.addEventListener('click', () => {
            this.openModal('modalTendenciasDetalladas');
        });

        document.getElementById('predictionsDetailsBtn')?.addEventListener('click', () => {
            this.openModal('modalPrediccionesDetalladas');
        });
    }

    updateMetricsData(days) {
        // Simular actualización de datos
        this.showNotification('Actualizando', 'Cargando datos...', 'info');
        
        setTimeout(() => {
            this.updateTrendsChart(days);
            this.showNotification('Éxito', 'Datos actualizados correctamente', 'success');
        }, 1000);
    }

    exportHealthData() {
        this.showNotification('Exportando', 'Preparando archivo...', 'info');
        
        setTimeout(() => {
            // Simular descarga
            const link = document.createElement('a');
            link.href = 'data:text/csv;charset=utf-8,datos_salud.csv';
            link.download = 'datos_salud.csv';
            link.click();
            
            this.showNotification('Éxito', 'Archivo descargado correctamente', 'success');
        }, 1500);
    }

    // ===== CALENDARIO =====
    setupCalendarEvents() {
        // Navegación del calendario
        document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
            this.navigateCalendar(-1);
        });

        document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
            this.navigateCalendar(1);
        });

        // Cambio de vista
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeCalendarView(e.target.dataset.view);
            });
        });

        // Agregar evento
        document.getElementById('addEventBtn')?.addEventListener('click', () => {
            this.openModal('modalAgregarEvento');
        });

        // Sincronizar
        document.getElementById('syncCalendarBtn')?.addEventListener('click', () => {
            this.syncCalendar();
        });
    }

    setupCalendar() {
        this.currentMonth = new Date();
        this.renderCalendar();
    }

    renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        if (!grid) return;

        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        // Obtener todos los eventos
        let eventos = JSON.parse(localStorage.getItem('eventosCalendario') || '[]');
        
        // Actualizar título
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

        // Limpiar grid
        grid.innerHTML = '';

        // Días de la semana
        const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });

        // Obtener primer día del mes
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Generar días
        for (let i = 0; i < 42; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            dayElement.textContent = currentDate.getDate();
            
            // Marcar día actual
            if (this.isToday(currentDate)) {
                dayElement.classList.add('today');
            }
            // Marcar días del mes actual
            if (currentDate.getMonth() === month) {
                dayElement.classList.add('current-month');
            }
            // Agregar eventos si existen
            const fechaStr = currentDate.toISOString().slice(0,10);
            // Solución: comparar fechas solo por año, mes y día (ignorando hora y zona horaria)
            const eventosDia = eventos.filter(ev => {
                // Evitar problemas de zona horaria: comparar como yyyy-mm-dd
                const evDate = (ev.fecha || '').slice(0,10);
                const curDate = currentDate.getFullYear() + '-' + String(currentDate.getMonth()+1).padStart(2,'0') + '-' + String(currentDate.getDate()).padStart(2,'0');
                return evDate === curDate;
            });
            if (eventosDia.length > 0) {
                dayElement.classList.add('has-events');
                // Indicadores visuales: varios círculos grandes con icono
                const indicator = document.createElement('span');
                indicator.className = 'calendar-event-indicator';
                eventosDia.forEach(ev => {
                  // Determinar clase por tipo
                  let tipoClase = 'otros';
                  if (ev.tipo === 'Cita') tipoClase = 'cita';
                  else if (ev.tipo === 'Recordatorio') tipoClase = 'recordatorio';
                  else if (ev.tipo === 'Evento Médico') tipoClase = 'medico';
                  const dot = document.createElement('span');
                  dot.className = `calendar-event-dot ${tipoClase}`;
                  dot.title = `${ev.tipo}: ${ev.descripcion||''}`;
                  if (ev.icono) {
                    dot.innerHTML = `<i class='fas fa-${ev.icono}'></i>`;
                  }
                  indicator.appendChild(dot);
                });
                dayElement.appendChild(indicator);
                // Tooltip con resumen de eventos
                dayElement.title = eventosDia.map(ev => `${ev.tipo}: ${ev.descripcion||''}`).join('\n');
            } else {
                dayElement.title = '';
            }
            dayElement.addEventListener('click', () => {
                this.selectCalendarDay(currentDate);
            });
            grid.appendChild(dayElement);
        }
    }

    navigateCalendar(direction) {
        const grid = document.getElementById('calendarGrid');
        if (grid) {
            grid.classList.remove('fade-in');
            grid.classList.add('fade-out');
            setTimeout(() => {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.renderCalendar();
                const newGrid = document.getElementById('calendarGrid');
                if (newGrid) {
                    newGrid.classList.remove('fade-out');
                    newGrid.classList.add('fade-in');
                }
            }, 220);
        } else {
            this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
            this.renderCalendar();
        }
    }

    changeCalendarView(view) {
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        this.showNotification('Vista', `Cambiando a vista ${view}`, 'info');
    }

    selectCalendarDay(date) {
        this.showDayEventsModal(date);
    }

    showDayEventsModal(date) {
        // Obtener eventos del día (simulación: localStorage o array)
        let eventos = JSON.parse(localStorage.getItem('eventosCalendario') || '[]');
        const fechaStr = date.toISOString().slice(0,10);
        const eventosDia = eventos.filter(ev => ev.fecha === fechaStr);
        // Título dinámico
        const titulo = document.getElementById('eventosDiaTitulo');
        if (titulo) {
            titulo.textContent = `Eventos del día: ${date.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' })}`;
        }
        // Lista de eventos
        const lista = document.getElementById('eventosDiaLista');
        if (lista) {
            if (eventosDia.length === 0) {
                lista.innerHTML = '<div class="empty-msg">No hay eventos para este día.</div>';
            } else {
                lista.innerHTML = eventosDia.map((ev, idx) => `
                  <div class='evento-dia-item'>
                    <div class='evento-info'>
                      <span class='evento-tipo'><i class='fas fa-${ev.icono||'calendar'}'></i> ${ev.tipo}</span>
                      <span class='evento-hora'>${ev.hora||''}</span>
                      <span class='evento-desc'>${ev.descripcion||''}</span>
                    </div>
                    <div class='evento-actions'>
                      <button class='btn btn-secondary btn-sm' onclick='editarEventoCalendario("${ev.id}")'><i class='fas fa-edit'></i></button>
                      <button class='btn btn-danger btn-sm' onclick='eliminarEventoCalendario("${ev.id}")'><i class='fas fa-trash'></i></button>
                    </div>
                  </div>
                `).join('');
            }
        }
        // Mostrar modal
        window.openModal('modalEventosDia');
    }

    syncCalendar() {
        this.showNotification('Sincronizando', 'Conectando con calendario...', 'info');
        
            setTimeout(() => {
            this.showNotification('Éxito', 'Calendario sincronizado', 'success');
        }, 2000);
    }

    // ===== COMUNICACIÓN MÉDICA =====
    setupCommunicationEvents() {
        // Nuevo mensaje
        document.getElementById('newMessageBtn')?.addEventListener('click', () => {
            this.openModal('modalNuevoMensaje');
        });

        // Compartir informes
        document.getElementById('shareReportsBtn')?.addEventListener('click', () => {
            this.openModal('modalCompartirInformes');
        });

        // Chats
        document.querySelectorAll('.chat-item').forEach(chat => {
            chat.addEventListener('click', () => {
                this.openChat(chat);
            });
        });
    }

    openChat(chat) {
        const doctorName = chat.querySelector('.chat-name').textContent;
        this.showNotification('Chat', `Abriendo chat con ${doctorName}`, 'info');
    }

    // ===== FAQ =====
    setupFAQ() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const isActive = faqItem.classList.contains('active');
                
                // Cerrar todos los FAQ
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Abrir el FAQ clickeado si no estaba activo
                if (!isActive) {
                    faqItem.classList.add('active');
                }
            });
        });
    }

    // ===== MODALES =====
    setupModalEvents() {
        // Cerrar modales
        document.querySelectorAll('.close, .close-modal-btn').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modalId || e.target.closest('.modal').id;
                this.closeModal(modalId);
            });
        });

        // Cerrar modal al hacer click fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Formularios
        this.setupFormSubmissions();
    }

    setupFormSubmissions() {
        // Agregar evento
        document.getElementById('submitAgregarEvento')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitEventForm();
        });

        // Nuevo mensaje
        document.getElementById('submitNuevoMensaje')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitMessageForm();
        });

        // Compartir informes
        document.getElementById('submitCompartirInformes')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitShareForm();
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
            modal.classList.add('show');
            }, 10);
            
            // Enfocar primer input si existe
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    // ===== FORMULARIOS =====
    submitEventForm() {
        const form = document.querySelector('#modalAgregarEvento form');
        const formData = new FormData(form);
        
        this.showNotification('Guardando', 'Agregando evento...', 'info');
        
        setTimeout(() => {
            this.closeModal('modalAgregarEvento');
            this.showNotification('Éxito', 'Evento agregado correctamente', 'success');
            form.reset();
        }, 1000);
    }

    submitMessageForm() {
        const form = document.querySelector('#modalNuevoMensaje form');
        const formData = new FormData(form);
        
        this.showNotification('Enviando', 'Enviando mensaje...', 'info');
        
        setTimeout(() => {
            this.closeModal('modalNuevoMensaje');
            this.showNotification('Éxito', 'Mensaje enviado correctamente', 'success');
            form.reset();
        }, 1000);
    }

    submitShareForm() {
        const form = document.querySelector('#modalCompartirInformes form');
        const formData = new FormData(form);
        
        this.showNotification('Compartiendo', 'Preparando informes...', 'info');
        
        setTimeout(() => {
            this.closeModal('modalCompartirInformes');
            this.showNotification('Éxito', 'Informes compartidos correctamente', 'success');
            form.reset();
        }, 1500);
    }

    // ===== CONSEJOS DE SALUD =====
    generateNewHealthTip() {
        const tips = [
            {
                title: 'Hidratación Adecuada',
                content: 'Recuerda mantener una hidratación adecuada. Bebe al menos 8 vasos de agua al día, especialmente si estás tomando medicamentos diuréticos.'
            },
            {
                title: 'Ejercicio Regular',
                content: 'Realiza al menos 30 minutos de actividad física moderada al día. Esto ayuda a mantener tu presión arterial estable y mejora tu salud cardiovascular.'
            },
            {
                title: 'Descanso de Calidad',
                content: 'Asegúrate de dormir entre 7-9 horas por noche. Un buen descanso es fundamental para la recuperación y el bienestar general.'
            },
            {
                title: 'Alimentación Balanceada',
                content: 'Mantén una dieta rica en frutas, verduras, proteínas magras y granos enteros. Evita el exceso de sal y azúcares refinados.'
            },
            {
                title: 'Control del Estrés',
                content: 'Practica técnicas de relajación como meditación o respiración profunda. El estrés puede afectar significativamente tu salud.'
            }
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        const tipCard = document.querySelector('.tip-card');
        
        if (tipCard) {
            tipCard.style.opacity = '0';
            setTimeout(() => {
                tipCard.querySelector('.tip-title').textContent = randomTip.title;
                tipCard.querySelector('.tip-content').textContent = randomTip.content;
                tipCard.style.opacity = '1';
            }, 300);
        }

        this.showNotification('Consejo', 'Nuevo consejo generado', 'success');
    }

    // ===== SISTEMA DE NOTIFICACIONES =====
    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">${title}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-message">${message}</div>
        `;

        const container = document.getElementById('notificationContainer');
        container.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    // ===== GRÁFICOS =====
    initializeCharts() {
        this.createTrendsChart();
        this.createPredictionsChart();
    }

    createTrendsChart() {
        const ctx = document.getElementById('trendsChart').getContext('2d');
        // Si ya existe, destrúyelo
        if (this.trendsChartInstance) {
            this.trendsChartInstance.destroy();
        }
        this.trendsChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
                datasets: [{
                    label: 'Presión Arterial',
                    data: [125, 122, 120, 118, 115],
                    borderColor: '#26a69a',
                    backgroundColor: 'rgba(38, 166, 154, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Peso (kg)',
                    data: [75, 74.5, 74, 73.5, 73],
                    borderColor: '#ff6b35',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    createPredictionsChart() {
        const ctx = document.getElementById('predictionsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Bajo Riesgo', 'Riesgo Medio', 'Alto Riesgo'],
                datasets: [{
                    data: [25, 60, 15],
                    backgroundColor: [
                        '#4caf50',
                        '#ff9800',
                        '#f44336'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    updateTrendsChart(days) {
        // Simular actualización de datos
        console.log(`Actualizando gráfico para ${days} días`);
    }

    // ===== FUNCIONES AUXILIARES =====
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    hasEvents(date) {
        // Simular verificación de eventos
        return Math.random() > 0.7;
    }

    animatePageTransition() {
        document.body.style.opacity = '0.8';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 300);
    }

    showWelcomeAnimation() {
        const welcomeSection = document.querySelector('.welcome-section');
        if (welcomeSection) {
            welcomeSection.style.opacity = '0';
            welcomeSection.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                welcomeSection.style.transition = 'all 0.8s ease-out';
                welcomeSection.style.opacity = '1';
                welcomeSection.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    startRealTimeUpdates() {
        // Simular actualizaciones en tiempo real
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000); // Cada 30 segundos
        
        // Actualizar el saludo cada hora para reflejar el cambio de día
        setInterval(() => {
            this.updateWelcomeMessage();
        }, 3600000); // 1 hora
    }

    updateRealTimeData() {
        // Actualizar datos en tiempo real
        const now = new Date();
        const timeElement = document.querySelector('.summary-card.medication .summary-card-value');
        if (timeElement) {
            const nextDose = new Date(now.getTime() + 45 * 60000); // 45 minutos
            timeElement.textContent = nextDose.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    refreshHealthData() {
        this.showNotification('Actualizando', 'Refrescando datos de salud...', 'info');
        
        // Simular carga
        setTimeout(() => {
            this.showNotification('Éxito', 'Datos actualizados correctamente', 'success');
        }, 1500);
    }

    // ===== FUNCIONES ESPECÍFICAS =====
    showMedicationDetails() {
        this.showNotification('Medicación', 'Mostrando detalles de medicación', 'info');
    }

    showBloodPressureHistory() {
        this.showNotification('Presión Arterial', 'Mostrando historial de presión arterial', 'info');
    }

    showAdherenceDetails() {
        this.showNotification('Adherencia', 'Mostrando detalles de adherencia', 'info');
    }

    showAppointmentDetails() {
        this.showNotification('Citas', 'Mostrando detalles de citas', 'info');
    }

    // ===== ALERTAS INTELIGENTES DINÁMICAS =====
    renderSmartAlerts() {
        // 1. Leer mediciones reales
        let mediciones = [];
        try {
            mediciones = JSON.parse(localStorage.getItem('mediciones') || '[]');
        } catch (e) { mediciones = []; }
        const now = new Date();
        // 2. Definir condiciones de alerta (30 ejemplos)
        const alertDefs = [
            // Presión arterial
            {
                id: 'presion-alta',
                check: ms => ms.tipo === 'presion' && Number(ms.sistolica) >= 140,
                icon: 'fa-heartbeat',
                color: 'alert-high',
                title: 'Presión arterial alta',
                desc: 'Se detectó una medición de presión sistólica mayor o igual a 140 mmHg.',
                badge: 'Alta prioridad'
            },
            {
                id: 'presion-baja',
                check: ms => ms.tipo === 'presion' && Number(ms.sistolica) <= 90,
                icon: 'fa-heartbeat',
                color: 'alert-medium',
                title: 'Presión arterial baja',
                desc: 'Se detectó una medición de presión sistólica menor o igual a 90 mmHg.',
                badge: 'Media'
            },
            {
                id: 'diastolica-alta',
                check: ms => ms.tipo === 'presion' && Number(ms.diastolica) >= 90,
                icon: 'fa-heartbeat',
                color: 'alert-high',
                title: 'Diastólica elevada',
                desc: 'La presión diastólica está por encima de 90 mmHg.',
                badge: 'Alta prioridad'
            },
            {
                id: 'diastolica-baja',
                check: ms => ms.tipo === 'presion' && Number(ms.diastolica) <= 60,
                icon: 'fa-heartbeat',
                color: 'alert-medium',
                title: 'Diastólica baja',
                desc: 'La presión diastólica está por debajo de 60 mmHg.',
                badge: 'Media'
            },
            // Glucosa
            {
                id: 'glucosa-alta',
                check: ms => ms.tipo === 'glucosa' && Number(ms.glucosa) >= 180,
                icon: 'fa-tint',
                color: 'alert-high',
                title: 'Glucosa elevada',
                desc: 'Se detectó una medición de glucosa mayor o igual a 180 mg/dL.',
                badge: 'Alta prioridad'
            },
            {
                id: 'glucosa-baja',
                check: ms => ms.tipo === 'glucosa' && Number(ms.glucosa) <= 70,
                icon: 'fa-tint',
                color: 'alert-high',
                title: 'Glucosa baja',
                desc: 'Se detectó una medición de glucosa menor o igual a 70 mg/dL.',
                badge: 'Alta prioridad'
            },
            // Peso
            {
                id: 'peso-alto',
                check: ms => ms.tipo === 'peso' && Number(ms.peso) >= 100,
                icon: 'fa-weight',
                color: 'alert-medium',
                title: 'Peso elevado',
                desc: 'Se detectó un peso mayor o igual a 100 kg.',
                badge: 'Media'
            },
            {
                id: 'peso-bajo',
                check: ms => ms.tipo === 'peso' && Number(ms.peso) <= 45,
                icon: 'fa-weight',
                color: 'alert-medium',
                title: 'Peso bajo',
                desc: 'Se detectó un peso menor o igual a 45 kg.',
                badge: 'Media'
            },
            // Temperatura
            {
                id: 'fiebre',
                check: ms => ms.tipo === 'temperatura' && Number(ms.temperatura) >= 38,
                icon: 'fa-thermometer-half',
                color: 'alert-high',
                title: 'Fiebre detectada',
                desc: 'Temperatura corporal igual o mayor a 38°C.',
                badge: 'Alta prioridad'
            },
            {
                id: 'hipotermia',
                check: ms => ms.tipo === 'temperatura' && Number(ms.temperatura) <= 35,
                icon: 'fa-thermometer-half',
                color: 'alert-high',
                title: 'Hipotermia',
                desc: 'Temperatura corporal igual o menor a 35°C.',
                badge: 'Alta prioridad'
            },
            // Oxígeno
            {
                id: 'oxigeno-bajo',
                check: ms => ms.tipo === 'oxigeno' && Number(ms.oxigeno) <= 92,
                icon: 'fa-lungs',
                color: 'alert-high',
                title: 'Oxígeno bajo',
                desc: 'Saturación de oxígeno igual o menor a 92%.',
                badge: 'Alta prioridad'
            },
            // Hábitos y tendencias
            {
                id: 'pocos-registros',
                check: () => mediciones.length < 3,
                icon: 'fa-exclamation-circle',
                color: 'alert-info',
                title: 'Pocos registros',
                desc: 'No se han registrado suficientes mediciones esta semana.',
                badge: 'Info'
            },
            {
                id: 'sin-pasos',
                check: () => {
                    const ultimos7 = mediciones.filter(m => m.tipo === 'pasos' && m.fecha && (now - new Date(m.fecha)) < 7*24*60*60*1000);
                    return ultimos7.length === 0;
                },
                icon: 'fa-shoe-prints',
                color: 'alert-info',
                title: 'Sin actividad física',
                desc: 'No se han registrado pasos en la última semana.',
                badge: 'Info'
            },
            // ... (agrega aquí más condiciones hasta 30, combinando valores, tendencias, combinaciones, etc)
        ];
        // 3. Evaluar condiciones y construir alertas
        let alerts = [];
        for (const def of alertDefs) {
            if (def.check.length === 1) {
                // Por cada medición
                for (const m of mediciones) {
                    if (def.check(m)) {
                        alerts.push({
                            icon: def.icon,
                            color: def.color,
                            title: def.title,
                            desc: def.desc,
                            badge: def.badge,
                            time: m.fecha ? this.getRelativeDate(m.fecha) : 'Reciente'
                        });
                        break; // Solo una alerta por tipo
                    }
                }
            } else {
                // Condición global
                if (def.check()) {
                    alerts.push({
                        icon: def.icon,
                        color: def.color,
                        title: def.title,
                        desc: def.desc,
                        badge: def.badge,
                        time: 'Ahora'
                    });
                }
            }
            if (alerts.length >= 30) break;
        }
        // 4. Renderizar en el DOM
        const list = document.querySelector('.smart-alert-list');
        const badge = document.querySelector('.smart-alerts-header .badge');
        if (list) {
            list.innerHTML = alerts.length === 0 ? '<div class="smart-alert-item alert-info">No hay alertas activas 🎉</div>' : alerts.map(alert => `
                <div class="smart-alert-item ${alert.color} animate-alert">
                  <div class="smart-alert-icon"><i class="fas ${alert.icon}"></i></div>
                  <div class="smart-alert-info">
                    <div class="smart-alert-title">${alert.title}</div>
                    <div class="smart-alert-desc">${alert.desc} <span class="badge">${alert.badge}</span></div>
                    <div class="smart-alert-meta"><i class="fas fa-clock"></i> ${alert.time}</div>
                  </div>
                </div>
            `).join('');
        }
        if (badge) badge.textContent = alerts.length;
    }

    // Llama a renderSmartAlerts en el dashboard personalizado
    initializePersonalizedDashboard() {
        this.updateWelcomeMessage();
        this.updateHealthStatus();
        this.loadQuickActionCards();
        this.loadNotifications();
        this.loadCuriosities();
        this.setupMotivationalQuotes();
        this.renderSmartAlerts();
        this.syncAppointmentsToCalendar();
    }

    // Sincroniza citas de 'meditrack_appointments' con el calendario de inicio
    syncAppointmentsToCalendar() {
        let eventos = JSON.parse(localStorage.getItem('eventosCalendario') || '[]');
        // --- Citas ---
        let citasRaw = localStorage.getItem('meditrack_appointments');
        if (citasRaw) {
            let citas = [];
            try {
                const parsed = JSON.parse(citasRaw);
                citas = Array.isArray(parsed) ? parsed : parsed.data || [];
            } catch { citas = []; }
            citas.forEach(cita => {
                if (!cita.start) return;
                const fecha = cita.start.split('T')[0];
                if (eventos.some(ev => ev.id === cita.id)) return;
                eventos.push({
                    id: cita.id,
                    tipo: 'Cita',
                    fecha: fecha,
                    hora: cita.start.split('T')[1]?.slice(0,5) || '',
                    descripcion: cita.title || cita.notes || '',
                    icono: 'calendar-check',
                    color: '#1976d2'
                });
            });
        }
        // --- Recordatorios ---
        let reminders = [];
        try { reminders = JSON.parse(localStorage.getItem('reminders') || '[]'); } catch { reminders = []; }
        reminders.forEach(rem => {
            if (!rem.date) return;
            const id = 'reminder-' + (rem.id || rem.title + rem.date + (rem.time||''));
            if (eventos.some(ev => ev.id === id)) return;
            let color = '#43a047', icono = 'bell';
            if (rem.category === 'medication') { color = '#ffa726'; icono = 'pills'; }
            if (rem.category === 'appointment') { color = '#1976d2'; icono = 'calendar-check'; }
            if (rem.category === 'exercise') { color = '#26a69a'; icono = 'running'; }
            if (rem.category === 'measurement') { color = '#00897b'; icono = 'heartbeat'; }
            if (rem.category === 'water') { color = '#00bcd4'; icono = 'tint'; }
            eventos.push({
                id,
                tipo: 'Recordatorio',
                fecha: rem.date,
                hora: rem.time || '',
                descripcion: rem.title || rem.description || '',
                icono,
                color
            });
        });
        // --- Eventos Médicos ---
        let medicalEvents = [];
        try { medicalEvents = JSON.parse(localStorage.getItem('medicalEvents') || '[]'); } catch { medicalEvents = []; }
        medicalEvents.forEach(ev => {
            if (!ev.date) return;
            if (eventos.some(e => e.id === ev.id)) return;
            eventos.push({
                id: ev.id,
                tipo: 'Evento Médico',
                fecha: ev.date,
                hora: '',
                descripcion: ev.name || ev.description || '',
                icono: 'notes-medical',
                color: '#f44336'
            });
        });
        // === AGREGAR EVENTOS DE EJEMPLO SI NO HAY NADA ===
        if (eventos.length === 0) {
            // Obtener fecha base (hoy)
            const today = new Date();
            function formatDate(offset) {
                const d = new Date(today);
                d.setDate(today.getDate() + offset);
                return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
            }
            // Ejemplo de citas demo
            [
                { id: 'demo-cita-1', tipo: 'Cita', fecha: formatDate(1), hora: '14:30', descripcion: 'Consulta cardiológica', icono: 'calendar-check', color: '#1976d2' },
                { id: 'demo-cita-2', tipo: 'Cita', fecha: formatDate(2), hora: '09:00', descripcion: 'Análisis de sangre', icono: 'calendar-check', color: '#1976d2' },
                { id: 'demo-cita-3', tipo: 'Cita', fecha: formatDate(3), hora: '10:00', descripcion: 'Revisión oftalmológica', icono: 'calendar-check', color: '#1976d2' }
            ].forEach(ev => eventos.push(ev));
            // Ejemplo de recordatorios demo
            [
                { id: 'demo-rem-1', tipo: 'Recordatorio', fecha: formatDate(1), hora: '08:00', descripcion: 'Tomar Vitamina D', icono: 'pills', color: '#ffa726' },
                { id: 'demo-rem-2', tipo: 'Recordatorio', fecha: formatDate(2), hora: '20:00', descripcion: 'Ejercicio: Caminata', icono: 'running', color: '#26a69a' }
            ].forEach(ev => eventos.push(ev));
            // Ejemplo de eventos médicos demo
            [
                { id: 'demo-med-1', tipo: 'Evento Médico', fecha: formatDate(4), hora: '', descripcion: 'Cirugía de Apendicectomía', icono: 'notes-medical', color: '#f44336' },
                { id: 'demo-med-2', tipo: 'Evento Médico', fecha: formatDate(5), hora: '', descripcion: 'Vacunación Anual (Influenza)', icono: 'syringe', color: '#f44336' }
            ].forEach(ev => eventos.push(ev));
            // Ejemplo de notas/demo de Informe.js
            [
                { id: 'demo-note-1', tipo: 'Nota', fecha: formatDate(6), hora: '21:00', descripcion: 'Nota personal: Me siento más cansada de lo habitual hoy.', icono: 'sticky-note', color: '#ffa726' }
            ].forEach(ev => eventos.push(ev));
        }
        localStorage.setItem('eventosCalendario', JSON.stringify(eventos));
    }

    // Actualizar mensaje de bienvenida personalizado
    updateWelcomeMessage() {
        const welcomeTitle = document.getElementById('welcomeTitle');
        const welcomeSubtitle = document.getElementById('welcomeSubtitle');
        
        if (welcomeTitle && welcomeSubtitle) {
            const userName = this.getUserName();
            const currentTime = new Date().getHours();
            let greeting = '';
            
            // Saludos más específicos según la hora
            if (currentTime >= 5 && currentTime < 12) {
                greeting = '¡Buenos días';
            } else if (currentTime >= 12 && currentTime < 18) {
                greeting = '¡Buenas tardes';
            } else if (currentTime >= 18 && currentTime < 22) {
                greeting = '¡Buenas noches';
            } else {
                greeting = '¡Buenas noches'; // Madrugada
            }
            
            welcomeTitle.textContent = `${greeting}, ${userName}!`;
            welcomeSubtitle.textContent = `Aquí tienes tu resumen de salud para ${this.getCurrentDateString()}`;
        }
    }

    // Actualizar estado de salud
    updateHealthStatus() {
        const statusIndicator = document.getElementById('healthStatusIndicator');
        const statusText = document.getElementById('healthStatusText');
        
        if (statusIndicator && statusText) {
            const healthStatus = this.calculateHealthStatus();
            
            statusText.textContent = healthStatus.message;
            
            // Actualizar icono y color según el estado
            const icon = statusIndicator.querySelector('i');
            if (icon) {
                icon.className = healthStatus.icon;
                icon.style.color = healthStatus.color;
            }
        }
    }

    // Cargar tarjetas de acciones rápidas
    loadQuickActionCards() {
        this.updateMedicationCard();
        this.updateAppointmentCard();
        this.updateEmergencyCard();
        this.updateLastRecordCard();
    }

    // Actualizar tarjeta de medicación
    updateMedicationCard() {
        const medicationName = document.getElementById('medicationName');
        const medicationTime = document.getElementById('medicationTime');
        const medicationTimeDetail = document.getElementById('medicationTimeDetail');
        
        if (medicationName && medicationTime && medicationTimeDetail) {
            const nextMedication = this.getNextMedication();
            
            if (nextMedication) {
                medicationName.textContent = nextMedication.name;
                medicationTimeDetail.textContent = nextMedication.time;
                medicationTime.textContent = this.getTimeUntil(nextMedication.time);
            }
        }
    }

    // Actualizar tarjeta de citas
    updateAppointmentCard() {
        const doctorName = document.getElementById('doctorName');
        const specialty = document.getElementById('specialty');
        const appointmentTime = document.getElementById('appointmentTime');
        const appointmentDate = document.getElementById('appointmentDate');
        
        if (doctorName && specialty && appointmentTime && appointmentDate) {
            const nextAppointment = this.getNextAppointment();
            
            if (nextAppointment) {
                doctorName.textContent = nextAppointment.doctor;
                specialty.textContent = nextAppointment.specialty;
                appointmentTime.textContent = `${nextAppointment.time} - ${nextAppointment.location}`;
                appointmentDate.textContent = this.getRelativeDate(nextAppointment.date);
            }
        }
    }

    // Actualizar tarjeta de emergencia
    updateEmergencyCard() {
        const contactName = document.getElementById('emergencyContactName');
        const contactPhone = document.getElementById('emergencyContactPhone');
        const caregiverMode = document.getElementById('caregiverModeStatus');
        
        if (contactName && contactPhone && caregiverMode) {
            const emergencyContact = this.getEmergencyContact();
            
            if (emergencyContact) {
                contactName.textContent = emergencyContact.name;
                contactPhone.textContent = emergencyContact.phone;
                
                if (this.isCaregiverMode()) {
                    caregiverMode.style.display = 'inline-block';
                } else {
                    caregiverMode.style.display = 'none';
                }
            }
        }
    }

    // Actualizar tarjeta de último registro
    updateLastRecordCard() {
        const diagnosis = document.getElementById('lastDiagnosis');
        const doctor = document.getElementById('lastDoctor');
        const status = document.getElementById('lastStatus');
        const lastRecordDate = document.getElementById('lastRecordDate');
        
        if (diagnosis && doctor && status && lastRecordDate) {
            const lastRecord = this.getLastMedicalRecord();
            
            if (lastRecord) {
                diagnosis.textContent = lastRecord.diagnosis;
                doctor.textContent = lastRecord.doctor;
                status.textContent = lastRecord.status;
                lastRecordDate.textContent = this.formatDate(lastRecord.date);
            }
        }
    }

    // ===== MINI-GRÁFICOS =====
    initializeMiniCharts() {
        this.createAdherenceChart();
        this.createBloodPressureChart();
        this.createActivityChart();
    }

    // Crear gráfico de adherencia (dona)
    createAdherenceChart() {
        const ctx = document.getElementById('adherenceChart');
        if (!ctx) return;

        const adherenceData = this.getAdherenceData();
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [adherenceData.percentage, 100 - adherenceData.percentage],
                    backgroundColor: [
                        '#10B981', // Verde para completado
                        '#E5E7EB'  // Gris para pendiente
                    ],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });

        // Actualizar porcentaje en el overlay
        const percentageElement = document.getElementById('adherencePercentage');
        if (percentageElement) {
            percentageElement.textContent = `${adherenceData.percentage}%`;
        }
    }

    // Crear gráfico de presión arterial
    createBloodPressureChart() {
        const ctx = document.getElementById('bloodPressureChart');
        if (!ctx) return;

        const bloodPressureData = this.getBloodPressureData();
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: bloodPressureData.labels,
                datasets: [{
                    label: 'Sistólica',
                    data: bloodPressureData.systolic,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Diastólica',
                    data: bloodPressureData.diastolic,
                    borderColor: '#3B82F6',
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
                        beginAtZero: false,
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Crear gráfico de actividad
    createActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;

        const activityData = this.getActivityData();
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: activityData.labels,
                datasets: [{
                    label: 'Pasos',
                    data: activityData.steps,
                    backgroundColor: '#8B5CF6',
                    borderRadius: 4
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
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // ===== NOTIFICACIONES =====
    setupNotifications() {
        this.loadNotifications();
        this.startNotificationUpdates();
    }

    loadNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        const notificationCount = document.getElementById('notificationCount');
        
        if (notificationsList && notificationCount) {
            const notifications = this.getRecentNotifications();
            
            // Actualizar contador
            notificationCount.textContent = notifications.length;
            
            // Limpiar lista existente
            notificationsList.innerHTML = '';
            
            // Agregar notificaciones
            notifications.forEach(notification => {
                const notificationElement = this.createNotificationElement(notification);
                notificationsList.appendChild(notificationElement);
            });
        }
    }

    createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = `notification-item ${notification.type}`;
        
        div.innerHTML = `
            <i class="fas ${notification.icon}"></i>
            <div class="notification-content">
                <p class="notification-text">${notification.text}</p>
                <span class="notification-time">${notification.time}</span>
            </div>
        `;
        
        return div;
    }

    // ===== CURIOSIDADES =====
    loadCuriosities() {
        const curiosityText = document.getElementById('curiosityText');
        if (curiosityText) {
            const curiosity = this.getRandomCuriosity();
            curiosityText.textContent = curiosity;
        }
    }

    // ===== FRASES MOTIVACIONALES =====
    setupMotivationalQuotes() {
        const motivationalQuote = document.getElementById('motivationalQuote');
        if (motivationalQuote) {
            const quote = this.getMotivationalQuote();
            motivationalQuote.textContent = `"${quote}"`;
        }
    }

    // ===== FUNCIONES DE DATOS (SIMULADAS) =====
    getUserName() {
        // Obtener el nombre del usuario desde localStorage
        let userName = localStorage.getItem('userName');
        
        if (!userName) {
            // Si no hay nombre guardado, redirigir al login
            window.location.href = 'index.html';
            return 'Usuario'; // Nombre temporal
        }
        
        return userName;
    }

    getCurrentDateString() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('es-ES', options);
    }

    calculateHealthStatus() {
        // Lógica para determinar el estado de salud
        const hasPendingMedications = this.hasPendingMedications();
        const hasUpcomingAppointments = this.hasUpcomingAppointments();
        const hasAlerts = this.hasHealthAlerts();
        
        if (hasAlerts) {
            return {
                message: 'Revisa tus alertas',
                icon: 'fas fa-exclamation-triangle',
                color: '#EF4444'
            };
        } else if (hasPendingMedications) {
            return {
                message: 'Medicamentos pendientes',
                icon: 'fas fa-clock',
                color: '#F59E0B'
            };
        } else {
            return {
                message: 'Todo bajo control',
                icon: 'fas fa-check-circle',
                color: '#10B981'
            };
        }
    }

    getNextMedication() {
        // Simulación de datos de medicación
        return {
            name: 'Paracetamol 500mg',
            time: '14:00',
            date: new Date()
        };
    }

    getNextAppointment() {
        // Simulación de datos de citas
        return {
            doctor: 'Dr. María González',
            specialty: 'Cardiología',
            time: '15:30',
            location: 'Clínica Vida',
            date: new Date()
        };
    }

    getEmergencyContact() {
        // Simulación de contacto de emergencia
        return {
            name: 'Juan Pérez',
            phone: '310 123 4567'
        };
    }

    getLastMedicalRecord() {
        // Simulación de último registro médico
        return {
            diagnosis: 'Hipertensión',
            doctor: 'Dr. Carlos Ruiz',
            status: 'En tratamiento',
            date: new Date('2025-06-14')
        };
    }

    getAdherenceData() {
        // Simulación de datos de adherencia
        return {
            percentage: 95,
            total: 20,
            taken: 19
        };
    }

    getBloodPressureData() {
        // Simulación de datos de presión arterial
        const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        return {
            labels: labels,
            systolic: [120, 118, 122, 119, 121, 117, 120],
            diastolic: [80, 78, 82, 79, 81, 77, 80]
        };
    }

    getActivityData() {
        // Simulación de datos de actividad
        const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        return {
            labels: labels,
            steps: [6500, 7200, 5800, 8100, 6900, 7500, 6800]
        };
    }

    getRecentNotifications() {
        // Simulación de notificaciones recientes
        return [
            {
                type: 'reminder',
                icon: 'fa-clock',
                text: 'Recordatorio: Toma tu Ibuprofeno a las 20:00',
                time: 'Hace 5 min'
            },
            {
                type: 'alert',
                icon: 'fa-exclamation-triangle',
                text: 'Glucosa elevada en la última medición',
                time: 'Hace 1 hora'
            },
            {
                type: 'info',
                icon: 'fa-info-circle',
                text: 'Tu cita de mañana ha sido confirmada',
                time: 'Hace 2 horas'
            }
        ];
    }

    getRandomCuriosity() {
        // Curiosidades médicas del MediBot
        const curiosities = [
            'Sonreír reduce el estrés y libera endorfinas que mejoran tu estado de ánimo, incluso si no te sientes feliz.',
            'El corazón humano late alrededor de 100,000 veces al día.',
            'La piel es el órgano más grande del cuerpo, cubriendo un área de unos 2 metros cuadrados.',
            'Tus ojos parpadean unas 15-20 veces por minuto, ¡eso son más de 20,000 veces al día!',
            'El cerebro humano pesa aproximadamente 1.4 kg, pero consume alrededor del 20% del oxígeno de tu cuerpo.'
        ];
        return curiosities[Math.floor(Math.random() * curiosities.length)];
    }

    getMotivationalQuote() {
        // Frases motivacionales
        const quotes = [
            'Cada día es una nueva oportunidad para cuidar tu salud',
            'Pequeños cambios hoy, grandes resultados mañana',
            'Tu salud es una inversión, no un gasto',
            'El autocuidado no es egoísmo, es supervivencia',
            'La salud es la mayor riqueza'
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    // ===== FUNCIONES UTILITARIAS =====
    getTimeUntil(timeString) {
        const now = new Date();
        const [hours, minutes] = timeString.split(':');
        const targetTime = new Date();
        targetTime.setHours(parseInt(hours), parseInt(minutes), 0);
        
        if (targetTime < now) {
            targetTime.setDate(targetTime.getDate() + 1);
        }
        
        const diff = targetTime - now;
        const hoursDiff = Math.floor(diff / (1000 * 60 * 60));
        const minutesDiff = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hoursDiff > 0) {
            return `En ${hoursDiff}h ${minutesDiff}m`;
        } else {
            return `En ${minutesDiff} minutos`;
        }
    }

    getRelativeDate(date) {
        const today = new Date();
        const appointmentDate = new Date(date);
        const diffTime = appointmentDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Mañana';
        if (diffDays < 7) return `En ${diffDays} días`;
        return this.formatDate(date);
    }

    formatDate(date) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(date).toLocaleDateString('es-ES', options);
    }

    hasPendingMedications() {
        // Simulación
        return Math.random() > 0.7;
    }

    hasUpcomingAppointments() {
        // Simulación
        return Math.random() > 0.5;
    }

    hasHealthAlerts() {
        // Simulación
        return Math.random() > 0.8;
    }

    isCaregiverMode() {
        // Simulación
        return Math.random() > 0.5;
    }

    // ===== FUNCIONES DE NAVEGACIÓN =====
    navigateToPage(page) {
        window.location.href = page;
    }

    // ===== ACTUALIZACIONES EN TIEMPO REAL =====
    startNotificationUpdates() {
        setInterval(() => {
            this.updateMedicationCard();
            this.updateHealthStatus();
        }, 60000); // Actualizar cada minuto
    }

    // ===== FUNCIONES PÚBLICAS PARA BOTONES =====
    markMedicationTaken() {
        this.showNotification('Medicación', 'Medicamento marcado como tomado', 'success');
        this.updateMedicationCard();
    }

    addToCalendar() {
        this.showNotification('Calendario', 'Cita agregada al calendario', 'success');
    }

    activateEmergency() {
        this.showNotification('Emergencia', 'Contactando servicios de emergencia...', 'warning');
    }

    generateNewTip() {
        this.loadCuriosities();
        this.showNotification('Consejo', 'Nuevo consejo generado', 'info');
    }

    showNewCuriosity() {
        this.loadCuriosities();
        this.showNotification('Curiosidad', 'Nueva curiosidad mostrada', 'info');
    }

    viewAllNotifications() {
        this.showNotification('Notificaciones', 'Abriendo todas las notificaciones', 'info');
    }

    loadUserData() {
        // Verificar si el usuario está autenticado
        const userName = localStorage.getItem('userName');
        if (!userName) {
            // Si no hay nombre de usuario, redirigir al login
            window.location.href = 'index.html';
            return;
        }
        
        // Cargar datos del usuario desde localStorage o backend
        const userData = localStorage.getItem('userData');
        if (userData) {
            this.userData = JSON.parse(userData);
        } else {
            // Datos por defecto usando el nombre del usuario autenticado
            this.userData = {
                name: userName,
                email: 'usuario@email.com',
                avatar: null
            };
        }
        
        // Actualizar el nombre en el sidebar
        this.updateSidebarUserName(userName);
    }
    
    updateSidebarUserName(userName) {
        // Actualizar el nombre del usuario en el sidebar
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = userName;
        }
    }

    // ===== CONFIGURACIÓN DEL SIDEBAR =====
    setupSidebarToggle() {
        // El sidebar se maneja automáticamente por su propio script
        // Esta función se mantiene por compatibilidad pero no hace nada
        console.log('Sidebar toggle configurado por el script del sidebar');
    }

    goToToday() {
        const grid = document.getElementById('calendarGrid');
        if (grid) {
            grid.classList.remove('fade-in');
            grid.classList.add('fade-out');
            setTimeout(() => {
                this.currentMonth = new Date();
                this.renderCalendar();
                const newGrid = document.getElementById('calendarGrid');
                if (newGrid) {
                    newGrid.classList.remove('fade-out');
                    newGrid.classList.add('fade-in');
                }
            }, 220);
        } else {
            this.currentMonth = new Date();
            this.renderCalendar();
        }
    }

    // ===== FUNCIONES DEL CHAT MEJORADO =====
    setupChatFunctionality() {
        // Búsqueda de chats
        const searchInput = document.getElementById('chatSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterChats();
            });
        }

        // Filtro por especialidad
        const specialtyFilter = document.getElementById('specialtyFilter');
        if (specialtyFilter) {
            specialtyFilter.addEventListener('change', () => {
                this.filterChats();
            });
        }

        // Filtro de médicos en línea
        const onlineFilter = document.getElementById('onlineFilter');
        if (onlineFilter) {
            onlineFilter.addEventListener('click', () => {
                onlineFilter.classList.toggle('active');
                this.filterChats();
            });
        }

        // Cargar avatares de doctores
        this.loadDoctorAvatars();

        // Simular mensajes nuevos
        this.simulateNewMessages();
    }

    // Función para generar avatares únicos usando DiceBear API
    loadDoctorAvatars() {
        const doctorAvatars = {
            'dra-garcia': 'https://api.dicebear.com/7.x/avataaars/svg?seed=mariaGarcia&backgroundColor=26a69a,4db6ac&mouth=smile&style=circle',
            'dr-martinez': 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlosMartinez&backgroundColor=1976d2,42a5f5&mouth=smile&style=circle',
            'dr-lopez': 'https://api.dicebear.com/7.x/avataaars/svg?seed=juanLopez&backgroundColor=ffa726,ffb74d&mouth=smile&style=circle',
            'dra-soto': 'https://api.dicebear.com/7.x/avataaars/svg?seed=anaSoto&backgroundColor=9c27b0,ba68c8&mouth=smile&style=circle'
        };

        // Actualizar avatares en la lista de chats
        Object.keys(doctorAvatars).forEach(doctorId => {
            const chatItem = document.querySelector(`[data-doctor-id="${doctorId}"]`);
            if (chatItem) {
                const avatarElement = chatItem.querySelector('.chat-avatar');
                if (avatarElement) {
                    avatarElement.innerHTML = `
                        <img src="${doctorAvatars[doctorId]}" alt="Avatar" class="doctor-avatar-img">
                        <div class="${doctorAvatars[doctorId].includes('mariaGarcia') || doctorAvatars[doctorId].includes('juanLopez') ? 'online-status' : 'offline-status'}" title="${doctorAvatars[doctorId].includes('mariaGarcia') || doctorAvatars[doctorId].includes('juanLopez') ? 'En línea' : 'Desconectado'}"></div>
                    `;
                }
            }
        });

        // Guardar avatares en localStorage para uso posterior
        localStorage.setItem('doctorAvatars', JSON.stringify(doctorAvatars));
    }

    // Función para obtener avatar de un doctor específico
    getDoctorAvatar(doctorId) {
        const avatars = JSON.parse(localStorage.getItem('doctorAvatars') || '{}');
        return avatars[doctorId] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctorId}&backgroundColor=26a69a,4db6ac&mouth=smile&style=circle`;
    }

    filterChats() {
        const searchTerm = document.getElementById('chatSearch')?.value.toLowerCase() || '';
        const specialty = document.getElementById('specialtyFilter')?.value || '';
        const onlineOnly = document.getElementById('onlineFilter')?.classList.contains('active') || false;

        const chatItems = document.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const name = item.querySelector('.chat-name')?.textContent.toLowerCase() || '';
            const message = item.querySelector('.message-bubble p')?.textContent.toLowerCase() || '';
            const itemSpecialty = item.dataset.specialty || '';
            const isOnline = item.dataset.online === 'true';

            const matchesSearch = name.includes(searchTerm) || message.includes(searchTerm);
            const matchesSpecialty = !specialty || itemSpecialty === specialty;
            const matchesOnline = !onlineOnly || isOnline;

            if (matchesSearch && matchesSpecialty && matchesOnline) {
                item.classList.remove('hidden');
                item.style.display = 'flex';
            } else {
                item.classList.add('hidden');
                item.style.display = 'none';
            }
        });

        // Mostrar mensaje si no hay resultados
        this.showNoResultsMessage();
    }

    showNoResultsMessage() {
        const visibleChats = document.querySelectorAll('.chat-item:not(.hidden)');
        const noResultsMsg = document.getElementById('noResultsMessage');
        
        if (visibleChats.length === 0) {
            if (!noResultsMsg) {
                const msg = document.createElement('div');
                msg.id = 'noResultsMessage';
                msg.className = 'no-results-message';
                msg.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>No se encontraron chats que coincidan con tu búsqueda</p>
                `;
                document.getElementById('chatList').appendChild(msg);
            }
        } else {
            noResultsMsg?.remove();
        }
    }

    simulateNewMessages() {
        // Simular mensajes nuevos cada 30 segundos
        setInterval(() => {
            const chatItems = document.querySelectorAll('.chat-item');
            if (chatItems.length > 0) {
                const randomChat = chatItems[Math.floor(Math.random() * chatItems.length)];
                if (!randomChat.classList.contains('unread')) {
                    this.addNewMessage(randomChat);
                }
            }
        }, 30000);
    }

    addNewMessage(chatItem) {
        chatItem.classList.add('unread');
        
        const badge = chatItem.querySelector('.unread-badge');
        if (badge) {
            const currentCount = parseInt(badge.textContent) || 0;
            badge.textContent = currentCount + 1;
        } else {
            const meta = chatItem.querySelector('.chat-meta');
            if (meta) {
                const newBadge = document.createElement('span');
                newBadge.className = 'unread-badge';
                newBadge.textContent = '1';
                meta.appendChild(newBadge);
            }
        }

        // Animación de notificación
        chatItem.style.animation = 'none';
        chatItem.offsetHeight; // Trigger reflow
        chatItem.style.animation = 'pulse 0.5s ease-in-out';
        
        // Mostrar notificación
        this.showNotification('Nuevo mensaje', 'Tienes un mensaje nuevo de ' + 
            chatItem.querySelector('.chat-name').textContent, 'info');
    }

    // Funciones globales para el chat
    openChatHistory(doctorId) {
        const doctorData = {
            'dra-garcia': {
                name: 'Dra. María García',
                specialty: 'Cardióloga',
                avatar: this.getDoctorAvatar('dra-garcia'),
                color: 'linear-gradient(135deg, #26a69a, #4db6ac)',
                online: true,
                phone: '+34 600 123 456'
            },
            'dr-martinez': {
                name: 'Dr. Carlos Martínez',
                specialty: 'Médico General',
                avatar: this.getDoctorAvatar('dr-martinez'),
                color: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                online: false,
                phone: '+34 600 234 567'
            },
            'dr-lopez': {
                name: 'Dr. Juan López',
                specialty: 'Oftalmólogo',
                avatar: this.getDoctorAvatar('dr-lopez'),
                color: 'linear-gradient(135deg, #ffa726, #ffb74d)',
                online: true,
                phone: '+34 600 345 678'
            },
            'dra-soto': {
                name: 'Dra. Ana Soto',
                specialty: 'Dermatóloga',
                avatar: this.getDoctorAvatar('dra-soto'),
                color: 'linear-gradient(135deg, #9c27b0, #ba68c8)',
                online: false,
                phone: '+34 600 456 789'
            }
        };
        
        const doctor = doctorData[doctorId] || doctorData['dra-garcia'];
        
        // Crear modal de historial de chat avanzado
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'chatHistoryModal';
        modal.innerHTML = `
            <div class="modal-content chat-modal-content">
                <div class="chat-modal-header">
                    <div class="chat-doctor-info">
                        <div class="chat-doctor-avatar">
                            <img src="${doctor.avatar}" alt="${doctor.name}" class="doctor-avatar-img">
                            <div class="${doctor.online ? 'online-status' : 'offline-status'}" title="${doctor.online ? 'En línea' : 'Desconectado'}"></div>
                        </div>
                        <div class="chat-doctor-details">
                            <h3>${doctor.name}</h3>
                            <p>${doctor.specialty}</p>
                            <span class="chat-status ${doctor.online ? 'online' : 'offline'}">
                                <i class="fas fa-circle"></i>
                                ${doctor.online ? 'En línea' : 'Desconectado'}
                            </span>
                        </div>
                    </div>
                    <div class="chat-header-actions">
                        <button class="chat-action-btn" onclick="callDoctorFromChat('${doctorId}')" title="Llamar">
                            <i class="fas fa-phone"></i>
                        </button>
                        <button class="chat-action-btn" onclick="scheduleAppointmentFromChat('${doctorId}')" title="Agendar cita">
                            <i class="fas fa-calendar-plus"></i>
                        </button>
                        <button class="chat-action-btn" onclick="shareMedicalData('${doctorId}')" title="Compartir datos médicos">
                            <i class="fas fa-share-alt"></i>
                        </button>
                        <button class="modal-close" onclick="closeChatHistory()">&times;</button>
                    </div>
                </div>
                <div class="chat-modal-body">
                    <div class="chat-history" id="chatHistory">
                        <div class="message received">
                            <div class="message-content">
                                <p>Hola, ¿cómo te sientes con la nueva medicación?</p>
                                <span class="message-time">10:30 AM</span>
                                <div class="message-status">
                                    <i class="fas fa-check-double"></i>
                                </div>
                            </div>
                        </div>
                        <div class="message sent">
                            <div class="message-content">
                                <p>Mucho mejor, gracias. Ya no tengo los efectos secundarios que tenía antes.</p>
                                <span class="message-time">10:32 AM</span>
                                <div class="message-status">
                                    <i class="fas fa-check-double"></i>
                                </div>
                            </div>
                        </div>
                        <div class="message received">
                            <div class="message-content">
                                <p>Excelente. ¿Has notado alguna mejora en tu presión arterial?</p>
                                <span class="message-time">10:33 AM</span>
                                <div class="message-status">
                                    <i class="fas fa-check-double"></i>
                                </div>
                            </div>
                        </div>
                        <div class="message sent">
                            <div class="message-content">
                                <p>Sí, está más estable. La última medicación fue 120/80.</p>
                                <span class="message-time">10:35 AM</span>
                                <div class="message-status">
                                    <i class="fas fa-check-double"></i>
                                </div>
                            </div>
                        </div>
                        <div class="message received">
                            <div class="message-content">
                                <p>Perfecto. ¿Recuerdas tu cita de seguimiento el próximo lunes?</p>
                                <span class="message-time">10:36 AM</span>
                                <div class="message-status">
                                    <i class="fas fa-check-double"></i>
                                </div>
                            </div>
                        </div>
                        <div class="message sent">
                            <div class="message-content">
                                <p>Sí, a las 3:00 PM. ¿Necesito traer algún análisis?</p>
                                <span class="message-time">10:37 AM</span>
                                <div class="message-status">
                                    <i class="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chat-input-area">
                        <div class="chat-input-container">
                            <input type="text" placeholder="Escribe tu mensaje..." class="chat-input" id="chatInput">
                            <div class="chat-input-actions">
                                <button class="chat-input-btn" onclick="attachFile()" title="Adjuntar archivo">
                                    <i class="fas fa-paperclip"></i>
                                </button>
                                <button class="chat-input-btn" onclick="sendImage()" title="Enviar imagen">
                                    <i class="fas fa-image"></i>
                                </button>
                                <button class="chat-input-btn" onclick="sendLocation()" title="Compartir ubicación">
                                    <i class="fas fa-map-marker-alt"></i>
                                </button>
                            </div>
                        </div>
                        <button class="send-btn" onclick="sendMessage()" id="sendBtn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar funcionalidades del chat
        this.setupChatInput();
        
        // Marcar como leído
        const chatItem = document.querySelector(`[data-doctor-id="${doctorId}"]`);
        if (chatItem) {
            chatItem.classList.remove('unread');
            const badge = chatItem.querySelector('.unread-badge');
            if (badge) badge.remove();
        }
        
        // Scroll al final del chat
        setTimeout(() => {
            const chatHistory = document.getElementById('chatHistory');
            if (chatHistory) {
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }
        }, 100);
    }

    setupChatInput() {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (chatInput && sendBtn) {
            // Enviar con Enter
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Habilitar/deshabilitar botón de enviar
            chatInput.addEventListener('input', () => {
                sendBtn.disabled = !chatInput.value.trim();
                sendBtn.style.opacity = chatInput.value.trim() ? '1' : '0.5';
            });
        }
    }

    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const chatHistory = document.getElementById('chatHistory');
        
        if (!chatInput || !chatHistory || !chatInput.value.trim()) return;
        
        const message = chatInput.value.trim();
        const time = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Crear mensaje enviado
        const messageElement = document.createElement('div');
        messageElement.className = 'message sent';
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">${time}</span>
                <div class="message-status">
                    <i class="fas fa-clock"></i>
                </div>
            </div>
        `;
        
        chatHistory.appendChild(messageElement);
        chatInput.value = '';
        
        // Scroll al final
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // Simular respuesta del médico después de 2-4 segundos
        setTimeout(() => {
            this.simulateDoctorResponse();
        }, Math.random() * 2000 + 2000);
        
        // Actualizar estado del botón
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.style.opacity = '0.5';
        }
    }

    simulateDoctorResponse() {
        const chatHistory = document.getElementById('chatHistory');
        if (!chatHistory) return;
        
        const responses = [
            "Entiendo perfectamente. ¿Hay algo más que quieras comentarme?",
            "Excelente, eso es muy positivo. Continúa así.",
            "Gracias por la información. Lo tendré en cuenta para tu próxima cita.",
            "¿Has notado algún otro síntoma o cambio?",
            "Perfecto. Recuerda mantener tu rutina de medicación.",
            "Muy bien. ¿Tienes alguna pregunta sobre tu tratamiento?",
            "Eso es una buena señal. Sigue monitoreando tu progreso.",
            "Gracias por mantenerme informado. Estoy aquí si necesitas algo más."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const time = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message received';
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${randomResponse}</p>
                <span class="message-time">${time}</span>
                <div class="message-status">
                    <i class="fas fa-check-double"></i>
                </div>
            </div>
        `;
        
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // Mostrar notificación temporal en lugar de estática
        this.showNotification('Nuevo mensaje', 'El médico ha respondido a tu mensaje');
    }

    callDoctor(doctorId) {
        const doctorNames = {
            'dra-garcia': 'Dra. María García',
            'dr-martinez': 'Dr. Carlos Martínez',
            'dr-lopez': 'Dr. Juan López',
            'dra-soto': 'Dra. Ana Soto'
        };
        
        const doctorName = doctorNames[doctorId] || 'Médico';
        const doctorAvatar = this.getDoctorAvatar(doctorId);
        
        // Crear modal de llamada
        const callModal = document.createElement('div');
        callModal.className = 'modal show';
        callModal.id = 'callModal';
        callModal.innerHTML = `
            <div class="modal-content call-modal-content">
                <div class="call-header">
                    <div class="call-avatar">
                        <img src="${doctorAvatar}" alt="${doctorName}" class="doctor-avatar-img">
                    </div>
                    <h3>Llamando a ${doctorName}</h3>
                    <p class="call-status">Conectando...</p>
                </div>
                <div class="call-actions">
                    <button class="call-btn call-end" onclick="endCall()">
                        <i class="fas fa-phone-slash"></i>
                    </button>
                    <button class="call-btn call-mute" onclick="toggleMute()">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <button class="call-btn call-speaker" onclick="toggleSpeaker()">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
                <div class="call-timer" id="callTimer">00:00</div>
            </div>
        `;
        
        document.body.appendChild(callModal);
        
        // Simular conexión
        setTimeout(() => {
            const status = callModal.querySelector('.call-status');
            if (status) {
                status.textContent = 'Conectado';
                status.className = 'call-status connected';
            }
            this.startCallTimer();
        }, 3000);
        
        // Usar notificación temporal en lugar de estática
        this.showNotification('Llamada', `Conectando con ${doctorName}...`);
    }

    startCallTimer() {
        let seconds = 0;
        const timerElement = document.getElementById('callTimer');
        
        const timer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            if (timerElement) {
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            }
            
            // Si se cierra el modal, parar el timer
            if (!document.getElementById('callModal')) {
                clearInterval(timer);
            }
        }, 1000);
    }

    scheduleAppointment(doctorId) {
        const doctorData = {
            'dra-garcia': { name: 'Dra. María García', specialty: 'Cardiología' },
            'dr-martinez': { name: 'Dr. Carlos Martínez', specialty: 'Medicina General' },
            'dr-lopez': { name: 'Dr. Juan López', specialty: 'Oftalmología' },
            'dra-soto': { name: 'Dra. Ana Soto', specialty: 'Dermatología' }
        };
        
        const doctor = doctorData[doctorId] || doctorData['dra-garcia'];
        
        // Crear modal de cita
        const appointmentModal = document.createElement('div');
        appointmentModal.className = 'modal show';
        appointmentModal.id = 'appointmentModal';
        appointmentModal.innerHTML = `
            <div class="modal-content appointment-modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-calendar-plus"></i> Agendar Cita con ${doctor.name}</h2>
                    <button class="modal-close" onclick="closeAppointmentModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="appointment-info">
                        <p><strong>Especialidad:</strong> ${doctor.specialty}</p>
                        <p><strong>Duración estimada:</strong> 30 minutos</p>
                    </div>
                    <form class="appointment-form" id="appointmentForm">
                        <div class="form-group">
                            <label for="appointmentDate">Fecha:</label>
                            <input type="date" id="appointmentDate" required min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label for="appointmentTime">Hora:</label>
                            <select id="appointmentTime" required>
                                <option value="">Selecciona una hora</option>
                                <option value="09:00">09:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="14:00">02:00 PM</option>
                                <option value="15:00">03:00 PM</option>
                                <option value="16:00">04:00 PM</option>
                                <option value="17:00">05:00 PM</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="appointmentType">Tipo de consulta:</label>
                            <select id="appointmentType" required>
                                <option value="">Selecciona el tipo</option>
                                <option value="consulta">Consulta general</option>
                                <option value="seguimiento">Seguimiento</option>
                                <option value="emergencia">Urgencia</option>
                                <option value="revision">Revisión de resultados</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="appointmentNotes">Notas adicionales:</label>
                            <textarea id="appointmentNotes" rows="3" placeholder="Describe brevemente el motivo de la consulta..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeAppointmentModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="confirmAppointment()">Confirmar Cita</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(appointmentModal);
    }

    openAllChats() {
        this.showNotification('Chats', 'Abriendo todos los chats...', 'info');
        // Aquí se podría abrir una página dedicada a chats
    }

    // Funciones auxiliares para el chat
    attachFile() {
        this.showNotification('Adjuntar archivo', 'Función de adjuntar archivo en desarrollo');
    }

    sendImage() {
        this.showNotification('Enviar imagen', 'Función de enviar imagen en desarrollo');
    }

    sendLocation() {
        this.showNotification('Compartir ubicación', 'Función de compartir ubicación en desarrollo');
    }

    shareMedicalData(doctorId) {
        this.showNotification('Compartir datos', 'Compartiendo datos médicos con el doctor...');
        setTimeout(() => {
            this.showStaticNotification('Datos compartidos', 'Los datos médicos han sido compartidos exitosamente', 'success');
        }, 2000);
    }

    // Función para mostrar notificaciones estáticas
    showStaticNotification(title, message, type = 'info') {
        // Solo mostrar notificaciones importantes, no todas las acciones
        const importantNotifications = [
            'Cita confirmada',
            'Error',
            'Datos compartidos',
            'Llamada terminada'
        ];
        
        if (!importantNotifications.includes(title)) {
            return; // No mostrar notificaciones menores
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} notification-static`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <h4>${title}</h4>
                    <button class="notification-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <p>${message}</p>
            </div>
        `;
        
        document.getElementById('notificationContainer').appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-ocultar después de 5 segundos para notificaciones de éxito
        if (type === 'success') {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    // Función para mostrar notificaciones temporales (mantener compatibilidad)
    showNotification(title, message, type = 'info') {
        // Para notificaciones temporales, usar un toast simple
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Mostrar y ocultar automáticamente
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== FUNCIONES DE TELEMEDICINA =====
    setupTelemedicineFunctionality() {
        // Simular actualización de estado de consultas
        this.updateConsultationStatus();
        
        // Actualizar cada minuto
        setInterval(() => {
            this.updateConsultationStatus();
        }, 60000);

        // Configurar eventos de teclado para el chat de consulta
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.getElementById('consultationChatInput')) {
                sendConsultationMessage();
            }
        });
    }

    updateConsultationStatus() {
        const now = new Date();
        const consultationElements = document.querySelectorAll('.consultation-status');
        
        consultationElements.forEach(element => {
            // Simular diferentes estados de consulta
            const randomStatus = Math.random();
            if (randomStatus > 0.7) {
                element.textContent = 'En 30 min';
                element.className = 'consultation-status active';
            } else if (randomStatus > 0.4) {
                element.textContent = 'En 2 horas';
                element.className = 'consultation-status active';
            } else {
                element.textContent = 'Mañana';
                element.className = 'consultation-status';
            }
        });
    }

    // Funciones para telemedicina
    joinConsultation(doctorId) {
        const doctorNames = {
            'dra-garcia': 'Dra. María García',
            'dr-martinez': 'Dr. Carlos Martínez',
            'dr-lopez': 'Dr. Juan López',
            'dra-soto': 'Dra. Ana Soto'
        };
        
        const doctorName = doctorNames[doctorId] || 'Médico';
        
        // Verificar si ya hay una consulta activa
        if (document.getElementById('consultationModal')) {
            this.showNotification('Consulta activa', 'Ya tienes una consulta en progreso');
            return;
        }
        
        // Crear modal de consulta virtual
        const consultationModal = document.createElement('div');
        consultationModal.className = 'modal show';
        consultationModal.id = 'consultationModal';
        consultationModal.innerHTML = `
            <div class="modal-content consultation-modal-content">
                <div class="consultation-modal-header">
                    <div class="consultation-doctor-info">
                        <div class="consultation-doctor-avatar">
                            <img src="${this.getDoctorAvatar(doctorId)}" alt="${doctorName}" class="doctor-avatar-img">
                            <div class="online-status" title="En línea"></div>
                        </div>
                        <div class="consultation-doctor-details">
                            <h3>${doctorName}</h3>
                            <p>Consulta Virtual en Progreso</p>
                            <span class="consultation-timer" id="consultationTimer">00:00</span>
                        </div>
                    </div>
                    <div class="consultation-controls">
                        <button class="consultation-btn" onclick="toggleMicrophone()" id="microphoneBtn" title="Silenciar/Activar micrófono">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <button class="consultation-btn" onclick="toggleCamera()" id="cameraBtn" title="Activar/Desactivar cámara">
                            <i class="fas fa-video"></i>
                        </button>
                        <button class="consultation-btn" onclick="toggleScreenShare()" id="screenShareBtn" title="Compartir pantalla">
                            <i class="fas fa-desktop"></i>
                        </button>
                        <button class="consultation-btn" onclick="toggleChat()" id="chatToggleBtn" title="Mostrar/Ocultar chat">
                            <i class="fas fa-comments"></i>
                        </button>
                        <button class="consultation-btn consultation-end" onclick="endConsultation()" title="Terminar consulta">
                            <i class="fas fa-phone-slash"></i>
                        </button>
                    </div>
                </div>
                <div class="consultation-modal-body">
                    <div class="video-container">
                        <div class="main-video">
                            <div class="video-placeholder" id="mainVideoPlaceholder">
                                <i class="fas fa-user-md"></i>
                                <p>${doctorName}</p>
                                <div class="connection-status">
                                    <span class="status-dot online"></span>
                                    Conectando...
                                </div>
                            </div>
                        </div>
                        <div class="self-video">
                            <div class="video-placeholder small" id="selfVideoPlaceholder">
                                <i class="fas fa-user"></i>
                                <p>Tú</p>
                            </div>
                        </div>
                        <div class="video-overlay" id="videoOverlay" style="display: none;">
                            <div class="overlay-content">
                                <i class="fas fa-camera-slash"></i>
                                <p>Cámara desactivada</p>
                            </div>
                        </div>
                    </div>
                    <div class="consultation-chat" id="consultationChat">
                        <div class="chat-header">
                            <h4><i class="fas fa-comments"></i> Chat de Consulta</h4>
                            <button class="close-chat-btn" onclick="toggleChat()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="chat-messages" id="consultationChatMessages">
                            <div class="message received">
                                <div class="message-content">
                                    <p>Hola, ¿cómo te sientes hoy?</p>
                                    <span class="message-time">14:00</span>
                                </div>
                            </div>
                        </div>
                        <div class="chat-input-area">
                            <input type="text" placeholder="Escribe un mensaje..." class="chat-input" id="consultationChatInput" onkeypress="if(event.key==='Enter') sendConsultationMessage()">
                            <button class="send-btn" onclick="sendConsultationMessage()" title="Enviar mensaje">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(consultationModal);
        
        // Simular conexión
        setTimeout(() => {
            const placeholder = document.getElementById('mainVideoPlaceholder');
            if (placeholder) {
                placeholder.innerHTML = `
                    <i class="fas fa-user-md"></i>
                    <p>${doctorName}</p>
                    <div class="connection-status">
                        <span class="status-dot online"></span>
                        Conectado
                    </div>
                `;
            }
        }, 2000);
        
        // Iniciar timer de consulta
        this.startConsultationTimer();
        
        // Simular mensajes del médico
        this.simulateDoctorMessages(doctorName);
        
        this.showNotification('Consulta iniciada', `Conectando con ${doctorName}...`);
        
        // Simular notificaciones de estado
        setTimeout(() => {
            this.showNotification('Conexión establecida', 'La consulta virtual está lista');
        }, 2500);
    }

    startConsultationTimer() {
        let seconds = 0;
        const timerElement = document.getElementById('consultationTimer');
        
        const timer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            if (timerElement) {
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            }
            
            // Si se cierra el modal, parar el timer
            if (!document.getElementById('consultationModal')) {
                clearInterval(timer);
            }
        }, 1000);
    }

    simulateDoctorMessages(doctorName) {
        const messages = [
            "¿Has notado algún cambio en tus síntomas?",
            "Perfecto, eso es muy positivo.",
            "¿Puedes mostrarme el área que mencionaste?",
            "Excelente, veo una mejora significativa.",
            "¿Tienes alguna pregunta sobre tu tratamiento?",
            "Recuerda mantener tu rutina de medicación.",
            "Los resultados de tus análisis se ven muy bien.",
            "¿Hay algo más que quieras comentarme?",
            "Voy a revisar tu historial médico.",
            "¿Has tenido algún efecto secundario?",
            "Te voy a recetar una nueva medicación.",
            "¿Necesitas que te explique algo más?"
        ];
        
        let messageIndex = 0;
        const chatContainer = document.getElementById('consultationChatMessages');
        
        const messageInterval = setInterval(() => {
            if (!chatContainer) {
                clearInterval(messageInterval);
                return;
            }
            
            const message = messages[messageIndex % messages.length];
            const time = new Date().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const messageElement = document.createElement('div');
            messageElement.className = 'message received';
            messageElement.innerHTML = `
                <div class="message-content">
                    <p>${message}</p>
                    <span class="message-time">${time}</span>
                </div>
            `;
            
            chatContainer.appendChild(messageElement);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            // Mostrar notificación de nuevo mensaje
            this.showNotification('Nuevo mensaje', `${doctorName}: ${message.substring(0, 50)}...`);
            
            messageIndex++;
        }, 15000); // Mensaje cada 15 segundos
    }

    rescheduleConsultation(doctorId) {
        const doctorNames = {
            'dra-garcia': 'Dra. María García',
            'dr-martinez': 'Dr. Carlos Martínez',
            'dr-lopez': 'Dr. Juan López',
            'dra-soto': 'Dra. Ana Soto'
        };
        
        const doctorName = doctorNames[doctorId] || 'Médico';
        
        // Verificar si ya hay un modal abierto
        if (document.getElementById('rescheduleModal')) {
            return;
        }
        
        // Crear modal de reprogramación
        const rescheduleModal = document.createElement('div');
        rescheduleModal.className = 'modal show';
        rescheduleModal.id = 'rescheduleModal';
        rescheduleModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-calendar-alt"></i> Reprogramar Consulta</h2>
                    <button class="modal-close" onclick="closeRescheduleModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="doctor-info-reschedule">
                        <div class="doctor-avatar-reschedule">
                            <img src="${this.getDoctorAvatar(doctorId)}" alt="${doctorName}" class="doctor-avatar-img">
                        </div>
                        <div class="doctor-details-reschedule">
                            <h4>${doctorName}</h4>
                            <p>Consulta actual: Hoy, 14:00 - 14:30</p>
                        </div>
                    </div>
                    <form class="reschedule-form" id="rescheduleForm">
                        <div class="form-group">
                            <label for="newDate">Nueva fecha:</label>
                            <input type="date" id="newDate" required min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label for="newTime">Nueva hora:</label>
                            <select id="newTime" required>
                                <option value="">Selecciona una hora</option>
                                <option value="09:00">09:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="14:00">02:00 PM</option>
                                <option value="15:00">03:00 PM</option>
                                <option value="16:00">04:00 PM</option>
                                <option value="17:00">05:00 PM</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="rescheduleReason">Motivo (opcional):</label>
                            <textarea id="rescheduleReason" rows="3" placeholder="¿Por qué necesitas reprogramar?"></textarea>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="sendNotification" checked>
                                Enviar notificación al médico
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeRescheduleModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="confirmReschedule('${doctorId}')">
                        <i class="fas fa-calendar-check"></i>
                        Reprogramar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(rescheduleModal);
        
        // Enfocar en el primer campo
        setTimeout(() => {
            const dateInput = document.getElementById('newDate');
            if (dateInput) {
                dateInput.focus();
            }
        }, 100);
    }

    viewConsultationDetails(doctorId) {
        const doctorNames = {
            'dra-garcia': 'Dra. María García',
            'dr-martinez': 'Dr. Carlos Martínez',
            'dr-lopez': 'Dr. Juan López',
            'dra-soto': 'Dra. Ana Soto'
        };
        
        const doctorName = doctorNames[doctorId] || 'Médico';
        
        // Verificar si ya hay un modal abierto
        if (document.getElementById('detailsModal')) {
            return;
        }
        
        // Crear modal de detalles
        const detailsModal = document.createElement('div');
        detailsModal.className = 'modal show';
        detailsModal.id = 'detailsModal';
        detailsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-info-circle"></i> Detalles de Consulta</h2>
                    <button class="modal-close" onclick="closeDetailsModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="consultation-details-info">
                        <div class="detail-item">
                            <strong>Médico:</strong> ${doctorName}
                        </div>
                        <div class="detail-item">
                            <strong>Especialidad:</strong> Cardiología
                        </div>
                        <div class="detail-item">
                            <strong>Fecha:</strong> Hoy, 14:00 - 14:30
                        </div>
                        <div class="detail-item">
                            <strong>Duración:</strong> 30 minutos
                        </div>
                        <div class="detail-item">
                            <strong>Tipo:</strong> Consulta de seguimiento
                        </div>
                        <div class="detail-item">
                            <strong>Estado:</strong> <span class="status-active">Confirmada</span>
                        </div>
                        <div class="detail-item">
                            <strong>ID de Consulta:</strong> #CONS-${Date.now().toString().slice(-6)}
                        </div>
                    </div>
                    <div class="consultation-notes">
                        <h4>Notas de la consulta:</h4>
                        <p>Consulta de seguimiento para revisar la evolución del tratamiento cardiológico y ajustar medicación si es necesario.</p>
                        <div class="consultation-objectives">
                            <h5>Objetivos de la consulta:</h5>
                            <ul>
                                <li>Revisar evolución del tratamiento</li>
                                <li>Evaluar efectos secundarios</li>
                                <li>Ajustar medicación si es necesario</li>
                                <li>Programar próximos controles</li>
                            </ul>
                        </div>
                    </div>
                    <div class="consultation-actions-details">
                        <button class="btn btn-outline" onclick="downloadConsultationInfo('${doctorId}')">
                            <i class="fas fa-download"></i>
                            Descargar información
                        </button>
                        <button class="btn btn-outline" onclick="shareConsultationInfo('${doctorId}')">
                            <i class="fas fa-share"></i>
                            Compartir
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeDetailsModal()">Cerrar</button>
                    <button class="btn btn-primary" onclick="joinConsultation('${doctorId}')">
                        <i class="fas fa-video"></i>
                        Unirse ahora
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(detailsModal);
    }

    testFeature(feature) {
        const featureNames = {
            'screen-share': 'Compartir Pantalla',
            'chat': 'Chat en Vivo',
            'recording': 'Grabación',
            'files': 'Compartir Archivos'
        };
        
        const featureName = featureNames[feature] || 'Función';
        
        // Simular diferentes comportamientos según la función
        switch(feature) {
            case 'screen-share':
                this.showNotification('Compartir Pantalla', 'Iniciando compartición de pantalla...');
                setTimeout(() => {
                    this.showNotification('Pantalla compartida', 'Tu pantalla está siendo compartida con el médico');
                }, 1000);
                break;
                
            case 'chat':
                this.showNotification('Chat en Vivo', 'Chat de consulta disponible');
                break;
                
            case 'recording':
                this.showNotification('Grabación', 'Iniciando grabación de la consulta...');
                setTimeout(() => {
                    this.showNotification('Grabando', 'La consulta está siendo grabada');
                }, 1000);
                break;
                
            case 'files':
                this.showNotification('Compartir Archivos', 'Selecciona archivos para compartir');
                // Simular selector de archivos
                setTimeout(() => {
                    this.showNotification('Archivo compartido', 'Resultados_laboratorio.pdf enviado al médico');
                }, 2000);
                break;
                
            default:
                this.showNotification('Función', `${featureName} está funcionando correctamente`);
        }
        
        // Agregar efecto visual al botón
        const featureItem = event.currentTarget;
        featureItem.style.transform = 'scale(0.95)';
        setTimeout(() => {
            featureItem.style.transform = 'scale(1)';
        }, 150);
    }

    viewConsultationRecording(doctorId) {
        const doctorNames = {
            'dra-garcia': 'Dra. María García',
            'dr-martinez': 'Dr. Carlos Martínez',
            'dr-lopez': 'Dr. Juan López',
            'dra-soto': 'Dra. Ana Soto'
        };
        
        const doctorName = doctorNames[doctorId] || 'Médico';
        
        // Verificar si ya hay un modal abierto
        if (document.getElementById('recordingModal')) {
            return;
        }
        
        // Crear modal de grabación
        const recordingModal = document.createElement('div');
        recordingModal.className = 'modal show';
        recordingModal.id = 'recordingModal';
        recordingModal.innerHTML = `
            <div class="modal-content recording-modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-play"></i> Grabación de Consulta</h2>
                    <button class="modal-close" onclick="closeRecordingModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="recording-info">
                        <div class="recording-doctor-info">
                            <img src="${this.getDoctorAvatar(doctorId)}" alt="${doctorName}" class="doctor-avatar-img small">
                            <div>
                                <p><strong>Médico:</strong> ${doctorName}</p>
                                <p><strong>Fecha:</strong> Ayer, 15:30</p>
                                <p><strong>Duración:</strong> 25 minutos</p>
                                <p><strong>Tamaño:</strong> 45.2 MB</p>
                            </div>
                        </div>
                    </div>
                    <div class="video-player">
                        <div class="video-placeholder-large" id="recordingPlayer">
                            <i class="fas fa-play-circle" id="playButton"></i>
                            <p>Grabación de la consulta</p>
                            <span id="recordingTime">00:00 / 25:30</span>
                        </div>
                    </div>
                    <div class="recording-controls">
                        <button class="btn btn-secondary" onclick="skipBackward()" title="Retroceder 10s">
                            <i class="fas fa-step-backward"></i>
                        </button>
                        <button class="btn btn-primary" onclick="togglePlayPause()" id="playPauseBtn" title="Reproducir/Pausar">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn btn-secondary" onclick="skipForward()" title="Avanzar 10s">
                            <i class="fas fa-step-forward"></i>
                        </button>
                        <button class="btn btn-outline" onclick="downloadRecording()" title="Descargar grabación">
                            <i class="fas fa-download"></i>
                            Descargar
                        </button>
                        <button class="btn btn-outline" onclick="shareRecording()" title="Compartir grabación">
                            <i class="fas fa-share"></i>
                            Compartir
                        </button>
                    </div>
                    <div class="recording-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(recordingModal);
        
        // Configurar eventos del reproductor
        this.setupRecordingPlayer();
    }

    setupRecordingPlayer() {
        let isPlaying = false;
        let currentTime = 0;
        const totalTime = 1530; // 25:30 en segundos
        
        window.togglePlayPause = () => {
            const btn = document.getElementById('playPauseBtn');
            const icon = btn.querySelector('i');
            const player = document.getElementById('recordingPlayer');
            
            if (isPlaying) {
                icon.className = 'fas fa-play';
                isPlaying = false;
                this.showNotification('Reproducción pausada', 'Grabación en pausa');
            } else {
                icon.className = 'fas fa-pause';
                isPlaying = true;
                this.showNotification('Reproducción iniciada', 'Reproduciendo grabación');
                
                // Simular progreso de reproducción
                const progressInterval = setInterval(() => {
                    if (!isPlaying) {
                        clearInterval(progressInterval);
                        return;
                    }
                    
                    currentTime += 1;
                    if (currentTime >= totalTime) {
                        currentTime = totalTime;
                        isPlaying = false;
                        icon.className = 'fas fa-play';
                        clearInterval(progressInterval);
                    }
                    
                    // Actualizar tiempo y progreso
                    const minutes = Math.floor(currentTime / 60);
                    const seconds = currentTime % 60;
                    const progressPercent = (currentTime / totalTime) * 100;
                    
                    document.getElementById('recordingTime').textContent = 
                        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} / 25:30`;
                    document.getElementById('progressFill').style.width = `${progressPercent}%`;
                }, 1000);
            }
        };
        
        window.skipForward = () => {
            currentTime = Math.min(currentTime + 10, totalTime);
            const progressPercent = (currentTime / totalTime) * 100;
            document.getElementById('progressFill').style.width = `${progressPercent}%`;
            this.showNotification('Avanzado', 'Avanzado 10 segundos');
        };
        
        window.skipBackward = () => {
            currentTime = Math.max(currentTime - 10, 0);
            const progressPercent = (currentTime / totalTime) * 100;
            document.getElementById('progressFill').style.width = `${progressPercent}%`;
            this.showNotification('Retrocedido', 'Retrocedido 10 segundos');
        };
        
        window.downloadRecording = () => {
            this.showNotification('Descarga iniciada', 'Descargando grabación de la consulta...');
            setTimeout(() => {
                this.showNotification('Descarga completada', 'Grabación guardada en Descargas');
            }, 3000);
        };
        
        window.shareRecording = () => {
            this.showNotification('Compartir', 'Enviando enlace de la grabación...');
            setTimeout(() => {
                this.showNotification('Compartido', 'Enlace enviado por correo electrónico');
            }, 2000);
        };
    }

    openTelemedicineDashboard() {
        this.showNotification('Panel de Telemedicina', 'Abriendo panel completo de telemedicina...');
        
        // Simular apertura de dashboard completo
        setTimeout(() => {
            this.showNotification('Dashboard abierto', 'Panel de telemedicina cargado completamente');
        }, 1500);
    }

    // Funciones auxiliares
    getDoctorAvatar(doctorId) {
        const avatars = {
            'dra-garcia': 'https://api.dicebear.com/7.x/avataaars/svg?seed=mariaGarcia&backgroundColor=26a69a,4db6ac&mouth=smile&style=circle',
            'dr-martinez': 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlosMartinez&backgroundColor=1976d2,42a5f5&mouth=smile&style=circle',
            'dr-lopez': 'https://api.dicebear.com/7.x/avataaars/svg?seed=juanLopez&backgroundColor=ffa726,ffb74d&mouth=smile&style=circle',
            'dra-soto': 'https://api.dicebear.com/7.x/avataaars/svg?seed=anaSoto&backgroundColor=9c27b0,ba68c8&mouth=smile&style=circle'
        };
        return avatars[doctorId] || avatars['dra-garcia'];
    }

}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la aplicación
    window.mediTrackApp = new MediTrackApp();
    
    // Función global para abrir modales
    window.openModal = (modalId) => {
        window.meditrackApp.openModal(modalId);
    };
    
    // Función global para cerrar modales
    window.closeModal = (modalId) => {
        window.meditrackApp.closeModal(modalId);
    };
    
    console.log('MediTrack App inicializada correctamente');
});

// ===== FUNCIONES GLOBALES =====
function showNotification(title, message, type = 'info') {
    if (window.meditrackApp) {
        window.meditrackApp.showNotification(title, message, type);
    }
}

function openModal(modalId) {
    if (window.mediTrackApp) {
        window.mediTrackApp.openModal(modalId);
    }
}

function closeModal(modalId) {
    if (window.mediTrackApp) {
        window.mediTrackApp.closeModal(modalId);
    }
}

// ===== FUNCIONES GLOBALES PARA BOTONES =====

// Funciones para las tarjetas de acciones rápidas
function markMedicationTaken() {
    if (window.mediTrackApp) {
        window.mediTrackApp.markMedicationTaken();
    }
}

function addToCalendar() {
    if (window.mediTrackApp) {
        window.mediTrackApp.addToCalendar();
    }
}

function activateEmergency() {
    if (window.mediTrackApp) {
        window.mediTrackApp.activateEmergency();
    }
}

function navigateToPage(page) {
    if (window.mediTrackApp) {
        window.mediTrackApp.navigateToPage(page);
    }
}

// Funciones para consejos y curiosidades
function generateNewTip() {
    if (window.mediTrackApp) {
        window.mediTrackApp.generateNewTip();
    }
}

function showNewCuriosity() {
    if (window.mediTrackApp) {
        window.mediTrackApp.showNewCuriosity();
    }
}

function viewAllNotifications() {
    if (window.mediTrackApp) {
        window.mediTrackApp.viewAllNotifications();
    }
}

// Función para actualizar el dashboard
function refreshDashboard() {
    if (window.mediTrackApp) {
        window.mediTrackApp.initializePersonalizedDashboard();
        showNotification('Dashboard', 'Datos actualizados', 'success');
    }
}

// Función para exportar datos
function exportData() {
    if (window.mediTrackApp) {
        window.mediTrackApp.exportHealthData();
    }
}

// Función para sincronizar calendario
function syncCalendar() {
    if (window.mediTrackApp) {
        window.mediTrackApp.syncCalendar();
    }
}

// === GRÁFICOS PARA MODAL DE ESTADÍSTICAS DE SALUD ===
function renderStatsCharts() {
  // Gráfico de presión arterial
  if (window.Chart && document.getElementById('statsChartPresion')) {
    new Chart(document.getElementById('statsChartPresion').getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
          { label: 'Sistólica', data: [120, 125, 122, 118, 130, 125, 120], borderColor: '#26a69a', backgroundColor: 'rgba(38,166,154,0.08)', tension:0.3 },
          { label: 'Diastólica', data: [80, 82, 81, 78, 85, 82, 80], borderColor: '#1976d2', backgroundColor: 'rgba(25,118,210,0.08)', tension:0.3 }
        ]
      },
      options: {
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: false, min: 60, max: 150 } }
      }
    });
  }
  // Gráfico de pasos
  if (window.Chart && document.getElementById('statsChartPasos')) {
    new Chart(document.getElementById('statsChartPasos').getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
          { label: 'Pasos', data: [6000, 7000, 8000, 6500, 9000, 8500, 8000], backgroundColor: '#26a69a' }
        ]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
}
// Mostrar gráficos al abrir el modal de reportes
const originalOpenModal = window.openModal;
window.openModal = function(modalId) {
  originalOpenModal(modalId);
  if (modalId === 'modalReportes') {
    setTimeout(renderStatsCharts, 200);
  }
};

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia global de la aplicación
    window.mediTrackApp = new MediTrackApp();
    
    // Mostrar notificación de bienvenida
    setTimeout(() => {
        showNotification('Bienvenido', 'Dashboard personalizado cargado correctamente', 'success');
    }, 1000);
});

// === Al guardar una nueva medición, actualiza las alertas inteligentes ===
const originalGuardarMedicion = MediTrackApp.guardarMedicionLocalStorage;
MediTrackApp.guardarMedicionLocalStorage = function(medicion) {
  originalGuardarMedicion.call(this, medicion);
  this.renderSmartAlerts();
};

// Funciones globales para editar/eliminar eventos
window.editarEventoCalendario = function(id) {
    alert('Funcionalidad de edición próximamente. ID: ' + id);
};
window.eliminarEventoCalendario = function(id) {
    let eventos = JSON.parse(localStorage.getItem('eventosCalendario') || '[]');
    eventos = eventos.filter(ev => ev.id !== id);
    localStorage.setItem('eventosCalendario', JSON.stringify(eventos));
    // Refrescar modal
    if(window.mediTrackApp && window.mediTrackApp._lastCalendarDate) {
        window.mediTrackApp.showDayEventsModal(window.mediTrackApp._lastCalendarDate);
    } else {
        window.closeModal('modalEventosDia');
    }
};
// Guardar la última fecha seleccionada para refrescar modal tras eliminar
MediTrackApp.prototype.selectCalendarDay = function(date) {
    this._lastCalendarDate = date;
    this.showDayEventsModal(date);
};

// ===== EJEMPLOS DE CONDICIONES AVANZADAS DE ALERTA =====
// Agrega estas condiciones al array alertDefs dentro de renderSmartAlerts:
/*
{
  id: 'tendencia-presion-empeora',
  check: msArr => {
    const presiones = msArr.filter(m => m.tipo === 'presion').slice(-5);
    if (presiones.length < 5) return false;
    return presiones.every((m, i, arr) => i === 0 || Number(m.sistolica) > Number(arr[i-1].sistolica));
  },
  icon: 'fa-arrow-up',
  color: 'alert-high',
  title: 'Tendencia: Presión arterial en aumento',
  desc: 'Tus últimas 5 mediciones muestran un aumento progresivo. Consulta a tu médico.'
},
{
  id: 'tendencia-glucosa-mejora',
  check: msArr => {
    const glucosas = msArr.filter(m => m.tipo === 'glucosa').slice(-5);
    if (glucosas.length < 5) return false;
    return glucosas.every((m, i, arr) => i === 0 || Number(m.valor) < Number(arr[i-1].valor));
  },
  icon: 'fa-arrow-down',
  color: 'alert-good',
  title: '¡Mejora en glucosa!',
  desc: 'Tus últimos registros de glucosa muestran una tendencia positiva. ¡Sigue así!'
},
{
  id: 'alerta-multifactor',
  check: msArr => {
    const ultimaPresion = msArr.filter(m => m.tipo === 'presion').slice(-1)[0];
    const ultimaGlucosa = msArr.filter(m => m.tipo === 'glucosa').slice(-1)[0];
    return ultimaPresion && ultimaGlucosa && Number(ultimaPresion.sistolica) > 140 && Number(ultimaGlucosa.valor) > 180;
  },
  icon: 'fa-exclamation-circle',
  color: 'alert-high',
  title: 'Alerta combinada: presión y glucosa altas',
  desc: 'Tus últimos registros muestran presión y glucosa elevadas. Precaución.'
},
{
  id: 'habito-falta-registros',
  check: msArr => {
    const now = new Date();
    return !msArr.some(m => {
      const d = new Date(m.fecha);
      return (now - d) < 3 * 24 * 60 * 60 * 1000; // No hay registros en 3 días
    });
  },
  icon: 'fa-calendar-times',
  color: 'alert-info',
  title: 'Falta de registros recientes',
  desc: 'No has registrado mediciones en los últimos 3 días. ¡No olvides tu salud!'
},
{
  id: 'motivacion-logro',
  check: msArr => {
    const pasos = msArr.filter(m => m.tipo === 'pasos').reduce((acc, m) => acc + Number(m.valor), 0);
    return pasos >= 70000;
  },
  icon: 'fa-trophy',
  color: 'alert-good',
  title: '¡Meta de pasos semanal alcanzada!',
  desc: '¡Felicidades! Has superado los 70,000 pasos esta semana.'
},
// ... puedes seguir agregando más condiciones avanzadas ...
*/

// ===== FUNCIONES GLOBALES PARA EL CHAT =====
function closeChatHistory() {
    const modal = document.getElementById('chatHistoryModal');
    if (modal) {
        modal.remove();
    }
}

// Hacer las funciones globales
window.openChatHistory = function(doctorId) {
    if (window.dashboardApp) {
        window.dashboardApp.openChatHistory(doctorId);
    }
};

window.callDoctor = function(doctorId) {
    if (window.dashboardApp) {
        window.dashboardApp.callDoctor(doctorId);
    }
};

window.scheduleAppointment = function(doctorId) {
    if (window.dashboardApp) {
        window.dashboardApp.scheduleAppointment(doctorId);
    }
};

window.openAllChats = function() {
    if (window.dashboardApp) {
        window.dashboardApp.openAllChats();
    }
};

window.closeChatHistory = closeChatHistory;

// Funciones de llamada
function endCall() {
    const callModal = document.getElementById('callModal');
    if (callModal) {
        callModal.remove();
        if (window.dashboardApp) {
            window.dashboardApp.showStaticNotification('Llamada terminada', 'La llamada ha sido finalizada', 'info');
        }
    }
}

function toggleMute() {
    const muteBtn = document.querySelector('.call-mute');
    if (muteBtn) {
        const icon = muteBtn.querySelector('i');
        if (icon.classList.contains('fa-microphone')) {
            icon.className = 'fas fa-microphone-slash';
            muteBtn.style.background = '#ef4444';
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Micrófono', 'Micrófono silenciado');
            }
        } else {
            icon.className = 'fas fa-microphone';
            muteBtn.style.background = '#26a69a';
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Micrófono', 'Micrófono activado');
            }
        }
    }
}

function toggleSpeaker() {
    const speakerBtn = document.querySelector('.call-speaker');
    if (speakerBtn) {
        const icon = speakerBtn.querySelector('i');
        if (icon.classList.contains('fa-volume-up')) {
            icon.className = 'fas fa-volume-mute';
            speakerBtn.style.background = '#ef4444';
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Altavoz', 'Altavoz desactivado');
            }
        } else {
            icon.className = 'fas fa-volume-up';
            speakerBtn.style.background = '#26a69a';
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Altavoz', 'Altavoz activado');
            }
        }
    }
}

// Funciones de cita
function closeAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    if (modal) {
        modal.remove();
    }
}

function confirmAppointment() {
    const form = document.getElementById('appointmentForm');
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const type = document.getElementById('appointmentType').value;
    const notes = document.getElementById('appointmentNotes').value;

    if (!date || !time || !type) {
        if (window.dashboardApp) {
            window.dashboardApp.showStaticNotification('Error', 'Por favor completa todos los campos obligatorios', 'error');
        }
        return;
    }

    // Simular guardado de cita
    if (window.dashboardApp) {
        window.dashboardApp.showStaticNotification('Cita confirmada', 'Tu cita ha sido agendada exitosamente', 'success');
    }

    // Cerrar modal después de confirmar
    setTimeout(() => {
        closeAppointmentModal();
    }, 2000);
}

// Funciones auxiliares para el chat
function attachFile() {
    if (window.dashboardApp) {
        window.dashboardApp.showNotification('Adjuntar archivo', 'Función de adjuntar archivo en desarrollo');
    }
}

function sendImage() {
    if (window.dashboardApp) {
        window.dashboardApp.showNotification('Enviar imagen', 'Función de enviar imagen en desarrollo');
    }
}

function sendLocation() {
    if (window.dashboardApp) {
        window.dashboardApp.showNotification('Compartir ubicación', 'Función de compartir ubicación en desarrollo');
    }
}

// ===== FUNCIONES GLOBALES PARA TELEMEDICINA =====
function joinConsultation(doctorId) {
    if (window.dashboardApp) {
        window.dashboardApp.joinConsultation(doctorId);
    }
}

function rescheduleConsultation(doctorId) {
    if (window.dashboardApp) {
        window.dashboardApp.rescheduleConsultation(doctorId);
    }
}

function viewConsultationDetails(doctorId) {
    if (window.dashboardApp) {
        window.dashboardApp.viewConsultationDetails(doctorId);
    }
}

function testFeature(feature) {
    if (window.dashboardApp) {
        window.dashboardApp.testFeature(feature);
    }
}

function viewConsultationRecording(doctorId) {
    if (window.dashboardApp) {
        window.dashboardApp.viewConsultationRecording(doctorId);
    }
}

function openTelemedicineDashboard() {
    if (window.dashboardApp) {
        window.dashboardApp.openTelemedicineDashboard();
    }
}

// Funciones de control de consulta
function toggleMicrophone() {
    const btn = document.getElementById('microphoneBtn');
    if (btn) {
        const icon = btn.querySelector('i');
        if (icon.classList.contains('fa-microphone')) {
            icon.className = 'fas fa-microphone-slash';
            btn.style.background = '#ef4444';
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Micrófono', 'Micrófono silenciado');
            }
        } else {
            icon.className = 'fas fa-microphone';
            btn.style.background = '#26a69a';
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Micrófono', 'Micrófono activado');
            }
        }
    }
}

function toggleCamera() {
    const btn = document.getElementById('cameraBtn');
    const overlay = document.getElementById('videoOverlay');
    if (btn) {
        const icon = btn.querySelector('i');
        if (icon.classList.contains('fa-video')) {
            icon.className = 'fas fa-video-slash';
            btn.style.background = '#ef4444';
            if (overlay) {
                overlay.style.display = 'flex';
            }
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Cámara', 'Cámara desactivada');
            }
        } else {
            icon.className = 'fas fa-video';
            btn.style.background = '#26a69a';
            if (overlay) {
                overlay.style.display = 'none';
            }
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Cámara', 'Cámara activada');
            }
        }
    }
}

function toggleScreenShare() {
    const btn = document.getElementById('screenShareBtn');
    if (btn) {
        const icon = btn.querySelector('i');
        if (icon.classList.contains('fa-desktop')) {
            icon.className = 'fas fa-stop';
            btn.style.background = '#ef4444';
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Pantalla', 'Compartiendo pantalla');
            }
        } else {
            icon.className = 'fas fa-desktop';
            btn.style.background = '#26a69a';
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Pantalla', 'Dejó de compartir pantalla');
            }
        }
    }
}

function toggleChat() {
    const chatContainer = document.getElementById('consultationChat');
    if (chatContainer) {
        if (chatContainer.style.display === 'none') {
            chatContainer.style.display = 'flex';
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Chat', 'Chat mostrado');
            }
        } else {
            chatContainer.style.display = 'none';
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Chat', 'Chat oculto');
            }
        }
    }
}

function endConsultation() {
    const modal = document.getElementById('consultationModal');
    if (modal) {
        // Mostrar confirmación antes de terminar
        if (confirm('¿Estás seguro de que quieres terminar la consulta?')) {
            modal.remove();
            if (window.dashboardApp) {
                window.dashboardApp.showNotification('Consulta terminada', 'La consulta virtual ha finalizado');
            }
        }
    }
}

function sendConsultationMessage() {
    const input = document.getElementById('consultationChatInput');
    const chatContainer = document.getElementById('consultationChatMessages');
    
    if (!input || !chatContainer || !input.value.trim()) return;
    
    const message = input.value.trim();
    const time = new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message sent';
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
            <span class="message-time">${time}</span>
        </div>
    `;
    
    chatContainer.appendChild(messageElement);
    input.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Simular respuesta del médico después de un tiempo
    setTimeout(() => {
        const responses = [
            "Entiendo, gracias por la información.",
            "Perfecto, lo anoto en tu expediente.",
            "¿Puedes ser más específico?",
            "Eso es muy útil para el diagnóstico.",
            "Voy a revisar eso en tu historial.",
            "¿Has notado algún patrón?",
            "Excelente observación.",
            "¿Cuándo comenzó esto?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseTime = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const responseElement = document.createElement('div');
        responseElement.className = 'message received';
        responseElement.innerHTML = `
            <div class="message-content">
                <p>${randomResponse}</p>
                <span class="message-time">${responseTime}</span>
            </div>
        `;
        
        chatContainer.appendChild(responseElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        if (window.dashboardApp) {
            window.dashboardApp.showNotification('Nuevo mensaje', `Médico: ${randomResponse}`);
        }
    }, 2000 + Math.random() * 3000); // Respuesta entre 2-5 segundos
}

// Funciones de modales
function closeRescheduleModal() {
    const modal = document.getElementById('rescheduleModal');
    if (modal) {
        modal.remove();
    }
}

function confirmReschedule(doctorId) {
    const date = document.getElementById('newDate').value;
    const time = document.getElementById('newTime').value;
    const reason = document.getElementById('rescheduleReason').value;
    const sendNotification = document.getElementById('sendNotification').checked;
    
    if (!date || !time) {
        if (window.dashboardApp) {
            window.dashboardApp.showNotification('Error', 'Por favor completa todos los campos obligatorios');
        }
        return;
    }
    
    // Simular procesamiento
    if (window.dashboardApp) {
        window.dashboardApp.showNotification('Procesando', 'Reprogramando consulta...');
    }
    
    setTimeout(() => {
        if (window.dashboardApp) {
            window.dashboardApp.showNotification('Consulta reprogramada', 'Tu consulta ha sido reprogramada exitosamente');
            if (sendNotification) {
                window.dashboardApp.showNotification('Notificación enviada', 'El médico ha sido notificado');
            }
        }
        closeRescheduleModal();
    }, 2000);
}

function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.remove();
    }
}

function closeRecordingModal() {
    const modal = document.getElementById('recordingModal');
    if (modal) {
        modal.remove();
    }
}

// Funciones adicionales para detalles de consulta
function downloadConsultationInfo(doctorId) {
    if (window.dashboardApp) {
        window.dashboardApp.showNotification('Descarga iniciada', 'Descargando información de la consulta...');
        setTimeout(() => {
            window.dashboardApp.showNotification('Descarga completada', 'Información guardada como PDF');
        }, 3000);
    }
}

function shareConsultationInfo(doctorId) {
    if (window.dashboardApp) {
        window.dashboardApp.showNotification('Compartiendo', 'Enviando información de la consulta...');
        setTimeout(() => {
            window.dashboardApp.showNotification('Compartido', 'Información enviada por correo electrónico');
        }, 2000);
    }
}

// Hacer las funciones globales
window.joinConsultation = joinConsultation;
window.rescheduleConsultation = rescheduleConsultation;
window.viewConsultationDetails = viewConsultationDetails;
window.testFeature = testFeature;
window.viewConsultationRecording = viewConsultationRecording;
window.openTelemedicineDashboard = openTelemedicineDashboard;
window.toggleMicrophone = toggleMicrophone;
window.toggleCamera = toggleCamera;
window.toggleScreenShare = toggleScreenShare;
window.toggleChat = toggleChat;
window.endConsultation = endConsultation;
window.sendConsultationMessage = sendConsultationMessage;
window.closeRescheduleModal = closeRescheduleModal;
window.confirmReschedule = confirmReschedule;
window.closeDetailsModal = closeDetailsModal;
window.closeRecordingModal = closeRecordingModal;
window.downloadConsultationInfo = downloadConsultationInfo;
window.shareConsultationInfo = shareConsultationInfo;

// ===== FUNCIÓN DE LOGOUT =====
function logout() {
    // Limpiar datos de sesión
    localStorage.removeItem('userName');
    localStorage.removeItem('userData');
    
    // Redirigir al login
    window.location.href = 'index.html';
}

// Hacer la función global
window.logout = logout;

// Función para manejar el logout desde el sidebar
function handleLogout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        logout();
    }
}

// Hacer la función global
window.handleLogout = handleLogout;

// ===== FUNCIÓN GLOBAL PARA ACTUALIZAR SIDEBAR =====
function updateSidebarUserNameGlobal() {
    const userName = localStorage.getItem('userName');
    if (userName) {
        // Actualizar por ID
        const sidebarUserNameElement = document.getElementById('sidebarUserName');
        if (sidebarUserNameElement) {
            sidebarUserNameElement.textContent = userName;
        }
        
        // Actualizar por clase
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = userName;
        }
    }
}

// Hacer la función global
window.updateSidebarUserNameGlobal = updateSidebarUserNameGlobal;
