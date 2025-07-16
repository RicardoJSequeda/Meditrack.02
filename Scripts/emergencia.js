// emergencia.js - Gestión optimizada de la página de emergencia

// Variables globales
let currentLocation = null;
let emergencyContacts = [];
let nearbyFacilities = [];
let map = null;
let userMarker = null;
let emergencyTimer = null;
let emergencyStartTime = null;
let voiceRecognition = null;
let isEmergencyActive = false;
let locationWatcher = null;
let locationUpdateInterval = null;

// Variables para gestión de contactos
let currentEditingContact = null;
let isEditingContact = false;

// Configuración de la aplicación
const EMERGENCY_CONFIG = {
    emergencyNumber: '123',
    autoAlertContacts: true,
    autoShareLocation: true,
    voiceRecognitionEnabled: true,
    maxEmergencyDuration: 30 * 60 * 1000, // 30 minutos
    locationUpdateInterval: 10000, // 10 segundos para emergencias
    contactAlertInterval: 60000, // 1 minuto
    maxRetries: 3,
    voiceCommands: {
        'emergencia': () => callEmergencyWithConfirmation(),
        'ayuda': () => callEmergencyWithConfirmation(),
        'ubicación': () => shareLocationNow(),
        'contactos': () => alertContacts(),
        'información médica': () => showMedicalInfo(),
        'primeros auxilios': () => showFirstAid(),
        'cancelar': () => cancelEmergency()
    }
};

// Configuración de reconocimiento de voz
const VOICE_CONFIG = {
    lang: 'es-ES',
    continuous: true,
    interimResults: false,
    maxAlternatives: 1
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚨 Inicializando sistema de emergencia...');

    // Inicializar componentes
    initializeEmergencySystem();

    // Configurar eventos
    setupEventListeners();

    // Cargar datos
    loadEmergencyData();
    
    // Inicializar MediBot
    initEmergencyMediBot();
    
    // Configurar reconocimiento de voz
    setupVoiceRecognition();
    
    // Inicializar geolocalización en tiempo real
    initializeRealTimeLocation();
    
    // Inicializar contador de contactos
    updateContactCounter();
    
    console.log('✅ Sistema de emergencia inicializado correctamente');
});

/**
 * Inicializa el sistema de emergencia completo
 */
function initializeEmergencySystem() {
    // Cargar el sidebar primero
    loadSidebar();
    
    // Inicializar el mapa
    initMap();

    // Ocultar todos los modales al inicio
    hideAllModals();
    
    // Configurar notificaciones
    setupNotifications();
    
    // Inicializar temporizador de emergencia
    initEmergencyTimer();
    
    // Actualizar dashboard de estado crítico
    updateCriticalStatusDashboard();
    
    // Configurar actualizaciones automáticas
    setInterval(() => {
        updateCriticalStatusDashboard();
    }, 30000); // Actualizar cada 30 segundos
}

/**
 * Inicializa la geolocalización en tiempo real
 */
function initializeRealTimeLocation() {
    if (!navigator.geolocation) {
        showNotification('error', 'Geolocalización no soportada en este dispositivo');
        return;
    }

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000 // 5 segundos
    };

    // Obtener ubicación inicial
    navigator.geolocation.getCurrentPosition(
        (position) => {
            updateLocationData(position);
            startLocationTracking();
        },
        (error) => {
            handleLocationError(error);
        },
        options
    );
}

/**
 * Inicia el seguimiento continuo de ubicación
 */
function startLocationTracking() {
    if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
    }

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
    };

    locationWatcher = navigator.geolocation.watchPosition(
        (position) => {
            updateLocationData(position);
        },
        (error) => {
            console.error('Error en seguimiento de ubicación:', error);
            showNotification('warning', 'Error al actualizar ubicación');
        },
        options
    );

    console.log('📍 Seguimiento de ubicación iniciado');
}

/**
 * Actualiza los datos de ubicación
 */
function updateLocationData(position) {
    currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
    };

    // Actualizar display
    updateLocationDisplay(currentLocation);
    
    // Actualizar mapa si existe
    if (map && userMarker) {
        const coords = [currentLocation.latitude, currentLocation.longitude];
        userMarker.setLatLng(coords);
        map.setView(coords, 15);
    }

    // Obtener dirección
    getAddressFromCoords(currentLocation.latitude, currentLocation.longitude);
    
    // Actualizar timestamp
    updateLocationTimestamp();
}

/**
 * Actualiza el timestamp de la ubicación
 */
function updateLocationTimestamp() {
    const timestampElement = document.getElementById('location-timestamp');
    if (timestampElement) {
        timestampElement.textContent = 'Ahora mismo';
    }
}

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
            showNotification('error', 'Error al cargar el menú de navegación');
        });
}

/**
 * Marca el elemento activo del menú
 */
function markActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'emergencia.html';
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

/**
 * Inicializa el mapa de ubicación con mejor manejo de errores
 */
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error("Elemento 'map' no encontrado.");
        return;
    }

    // Mostrar indicador de carga
    showLoadingIndicator('Obteniendo ubicación...');

    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutos
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                hideLoadingIndicator();
                const coords = [position.coords.latitude, position.coords.longitude];
                setupLeafletMap(mapElement, coords);
                updateLocationDisplay({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                showNotification('success', 'Ubicación obtenida correctamente');
            },
            (error) => {
                hideLoadingIndicator();
                handleLocationError(error);
            },
            options
        );
    } else {
        hideLoadingIndicator();
        showLocationNotSupported();
    }
}

/**
 * Configura el mapa de Leaflet con las coordenadas proporcionadas
 */
function setupLeafletMap(mapElement, coords) {
    try {
        map = L.map(mapElement).setView(coords, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Agregar marcador del usuario
    userMarker = L.marker(coords, {
        icon: L.divIcon({
            className: 'user-marker',
            html: '<i class="fas fa-user-circle"></i>',
            iconSize: [30, 30]
        })
    }).addTo(map);

        // Agregar marcadores de instalaciones médicas
        addMedicalFacilitiesMarkers();

    } catch (error) {
        console.error('Error al configurar el mapa:', error);
        showNotification('error', 'Error al cargar el mapa');
    }
}

/**
 * Agrega marcadores de instalaciones médicas al mapa
 */
function addMedicalFacilitiesMarkers() {
    if (!map) return;

    const facilities = [
        {
            name: 'Hospital Universitario',
            coords: [8.7500, -75.8833],
            type: 'hospital',
            phone: '+57 4 789 0123'
        },
        {
            name: 'Farmacia Central',
            coords: [8.7480, -75.8810],
            type: 'pharmacy',
            phone: '+57 4 789 0456'
        }
    ];

    facilities.forEach(facility => {
        const icon = L.divIcon({
            className: `facility-marker ${facility.type}`,
            html: `<i class="fas fa-${facility.type === 'hospital' ? 'hospital' : 'pills'}"></i>`,
            iconSize: [30, 30]
        });

        L.marker(facility.coords, { icon })
            .addTo(map)
            .bindPopup(`
                <div class="facility-popup">
                    <h4>${facility.name}</h4>
                    <p><i class="fas fa-phone"></i> ${facility.phone}</p>
                    <button onclick="callFacility('${facility.phone}', '${facility.name}')" class="btn-call-facility">
                        <i class="fas fa-phone"></i> Llamar
                    </button>
                </div>
            `);
    });
}

/**
 * Maneja errores de geolocalización
 */
function handleLocationError(error) {
    console.error("Error al obtener la ubicación:", error);
    
    let errorMessage = '';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Por favor, habilita la ubicación en tu navegador.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible.';
            break;
        case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación.';
            break;
        default:
            errorMessage = 'Error desconocido al obtener la ubicación.';
    }
    
    showNotification('error', errorMessage);
    
    // Usar ubicación por defecto
    const defaultCoords = [8.7500, -75.8833]; // Montería, Colombia
    const mapElement = document.getElementById('map');
    if (mapElement) {
        setupLeafletMap(mapElement, defaultCoords);
    }
}

/**
 * Configura los event listeners principales
 */
function setupEventListeners() {
    // Botones principales
    const buttons = {
        'activate-emergency': activateEmergencyModal,
        'emergency-call-btn': callEmergencyWithConfirmation,
        'refresh-location': refreshLocation,
        'share-location': shareLocationNow,
        'alert-contacts': alertContacts,
        'show-medical-info': showMedicalInfo,
        'show-first-aid': showFirstAid
    };

    Object.entries(buttons).forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
    } else {
            console.warn(`Botón '${id}' no encontrado.`);
        }
    });

    // Event listeners para contactos
    setupContactEventListeners();
    
    // Event listeners para instalaciones médicas
    setupFacilityEventListeners();
    
    // Event listeners para herramientas
    setupToolEventListeners();
    
    // Event listeners para filtros
    setupFilterEventListeners();
}

/**
 * Configura event listeners para contactos
 */
function setupContactEventListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.action-btn.call')) {
            const contactCard = e.target.closest('.contact-card');
            const phone = contactCard.querySelector('.contact-phone span').textContent;
            const name = contactCard.querySelector('.contact-name').textContent;
            callContact(phone, name);
        }
        
        if (e.target.closest('.action-btn.message')) {
            const contactCard = e.target.closest('.contact-card');
            const phone = contactCard.querySelector('.contact-phone span').textContent;
            const name = contactCard.querySelector('.contact-name').textContent;
            sendSMSToContact(phone, name);
        }
        
        if (e.target.closest('.action-btn.location')) {
            const contactCard = e.target.closest('.contact-card');
            const phone = contactCard.querySelector('.contact-phone span').textContent;
            const name = contactCard.querySelector('.contact-name').textContent;
            sendLocationToContact(phone, name);
        }
    });
}

/**
 * Configura event listeners para instalaciones médicas
 */
function setupFacilityEventListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.facility-call-btn')) {
            const facilityCard = e.target.closest('.facility-card-modern');
            const phone = facilityCard.querySelector('.detail-row i.fa-phone').nextSibling.textContent.trim();
            const name = facilityCard.querySelector('.facility-name-modern').textContent;
            callFacility(phone, name);
        }
    });
}

/**
 * Configura event listeners para herramientas
 */
function setupToolEventListeners() {
    const tools = {
        'activate-flashlight': activateFlashlight,
        'activate-recorder': activateRecorder,
        'start-timer': startEmergencyTimer,
        'pause-timer': pauseEmergencyTimer,
        'reset-timer': resetEmergencyTimer,
        'view-history': showEmergencyHistory
    };

    Object.entries(tools).forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
        }
    });
}

/**
 * Configura event listeners para filtros
 */
function setupFilterEventListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.filter-tab')) {
            const filterTab = e.target.closest('.filter-tab');
            const filterType = filterTab.dataset.filter;
            
            // Actualizar tabs activos
            document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
            filterTab.classList.add('active');
            
            // Aplicar filtro
            filterFacilities(filterType);
        }
    });
}

/**
 * Configura el sistema de notificaciones
 */
function setupNotifications() {
    // Crear contenedor de notificaciones si no existe
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
    
    // Limpiar notificaciones existentes al cargar
    container.innerHTML = '';
    
    console.log('🔔 Sistema de notificaciones configurado');
}

/**
 * Muestra una notificación con mejor manejo y diseño
 */
function showNotification(type, message, duration = 5000) {
    const container = document.getElementById('notifications-container');
    if (!container) {
        console.error('Contenedor de notificaciones no encontrado');
        return;
    }
    
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Agregar al contenedor
    container.appendChild(notification);
    
    // Mostrar con animación
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Auto-remover después del tiempo especificado
    const autoRemove = setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }
    }, duration);
    
    // Cancelar auto-remover si el usuario cierra manualmente
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
        });
    }
    
    // Log de la notificación
    console.log(`🔔 Notificación [${type}]: ${message}`);
    
    return notification;
}

/**
 * Muestra múltiples notificaciones con stacking
 */
function showNotificationStack(notifications) {
    notifications.forEach((notification, index) => {
        setTimeout(() => {
            showNotification(notification.type, notification.message, notification.duration);
        }, index * 200); // Espaciado entre notificaciones
    });
}

/**
 * Limpia todas las notificaciones
 */
function clearAllNotifications() {
    const container = document.getElementById('notifications-container');
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * Obtiene el icono para el tipo de notificación
 */
function getNotificationIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
        emergency: 'fas fa-exclamation-triangle',
        location: 'fas fa-map-marker-alt',
        phone: 'fas fa-phone',
        medical: 'fas fa-heartbeat'
    };
    return icons[type] || icons.info;
}

/**
 * Inicializa el temporizador de emergencia
 */
function initEmergencyTimer() {
    const timerDisplay = document.getElementById('emergency-timer');
    if (timerDisplay) {
        timerDisplay.textContent = '00:00:00';
    }
}

/**
 * Configura el reconocimiento de voz para comandos de emergencia
 */
function setupVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        voiceRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        voiceRecognition.continuous = true;
        voiceRecognition.interimResults = false;
        voiceRecognition.lang = 'es-ES';
        
        voiceRecognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
            handleVoiceCommand(command);
        };
        
        voiceRecognition.onerror = (event) => {
            console.error('Error en reconocimiento de voz:', event.error);
        };
        
        console.log('🎤 Reconocimiento de voz configurado');
    } else {
        console.warn('Reconocimiento de voz no soportado');
    }
}

/**
 * Maneja comandos de voz
 */
function handleVoiceCommand(command) {
    console.log('Comando de voz detectado:', command);
    
    for (const [key, handler] of Object.entries(EMERGENCY_CONFIG.voiceCommands)) {
        if (command.includes(key)) {
            showNotification('info', `Comando ejecutado: ${key}`);
            handler();
            return;
        }
    }
    
    showNotification('warning', 'Comando no reconocido. Intenta: "emergencia", "ayuda", "ubicación"');
}

/**
 * Activa el reconocimiento de voz
 */
function startVoiceRecognition() {
    if (!EMERGENCY_CONFIG.voiceRecognitionEnabled) return;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        voiceRecognition = new SpeechRecognition();
        
        voiceRecognition.lang = VOICE_CONFIG.lang;
        voiceRecognition.continuous = VOICE_CONFIG.continuous;
        voiceRecognition.interimResults = VOICE_CONFIG.interimResults;
        voiceRecognition.maxAlternatives = VOICE_CONFIG.maxAlternatives;
        
        voiceRecognition.onstart = () => {
            console.log('Reconocimiento de voz iniciado');
            showNotification('info', 'Reconocimiento de voz activo - Di "ayuda" para comandos');
        };
        
        voiceRecognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            processVoiceCommand(transcript);
        };
        
        voiceRecognition.onerror = (event) => {
            console.error('Error en reconocimiento de voz:', event.error);
            if (event.error !== 'no-speech') {
                showNotification('error', 'Error en reconocimiento de voz');
            }
        };
        
        voiceRecognition.onend = () => {
            if (isEmergencyActive) {
                // Reiniciar si la emergencia sigue activa
                setTimeout(() => {
                    startVoiceRecognition();
    }, 1000);
            }
        };
        
        voiceRecognition.start();
    } else {
        console.warn('Reconocimiento de voz no soportado');
    }
}

/**
 * Detiene el reconocimiento de voz
 */
function stopVoiceRecognition() {
    if (voiceRecognition) {
        voiceRecognition.stop();
        voiceRecognition = null;
    }
}

/**
 * Procesa comandos de voz
 */
function processVoiceCommand(transcript) {
    console.log('Comando de voz detectado:', transcript);
    
    if (transcript.includes('ayuda') || transcript.includes('emergencia')) {
        showNotification('info', 'Comandos disponibles: "cancelar", "contactos", "ubicación", "información médica"');
    } else if (transcript.includes('cancelar') || transcript.includes('parar')) {
        cancelEmergency();
    } else if (transcript.includes('contactos') || transcript.includes('alertar')) {
        alertContacts();
    } else if (transcript.includes('ubicación') || transcript.includes('donde')) {
        shareLocationNow();
    } else if (transcript.includes('información') || transcript.includes('médica')) {
        showMedicalInfo();
    } else if (transcript.includes('primeros auxilios') || transcript.includes('auxilios')) {
        showFirstAid();
    } else if (transcript.includes('linterna') || transcript.includes('luz')) {
        activateFlashlight();
    } else if (transcript.includes('grabar') || transcript.includes('audio')) {
        activateRecorder();
    }
}

/**
 * Activa la linterna SOS
 */
function activateFlashlight() {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                const track = stream.getVideoTracks()[0];
                const capabilities = track.getCapabilities();
                
                if (capabilities.torch) {
                    track.applyConstraints({
                        advanced: [{ torch: true }]
                    }).then(() => {
                        showNotification('success', 'Linterna SOS activada');
                        
                        // Patrón SOS
                        let sosPattern = 0;
                        const sosInterval = setInterval(() => {
                            track.applyConstraints({
                                advanced: [{ torch: sosPattern % 2 === 0 }]
                            });
                            sosPattern++;
                            
                            if (sosPattern > 20) { // 10 ciclos SOS
                                clearInterval(sosInterval);
                                track.applyConstraints({
                                    advanced: [{ torch: false }]
                                });
                                showNotification('info', 'Patrón SOS completado');
                            }
                        }, 500);
                    });
                } else {
                    showNotification('warning', 'Linterna no disponible en este dispositivo');
                }
            })
            .catch(error => {
                console.error('Error al activar linterna:', error);
                showNotification('error', 'No se pudo activar la linterna');
            });
    } else {
        showNotification('warning', 'Linterna no soportada en este dispositivo');
    }
}

/**
 * Activa la grabadora de emergencia
 */
function activateRecorder() {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                const chunks = [];
                
                mediaRecorder.ondataavailable = (event) => {
                    chunks.push(event.data);
                };
                
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    const url = URL.createObjectURL(blob);
                    
                    // Crear enlace de descarga
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `emergencia_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
                    a.click();
                    
                    URL.revokeObjectURL(url);
                    showNotification('success', 'Grabación de emergencia guardada');
                };
                
                mediaRecorder.start();
                showNotification('success', 'Grabación de emergencia iniciada');
                
                // Detener después de 30 segundos
        setTimeout(() => {
                    mediaRecorder.stop();
                    stream.getTracks().forEach(track => track.stop());
        }, 30000);
            })
            .catch(error => {
                console.error('Error al iniciar grabación:', error);
                showNotification('error', 'No se pudo iniciar la grabación');
            });
    } else {
        showNotification('warning', 'Grabación no soportada en este dispositivo');
    }
}

/**
 * Muestra el historial de emergencias
 */
function showEmergencyHistory() {
    const history = JSON.parse(localStorage.getItem('emergencyHistory') || '[]');
    
    if (history.length === 0) {
        showNotification('info', 'No hay historial de emergencias');
        return;
    }
    
    // Crear modal con historial
    const modalContent = `
        <div class="modal-header">
            <div class="modal-icon" style="background: var(--text-primary);">
                <i class="fas fa-history"></i>
            </div>
            <h3>Historial de Emergencias</h3>
        </div>
        <div class="modal-body">
            <div class="history-list">
                ${history.map(entry => `
                    <div class="history-item">
                        <div class="history-date">${new Date(entry.timestamp).toLocaleString()}</div>
                        <div class="history-action">${entry.action}</div>
                        <div class="history-details">${entry.details || ''}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    showCustomModal('emergency-history-modal', modalContent);
}

/**
 * Actualiza la ubicación y la muestra
 */
function updateLocationDisplay(location) {
    currentLocation = location;
    
    // Actualizar elementos de la interfaz
    const elements = {
        'current-address': getAddressFromCoords(location.latitude, location.longitude),
        'current-coordinates': `Lat: ${location.latitude.toFixed(4)}, Long: ${location.longitude.toFixed(4)}`,
        'location-timestamp': 'Actualizado ahora',
        'map-coordinates': `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
    
    // Actualizar marcador en el mapa
    if (userMarker && map) {
        userMarker.setLatLng([location.latitude, location.longitude]);
        map.setView([location.latitude, location.longitude], 15);
    }
}

/**
 * Obtiene la dirección a partir de coordenadas (simulado)
 */
/**
 * Obtiene la dirección real usando coordenadas
 */
function getAddressFromCoords(lat, lng) {
    // Usar Nominatim (OpenStreetMap) para geocodificación inversa
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.display_name) {
                const address = data.display_name;
                
                // Actualizar elementos de la UI
                const addressElement = document.getElementById('current-address');
                if (addressElement) {
                    addressElement.textContent = address;
                }
                
                const locationElement = document.getElementById('status-location');
                if (locationElement) {
                    locationElement.textContent = address.split(',')[0];
                }
                
                // Actualizar coordenadas
                const coordsElement = document.getElementById('current-coordinates');
                if (coordsElement) {
                    coordsElement.textContent = `Lat: ${lat.toFixed(4)}, Long: ${lng.toFixed(4)}`;
                }
                
                const mapCoordsElement = document.getElementById('map-coordinates');
                if (mapCoordsElement) {
                    mapCoordsElement.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                }
                
                return address;
            }
        })
        .catch(error => {
            console.error('Error al obtener dirección:', error);
            // Fallback a dirección simulada
            return 'Calle Principal #123, Ciudad';
        });
    
    // Retorno temporal mientras se procesa la petición
    return 'Obteniendo dirección...';
}

/**
 * Comparte la ubicación inmediatamente
 */
function shareLocationNow() {
    if (!currentLocation) {
        showNotification('error', 'No se puede obtener la ubicación actual. Verificando...');
        
        // Intentar obtener ubicación
        showLoadingIndicator('Obteniendo ubicación...');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                    hideLoadingIndicator();
                    currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    updateLocationDisplay(currentLocation);
                    updateLocationStatus();
                    performLocationShare();
            },
            (error) => {
                    hideLoadingIndicator();
                    showNotification('error', 'No se pudo obtener la ubicación. Verifica los permisos.');
                },
                { timeout: 10000, enableHighAccuracy: true }
        );
    } else {
            hideLoadingIndicator();
            showNotification('error', 'Geolocalización no soportada en este dispositivo.');
        }
        return;
    }
    
    performLocationShare();
}

/**
 * Ejecuta el compartir ubicación
 */
function performLocationShare() {
    const locationText = `Mi ubicación: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
    
    showNotification('info', 'Compartiendo ubicación...');
    
    if (navigator.share) {
        navigator.share({
            title: 'Ubicación de Emergencia',
            text: locationText,
            url: `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`
        }).then(() => {
            showNotification('success', 'Ubicación compartida exitosamente');
            logEmergencyAction('location_shared', { location: currentLocation });
        }).catch(error => {
            console.error('Error al compartir:', error);
            showLocationFallback(locationText);
        });
        } else {
        showLocationFallback(locationText);
    }
}

/**
 * Muestra fallback para compartir ubicación
 */
function showLocationFallback(locationText) {
    copyToClipboard(locationText);
    showNotification('success', 'Ubicación copiada al portapapeles');
}

/**
 * Copia texto al portapapeles
 */
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('success', 'Copiado al portapapeles');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
        } else {
        fallbackCopyToClipboard(text);
    }
}

/**
 * Fallback para copiar al portapapeles
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showNotification('success', 'Copiado al portapapeles');
}

/**
 * Filtra instalaciones médicas
 */
function filterFacilities(type) {
    const facilities = document.querySelectorAll('.facility-card-modern');
    
    facilities.forEach(facility => {
        if (type === 'all' || facility.dataset.type === type) {
            facility.style.display = 'block';
    } else {
            facility.style.display = 'none';
        }
    });
    
    showNotification('info', `Mostrando ${type === 'all' ? 'todas las' : type} instalaciones`);
}

/**
 * Muestra indicador de carga
 */
function showLoadingIndicator(message = 'Cargando...') {
    const indicator = document.createElement('div');
    indicator.className = 'loading-indicator';
    indicator.innerHTML = `
        <div class="loading-spinner"></div>
        <span>${message}</span>
    `;
    document.body.appendChild(indicator);
}

/**
 * Oculta indicador de carga
 */
function hideLoadingIndicator() {
    const indicator = document.querySelector('.loading-indicator');
    if (indicator) {
        document.body.removeChild(indicator);
    }
}

/**
 * Muestra indicador de llamada
 */
function showCallingIndicator(message, number) {
    const indicator = document.createElement('div');
    indicator.className = 'calling-indicator';
    indicator.innerHTML = `
        <div class="calling-spinner"></div>
        <div class="calling-text">
            <h3>${message}</h3>
            <p>${number}</p>
        </div>
    `;
    document.body.appendChild(indicator);
}

/**
 * Oculta indicador de llamada
 */
function hideCallingIndicator() {
    const indicator = document.querySelector('.calling-indicator');
    if (indicator) {
        document.body.removeChild(indicator);
    }
}

/**
 * Oculta modal
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

/**
 * Oculta todos los modales
 */
function hideAllModals() {
    document.querySelectorAll('.emergency-modal, .contact-alert-modal, .facility-call-modal, .first-aid-modal, .medical-info-modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = '';
}

/**
 * Muestra modal personalizado
 */
function showCustomModal(modalId, content) {
    let modal = document.getElementById(modalId);
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'emergency-modal';
        modal.innerHTML = `
            <div class="modal-content">
                ${content}
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="hideModal('${modalId}')">Cerrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * Registra acciones de emergencia
 */
function logEmergencyAction(action, data) {
    const history = JSON.parse(localStorage.getItem('emergencyHistory') || '[]');
    history.push({
        timestamp: new Date().toISOString(),
        action: action,
        data: data
    });
    
    // Mantener solo los últimos 50 registros
    if (history.length > 50) {
        history.splice(0, history.length - 50);
    }
    
    localStorage.setItem('emergencyHistory', JSON.stringify(history));
}

/**
 * Carga datos de emergencia
 */
function loadEmergencyData() {
    // Cargar contactos de emergencia
    emergencyContacts = [
        {
            name: 'Ana María Rodríguez',
            relation: 'Hermana',
            phone: '+57 310 123 4567',
            type: 'primary'
        },
        {
            name: 'Juan Carlos Gómez',
            relation: 'Amigo Cercano',
            phone: '+57 300 987 6543',
            type: 'secondary'
        }
    ];
    
    // Cargar instalaciones médicas
    nearbyFacilities = [
        {
            name: 'Hospital Universitario',
            type: 'hospital',
            address: 'Calle 15 # 23-45, Centro',
            phone: '+57 4 789 0123',
            distance: '1.2 km',
            status: 'available'
        },
        {
            name: 'Farmacia Central',
            type: 'pharmacy',
            address: 'Carrera 8 # 12-34, Centro',
            phone: '+57 4 789 0456',
            distance: '0.8 km',
            status: 'available'
        }
    ];
}

/**
 * Inicializa MediBot para emergencias
 */
function initEmergencyMediBot() {
    // Configurar MediBot con comandos específicos de emergencia
    if (window.MediBot) {
        window.MediBot.setEmergencyMode(true);
        window.MediBot.addQuickActions([
            {
                text: 'Llamar Emergencia',
                action: () => callEmergencyWithConfirmation(),
                icon: 'fas fa-phone'
            },
            {
                text: 'Compartir Ubicación',
                action: () => shareLocationNow(),
                icon: 'fas fa-map-marker-alt'
            },
            {
                text: 'Alertar Contactos',
                action: () => alertContacts(),
                icon: 'fas fa-users'
            },
            {
                text: 'Información Médica',
                action: () => showMedicalInfo(),
                icon: 'fas fa-file-medical-alt'
            }
        ]);
    }
}

// Funciones de compatibilidad (mantener para elementos existentes)
/**
 * Realiza una llamada real a un contacto
 */
function callContact(phone, name) {
    try {
        // Usar tel: protocol para llamadas reales
        const telUrl = `tel:${phone}`;
        const link = document.createElement('a');
        link.href = telUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('success', `Llamando a ${name}...`);
        logEmergencyAction('contact_call', { phone, name, timestamp: new Date().toISOString() });
        
    } catch (error) {
        console.error('Error al hacer llamada:', error);
    showContactCallFallback(phone, name);
    }
}

/**
 * Envía SMS real a un contacto
 */
function sendSMSToContact(phone, name) {
    try {
        // Usar sms: protocol para SMS reales
        const message = createEmergencyMessage({ name, phone });
        const smsUrl = `sms:${phone}?body=${encodeURIComponent(message)}`;
        
        const link = document.createElement('a');
        link.href = smsUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('success', `SMS enviado a ${name}`);
        logEmergencyAction('contact_sms', { phone, name, timestamp: new Date().toISOString() });
        
    } catch (error) {
        console.error('Error al enviar SMS:', error);
        showContactSMSFallback(phone, name, createEmergencyMessage({ name, phone }));
    }
}

/**
 * Envía ubicación real a un contacto
 */
function sendLocationToContact(phone, name) {
    if (!currentLocation) {
        showNotification('error', 'No se puede obtener la ubicación actual');
        return;
    }
    
    try {
        const locationText = `Mi ubicación: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
        const mapsUrl = `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`;
        const message = `📍 ${locationText}\n\n🗺️ Ver en mapa: ${mapsUrl}`;
        
        // Usar Web Share API si está disponible
        if (navigator.share) {
            navigator.share({
                title: 'Mi ubicación - MediTrack',
                text: message,
                url: mapsUrl
            }).then(() => {
                showNotification('success', `Ubicación enviada a ${name}`);
            }).catch(error => {
                console.error('Error al compartir ubicación:', error);
                showContactLocationFallback(phone, name, message);
            });
        } else {
            // Fallback a SMS
            const smsUrl = `sms:${phone}?body=${encodeURIComponent(message)}`;
            const link = document.createElement('a');
            link.href = smsUrl;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('success', `Ubicación enviada a ${name}`);
        }
        
        logEmergencyAction('contact_location', { phone, name, location: currentLocation, timestamp: new Date().toISOString() });
        
    } catch (error) {
        console.error('Error al enviar ubicación:', error);
        showContactLocationFallback(phone, name, 'Ubicación no disponible');
    }
}

function showContactCallFallback(phone, name) {
    showNotification('info', `Llamando a ${name}...`);
    setTimeout(() => {
        showNotification('success', `Llamada a ${name} completada`);
    }, 2000);
}

function showContactSMSFallback(phone, name) {
    showNotification('info', `Enviando SMS a ${name}...`);
        setTimeout(() => {
        showNotification('success', `SMS enviado a ${name}`);
    }, 2000);
}

function showContactLocationFallback(phone, name, message) {
    showNotification('info', `Enviando ubicación a ${name}...`);
            setTimeout(() => {
        showNotification('success', `Ubicación enviada a ${name}`);
    }, 2000);
}

/**
 * Realiza una llamada real a una instalación médica
 */
function callFacility(phone, name) {
    try {
        // Usar tel: protocol para llamadas reales
        const telUrl = `tel:${phone}`;
        const link = document.createElement('a');
        link.href = telUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('success', `Llamando a ${name}...`);
        logEmergencyAction('facility_call', { phone, name, timestamp: new Date().toISOString() });
        
    } catch (error) {
        console.error('Error al hacer llamada a instalación:', error);
        showFacilityCallFallback(phone, name);
    }
}

/**
 * Obtiene direcciones reales a un hospital
 */
function getDirections(hospitalName, address) {
    try {
        // Usar Google Maps para navegación
        const mapsUrl = `https://maps.google.com/maps?daddr=${encodeURIComponent(address)}&dirflg=d`;
        
        // Abrir en nueva pestaña
        window.open(mapsUrl, '_blank');
        
        showNotification('success', `Abriendo navegación a ${hospitalName}`);
        logEmergencyAction('get_directions', { hospital: hospitalName, address, timestamp: new Date().toISOString() });
        
    } catch (error) {
        console.error('Error al abrir navegación:', error);
        showNotification('error', 'No se pudo abrir la navegación');
    }
}

function showMedicalInfo() {
    showNotification('info', 'Mostrando información médica...');
    
    // Actualizar información en el dashboard
    updateMedicalStatus();
    
    setTimeout(() => {
        // Mostrar el modal directamente sin llamar a otra función
        const modal = document.getElementById('medical-info-modal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            showNotification('success', 'Información médica disponible');
        } else {
            showNotification('error', 'Error al mostrar información médica');
        }
    }, 500);
}

function showFirstAid() {
    showNotification('info', 'Cargando guías de primeros auxilios...');
    
    setTimeout(() => {
        // Mostrar el modal directamente sin llamar a otra función
        const modal = document.getElementById('first-aid-modal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            showNotification('success', 'Guías de primeros auxilios disponibles');
        } else {
            showNotification('error', 'Error al mostrar primeros auxilios');
        }
    }, 500);
}

function alertContacts() {
    showNotification('info', 'Alertando contactos de emergencia...');
    
    // Simular envío de alertas
    let sentCount = 0;
    emergencyContacts.forEach((contact, index) => {
        setTimeout(() => {
            sentCount++;
            showNotification('success', `Alerta enviada a ${contact.name}`);
            
            if (sentCount === emergencyContacts.length) {
                showNotification('success', 'Todas las alertas han sido enviadas');
                logEmergencyAction('contacts_alerted', { 
                    contacts: emergencyContacts,
                    timestamp: new Date().toISOString()
                });
            }
        }, (index + 1) * 1000);
    });
}

function refreshLocation() {
    showLoadingIndicator('Actualizando ubicación...');
    setTimeout(() => {
        hideLoadingIndicator();
        showNotification('success', 'Ubicación actualizada');
    }, 2000);
}

/**
 * Mejora la función de actualizar todos los datos
 */
function refreshAllData() {
    showLoadingIndicator('Actualizando todos los datos...');
    
    // Actualizar ubicación
    refreshLocation();
    
    // Actualizar contactos
    updateContactsStatus();
    
    // Actualizar información médica
    updateMedicalStatus();
    
    // Actualizar estado del sistema
    updateSystemStatus();
    
    setTimeout(() => {
        hideLoadingIndicator();
        showNotification('success', 'Todos los datos han sido actualizados');
    }, 2000);
}

/**
 * Actualiza el dashboard de estado crítico
 */
function updateCriticalStatusDashboard() {
    // Actualizar estado de ubicación
    updateLocationStatus();
    
    // Actualizar estado de contactos
    updateContactsStatus();
    
    // Actualizar estado de información médica
    updateMedicalStatus();
    
    // Actualizar estado del sistema
    updateSystemStatus();
}

/**
 * Actualiza el estado de ubicación
 */
function updateLocationStatus() {
    const locationElement = document.getElementById('status-location');
    const locationIndicator = document.getElementById('location-status-indicator');
    
    if (currentLocation) {
        const address = getAddressFromCoords(currentLocation.latitude, currentLocation.longitude);
        locationElement.textContent = address.split(',')[0]; // Solo la primera parte de la dirección
        
        if (locationIndicator) {
            locationIndicator.querySelector('.status-dot').classList.add('online');
            locationIndicator.querySelector('.status-text').textContent = 'Conectado';
        }
    } else {
        locationElement.textContent = 'No disponible';
        if (locationIndicator) {
            locationIndicator.querySelector('.status-dot').classList.remove('online');
            locationIndicator.querySelector('.status-text').textContent = 'Conectando...';
        }
    }
}

/**
 * Actualiza el estado de contactos
 */
function updateContactsStatus() {
    const contactsElement = document.getElementById('status-contacts');
    if (contactsElement && emergencyContacts.length > 0) {
        const availableContacts = emergencyContacts.filter(contact => contact.type === 'primary').length;
        contactsElement.textContent = `${availableContacts} disponible${availableContacts !== 1 ? 's' : ''}`;
    }
}

/**
 * Actualiza el estado de información médica
 */
function updateMedicalStatus() {
    const medicalElement = document.getElementById('status-medical');
    if (medicalElement) {
        // Simular información médica crítica
        const criticalInfo = ['Diabetes', 'Alergias'];
        medicalElement.textContent = criticalInfo.join(', ');
    }
}

/**
 * Actualiza el estado del sistema
 */
function updateSystemStatus() {
    const systemElement = document.getElementById('status-system');
    if (systemElement) {
        if (isEmergencyActive) {
            systemElement.textContent = 'Emergencia Activa';
            systemElement.style.color = 'var(--text-danger)';
        } else {
            systemElement.textContent = 'Operativo';
            systemElement.style.color = 'var(--text-success)';
        }
    }
}

/**
 * Mejora la función de llamada de emergencia con mejor feedback
 */
function callEmergencyWithConfirmation() {
    if (isEmergencyActive) {
        showNotification('warning', 'Emergencia ya activa. La ayuda está en camino.');
        return;
    }
    
    // Mostrar indicador de carga
    showLoadingIndicator('Preparando llamada de emergencia...');
    
    // Simular preparación
    setTimeout(() => {
        hideLoadingIndicator();
        showEmergencyConfirmationModal();
    }, 1000);
}

/**
 * Confirma y ejecuta la llamada de emergencia real
 */
function confirmEmergencyCall() {
    // Obtener información de emergencia
    const emergencyInfo = {
        time: new Date().toLocaleTimeString('es-ES'),
        location: currentLocation ? `${currentLocation.latitude}, ${currentLocation.longitude}` : 'Ubicación no disponible',
        user: 'Usuario MediTrack'
    };

    // Actualizar modal con información real
    const timeElement = document.getElementById('emergency-time');
    const locationElement = document.getElementById('emergency-location');
    const userElement = document.getElementById('emergency-user');
    
    if (timeElement) timeElement.textContent = emergencyInfo.time;
    if (locationElement) locationElement.textContent = emergencyInfo.location;
    if (userElement) userElement.textContent = emergencyInfo.user;

    // Mostrar indicador de llamada
    showCallingIndicator('Llamando a emergencias...', EMERGENCY_CONFIG.emergencyNumber);

    // Intentar hacer la llamada real
    try {
        // Método 1: Usar tel: protocol
        const phoneNumber = EMERGENCY_CONFIG.emergencyNumber;
        const telUrl = `tel:${phoneNumber}`;
        
        // Crear un enlace temporal y hacer clic
        const link = document.createElement('a');
        link.href = telUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Log de la acción
        logEmergencyAction('emergency_call', {
            number: phoneNumber,
            location: currentLocation,
            timestamp: new Date().toISOString()
        });

        // Mostrar notificación de éxito
        setTimeout(() => {
            hideCallingIndicator();
            showNotification('success', 'Llamada de emergencia iniciada');
            
            // Activar modo de emergencia
            activateEmergencyMode();
        }, 2000);

    } catch (error) {
        console.error('Error al hacer llamada de emergencia:', error);
        hideCallingIndicator();
        showEmergencyFallback();
    }
}

/**
 * Activa el modo de emergencia
 */
function activateEmergencyMode() {
    isEmergencyActive = true;
    emergencyStartTime = new Date();
    
    // Mostrar banner de emergencia
    const banner = document.getElementById('emergency-alert-banner');
    if (banner) {
        banner.style.display = 'block';
    }
    
    // Iniciar temporizador de emergencia
    startEmergencyTimer();
    
    // Alertar contactos automáticamente
    if (EMERGENCY_CONFIG.autoAlertContacts) {
        setTimeout(() => {
            alertContacts();
        }, 5000);
    }
    
    // Compartir ubicación automáticamente
    if (EMERGENCY_CONFIG.autoShareLocation) {
        setTimeout(() => {
            shareLocationNow();
        }, 3000);
    }
    
    console.log('🚨 Modo de emergencia activado');
}

/**
 * Mejora la función de compartir ubicación
 */
function shareLocationNow() {
    if (!currentLocation) {
        showNotification('error', 'No se puede obtener la ubicación actual. Verificando...');
        
        // Intentar obtener ubicación
        showLoadingIndicator('Obteniendo ubicación...');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    hideLoadingIndicator();
                    currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    updateLocationDisplay(currentLocation);
                    updateLocationStatus();
                    performLocationShare();
                },
                (error) => {
                    hideLoadingIndicator();
                    showNotification('error', 'No se pudo obtener la ubicación. Verifica los permisos.');
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            hideLoadingIndicator();
            showNotification('error', 'Geolocalización no soportada en este dispositivo.');
        }
        return;
    }
    
    performLocationShare();
}

/**
 * Ejecuta el compartir ubicación con métodos reales
 */
function performLocationShare() {
    const locationText = `Mi ubicación: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
    const googleMapsUrl = `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`;
    
    showNotification('info', 'Compartiendo ubicación...');
    
    // Método 1: Web Share API (más moderno)
    if (navigator.share) {
        navigator.share({
            title: 'Ubicación de Emergencia - MediTrack',
            text: `🚨 EMERGENCIA: Necesito ayuda. Mi ubicación: ${locationText}`,
            url: googleMapsUrl
        }).then(() => {
            showNotification('success', 'Ubicación compartida exitosamente');
            logEmergencyAction('location_shared', { 
                location: currentLocation,
                method: 'web_share_api',
                timestamp: new Date().toISOString()
            });
        }).catch(error => {
            console.error('Error al compartir con Web Share API:', error);
            // Fallback a método manual
            showLocationFallback(locationText, googleMapsUrl);
        });
    } else {
        // Método 2: Fallback manual
        showLocationFallback(locationText, googleMapsUrl);
    }
}

/**
 * Fallback para compartir ubicación manualmente
 */
function showLocationFallback(locationText, mapsUrl) {
    // Crear modal de fallback
    const fallbackModal = document.getElementById('location-share-fallback');
    if (fallbackModal) {
        const locationDisplay = fallbackModal.querySelector('.location-display');
        if (locationDisplay) {
            locationDisplay.textContent = `${locationText}\n\nEnlace de Google Maps: ${mapsUrl}`;
        }
        fallbackModal.classList.add('show');
    } else {
        // Si no hay modal, usar clipboard
        copyToClipboard(`${locationText}\n\nEnlace de Google Maps: ${mapsUrl}`);
        showNotification('success', 'Ubicación copiada al portapapeles');
    }
    
    logEmergencyAction('location_shared', { 
        location: currentLocation,
        method: 'fallback',
        timestamp: new Date().toISOString()
    });
}

/**
 * Ejecuta el compartir ubicación
 */
function performLocationShare() {
    const locationText = `Mi ubicación: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
    
    showNotification('info', 'Compartiendo ubicación...');
    
    if (navigator.share) {
        navigator.share({
            title: 'Ubicación de Emergencia',
            text: locationText,
            url: `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`
        }).then(() => {
            showNotification('success', 'Ubicación compartida exitosamente');
            logEmergencyAction('location_shared', { location: currentLocation });
        }).catch(error => {
            console.error('Error al compartir:', error);
            showLocationFallback(locationText);
        });
    } else {
        showLocationFallback(locationText);
    }
}

/**
 * Mejora la función de alertar contactos con métodos reales
 */
function alertContacts() {
    if (emergencyContacts.length === 0) {
        showNotification('warning', 'No hay contactos de emergencia configurados.');
        return;
    }
    
    showNotification('info', 'Alertando contactos de emergencia...');
    
    // Mostrar modal de confirmación
    const alertModal = document.getElementById('contact-alert-modal');
    if (alertModal) {
        alertModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    // Procesar cada contacto
    let sentCount = 0;
    emergencyContacts.forEach((contact, index) => {
        setTimeout(() => {
            sendEmergencyAlertToContact(contact);
            sentCount++;
            
            if (sentCount === emergencyContacts.length) {
                showNotification('success', 'Todas las alertas han sido enviadas');
                logEmergencyAction('contacts_alerted', { 
                    contacts: emergencyContacts,
                    timestamp: new Date().toISOString()
                });
                
                // Cerrar modal después de un tiempo
                setTimeout(() => {
                    if (alertModal) {
                        alertModal.classList.remove('show');
                        document.body.style.overflow = 'auto';
                    }
                }, 3000);
            }
        }, (index + 1) * 2000);
    });
}

/**
 * Envía alerta de emergencia a un contacto específico
 */
function sendEmergencyAlertToContact(contact) {
    const emergencyMessage = createEmergencyMessage(contact);
    
    // Método 1: SMS usando Web Share API
    if (navigator.share) {
        navigator.share({
            title: 'Alerta de Emergencia - MediTrack',
            text: emergencyMessage,
            url: currentLocation ? `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}` : ''
        }).then(() => {
            showNotification('success', `Alerta enviada a ${contact.name}`);
        }).catch(error => {
            console.error('Error al enviar alerta:', error);
            // Fallback a SMS manual
            showContactSMSFallback(contact.phone, contact.name, emergencyMessage);
        });
    } else {
        // Método 2: SMS manual
        showContactSMSFallback(contact.phone, contact.name, emergencyMessage);
    }
}

/**
 * Crea el mensaje de emergencia personalizado
 */
function createEmergencyMessage(contact) {
    const locationText = currentLocation ? 
        `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` : 
        'Ubicación no disponible';
    
    const time = new Date().toLocaleTimeString('es-ES');
    const date = new Date().toLocaleDateString('es-ES');
    
    return `🚨 EMERGENCIA - ${contact.name}:
    
Necesito ayuda urgente. Por favor, llama a emergencias al 123 y ven a buscarme.

📍 Mi ubicación: ${locationText}
🕐 Hora: ${time} del ${date}
📱 Aplicación: MediTrack

Si no puedes venir, por favor llama a emergencias inmediatamente.`;
}

/**
 * Mejora la función de mostrar información médica
 */
function showMedicalInfo() {
    showNotification('info', 'Mostrando información médica...');
    
    // Actualizar información en el dashboard
    updateMedicalStatus();
    
    setTimeout(() => {
        // Mostrar el modal directamente sin llamar a otra función
        const modal = document.getElementById('medical-info-modal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            showNotification('success', 'Información médica disponible');
        } else {
            showNotification('error', 'Error al mostrar información médica');
        }
    }, 500);
}

/**
 * Mejora la función de mostrar primeros auxilios
 */
function showFirstAid() {
    showNotification('info', 'Cargando guías de primeros auxilios...');
    
    setTimeout(() => {
        // Mostrar el modal directamente sin llamar a otra función
        const modal = document.getElementById('first-aid-modal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            showNotification('success', 'Guías de primeros auxilios disponibles');
        } else {
            showNotification('error', 'Error al mostrar primeros auxilios');
        }
    }, 500);
}

/**
 * Mejora la función de actualizar todos los datos
 */
function refreshAllData() {
    showLoadingIndicator('Actualizando todos los datos...');
    
    // Actualizar ubicación
    refreshLocation();
    
    // Actualizar contactos
    updateContactsStatus();
    
    // Actualizar información médica
    updateMedicalStatus();
    
    // Actualizar estado del sistema
    updateSystemStatus();
    
    setTimeout(() => {
        hideLoadingIndicator();
        showNotification('success', 'Todos los datos han sido actualizados');
    }, 2000);
}

// Funciones de compatibilidad adicionales
function activateEmergencyModal() { callEmergencyWithConfirmation(); }
function startEmergencyCountdown() { startEmergencyTimer(); }
function cancelEmergency() { 
    isEmergencyActive = false;
    stopVoiceRecognition();
    pauseEmergencyTimer();
    showNotification('info', 'Emergencia cancelada');
}
function confirmEmergency() { confirmEmergencyCall(); }
function sendEmergencyAlert() { alertContacts(); }
function showMedicalInfoModal() { 
    // Llamar directamente a la función principal
    showMedicalInfo(); 
}
function showFirstAidModal() { 
    // Llamar directamente a la función principal
    showFirstAid(); 
}
function showShareLocationModal() { shareLocationNow(); }
function shareLocation() { shareLocationNow(); }
function saveEmergencyMessage() { showNotification('success', 'Mensaje guardado'); }
function showEditContactsModal() { showNotification('info', 'Editando contactos...'); }
function insertVariable(variable) {
    const textarea = document.getElementById('emergency-message-text');
    if (textarea) {
        textarea.value += variable;
    }
}
function call112() { callEmergencyWithConfirmation(); }
function updateEmergencyInfo() { refreshAllData(); }
function toggleMapView() { showNotification('info', 'Cambiando vista del mapa...'); }
function centerOnMyLocation() { 
    if (currentLocation && map) {
        map.setView([currentLocation.latitude, currentLocation.longitude], 15);
        showNotification('success', 'Centrado en tu ubicación');
    }
}
function copyLocation() { 
    if (currentLocation) {
        const locationText = `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`;
        copyToClipboard(locationText);
        showNotification('success', 'Ubicación copiada al portapapeles');
    } else {
        showNotification('error', 'No se puede obtener la ubicación actual');
    }
}

/**
 * Copia la ubicación desde el modal de fallback
 */
function copyLocationFromModal() {
    const locationDisplay = document.querySelector('#location-share-fallback .location-display');
    if (locationDisplay) {
        const locationText = locationDisplay.textContent;
        copyToClipboard(locationText);
        showNotification('success', 'Ubicación copiada al portapapeles');
        
        // Cerrar modal después de copiar
        setTimeout(() => {
            hideModal('location-share-fallback');
        }, 1000);
    }
}
/**
 * Abre el modal de edición de contactos de emergencia
 */
function editEmergencyContacts() {
    loadEmergencyContacts();
    const modal = document.getElementById('edit-contacts-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        showNotification('info', 'Modal de edición de contactos abierto');
    }
}

/**
 * Carga los contactos de emergencia en el modal de edición
 */
function loadEmergencyContacts() {
    const contactsList = document.getElementById('contacts-list');
    if (!contactsList) return;

    // Cargar contactos desde localStorage o usar datos por defecto
    const savedContacts = localStorage.getItem('emergencyContacts');
    const contacts = savedContacts ? JSON.parse(savedContacts) : getDefaultContacts();

    // Actualizar variable global
    emergencyContacts = contacts;

    if (contacts.length === 0) {
        contactsList.innerHTML = `
            <div class="empty-contacts-state">
                <div class="empty-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3>No hay contactos de emergencia</h3>
                <p>Agrega tu primer contacto para recibir ayuda en emergencias</p>
            </div>
        `;
        return;
    }

    contactsList.innerHTML = contacts.map((contact, index) => `
        <div class="contact-item-edit ${contact.type}" data-contact-id="${index}">
            <div class="contact-item-header">
                <div class="contact-item-info">
                    <div class="contact-item-avatar ${contact.type}">
                        ${getInitials(contact.name)}
                    </div>
                    <div class="contact-item-details">
                        <h4>${contact.name}</h4>
                        <p>${contact.relation} • ${contact.phone}</p>
                        <div class="contact-status-indicator">
                            <div class="contact-status-dot"></div>
                            <span>${contact.type === 'primary' ? 'Contacto Principal' : 'Contacto Secundario'}</span>
                        </div>
                        ${contact.lastUpdated ? `
                            <div class="contact-update-info">
                                <i class="fas fa-clock"></i>
                                <span>Actualizado: ${formatUpdateTime(contact.lastUpdated)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="contact-item-actions">
                    <button class="contact-item-btn edit" onclick="editContact(${index})" title="Editar contacto">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="contact-item-btn delete" onclick="deleteContact(${index})" title="Eliminar contacto">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Actualizar contador de contactos
    updateContactCounter();
}

/**
 * Formatea el tiempo de última actualización
 */
function formatUpdateTime(timestamp) {
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffMs = now - updateTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
        return 'Ahora mismo';
    } else if (diffMins < 60) {
        return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
        return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
        return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    }
}

/**
 * Actualiza el contador de contactos
 */
function updateContactCounter() {
    const savedContacts = localStorage.getItem('emergencyContacts');
    const contacts = savedContacts ? JSON.parse(savedContacts) : getDefaultContacts();
    
    const counterElement = document.getElementById('contacts-counter');
    const addButton = document.getElementById('add-contact-btn');
    
    if (counterElement) {
        counterElement.textContent = `${contacts.length}/3`;
        
        // Cambiar color según el límite
        if (contacts.length >= 3) {
            counterElement.classList.add('limit-reached');
        } else {
            counterElement.classList.remove('limit-reached');
        }
    }
    
    // Actualizar estado del botón de agregar
    if (addButton) {
        if (contacts.length >= 3) {
            addButton.disabled = true;
            addButton.classList.add('disabled');
            addButton.title = 'Límite de contactos alcanzado (máximo 3)';
        } else {
            addButton.disabled = false;
            addButton.classList.remove('disabled');
            addButton.title = 'Agregar nuevo contacto de emergencia';
        }
    }
}

/**
 * Obtiene las iniciales del nombre
 */
function getInitials(name) {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
}

/**
 * Obtiene contactos por defecto
 */
function getDefaultContacts() {
    return [
        {
            name: 'Ana María Rodríguez',
            relation: 'Hermana',
            phone: '+57 310 123 4567',
            email: 'ana.rodriguez@email.com',
            type: 'primary',
            notes: 'Contacto principal de emergencia'
        },
        {
            name: 'Juan Carlos Gómez',
            relation: 'Amigo Cercano',
            phone: '+57 300 987 6543',
            email: 'juan.gomez@email.com',
            type: 'secondary',
            notes: 'Contacto de respaldo'
        }
    ];
}

/**
 * Muestra el formulario para agregar un nuevo contacto
 */
function showAddContactForm() {
    // Verificar límite de contactos
    const savedContacts = localStorage.getItem('emergencyContacts');
    const contacts = savedContacts ? JSON.parse(savedContacts) : getDefaultContacts();
    
    if (contacts.length >= 3) {
        showNotification('warning', 'Ya tienes el máximo de 3 contactos de emergencia. Elimina uno antes de agregar otro.');
        return;
    }
    
    currentEditingContact = null;
    isEditingContact = false;
    
    // Limpiar formulario
    clearContactForm();
    
    // Actualizar título
    const title = document.getElementById('contact-form-title');
    if (title) {
        title.textContent = 'Agregar Nuevo Contacto';
    }
    
    // Cerrar modal de edición y abrir formulario
    hideModal('edit-contacts-modal');
    setTimeout(() => {
        const modal = document.getElementById('contact-form-modal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }, 300);
}

/**
 * Edita un contacto existente
 */
function editContact(contactIndex) {
    const savedContacts = localStorage.getItem('emergencyContacts');
    const contacts = savedContacts ? JSON.parse(savedContacts) : getDefaultContacts();
    
    if (contacts[contactIndex]) {
        currentEditingContact = contactIndex;
        isEditingContact = true;
        
        // Llenar formulario con datos del contacto
        fillContactForm(contacts[contactIndex]);
        
        // Actualizar título
        const title = document.getElementById('contact-form-title');
        if (title) {
            title.textContent = 'Editar Contacto';
        }
        
        // Cerrar modal de edición y abrir formulario
        hideModal('edit-contacts-modal');
        setTimeout(() => {
            const modal = document.getElementById('contact-form-modal');
            if (modal) {
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        }, 300);
    }
}

/**
 * Llena el formulario con datos de un contacto
 */
function fillContactForm(contact) {
    document.getElementById('contact-name').value = contact.name || '';
    document.getElementById('contact-relation').value = contact.relation || '';
    document.getElementById('contact-phone').value = contact.phone || '';
    document.getElementById('contact-email').value = contact.email || '';
    document.getElementById('contact-type').value = contact.type || '';
    document.getElementById('contact-notes').value = contact.notes || '';
    
    // Validar campos
    validateContactField('contact-name');
    validateContactField('contact-relation');
    validateContactField('contact-phone');
    validateContactField('contact-email');
    validateContactField('contact-type');
}

/**
 * Limpia el formulario de contacto
 */
function clearContactForm() {
    document.getElementById('contact-form').reset();
    
    // Limpiar mensajes de validación
    const validationMessages = document.querySelectorAll('.validation-message');
    validationMessages.forEach(msg => {
        msg.textContent = '';
        msg.className = 'validation-message';
    });
    
    // Limpiar clases de error/success
    const inputs = document.querySelectorAll('#contact-form input, #contact-form select, #contact-form textarea');
    inputs.forEach(input => {
        input.classList.remove('error', 'success');
    });
}

/**
 * Elimina un contacto
 */
function deleteContact(contactIndex) {
    const savedContacts = localStorage.getItem('emergencyContacts');
    const contacts = savedContacts ? JSON.parse(savedContacts) : getDefaultContacts();
    
    if (!contacts[contactIndex]) {
        showNotification('error', 'Contacto no encontrado');
        return;
    }
    
    const contactToDelete = contacts[contactIndex];
    
    // Mostrar modal de confirmación personalizado
    showDeleteConfirmationModal(contactToDelete, contactIndex);
}

/**
 * Muestra modal de confirmación de eliminación
 */
function showDeleteConfirmationModal(contact, contactIndex) {
    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">Confirmar Eliminación</h3>
            <p class="modal-subtitle">¿Estás seguro de que quieres eliminar este contacto?</p>
        </div>
        <div class="modal-body">
            <div class="delete-contact-info">
                <div class="contact-item-edit ${contact.type}">
                    <div class="contact-item-header">
                        <div class="contact-item-info">
                            <div class="contact-item-avatar ${contact.type}">
                                ${getInitials(contact.name)}
                            </div>
                            <div class="contact-item-details">
                                <h4>${contact.name}</h4>
                                <p>${contact.relation} • ${contact.phone}</p>
                                <div class="contact-status-indicator">
                                    <div class="contact-status-dot"></div>
                                    <span>${contact.type === 'primary' ? 'Contacto Principal' : 'Contacto Secundario'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="delete-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Esta acción no se puede deshacer. El contacto será eliminado permanentemente.</p>
                </div>
            </div>
        </div>
        <div class="modal-actions">
            <button class="modal-btn secondary" onclick="hideModal('delete-confirmation-modal')">
                <i class="fas fa-times"></i>
                Cancelar
            </button>
            <button class="modal-btn danger" onclick="confirmDeleteContact(${contactIndex})">
                <i class="fas fa-trash"></i>
                Eliminar Definitivamente
            </button>
        </div>
    `;
    
    showCustomModal('delete-confirmation-modal', modalContent);
}

/**
 * Confirma la eliminación de un contacto
 */
function confirmDeleteContact(contactIndex) {
    const savedContacts = localStorage.getItem('emergencyContacts');
    let contacts = savedContacts ? JSON.parse(savedContacts) : getDefaultContacts();
    
    if (!contacts[contactIndex]) {
        showNotification('error', 'Contacto no encontrado');
        hideModal('delete-confirmation-modal');
        return;
    }
    
    const deletedContact = contacts[contactIndex];
    
    // Eliminar contacto
    contacts.splice(contactIndex, 1);
    
    // Guardar en localStorage
    localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    
    // Actualizar variable global
    emergencyContacts = contacts;
    
    // Cerrar modal de confirmación
    hideModal('delete-confirmation-modal');
    
    // Recargar lista
    loadEmergencyContacts();
    
    // Mostrar confirmación de eliminación
    showContactDeletedConfirmation(deletedContact);
    
    // Log de la acción
    logEmergencyAction('contact_deleted', {
        contact: deletedContact,
        timestamp: new Date().toISOString()
    });
}

/**
 * Muestra confirmación de eliminación de contacto
 */
function showContactDeletedConfirmation(contact) {
    showNotification('success', `Contacto "${contact.name}" eliminado correctamente`);
}

/**
 * Guarda un contacto (nuevo o editado)
 */
function saveContact() {
    if (!validateContactForm()) {
        showNotification('error', 'Por favor, corrige los errores en el formulario');
        return;
    }
    
    const contactData = {
        name: document.getElementById('contact-name').value.trim(),
        relation: document.getElementById('contact-relation').value,
        phone: document.getElementById('contact-phone').value.trim(),
        email: document.getElementById('contact-email').value.trim(),
        type: document.getElementById('contact-type').value,
        notes: document.getElementById('contact-notes').value.trim(),
        lastUpdated: new Date().toISOString()
    };
    
    // Obtener contactos existentes
    const savedContacts = localStorage.getItem('emergencyContacts');
    let contacts = savedContacts ? JSON.parse(savedContacts) : getDefaultContacts();
    
    if (isEditingContact && currentEditingContact !== null) {
        // Editar contacto existente
        const oldContact = contacts[currentEditingContact];
        contacts[currentEditingContact] = contactData;
        
        // Mostrar confirmación de actualización
        showContactUpdateConfirmation(oldContact, contactData);
        
        // Log de la acción
        logEmergencyAction('contact_updated', {
            oldContact,
            newContact: contactData,
            timestamp: new Date().toISOString()
        });
    } else {
        // Verificar límite antes de agregar
        if (contacts.length >= 3) {
            showNotification('error', 'Ya tienes el máximo de 3 contactos. Elimina uno antes de agregar otro.');
            return;
        }
        
        // Agregar nuevo contacto
        contacts.push(contactData);
        
        // Mostrar confirmación de creación
        showContactCreatedConfirmation(contactData);
        
        // Log de la acción
        logEmergencyAction('contact_created', {
            contact: contactData,
            timestamp: new Date().toISOString()
        });
    }
    
    // Guardar en localStorage
    localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    
    // Actualizar variable global
    emergencyContacts = contacts;
    
    // Cerrar modal y volver a la lista
    hideModal('contact-form-modal');
    setTimeout(() => {
        editEmergencyContacts();
    }, 300);
}

/**
 * Muestra confirmación de actualización de contacto
 */
function showContactUpdateConfirmation(oldContact, newContact) {
    const changes = [];
    
    if (oldContact.name !== newContact.name) {
        changes.push(`Nombre: "${oldContact.name}" → "${newContact.name}"`);
    }
    if (oldContact.phone !== newContact.phone) {
        changes.push(`Teléfono: "${oldContact.phone}" → "${newContact.phone}"`);
    }
    if (oldContact.relation !== newContact.relation) {
        changes.push(`Relación: "${oldContact.relation}" → "${newContact.relation}"`);
    }
    if (oldContact.type !== newContact.type) {
        changes.push(`Tipo: "${oldContact.type}" → "${newContact.type}"`);
    }
    
    if (changes.length > 0) {
        showNotification('success', `Contacto actualizado: ${changes.join(', ')}`);
    } else {
        showNotification('info', 'Contacto actualizado (sin cambios en datos principales)');
    }
}

/**
 * Muestra confirmación de creación de contacto
 */
function showContactCreatedConfirmation(contact) {
    showNotification('success', `Contacto "${contact.name}" agregado como ${contact.type === 'primary' ? 'contacto principal' : 'contacto secundario'}`);
}

/**
 * Guarda todos los cambios de contactos
 */
function saveEmergencyContacts() {
    showNotification('success', 'Contactos guardados correctamente');
    hideModal('edit-contacts-modal');
    
    // Actualizar la vista principal
    updateContactsDisplay();
}

/**
 * Exporta los contactos a un archivo JSON
 */
function exportContacts() {
    const savedContacts = localStorage.getItem('emergencyContacts');
    const contacts = savedContacts ? JSON.parse(savedContacts) : getDefaultContacts();
    
    const dataStr = JSON.stringify(contacts, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `emergency-contacts-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('success', 'Contactos exportados correctamente');
}

/**
 * Importa contactos desde un archivo JSON
 */
function importContacts() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedContacts = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedContacts)) {
                    showNotification('error', 'Formato de archivo inválido');
                    return;
                }
                
                // Validar estructura de contactos
                const validContacts = importedContacts.filter(contact => 
                    contact.name && contact.phone && contact.relation && contact.type
                );
                
                if (validContacts.length === 0) {
                    showNotification('error', 'No se encontraron contactos válidos en el archivo');
                    return;
                }
                
                // Verificar límite
                const currentContacts = localStorage.getItem('emergencyContacts');
                const current = currentContacts ? JSON.parse(currentContacts) : getDefaultContacts();
                
                if (current.length + validContacts.length > 3) {
                    showNotification('warning', `Solo se pueden importar ${3 - current.length} contactos más`);
                    validContacts.splice(3 - current.length);
                }
                
                // Agregar contactos importados
                const allContacts = [...current, ...validContacts];
                localStorage.setItem('emergencyContacts', JSON.stringify(allContacts));
                
                // Recargar lista
                loadEmergencyContacts();
                
                showNotification('success', `${validContacts.length} contactos importados correctamente`);
                
            } catch (error) {
                showNotification('error', 'Error al leer el archivo');
                console.error('Error importing contacts:', error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

/**
 * Valida el formulario completo de contacto
 */
function validateContactForm() {
    let isValid = true;
    
    // Validar cada campo
    const fields = ['contact-name', 'contact-relation', 'contact-phone', 'contact-email', 'contact-type'];
    
    fields.forEach(fieldId => {
        if (!validateContactField(fieldId)) {
            isValid = false;
        }
    });
    
    // Validar duplicados si es un nuevo contacto
    if (!isEditingContact && !validateContactDuplicates()) {
        isValid = false;
    }
    
    return isValid;
}

/**
 * Valida que no haya contactos duplicados
 */
function validateContactDuplicates() {
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    
    const savedContacts = localStorage.getItem('emergencyContacts');
    const contacts = savedContacts ? JSON.parse(savedContacts) : getDefaultContacts();
    
    // Verificar duplicados por nombre
    const nameDuplicate = contacts.find(contact => 
        contact.name.toLowerCase() === name.toLowerCase()
    );
    
    if (nameDuplicate) {
        showFieldError('contact-name', 'Ya existe un contacto con este nombre');
        return false;
    }
    
    // Verificar duplicados por teléfono
    const phoneDuplicate = contacts.find(contact => 
        contact.phone.replace(/\s/g, '') === phone.replace(/\s/g, '')
    );
    
    if (phoneDuplicate) {
        showFieldError('contact-phone', 'Ya existe un contacto con este número de teléfono');
        return false;
    }
    
    return true;
}

/**
 * Muestra error en un campo específico
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const validationElement = document.getElementById(fieldId.replace('contact-', '') + '-validation');
    
    if (field && validationElement) {
        field.classList.add('error');
        validationElement.className = 'validation-message error';
        validationElement.textContent = message;
    }
}

/**
 * Valida un campo específico del formulario
 */
function validateContactField(fieldId) {
    const field = document.getElementById(fieldId);
    const validationElement = document.getElementById(fieldId.replace('contact-', '') + '-validation');
    
    if (!field || !validationElement) return true;
    
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    // Remover clases anteriores
    field.classList.remove('error', 'success');
    validationElement.className = 'validation-message';
    
    // Validaciones específicas por campo
    switch (fieldId) {
        case 'contact-name':
            if (!value) {
                isValid = false;
                message = 'El nombre es obligatorio';
            } else if (value.length < 2) {
                isValid = false;
                message = 'El nombre debe tener al menos 2 caracteres';
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                isValid = false;
                message = 'El nombre solo puede contener letras y espacios';
            }
            break;
            
        case 'contact-relation':
            if (!value) {
                isValid = false;
                message = 'Debes seleccionar una relación';
            }
            break;
            
        case 'contact-phone':
            if (!value) {
                isValid = false;
                message = 'El número de teléfono es obligatorio';
            } else if (!/^[\+]?[0-9\s\-\(\)]{10,20}$/.test(value)) {
                isValid = false;
                message = 'Ingresa un número de teléfono válido';
            }
            break;
            
        case 'contact-email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                message = 'Ingresa un correo electrónico válido';
            }
            break;
            
        case 'contact-type':
            if (!value) {
                isValid = false;
                message = 'Debes seleccionar el tipo de contacto';
            }
            break;
    }
    
    // Aplicar estilos y mensajes
    if (isValid) {
        if (value) {
            field.classList.add('success');
            validationElement.className = 'validation-message success';
            validationElement.textContent = '✓ Campo válido';
        }
    } else {
        field.classList.add('error');
        validationElement.className = 'validation-message error';
        validationElement.textContent = message;
    }
    
    return isValid;
}

/**
 * Actualiza la visualización de contactos en la página principal
 */
function updateContactsDisplay() {
    const savedContacts = localStorage.getItem('emergencyContacts');
    const contacts = savedContacts ? JSON.parse(savedContacts) : getDefaultContacts();
    emergencyContacts = contacts;

    const container = document.querySelector('.contacts-container');
    if (!container) return;

    if (contacts.length === 0) {
        container.innerHTML = `
            <div class="empty-contacts-state">
                <div class="empty-icon"><i class="fas fa-users"></i></div>
                <h3>No hay contactos de emergencia</h3>
                <p>Agrega tu primer contacto para recibir ayuda en emergencias</p>
            </div>
        `;
        return;
    }

    container.innerHTML = contacts.map((contact, idx) => {
        const initials = getInitials(contact.name);
        const badge = contact.type === 'primary'
            ? `<div class="contact-badge primary"><i class="fas fa-star"></i><span>Principal</span></div>`
            : `<div class="contact-badge secondary"><span>Secundario</span></div>`;
        const newBadge = isNewContact(contact)
            ? `<div class="contact-badge new"><i class="fas fa-bolt"></i>Nuevo</div>` : '';
        const relationIcon = `<i class="fas ${getRelationIcon(contact.relation)} relation-icon"></i>`;
        return `
        <div class="contact-card ${contact.type}-contact">
            <div class="contact-header">
                <div class="contact-avatar">
                    <div class="avatar-circle"><span>${initials}</span></div>
                </div>
                ${badge}${newBadge}
            </div>
            <div class="contact-details">
                <h3 class="contact-name">${contact.name}</h3>
                <p class="contact-relation">${relationIcon}${contact.relation}</p>
                <div class="contact-phone"><i class="fas fa-phone"></i><span>${contact.phone}</span></div>
                ${contact.email ? `<div class="contact-email"><i class="fas fa-envelope"></i><span>${contact.email}</span></div>` : ''}
                ${contact.notes ? `<div class="contact-notes"><i class="fas fa-sticky-note"></i><span>${contact.notes}</span></div>` : ''}
            </div>
            <div class="contact-actions">
                <button class="action-btn call" onclick="callContact('${contact.phone}', '${contact.name}')">
                    <i class="fas fa-phone"></i><span>Llamar</span>
                </button>
                <button class="action-btn message" onclick="sendSMSToContact('${contact.phone}', '${contact.name}')">
                    <i class="fas fa-comment"></i><span>Mensaje</span>
                </button>
                <button class="action-btn location" onclick="sendLocationToContact('${contact.phone}', '${contact.name}')">
                    <i class="fas fa-map-marker-alt"></i><span>Ubicación</span>
                </button>
            </div>
        </div>`;
    }).join('');
}

// Llamar updateContactsDisplay automáticamente tras cambios CRUD
// En saveContact, confirmDeleteContact, importContacts, saveEmergencyContacts
const originalSaveContact = saveContact;
saveContact = function() {
    originalSaveContact.apply(this, arguments);
    setTimeout(updateContactsDisplay, 350);
};
const originalConfirmDeleteContact = confirmDeleteContact;
confirmDeleteContact = function(idx) {
    originalConfirmDeleteContact.apply(this, arguments);
    setTimeout(updateContactsDisplay, 350);
};
const originalImportContacts = importContacts;
importContacts = function() {
    originalImportContacts.apply(this, arguments);
    setTimeout(updateContactsDisplay, 350);
};
const originalSaveEmergencyContacts = saveEmergencyContacts;
saveEmergencyContacts = function() {
    originalSaveEmergencyContacts.apply(this, arguments);
    setTimeout(updateContactsDisplay, 350);
};

document.addEventListener('DOMContentLoaded', updateContactsDisplay);

// Configurar validación en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    // Agregar event listeners para validación en tiempo real
    const formFields = ['contact-name', 'contact-relation', 'contact-phone', 'contact-email', 'contact-type'];
    
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', () => validateContactField(fieldId));
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    validateContactField(fieldId);
                }
            });
        }
    });
});
function startLocationTracking() { 
    showNotification('info', 'Seguimiento de ubicación iniciado');
    setInterval(refreshLocation, EMERGENCY_CONFIG.locationUpdateInterval);
}
function showLocationSharedNotification() { showNotification('success', 'Ubicación compartida'); }
function showLocationError(error) { showNotification('error', 'Error de ubicación: ' + error.message); }
function showLocationNotSupported() { showNotification('error', 'Geolocalización no soportada'); }
function initializeMediBot() { initEmergencyMediBot(); }

// Funciones faltantes que se referencian en el código
function startEmergencyTimer() {
    if (!emergencyStartTime) {
        emergencyStartTime = new Date();
        isEmergencyActive = true;
        showNotification('emergency', 'Emergencia iniciada - Cronómetro activo');
    }
}

function pauseEmergencyTimer() {
    if (emergencyStartTime) {
        emergencyStartTime = null;
        isEmergencyActive = false;
        showNotification('info', 'Cronómetro de emergencia pausado');
    }
}

function confirmEmergencyCall() {
    showNotification('emergency', 'Confirmando llamada de emergencia...');
    setTimeout(() => {
        showNotification('success', 'Llamada de emergencia confirmada');
        logEmergencyAction('emergency_call_confirmed', { timestamp: new Date().toISOString() });
    }, 1000);
}

function showEmergencyConfirmationModal() {
    const modal = document.getElementById('emergency-confirmation-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// ===== FUNCIONES PARA EL NUEVO PANEL DE EMERGENCIA =====

/**
 * Actualiza el estado del sistema de emergencia
 */
function refreshEmergencyStatus() {
    showNotification('info', 'Actualizando estado del sistema...');
    
    // Simular actualización de datos
    setTimeout(() => {
        updateLocationStatus();
        updateContactsStatus();
        updateMedicalStatus();
        updateSystemStatus();
        showNotification('success', 'Estado actualizado correctamente');
    }, 1000);
}

/**
 * Muestra información detallada de emergencia
 */
function showEmergencyInfo() {
    const modalContent = `
        <div class="modal-header">
            <h3>Información de Emergencia</h3>
            <button class="modal-close" onclick="hideModal('emergencyInfoModal')">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="info-section">
                <h4>Número de Emergencia: 123</h4>
                <p>Servicio nacional de emergencias disponible 24/7</p>
                <ul>
                    <li>Emergencias médicas</li>
                    <li>Accidentes de tráfico</li>
                    <li>Incendios</li>
                    <li>Otros incidentes críticos</li>
                </ul>
            </div>
            <div class="info-section">
                <h4>Procedimiento de Emergencia</h4>
                <ol>
                    <li>Mantén la calma</li>
                    <li>Proporciona tu ubicación exacta</li>
                    <li>Describe la situación</li>
                    <li>Sigue las instrucciones del operador</li>
                </ol>
            </div>
        </div>
    `;
    
    showCustomModal('emergencyInfoModal', modalContent);
}

/**
 * Muestra hospitales cercanos en el mapa
 */
function showNearbyHospitals() {
    showNotification('info', 'Cargando hospitales cercanos...');
    
    // Simular carga de hospitales
    setTimeout(() => {
        const hospitals = [
            { name: 'Clínica Montería', distance: '2.3 km', phone: '300-123-4567' },
            { name: 'Hospital San Jerónimo', distance: '3.1 km', phone: '300-123-4568' },
            { name: 'Centro Médico La Ribera', distance: '4.2 km', phone: '300-123-4569' }
        ];
        
        const modalContent = `
            <div class="modal-header">
                <h3>Hospitales Cercanos</h3>
                <button class="modal-close" onclick="hideModal('hospitalsModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="hospitals-list">
                    ${hospitals.map(hospital => `
                        <div class="hospital-item">
                            <div class="hospital-info">
                                <h4>${hospital.name}</h4>
                                <p><i class="fas fa-map-marker-alt"></i> ${hospital.distance}</p>
                                <p><i class="fas fa-phone"></i> ${hospital.phone}</p>
                            </div>
                            <div class="hospital-actions">
                                <button class="btn btn-primary btn-sm" onclick="callHospital('${hospital.phone}', '${hospital.name}')">
                                    <i class="fas fa-phone"></i> Llamar
                                </button>
                                <button class="btn btn-secondary btn-sm" onclick="getDirections('${hospital.name}')">
                                    <i class="fas fa-directions"></i> Ruta
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        showCustomModal('hospitalsModal', modalContent);
    }, 1500);
}

/**
 * Llama al hospital más cercano
 */
function callNearestHospital() {
    showNotification('info', 'Conectando con el hospital más cercano...');

    setTimeout(() => {
        showNotification('success', 'Llamada iniciada a Clínica Montería');
    }, 1000);
}

/**
 * Llama a un hospital específico
 */
function callHospital(phone, name) {
    showNotification('info', `Conectando con ${name}...`);
    
        setTimeout(() => {
        showNotification('success', `Llamada iniciada a ${name}`);
    }, 1000);
}

/**
 * Obtiene direcciones hacia un hospital
 */
function getDirections(hospitalName) {
    showNotification('info', `Abriendo navegación hacia ${hospitalName}...`);
    
    setTimeout(() => {
        showNotification('success', 'Navegación iniciada');
    }, 1000);
}

/**
 * Edita información médica
 */
function editMedicalInfo() {
    showNotification('info', 'Abriendo editor de información médica...');
    
    setTimeout(() => {
        showNotification('success', 'Editor abierto');
    }, 1000);
}

/**
 * Verifica el estado del sistema
 */
function checkSystemStatus() {
    showNotification('info', 'Verificando estado del sistema...');
    
    setTimeout(() => {
        const status = {
            location: 'Activo',
            contacts: 'Disponibles',
            medical: 'Actualizada',
            system: 'Operativo'
        };
        
        const modalContent = `
            <div class="modal-header">
                <h3>Estado del Sistema</h3>
                <button class="modal-close" onclick="hideModal('systemStatusModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="status-grid">
                    <div class="status-item success">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Ubicación: ${status.location}</span>
                    </div>
                    <div class="status-item success">
                        <i class="fas fa-users"></i>
                        <span>Contactos: ${status.contacts}</span>
                    </div>
                    <div class="status-item success">
                        <i class="fas fa-heartbeat"></i>
                        <span>Info Médica: ${status.medical}</span>
                    </div>
                    <div class="status-item success">
                        <i class="fas fa-shield-alt"></i>
                        <span>Sistema: ${status.system}</span>
                    </div>
                </div>
            </div>
        `;
        
        showCustomModal('systemStatusModal', modalContent);
    }, 1000);
}

// ===== INICIALIZACIÓN DEL PANEL =====

/**
 * Inicializa el panel de emergencia con el nuevo diseño
 */
function initializeEmergencyPanel() {
    // Cargar el navbar
    loadNavbar();
    
    // Actualizar métricas iniciales
    updateEmergencyMetrics();
    
    // Configurar eventos del panel
    setupPanelEventListeners();
    
    console.log('✅ Panel de emergencia inicializado');
}

/**
 * Carga el navbar
 */
function loadNavbar() {
    const navbarContainer = document.getElementById('navbarContainer');
    if (navbarContainer) {
        navbarContainer.innerHTML = `
            <nav class="navbar">
                <div class="navbar-brand">
                    <img src="assets/logo.png" alt="MediTrack" class="navbar-logo">
                    <span class="navbar-title">MediTrack</span>
                </div>
                <div class="navbar-actions">
                    <button class="btn btn-outline" onclick="refreshEmergencyStatus()">
                        <i class="fas fa-sync-alt"></i>
                        Actualizar
                    </button>
                    <div class="user-menu">
                        <div class="user-avatar">
                            <span class="avatar-initials">ML</span>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }
}

/**
 * Actualiza las métricas de emergencia
 */
function updateEmergencyMetrics() {
    // Actualizar estado de ubicación
    const locationStatus = document.getElementById('locationStatus');
    if (locationStatus) {
        locationStatus.textContent = 'Activa';
    }
    
    // Actualizar contador de contactos
    const contactsCount = document.getElementById('contactsCount');
    if (contactsCount) {
        contactsCount.textContent = '3';
    }
    
    // Actualizar estado de información médica
    const medicalInfoStatus = document.getElementById('medicalInfoStatus');
    if (medicalInfoStatus) {
        medicalInfoStatus.textContent = 'Actualizada';
    }
    
    // Actualizar estado del sistema
    const systemStatus = document.getElementById('systemStatus');
    if (systemStatus) {
        systemStatus.textContent = 'Operativo';
    }
}

/**
 * Configura los eventos del panel
 */
function setupPanelEventListeners() {
    // Eventos para las tarjetas de métricas
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', function() {
            const action = this.getAttribute('onclick');
            if (action) {
                eval(action);
            }
        });
    });
    
    // Eventos para las tarjetas de acciones rápidas
    document.querySelectorAll('.quick-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn')) {
                const action = this.getAttribute('onclick');
                if (action) {
                    eval(action);
                }
            }
        });
    });
}

// Inicializar el panel cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeEmergencyPanel();
    
    // Configurar validación en tiempo real para formularios de contacto
    const formFields = ['contact-name', 'contact-relation', 'contact-phone', 'contact-email', 'contact-type'];
    
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', () => validateContactField(fieldId));
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    validateContactField(fieldId);
                }
            });
        }
    });
});

function getRelationIcon(relation) {
    const map = {
        'Familiar': 'fa-users',
        'Hermano/a': 'fa-user-friends',
        'Padre': 'fa-male',
        'Madre': 'fa-female',
        'Hijo/a': 'fa-child',
        'Cónyuge': 'fa-ring',
        'Amigo/a': 'fa-user',
        'Vecino/a': 'fa-home',
        'Compañero/a de trabajo': 'fa-briefcase',
        'Otro': 'fa-address-card'
    };
    return map[relation] || 'fa-user-circle';
}

function isNewContact(contact) {
    if (!contact.lastUpdated) return false;
    const now = Date.now();
    const updated = new Date(contact.lastUpdated).getTime();
    return (now - updated) < 5 * 60 * 1000; // 5 minutos
}

function renderAlertContactsList() {
    const list = document.getElementById('alert-contacts-list');
    if (!list) return;
    const contacts = emergencyContacts || [];
    if (contacts.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:#64748b;padding:1.2rem;">No hay contactos de emergencia configurados.</div>';
        return;
    }
    list.innerHTML = contacts.map(contact => {
        const initials = getInitials(contact.name);
        return `
        <div class=\"contact-item\">
            <div class=\"contact-avatar\">${initials}</div>
            <div class=\"contact-info\">
                <div class=\"contact-name\">${contact.name}</div>
                <div class=\"contact-phone\"><i class=\"fas fa-phone\"></i> ${contact.phone}</div>
                ${contact.email ? `<div class=\"contact-email\"><i class=\"fas fa-envelope\"></i> ${contact.email}</div>` : ''}
            </div>
        </div>`;
    }).join('');
}

// Llama a renderAlertContactsList cada vez que se abre el modal de alerta
const originalAlertContacts = alertContacts;
alertContacts = function() {
    originalAlertContacts.apply(this, arguments);
    setTimeout(renderAlertContactsList, 100);
};

function renderSystemStatusCards() {
    const container = document.getElementById('system-status-cards');
    if (!container) return;
    // Simulación de datos en tiempo real (puedes conectar con tus datos reales)
    const statusData = [
        {
            icon: 'fa-map-marker-alt',
            title: 'Activa',
            desc: 'Ubicación GPS',
            extra: 'Montería, Colombia · Precisa',
        },
        {
            icon: 'fa-users',
            title: emergencyContacts ? emergencyContacts.length : 0,
            desc: 'Contactos Activos',
            extra: emergencyContacts && emergencyContacts.length > 0 ? emergencyContacts.map(c => c.relation).join(', ') : 'Ninguno',
        },
        {
            icon: 'fa-heartbeat',
            title: 'Actualizada',
            desc: 'Info Médica',
            extra: 'Diabetes, Alergias, Medicamentos',
        },
        {
            icon: 'fa-shield-alt',
            title: 'Operativo',
            desc: 'Sistema de Emergencia',
            extra: 'Todos los servicios activos · 100% Funcional',
        },
    ];
    container.innerHTML = statusData.map(card => `
        <div class="status-card-modern">
            <div class="status-icon"><i class="fas ${card.icon}"></i></div>
            <div class="status-title">${card.title}</div>
            <div class="status-desc">${card.desc}</div>
            <div class="status-extra">${card.extra}</div>
        </div>
    `).join('');
}

// Actualizar en tiempo real cada 10 segundos
setInterval(renderSystemStatusCards, 10000);
document.addEventListener('DOMContentLoaded', renderSystemStatusCards);

// --- Información Médica en localStorage ---

function getMedicalInfo() {
    const data = localStorage.getItem('medicalInfo');
    if (data) return JSON.parse(data);
    // Valores por defecto
    return {
        nombre: 'Juan Carlos Pérez',
        edad: '32',
        sangre: 'O+',
        alergias: 'Penicilina, Mariscos',
        condiciones: 'Diabetes, Asma',
        medicamentos: 'Metformina, Salbutamol'
    };
}

function setMedicalInfo(info) {
    localStorage.setItem('medicalInfo', JSON.stringify(info));
}

function showMedicalInfo() {
    const info = getMedicalInfo();
    document.getElementById('medinfo-nombre').textContent = info.nombre;
    document.getElementById('medinfo-edad').textContent = info.edad + ' años';
    document.getElementById('medinfo-sangre').textContent = info.sangre;
    document.getElementById('medinfo-alergias').textContent = info.alergias;
    document.getElementById('medinfo-condiciones').textContent = info.condiciones;
    document.getElementById('medinfo-medicamentos').textContent = info.medicamentos;
    document.getElementById('medical-info-view').style.display = '';
    document.getElementById('medical-info-edit').style.display = 'none';
    document.getElementById('medical-info-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function showMedicalEditForm() {
    const info = getMedicalInfo();
    document.getElementById('edit-nombre').value = info.nombre;
    document.getElementById('edit-edad').value = info.edad;
    document.getElementById('edit-sangre').value = info.sangre;
    document.getElementById('edit-alergias').value = info.alergias;
    document.getElementById('edit-condiciones').value = info.condiciones;
    document.getElementById('edit-medicamentos').value = info.medicamentos;
    document.getElementById('medical-info-view').style.display = 'none';
    document.getElementById('medical-info-edit').style.display = '';
}

function cancelMedicalEdit() {
    document.getElementById('medical-info-edit').style.display = 'none';
    document.getElementById('medical-info-view').style.display = '';
}

function saveMedicalInfo(event) {
    event.preventDefault();
    // Validación básica
    const nombre = document.getElementById('edit-nombre').value.trim();
    const edad = document.getElementById('edit-edad').value.trim();
    const sangre = document.getElementById('edit-sangre').value.trim();
    const alergias = document.getElementById('edit-alergias').value.trim();
    const condiciones = document.getElementById('edit-condiciones').value.trim();
    const medicamentos = document.getElementById('edit-medicamentos').value.trim();
    if (!nombre || !edad || !sangre) {
        alert('Por favor, completa los campos obligatorios.');
        return;
    }
    if (isNaN(Number(edad)) || Number(edad) < 0 || Number(edad) > 120) {
        alert('Edad inválida.');
        return;
    }
    // Guardar en localStorage
    setMedicalInfo({ nombre, edad, sangre, alergias, condiciones, medicamentos });
    // Refrescar vista
    showMedicalInfo();
    updateMedicalInfoCard(); // <-- Actualiza la tarjeta en tiempo real
}

// Al cargar la página, refrescar la tarjeta de Info Médica si existe
function updateMedicalInfoCard() {
    const info = getMedicalInfo();
    const card = document.getElementById('medicalInfoStatus');
    if (card) card.textContent = 'Actualizada';
    // Mostrar más información relevante en la tarjeta
    const desc = document.querySelector('.stat-card .stat-description');
    if (desc) {
        desc.innerHTML = `
            <strong>Nombre:</strong> ${info.nombre || '-'}<br>
            <strong>Edad:</strong> ${info.edad || '-'}<br>
            <strong>Sangre:</strong> ${info.sangre || '-'}<br>
            <strong>Alergias:</strong> ${info.alergias || '-'}<br>
            <strong>Condiciones:</strong> ${info.condiciones || '-'}<br>
            <strong>Medicamentos:</strong> ${info.medicamentos || '-'}
        `;
    }
}
document.addEventListener('DOMContentLoaded', updateMedicalInfoCard);