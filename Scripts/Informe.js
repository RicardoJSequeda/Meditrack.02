// Informe.js - Gestión avanzada del informe semanal

document.addEventListener('DOMContentLoaded', function() {
    // --- Inicialización del Sidebar ---
    loadSidebar();
    
    // Inicializar todos los gráficos
    // Inicializar todos los gráficos
    initAllCharts();
    
    // Configurar eventos
    setupEventListeners();
    
    // Cargar datos del informe
    loadReportData();
    
    // Inicializar análisis avanzado
    initAdvancedAnalytics();
    
    // Configurar modales
    setupModals();
});

/**
 * Inicializa todos los gráficos del informe
 */
function initAllCharts() {
    // Gráfico de adherencia principal
    initAdherenceChart();
    
    // Gráfico de medicamentos
    initMedicationChart();
    
    // Gráfico de signos vitales
    initVitalsChart();
    
    // Gráfico de actividad física
    initActivityChart();
    
    // Gráficos de análisis avanzado
    initTrendChart();
    initPredictionChart();
    
    // Gráficos comparativos
    initComparisonCharts();
}

/**
 * Inicializa el gráfico de adherencia
 */
function initAdherenceChart() {
    const ctx = document.getElementById('adherenceChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Adherencia (%)',
                data: [85, 90, 95, 100, 90, 85, 100],
                backgroundColor: 'rgba(38, 166, 154, 0.1)',
                borderColor: '#26a69a',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '% de dosis tomadas';
                        }
                    }
                }
            }
        }
    });

    ctx._chart = chart;
}

/**
 * Inicializa el gráfico de medicamentos
 */
function initMedicationChart() {
    const ctx = document.getElementById('medicationChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Metformina', 'Losartán', 'Omeprazol', 'Vitamina D'],
            datasets: [{
                data: [28, 21, 14, 7],
                backgroundColor: [
                    '#26a69a',
                    '#80cbc4',
                    '#b2dfdb',
                    '#e0f2f1'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw + ' dosis';
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
    
    ctx._chart = chart;
}

/**
 * Inicializa el gráfico de signos vitales
 */
function initVitalsChart() {
    const ctx = document.getElementById('vitalsChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Presión Sistólica',
                data: [125, 128, 122, 126, 130, 124, 126],
                borderColor: '#26a69a',
                backgroundColor: 'rgba(38, 166, 154, 0.1)',
                tension: 0.4
            }, {
                label: 'Presión Diastólica',
                data: [82, 85, 80, 82, 88, 81, 82],
                borderColor: '#80cbc4',
                backgroundColor: 'rgba(128, 203, 196, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 70,
                    max: 140
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
    
    ctx._chart = chart;
}

/**
 * Inicializa el gráfico de actividad física
 */
function initActivityChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Pasos',
                data: [8500, 10200, 7800, 9500, 6800, 12000, 8900],
                backgroundColor: 'rgba(38, 166, 154, 0.8)',
                borderColor: '#26a69a',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 15000,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    ctx._chart = chart;
}

/**
 * Inicializa el gráfico de tendencias
 */
function initTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            datasets: [{
                label: 'Adherencia',
                data: [85, 88, 92, 95],
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4
            }, {
                label: 'Actividad',
                data: [70, 65, 60, 55],
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    ctx._chart = chart;
}

/**
 * Inicializa el gráfico predictivo
 */
function initPredictionChart() {
    const ctx = document.getElementById('predictionChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Salud General', 'Adherencia', 'Actividad', 'Nutrición', 'Sueño', 'Estrés'],
            datasets: [{
                label: 'Actual',
                data: [75, 92, 60, 80, 70, 65],
                borderColor: '#26a69a',
                backgroundColor: 'rgba(38, 166, 154, 0.2)',
                pointBackgroundColor: '#26a69a'
            }, {
                label: 'Predicción',
                data: [80, 95, 75, 85, 75, 70],
                borderColor: '#ff9800',
                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                pointBackgroundColor: '#ff9800'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    ctx._chart = chart;
}

/**
 * Inicializa los gráficos comparativos
 */
function initComparisonCharts() {
    // Gráfico de comparación de adherencia
    const adherenceCtx = document.getElementById('adherenceComparisonChart');
    if (adherenceCtx) {
        new Chart(adherenceCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Actual', 'Anterior'],
                datasets: [{
                    label: 'Adherencia (%)',
                    data: [92, 89],
                    backgroundColor: ['#26a69a', '#80cbc4']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Gráfico de comparación de actividad
    const activityCtx = document.getElementById('activityComparisonChart');
    if (activityCtx) {
        new Chart(activityCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Actual', 'Anterior'],
                datasets: [{
                    label: 'Horas de actividad',
                    data: [3.2, 4.1],
                    backgroundColor: ['#26a69a', '#80cbc4']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Gráfico de comparación de presión
    const pressureCtx = document.getElementById('pressureComparisonChart');
    if (pressureCtx) {
        new Chart(pressureCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Actual',
                    data: [126, 128, 122, 126, 130, 124, 126],
                    borderColor: '#26a69a',
                    tension: 0.4
                }, {
                    label: 'Anterior',
                    data: [128, 130, 125, 128, 132, 126, 128],
                    borderColor: '#80cbc4',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }
}

/**
 * Inicializa el análisis avanzado
 */
function initAdvancedAnalytics() {
    // Animar métricas de tendencias
    animateTrendMetrics();
    
    // Actualizar indicadores de riesgo
    updateRiskIndicators();
    
    // Configurar análisis predictivo
    setupPredictiveAnalysis();
}

/**
 * Anima las métricas de tendencias
 */
function animateTrendMetrics() {
    const trendItems = document.querySelectorAll('.trend-item');
    trendItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 100);
        }, index * 200);
    });
}

/**
 * Actualiza los indicadores de riesgo
 */
function updateRiskIndicators() {
    const riskItems = document.querySelectorAll('.risk-item');
    riskItems.forEach((item, index) => {
        setTimeout(() => {
            const riskValue = item.querySelector('.risk-value');
            const value = parseInt(riskValue.textContent);
            
            // Simular animación de contador
            animateCounter(riskValue, 0, value, 1000);
        }, index * 300);
    });
}

/**
 * Configura el análisis predictivo
 */
function setupPredictiveAnalysis() {
    const predictionItems = document.querySelectorAll('.prediction-item');
    predictionItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            item.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 100);
        }, index * 200);
    });
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Navegación entre semanas
    document.getElementById('prev-week')?.addEventListener('click', loadPreviousWeek);
    document.getElementById('next-week')?.addEventListener('click', loadNextWeek);
    
    // Botones de vista de gráficos
    document.querySelectorAll('.chart-action-button').forEach(button => {
        button.addEventListener('click', function() {
            switchChartView(this);
        });
    });
    
    // Botones de análisis avanzado
    document.getElementById('customize-analysis')?.addEventListener('click', () => {
        document.getElementById('customize-analysis-modal').style.display = 'flex';
    });
    
    document.getElementById('export-analytics')?.addEventListener('click', () => {
        document.getElementById('export-analytics-modal').style.display = 'flex';
    });
    
    // Botones de eventos
    document.getElementById('add-health-event')?.addEventListener('click', () => {
        document.getElementById('health-event-modal').style.display = 'flex';
    });
    
    document.getElementById('filter-events')?.addEventListener('click', () => {
        document.getElementById('filter-events-modal').style.display = 'flex';
    });
    
    document.getElementById('export-events')?.addEventListener('click', exportEvents);
    
    // Botones de recomendaciones
    document.getElementById('refresh-recommendations')?.addEventListener('click', refreshRecommendations);
    document.getElementById('customize-recommendations')?.addEventListener('click', customizeRecommendations);
    
    // Botones de acciones del informe
    document.getElementById('generate-report')?.addEventListener('click', generateFullReport);
    document.getElementById('generate-summary-report')?.addEventListener('click', generateSummaryReport);
    document.getElementById('download-pdf')?.addEventListener('click', downloadPDF);
    document.getElementById('download-excel')?.addEventListener('click', downloadExcel);
    document.getElementById('print-report')?.addEventListener('click', printReport);
    document.getElementById('share-with-doctor')?.addEventListener('click', () => {
        document.getElementById('share-doctor-modal').style.display = 'flex';
    });
    document.getElementById('share-with-family')?.addEventListener('click', shareWithFamily);
    document.getElementById('schedule-sharing')?.addEventListener('click', () => {
        document.getElementById('schedule-sharing-modal').style.display = 'flex';
    });
    
    // Botones de comparación
    document.getElementById('comparison-period')?.addEventListener('change', updateComparison);
    document.getElementById('export-comparison')?.addEventListener('click', exportComparison);
    
    // Botones de recomendaciones
    document.querySelectorAll('.recommendation-card .primary-button').forEach(button => {
        button.addEventListener('click', function() {
            applyRecommendation(this);
        });
    });
    
    // Acciones de eventos
    document.querySelectorAll('.event-actions .icon-button').forEach(button => {
        button.addEventListener('click', function() {
            handleEventAction(this);
        });
    });
}

/**
 * Configura los modales
 */
function setupModals() {
    // Cerrar modales
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Cerrar modal al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    // Formularios
    document.getElementById('health-event-form')?.addEventListener('submit', saveHealthEvent);
    document.getElementById('customize-analysis-form')?.addEventListener('submit', saveAnalysisCustomization);
    document.getElementById('export-analytics-form')?.addEventListener('submit', exportAnalytics);
    document.getElementById('share-doctor-form')?.addEventListener('submit', shareWithDoctor);
    document.getElementById('schedule-sharing-form')?.addEventListener('submit', scheduleSharing);
    document.getElementById('filter-events-form')?.addEventListener('submit', applyEventFilters);
}

/**
 * Carga los datos del informe
 */
function loadReportData() {
    showLoading();
    
    // Simular carga de datos
    setTimeout(() => {
        updateMetrics();
        hideLoading();
        showNotification('success', 'Informe actualizado correctamente');
    }, 1500);
}

/**
 * Actualiza las métricas del informe
 */
function updateMetrics() {
    // Actualizar porcentajes con animación
    const percentages = document.querySelectorAll('.percentage');
    percentages.forEach(element => {
        const targetValue = parseInt(element.textContent);
        animateCounter(element, 0, targetValue, 1000);
    });
    
    // Actualizar barras de progreso
    const progressBars = document.querySelectorAll('.progress');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
}

/**
 * Anima un contador
 */
function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    const startValue = start;
    const change = end - start;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(startValue + (change * progress));
        element.textContent = currentValue + (element.textContent.includes('%') ? '%' : '');
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/**
 * Carga la semana anterior
 */
function loadPreviousWeek() {
    showLoading();
    setTimeout(() => {
        updateWeekDisplay('Semana del 5 al 11 de Junio 2023');
        hideLoading();
        showNotification('info', 'Cargando semana anterior...');
    }, 800);
}

/**
 * Carga la semana siguiente
 */
function loadNextWeek() {
    showLoading();
    setTimeout(() => {
        updateWeekDisplay('Semana del 19 al 25 de Junio 2023');
        hideLoading();
        showNotification('info', 'Cargando semana siguiente...');
    }, 800);
}

/**
 * Actualiza el display de la semana
 */
function updateWeekDisplay(weekText) {
    const element = document.querySelector('.current-period');
    if (element) {
        element.textContent = weekText;
    }
}

/**
 * Cambia la vista de los gráficos
 */
function switchChartView(button) {
    // Remover clase active de todos los botones del grupo
    const buttonGroup = button.closest('.chart-actions');
    buttonGroup.querySelectorAll('.chart-action-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Agregar clase active al botón clickeado
    button.classList.add('active');
    
    // Actualizar gráfico según la vista seleccionada
    const chartContainer = button.closest('.chart-container');
    const chartId = chartContainer.querySelector('canvas').id;
    const view = button.dataset.view || button.dataset.period || button.dataset.vital || button.dataset.activity;
    
    updateChartData(chartId, view);
}

/**
 * Actualiza los datos del gráfico
 */
function updateChartData(chartId, view) {
    const canvas = document.getElementById(chartId);
    if (!canvas || !canvas._chart) return;
    
    const chart = canvas._chart;
    
    // Simular actualización de datos
    showLoading();
    setTimeout(() => {
        // Aquí se actualizarían los datos reales según la vista
        console.log(`Actualizando gráfico ${chartId} con vista: ${view}`);
        hideLoading();
    }, 500);
}

/**
 * Guarda un evento de salud
 */
function saveHealthEvent(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const eventData = {
        type: formData.get('event-type'),
        date: formData.get('event-date'),
        time: formData.get('event-time'),
        title: formData.get('event-title'),
        description: formData.get('event-description'),
        priority: formData.get('event-priority')
    };
    
    // Simular guardado
    showLoading();
    setTimeout(() => {
        addNewEventToTimeline(eventData);
        document.getElementById('health-event-modal').style.display = 'none';
        e.target.reset();
        hideLoading();
        showNotification('success', 'Evento guardado correctamente');
    }, 1000);
}

/**
 * Agrega un nuevo evento a la línea de tiempo
 */
function addNewEventToTimeline(eventData) {
    const timeline = document.querySelector('.events-timeline');
    if (!timeline) return;
    
    const eventElement = document.createElement('div');
    eventElement.className = 'timeline-item';
    eventElement.innerHTML = `
        <div class="timeline-date">
            <span class="day">${new Date(eventData.date).getDate()}</span>
            <span class="month">${new Date(eventData.date).toLocaleDateString('es', { month: 'short' })}</span>
        </div>
        <div class="timeline-content">
            <h3>${eventData.title}</h3>
            <p class="event-description">${eventData.description}</p>
            <div class="event-meta">
                <span class="event-type"><i class="fas fa-calendar-alt"></i> ${eventData.type}</span>
                <span class="event-time"><i class="fas fa-clock"></i> ${eventData.time || 'Sin hora'}</span>
                <span class="event-priority ${eventData.priority}"><i class="fas fa-exclamation"></i> ${eventData.priority} prioridad</span>
            </div>
            <div class="event-actions">
                <button class="icon-button" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="icon-button" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-button" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    // Agregar al inicio de la línea de tiempo
    timeline.insertBefore(eventElement, timeline.firstChild);
    
    // Animar entrada
    eventElement.style.opacity = '0';
    eventElement.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        eventElement.style.transition = 'all 0.5s ease';
        eventElement.style.opacity = '1';
        eventElement.style.transform = 'translateY(0)';
    }, 100);
}

/**
 * Aplica una recomendación
 */
function applyRecommendation(button) {
    const card = button.closest('.recommendation-card');
    const title = card.querySelector('h3').textContent;
    
    showLoading();
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-check"></i> Aplicado';
        button.disabled = true;
        button.style.background = '#4caf50';
        hideLoading();
        showNotification('success', `Recomendación "${title}" aplicada`);
    }, 1000);
}

/**
 * Genera informe completo
 */
function generateFullReport() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showNotification('success', 'Informe completo generado. Descargando...');
        // Aquí se generaría y descargaría el informe completo
    }, 2000);
}

/**
 * Genera resumen ejecutivo
 */
function generateSummaryReport() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showNotification('success', 'Resumen ejecutivo generado');
    }, 1500);
}

/**
 * Descarga PDF
 */
function downloadPDF() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showNotification('success', 'PDF descargado correctamente');
    }, 1500);
}

/**
 * Descarga Excel
 */
function downloadExcel() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showNotification('success', 'Archivo Excel descargado');
    }, 1500);
}

/**
 * Imprime el informe
 */
function printReport() {
    window.print();
    showNotification('info', 'Preparando para impresión...');
}

/**
 * Comparte con médico
 */
function shareWithDoctor() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showNotification('success', 'Informe compartido con el médico');
    }, 1500);
}

/**
 * Comparte con familia
 */
function shareWithFamily() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showNotification('success', 'Informe compartido con la familia');
    }, 1500);
}

/**
 * Actualiza comparación
 */
function updateComparison() {
    const period = document.getElementById('comparison-period').value;
    showLoading();
    setTimeout(() => {
        hideLoading();
        showNotification('info', `Comparación actualizada: ${period}`);
    }, 1000);
}

/**
 * Exporta comparación
 */
function exportComparison() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showNotification('success', 'Comparación exportada');
    }, 1500);
}

/**
 * Exporta eventos
 */
function exportEvents() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showNotification('success', 'Eventos exportados a CSV');
    }, 1500);
}

/**
 * Refresca recomendaciones
 */
function refreshRecommendations() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showNotification('success', 'Recomendaciones actualizadas');
    }, 1500);
}

/**
 * Personaliza recomendaciones
 */
function customizeRecommendations() {
    showNotification('info', 'Funcionalidad de personalización en desarrollo');
}

/**
 * Maneja acciones de eventos
 */
function handleEventAction(button) {
    const action = button.title.toLowerCase();
    const eventTitle = button.closest('.timeline-content').querySelector('h3').textContent;
    
    switch(action) {
        case 'ver detalles':
            showNotification('info', `Viendo detalles de: ${eventTitle}`);
            break;
        case 'editar':
            showNotification('info', `Editando: ${eventTitle}`);
            break;
        case 'eliminar':
            if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
                button.closest('.timeline-item').remove();
                showNotification('success', 'Evento eliminado');
            }
            break;
        case 'compartir':
            showNotification('info', `Compartiendo: ${eventTitle}`);
            break;
    }
}

/**
 * Guarda personalización de análisis
 */
function saveAnalysisCustomization(e) {
    e.preventDefault();
    document.getElementById('customize-analysis-modal').style.display = 'none';
    showNotification('success', 'Configuración guardada');
}

/**
 * Exporta análisis
 */
function exportAnalytics(e) {
    e.preventDefault();
    const format = document.getElementById('export-format').value;
    document.getElementById('export-analytics-modal').style.display = 'none';
    showNotification('success', `Análisis exportado en formato ${format.toUpperCase()}`);
}

/**
 * Comparte con médico
 */
function shareWithDoctor(e) {
    e.preventDefault();
    document.getElementById('share-doctor-modal').style.display = 'none';
    showNotification('success', 'Informe enviado al médico');
}

/**
 * Programa envío
 */
function scheduleSharing(e) {
    e.preventDefault();
    document.getElementById('schedule-sharing-modal').style.display = 'none';
    showNotification('success', 'Envío programado correctamente');
}

/**
 * Aplica filtros de eventos
 */
function applyEventFilters(e) {
    e.preventDefault();
    document.getElementById('filter-events-modal').style.display = 'none';
    showNotification('success', 'Filtros aplicados');
}

/**
 * Muestra loading
 */
function showLoading() {
    // Crear overlay de loading si no existe
    if (!document.getElementById('loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando...</p>
            </div>
        `;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        overlay.querySelector('.loading-spinner').style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        document.body.appendChild(overlay);
    }
}

/**
 * Oculta loading
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Muestra notificación
 */
function showNotification(type, message) {
    let container = document.querySelector('.notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close" aria-label="Cerrar notificación">&times;</button>
    `;
    container.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    // Cierre manual
    notification.querySelector('.notification-close').onclick = () => closeNotification(notification);
    // Cierre automático
    setTimeout(() => closeNotification(notification), 4000);
}

function closeNotification(notification) {
    notification.style.animation = 'notificationSlideOut 0.4s forwards';
    setTimeout(() => {
        if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, 400);
}

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
    const currentPage = window.location.pathname.split('/').pop() || 'InformeSemanal.html';
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

// --- GESTIÓN DINÁMICA DE EVENTOS DE SALUD ---
const EVENTS_KEY = 'healthEvents';
const eventsTimeline = document.getElementById('events-timeline');
const addEventBtn = document.getElementById('add-health-event');
const eventModal = document.getElementById('add-event-modal') || document.getElementById('event-modal');
let editingEventId = null;

// Ejemplo de eventos iniciales
const exampleEvents = [
  {
    id: generateId(),
    date: '2023-06-15',
    title: 'Cita con Cardiólogo',
    description: 'Revisión de tratamiento. Ajuste de medicación.',
    type: 'appointment',
    icon: 'calendar-alt',
    time: '10:30 AM',
    priority: 'high',
  },
  {
    id: generateId(),
    date: '2023-06-13',
    title: 'Análisis de sangre',
    description: 'Resultados dentro de parámetros normales.',
    type: 'test',
    icon: 'flask',
    time: '9:00 AM',
    priority: 'medium',
  },
  {
    id: generateId(),
    date: '2023-06-12',
    title: 'Nota personal',
    description: 'Me siento más cansada de lo habitual hoy.',
    type: 'note',
    icon: 'sticky-note',
    time: '8:45 PM',
    priority: 'low',
  },
];

function generateId() {
  return 'evt-' + Math.random().toString(36).substr(2, 9);
}

function getEvents() {
  const data = localStorage.getItem(EVENTS_KEY);
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
}

function saveEvents(events) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

function getActiveFilters() {
  const saved = localStorage.getItem(FILTERS_KEY);
  if (!saved) return null;
  try { return JSON.parse(saved); } catch { return null; }
}

function eventMatchesFilters(event, filters) {
  if (!filters) return true;
  if (filters.type && event.type !== filters.type) return false;
  if (filters.priority && event.priority !== filters.priority) return false;
  if (filters.start && event.date < filters.start) return false;
  if (filters.end && event.date > filters.end) return false;
  return true;
}

function renderEvents() {
  let events = getEvents();
  if (!events || !Array.isArray(events) || events.length === 0) {
    events = exampleEvents;
    saveEvents(events);
  }
  const filters = getActiveFilters();
  const filtered = filters ? events.filter(ev => eventMatchesFilters(ev, filters)) : events;
  eventsTimeline.innerHTML = '';
  if (filtered.length === 0) {
    eventsTimeline.innerHTML = '<div class="empty-state">No hay eventos que coincidan con los filtros seleccionados.</div>';
    showNotification('info', 'No hay eventos que coincidan con los filtros.');
    return;
  }
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const event of filtered) {
    const dateObj = new Date(event.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('es-ES', { month: 'short' });
    const priorityClass = event.priority || 'low';
    eventsTimeline.innerHTML += `
      <div class="timeline-item">
        <div class="timeline-date">
          <span class="day">${day}</span>
          <span class="month">${month.charAt(0).toUpperCase() + month.slice(1)}</span>
        </div>
        <div class="timeline-content">
          <h3>${event.title}</h3>
          <p class="event-description">${event.description}</p>
          <div class="event-meta">
            <span class="event-type"><i class="fas fa-${event.icon}"></i> ${getEventTypeLabel(event.type)}</span>
            <span class="event-time"><i class="fas fa-clock"></i> ${event.time || ''}</span>
            <span class="event-priority ${priorityClass}"><i class="fas fa-${getPriorityIcon(priorityClass)}"></i> ${getPriorityLabel(priorityClass)}</span>
          </div>
          <div class="event-actions">
            <button class="icon-button" title="Ver detalles" onclick="showEventDetails('${event.id}')"><i class="fas fa-eye"></i></button>
            <button class="icon-button" title="Editar" onclick="editEvent('${event.id}')"><i class="fas fa-edit"></i></button>
            <button class="icon-button" title="Eliminar" onclick="deleteEvent('${event.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  }
}

function getEventTypeLabel(type) {
  switch(type) {
    case 'appointment': return 'Cita médica';
    case 'test': return 'Prueba médica';
    case 'note': return 'Nota';
    case 'medication': return 'Medicación';
    case 'symptom': return 'Síntoma';
    default: return 'Evento';
  }
}
function getPriorityLabel(priority) {
  switch(priority) {
    case 'high': return 'Alta prioridad';
    case 'medium': return 'Media prioridad';
    default: return 'Baja prioridad';
  }
}
function getPriorityIcon(priority) {
  switch(priority) {
    case 'high': return 'exclamation';
    case 'medium': return 'info';
    default: return 'check';
  }
}

// --- MODAL DE EVENTO ---
addEventBtn.onclick = () => openEventModal();

function openEventModal(event = null) {
  editingEventId = event ? event.id : null;
  const modal = document.getElementById('add-event-modal');
  document.getElementById('modal-event-title').textContent = event ? 'Editar Evento' : 'Añadir Evento';
  modal.querySelector('#event-title').value = event ? event.title : '';
  modal.querySelector('#event-description').value = event ? event.description : '';
  modal.querySelector('#event-type').value = event ? event.type || 'note' : 'note';
  modal.querySelector('#event-priority').value = event ? event.priority || 'low' : 'low';
  modal.querySelector('#event-date').value = event ? (event.date || '') : '';
  modal.querySelector('#event-time').value = event ? (event.time || '') : '';
  document.getElementById('event-form-error').style.display = 'none';
  modal.classList.add('show');
  setTimeout(() => modal.querySelector('#event-title').focus(), 100);
}

// Cerrar modal con botón, fondo o Escape
Array.from(document.querySelectorAll('.close-modal-btn, #add-event-modal .close-modal')).forEach(btn => {
  btn.onclick = () => document.getElementById('add-event-modal').classList.remove('show');
});
document.getElementById('add-event-modal').addEventListener('click', function(e) {
  if (e.target === this) this.classList.remove('show');
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') document.getElementById('add-event-modal').classList.remove('show');
});

// Guardar evento (nuevo o editado)
document.getElementById('add-event-form').onsubmit = function(e) {
  e.preventDefault();
  const title = this.querySelector('#event-title').value.trim();
  const description = this.querySelector('#event-description').value.trim();
  const type = this.querySelector('#event-type').value;
  const priority = this.querySelector('#event-priority').value;
  const date = this.querySelector('#event-date').value;
  const time = this.querySelector('#event-time').value;
  const errorDiv = document.getElementById('event-form-error');
  // Validación avanzada
  if (!title) {
    errorDiv.textContent = 'El título es obligatorio';
    errorDiv.style.display = 'block';
    this.querySelector('#event-title').focus();
    showNotification('error', 'El título es obligatorio');
    return;
  }
  if (title.length < 3) {
    errorDiv.textContent = 'El título debe tener al menos 3 caracteres';
    errorDiv.style.display = 'block';
    this.querySelector('#event-title').focus();
    showNotification('error', 'El título debe tener al menos 3 caracteres');
    return;
  }
  if (description && description.length < 5) {
    errorDiv.textContent = 'La descripción debe tener al menos 5 caracteres';
    errorDiv.style.display = 'block';
    this.querySelector('#event-description').focus();
    showNotification('error', 'La descripción debe tener al menos 5 caracteres');
    return;
  }
  if (!date) {
    errorDiv.textContent = 'La fecha es obligatoria';
    errorDiv.style.display = 'block';
    this.querySelector('#event-date').focus();
    showNotification('error', 'La fecha es obligatoria');
    return;
  }
  const today = new Date();
  const eventDate = new Date(date);
  if (eventDate > today) {
    errorDiv.textContent = 'La fecha no puede ser futura';
    errorDiv.style.display = 'block';
    this.querySelector('#event-date').focus();
    showNotification('error', 'La fecha no puede ser futura');
    return;
  }
  if ((type === 'appointment' || type === 'test') && !time) {
    errorDiv.textContent = 'La hora es obligatoria para este tipo de evento';
    errorDiv.style.display = 'block';
    this.querySelector('#event-time').focus();
    showNotification('error', 'La hora es obligatoria para este tipo de evento');
    return;
  }
  errorDiv.style.display = 'none';
  let events = getEvents() || [];
  if (editingEventId) {
    // Editar
    events = events.map(ev => ev.id === editingEventId ? { ...ev, title, description, type, priority, date, time, icon: getEventIcon(type) } : ev);
    showNotification('success', 'Evento actualizado');
  } else {
    // Nuevo
    const newEvent = {
      id: generateId(),
      title, description, type, priority, date, time,
      icon: getEventIcon(type)
    };
    events.push(newEvent);
    showNotification('success', 'Evento agregado');
  }
  saveEvents(events);
  renderEvents();
  document.getElementById('add-event-modal').classList.remove('show');
};

function getEventIcon(type) {
  switch(type) {
    case 'appointment': return 'calendar-alt';
    case 'test': return 'flask';
    case 'note': return 'sticky-note';
    case 'medication': return 'pills';
    case 'symptom': return 'heartbeat';
    default: return 'calendar';
  }
}

// Editar evento
window.editEvent = function(id) {
  const events = getEvents() || [];
  const event = events.find(ev => ev.id === id);
  if (event) openEventModal(event);
};

// Eliminar evento
window.deleteEvent = function(id) {
  if (!confirm('¿Seguro que deseas eliminar este evento?')) return;
  let events = getEvents() || [];
  events = events.filter(ev => ev.id !== id);
  saveEvents(events);
  renderEvents();
  showNotification('success', 'Evento eliminado');
};

// Ver detalles (puedes mejorar este modal)
window.showEventDetails = function(id) {
  const events = getEvents() || [];
  const event = events.find(ev => ev.id === id);
  if (event) {
    document.getElementById('details-event-title').textContent = event.title;
    document.getElementById('details-event-description').textContent = event.description;
    document.getElementById('details-event-type').textContent = getEventTypeLabel(event.type);
    document.getElementById('details-event-priority').textContent = getPriorityLabel(event.priority);
    document.getElementById('details-event-date').textContent = event.date;
    document.getElementById('details-event-time').textContent = event.time || '';
    document.getElementById('event-details-modal').classList.add('show');
  }
};

// Cerrar modal de detalles
function closeEventDetailsModal() {
  document.getElementById('event-details-modal').classList.remove('show');
}
document.getElementById('close-event-details').onclick = closeEventDetailsModal;
Array.from(document.querySelectorAll('#event-details-modal .close-modal-btn')).forEach(btn => {
  btn.onclick = closeEventDetailsModal;
});
document.getElementById('event-details-modal').addEventListener('click', function(e) {
  if (e.target === this) closeEventDetailsModal();
});

// Inicializar eventos al cargar
renderEvents();

// --- PERSISTENCIA DE FILTROS DE EVENTOS ---
const FILTERS_KEY = 'eventFilters';
const filterForm = document.getElementById('filter-events-form');
if (filterForm) {
  // Guardar filtros al aplicar
  filterForm.onsubmit = function(e) {
    e.preventDefault();
    const filters = {
      type: this.querySelector('#filter-type').value,
      priority: this.querySelector('#filter-priority').value,
      start: this.querySelector('#filter-start').value,
      end: this.querySelector('#filter-end').value
    };
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    showNotification('success', 'Filtros aplicados y guardados');
    document.getElementById('filter-events-modal').classList.remove('show');
    renderEvents();
  };
  // Al abrir el modal, rellenar con los filtros guardados
  document.getElementById('filter-events').onclick = function() {
    const saved = localStorage.getItem(FILTERS_KEY);
    if (saved) {
      const filters = JSON.parse(saved);
      filterForm.querySelector('#filter-type').value = filters.type || '';
      filterForm.querySelector('#filter-priority').value = filters.priority || '';
      filterForm.querySelector('#filter-start').value = filters.start || '';
      filterForm.querySelector('#filter-end').value = filters.end || '';
    }
  };
}

// Al limpiar filtros, mostrar todos los eventos
document.getElementById('filter-events-form')?.addEventListener('reset', function() {
  localStorage.removeItem(FILTERS_KEY);
  showNotification('info', 'Filtros limpiados');
  renderEvents();
});

// --- PERSISTENCIA DE CONFIGURACIÓN DE ANÁLISIS ---
const ANALYSIS_KEY = 'analysisConfig';
const analysisForm = document.getElementById('customize-analysis-form');
if (analysisForm) {
  analysisForm.onsubmit = function(e) {
    e.preventDefault();
    const metrics = Array.from(this.querySelectorAll('.checkbox-group input[type=checkbox]')).map(cb => cb.checked);
    const start = this.querySelector('#analysis-start').value;
    const end = this.querySelector('#analysis-end').value;
    const threshold = this.querySelector('#alert-threshold').value;
    const config = { metrics, start, end, threshold };
    localStorage.setItem(ANALYSIS_KEY, JSON.stringify(config));
    showNotification('success', 'Configuración de análisis guardada');
    document.getElementById('customize-analysis-modal').classList.remove('show');
    // Aquí podrías actualizar el análisis con la nueva configuración
  };
  // Al abrir el modal, rellenar con la configuración guardada
  document.getElementById('customize-analysis').onclick = function() {
    const saved = localStorage.getItem(ANALYSIS_KEY);
    if (saved) {
      const config = JSON.parse(saved);
      const checkboxes = analysisForm.querySelectorAll('.checkbox-group input[type=checkbox]');
      config.metrics.forEach((val, i) => { if (checkboxes[i]) checkboxes[i].checked = val; });
      analysisForm.querySelector('#analysis-start').value = config.start || '';
      analysisForm.querySelector('#analysis-end').value = config.end || '';
      analysisForm.querySelector('#alert-threshold').value = config.threshold || 80;
    }
  };
} 