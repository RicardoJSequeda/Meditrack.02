document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Elementos del DOM ---
    const medibotContainer = document.getElementById('medibotContainer');
    const medibotToggle = document.getElementById('medibotToggle');
    const medibotHeader = document.getElementById('medibotHeader');
    const medibotMessages = document.getElementById('medibotMessages');
    const medibotInput = document.getElementById('medibotInput');
    const medibotSendButton = document.getElementById('medibotSend');
    const medibotQuickActions = document.getElementById('medibotQuickActions');
    const medibotMinimize = document.getElementById('medibotMinimize');
    const medibotClose = document.getElementById('medibotClose');
    const notificationBadge = document.getElementById('notificationBadge');
    const medibotVoiceInput = document.getElementById('medibotVoiceInput');
    const medibotVoice = document.getElementById('medibotVoice');

    // --- 2. Datos del usuario ---
    const userData = {
        name: "Usuario",
        emergencyContacts: ["+1234567890 (Juan Pérez)", "+9876543210 (María García)"],
        medications: [
            { id: 'med1', name: "Paracetamol", dose: "500mg", time: "14:00", lastTaken: "13:55" },
            { id: 'med2', name: "Ibuprofeno", dose: "400mg", time: "08:00 y 20:00", lastTaken: "08:00" },
            { id: 'med3', name: "Vitamina C", dose: "1000mg", time: "09:00", lastTaken: "09:00" }
        ],
        appointments: [
            { id: 'appt1', doctor: "Dr. García", specialty: "Cardiólogo", date: "22 de Mayo", time: "10:00 AM", location: "Hospital Central, Consultorio 402", notes: "Llevar estudios previos." },
            { id: 'appt2', doctor: "Dra. López", specialty: "Dermatóloga", date: "15 de Junio", time: "16:30", location: "Clínica Piel Sana, Piso 3", notes: "Revisión anual de lunares." }
        ],
        healthTips: [
            {
                category: "Bienestar General",
                text: "¡Excelente trabajo cuidando de tu salud hoy! Recuerda que cada pequeño paso cuenta. 💖",
                tip: "¿Sabías que caminar 30 minutos al día puede reducir significativamente el riesgo de enfermedades cardíacas?"
            },
            {
                category: "Hidratación",
                text: "La hidratación es clave para tu bienestar. ¿Has bebido suficiente agua hoy? 💧",
                tip: "Intenta beber al menos 8 vasos de agua al día para mantener tu cuerpo hidratado."
            },
            {
                category: "Nutrición",
                text: "Una dieta rica en frutas y verduras fortalece tu sistema inmune. 🍎🥦",
                tip: "Consume al menos 5 porciones de frutas y verduras al día."
            }
        ],
        curiosities: [
            "¿Sabías que el hueso más pequeño del cuerpo humano está en el oído? Se llama estribo.",
            "¿Sabías que el corazón humano late alrededor de 100,000 veces al día?",
            "¿Sabías que la piel es el órgano más grande del cuerpo?"
        ]
    };

    // --- 3. Estado del chatbot y configuración de voz ---
    let isOpen = false;
    let isMinimized = false;
    let unreadMessages = 0;
    let currentConversationState = 'initial';
    let conversationData = {};
    let currentUtterance = null;
    let voices = [];
    let isVoiceEnabled = true;
    let isRecording = false;
    let recognition = null;

    // Configuración de SpeechSynthesis
    const SpeechSynthesis = window.speechSynthesis;
    
    SpeechSynthesis.onvoiceschanged = () => {
        voices = SpeechSynthesis.getVoices();
        const defaultVoice = voices.find(voice => voice.lang === 'es-ES' && voice.name.includes('Google español'));
        if (defaultVoice) {
            console.log("Voz predeterminada seleccionada:", defaultVoice.name);
        } else if (voices.length > 0) {
            const esVoice = voices.find(voice => voice.lang.startsWith('es'));
            if (esVoice) {
                console.log("Voz española encontrada:", esVoice.name);
            } else {
                console.log("Usando primera voz disponible:", voices[0].name);
            }
        }
    };

    // Configuración de SpeechRecognition
    function initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'es-ES';
            recognition.maxAlternatives = 1;
            
            recognition.onstart = () => {
                console.log('Reconocimiento de voz iniciado');
                isRecording = true;
                medibotVoiceInput.classList.add('recording');
                medibotVoiceInput.setAttribute('aria-label', 'Detener grabación');
            };
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('Texto reconocido:', transcript);
                
                // Mostrar el texto reconocido en el input
                medibotInput.value = transcript;
                
                // Procesar el mensaje
                addUserMessage(transcript);
            };
            
            recognition.onerror = (event) => {
                console.error('Error en reconocimiento de voz:', event.error);
                let errorMessage = 'Error en el reconocimiento de voz';
                
                switch(event.error) {
                    case 'no-speech':
                        errorMessage = 'No se detectó voz. Intenta hablar más cerca del micrófono.';
                        break;
                    case 'audio-capture':
                        errorMessage = 'No se pudo acceder al micrófono. Verifica los permisos.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Permiso denegado para usar el micrófono.';
                        break;
                    case 'network':
                        errorMessage = 'Error de red. Verifica tu conexión.';
                        break;
                    default:
                        errorMessage = `Error: ${event.error}`;
                }
                
                addBotMessage(`<div class="medibot-card error-message">
                    <h4><i class="fas fa-exclamation-triangle"></i> Error de Voz</h4>
                    <p>${errorMessage}</p>
                    <p>Puedes escribir tu mensaje manualmente.</p>
                </div>`);
            };
            
            recognition.onend = () => {
                console.log('Reconocimiento de voz finalizado');
                isRecording = false;
                medibotVoiceInput.classList.remove('recording');
                medibotVoiceInput.setAttribute('aria-label', 'Entrada de voz');
            };
        } else {
            console.warn('SpeechRecognition no está disponible en este navegador');
            medibotVoiceInput.style.display = 'none';
        }
    }

    // --- 4. Funciones de la interfaz ---
    function toggleMedibot() {
        isOpen = !isOpen;
        medibotContainer.classList.toggle('active', isOpen);
        medibotToggle.setAttribute('aria-expanded', isOpen);
        medibotToggle.style.display = isOpen ? 'none' : 'flex';

        if (isOpen) {
            if (isMinimized) {
                toggleMinimize();
            }
            medibotInput.focus();
            resetUnreadMessages();
            medibotToggle.classList.remove('pulse');
            if (medibotMessages.children.length === 0) {
                showWelcomeMessage();
            } else {
                medibotMessages.scrollTop = medibotMessages.scrollHeight;
            }
        } else {
            medibotToggle.style.display = 'flex';
        }
    }

    function toggleMinimize() {
        isMinimized = !isMinimized;
        medibotContainer.classList.toggle('minimized', isMinimized);
        medibotMinimize.innerHTML = isMinimized ? '<i class="fas fa-expand"></i>' : '<i class="fas fa-minus"></i>';

        if (!isMinimized) {
            medibotMessages.scrollTop = medibotMessages.scrollHeight;
            medibotInput.focus();
        }
    }

    function addMessage(htmlContent, senderClass) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', senderClass, 'fade-in');
        messageDiv.innerHTML = htmlContent;
        medibotMessages.appendChild(messageDiv);
        medibotMessages.scrollTop = medibotMessages.scrollHeight;

        if (senderClass === 'bot-message' && !isOpen) {
            incrementUnreadMessages();
        }
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator', 'bot-message');
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `<span></span><span></span><span></span>`;
        medibotMessages.appendChild(typingDiv);
        medibotMessages.scrollTop = medibotMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function addBotMessage(htmlContent, speakText = null) {
        addMessage(htmlContent, 'bot-message');
        
        // Extraer texto para voz si no se proporciona
        if (speakText === null) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            speakText = tempDiv.textContent || tempDiv.innerText || '';
        }
        
        // Leer el mensaje en voz alta solo si está habilitado
        if (speakText.trim() && isVoiceEnabled) {
            speakMessage(speakText);
        }
    }

    function addUserMessage(text) {
        addMessage(`<p>${text}</p>`, 'user-message');
        medibotInput.value = '';
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            processUserMessage(text);
        }, 1000 + Math.random() * 1000);
    }

    function createQuickActionButton(text, actionHandler, className = 'quick-action-btn') {
        const button = document.createElement('button');
        button.className = className;
        button.innerHTML = text;
        button.addEventListener('click', actionHandler);
        return button;
    }

    function navigateToPage(pageUrl) {
        window.location.href = pageUrl;
    }

    // --- Funciones de voz ---
    function speakMessage(text) {
        // Detener cualquier mensaje anterior
        if (currentUtterance) {
            SpeechSynthesis.cancel();
        }
        
        // Crear nuevo mensaje de voz
        currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Configurar la voz
        if (voices.length > 0) {
            const esVoice = voices.find(voice => voice.lang.startsWith('es'));
            if (esVoice) {
                currentUtterance.voice = esVoice;
            } else {
                currentUtterance.voice = voices[0];
            }
        }
        
        // Configurar propiedades de voz
        currentUtterance.lang = 'es-ES';
        currentUtterance.rate = 0.9; // Velocidad ligeramente más lenta
        currentUtterance.pitch = 1.0; // Tono normal
        currentUtterance.volume = 0.8; // Volumen al 80%
        
        // Eventos de la voz
        currentUtterance.onstart = () => {
            console.log('Iniciando síntesis de voz:', text);
        };
        
        currentUtterance.onend = () => {
            console.log('Síntesis de voz completada');
            currentUtterance = null;
        };
        
        currentUtterance.onerror = (event) => {
            console.error('Error en síntesis de voz:', event.error);
            currentUtterance = null;
        };
        
        // Iniciar la síntesis de voz
        SpeechSynthesis.speak(currentUtterance);
    }
    
    function stopSpeaking() {
        if (SpeechSynthesis.speaking) {
            SpeechSynthesis.cancel();
            currentUtterance = null;
        }
    }
    
    function toggleVoice() {
        if (SpeechSynthesis.speaking) {
            stopSpeaking();
        } else {
            // Si no está hablando, leer el último mensaje del bot
            const botMessages = document.querySelectorAll('.bot-message');
            if (botMessages.length > 0) {
                const lastMessage = botMessages[botMessages.length - 1];
                const text = lastMessage.textContent || lastMessage.innerText || '';
                if (text.trim()) {
                    speakMessage(text);
                }
            }
        }
    }

    function toggleVoiceEnabled() {
        isVoiceEnabled = !isVoiceEnabled;
        
        if (isVoiceEnabled) {
            speakMessage("Voz activada. Ahora puedo leer mis mensajes en voz alta.");
        } else {
            stopSpeaking();
            speakMessage("Voz desactivada. Ya no leeré mis mensajes en voz alta.");
        }
        
        // Actualizar el estado visual del botón
        const icon = medibotVoice.querySelector('i');
        if (isVoiceEnabled) {
            icon.className = 'fas fa-volume-up';
            medibotVoice.classList.add('active');
            medibotVoice.setAttribute('aria-label', 'Desactivar voz');
        } else {
            icon.className = 'fas fa-volume-mute';
            medibotVoice.classList.remove('active');
            medibotVoice.setAttribute('aria-label', 'Activar voz');
        }
    }

    function toggleVoiceInput() {
        if (!recognition) {
            addBotMessage(`<div class="medibot-card error-message">
                <h4><i class="fas fa-exclamation-triangle"></i> Función No Disponible</h4>
                <p>El reconocimiento de voz no está disponible en tu navegador.</p>
                <p>Puedes escribir tu mensaje manualmente.</p>
            </div>`);
            return;
        }

        if (isRecording) {
            // Detener la grabación
            recognition.stop();
        } else {
            // Iniciar la grabación
            try {
                recognition.start();
                addBotMessage(`<div class="medibot-card">
                    <h4><i class="fas fa-microphone"></i> Escuchando...</h4>
                    <p>Habla ahora. Te escucho.</p>
                </div>`);
            } catch (error) {
                console.error('Error al iniciar reconocimiento de voz:', error);
                addBotMessage(`<div class="medibot-card error-message">
                    <h4><i class="fas fa-exclamation-triangle"></i> Error</h4>
                    <p>No se pudo iniciar el reconocimiento de voz.</p>
                    <p>Verifica que tengas permisos para usar el micrófono.</p>
                </div>`);
            }
        }
    }

    // --- 5. Mensajes y respuestas ---
    function showWelcomeMessage() {
        const currentTime = new Date().getHours();
        let greeting = '';
        
        if (currentTime < 12) {
            greeting = '¡Buenos días';
        } else if (currentTime < 18) {
            greeting = '¡Buenas tardes';
        } else {
            greeting = '¡Buenas noches';
        }

        const welcomeMessageHTML = `
            <div class="medibot-card">
                <h4><i class="fas fa-robot"></i> ${greeting} ${userData.name}!</h4>
                <p>Soy MediBot, tu asistente de salud personal. Estoy aquí para ayudarte con:</p>
                <ul>
                    <li>Gestión de citas médicas</li>
                    <li>Recordatorios de medicación</li>
                    <li>Consejos de salud personalizados</li>
                    <li>Soporte en emergencias</li>
                </ul>
                <p>¿En qué puedo ayudarte hoy? Puedes elegir una opción rápida o escribirme tu pregunta.</p>
            </div>
        `;
        addBotMessage(welcomeMessageHTML);
        setupQuickActions();
    }

    function setupQuickActions() {
        medibotQuickActions.innerHTML = '';

        const actions = [
            { text: '<i class="fas fa-clipboard-list"></i> Mi Resumen', action: showDailySummary },
            { text: '<i class="fas fa-calendar-alt"></i> Mis Citas', action: showAppointments },
            { text: '<i class="fas fa-pills"></i> Mi Medicación', action: showMedications },
            { text: '<i class="fas fa-lightbulb"></i> Consejos de Salud', action: showHealthTips },
            { text: '<i class="fas fa-plus-circle"></i> Registrar Síntoma', action: startSymptomLogging }
        ];

        actions.forEach(action => {
            const button = createQuickActionButton(action.text, action.action);
            medibotQuickActions.appendChild(button);
        });
    }

    function showDailySummary() {
        const numMedications = userData.medications.length;
        const numAppointments = userData.appointments.length;

        let summaryHTML = `<div class="medibot-card"><h4><i class="fas fa-clipboard-list"></i> Tu Resumen de Hoy</h4>`;

        if (numMedications > 0) {
            summaryHTML += `<p>Tienes <strong>${numMedications}</strong> medicamento(s) registrado(s). Asegúrate de tomar tus dosis a tiempo.</p>`;
        } else {
            summaryHTML += `<p>No tienes medicamentos registrados para hoy.</p>`;
        }
        
        if (numAppointments > 0) {
            summaryHTML += `<p>Tienes <strong>${numAppointments}</strong> cita(s) programada(s). Revisa la sección de Citas para más detalles.</p>`;
        } else {
            summaryHTML += `<p>No tienes citas programadas para hoy.</p>`;
        }
        
        summaryHTML += `<p>¡Sigue cuidándote! Si necesitas registrar síntomas o actividades, usa el Historial Médico.</p>
            <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
                <button class="quick-action-btn" onclick="navigateToPage('Registrar-medicacion.html')">
                    <i class="fas fa-pills"></i> Registrar Medicación
                </button>
                <button class="quick-action-btn" onclick="navigateToPage('HistorialMedico.html')">
                    <i class="fas fa-history"></i> Historial Médico
                </button>
            </div>
        </div>`;
        addBotMessage(summaryHTML);
    }

    function showAppointments() {
        let messageHTML = `
            <div class="medibot-card">
                <h4><i class="fas fa-calendar-alt"></i> Tus Próximas Citas</h4>
        `;

        if (userData.appointments.length > 0) {
            userData.appointments.forEach(appt => {
                messageHTML += `
                    <p><strong>${appt.doctor}</strong> (${appt.specialty})</p>
                    <p>${appt.date} a las ${appt.time}</p>
                    <hr>
                `;
            });
        } else {
            messageHTML += `<p>No tienes citas programadas actualmente.</p>`;
        }

        messageHTML += `
                <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
                    <button class="quick-action-btn" onclick="navigateToPage('Citas.html')">
                        <i class="fas fa-external-link-alt"></i> Ir a Citas
                    </button>
                </div>
            </div>
        `;
        addBotMessage(messageHTML);
    }

    function showMedications() {
        let messageHTML = `
            <div class="medibot-card">
                <h4><i class="fas fa-pills"></i> Tu Medicación Actual</h4>
        `;

        if (userData.medications.length > 0) {
            userData.medications.forEach(med => {
                messageHTML += `
                    <p><strong>${med.name}</strong> (${med.dose})</p>
                    <p>Horario: ${med.time}</p>
                    <p>Última toma: ${med.lastTaken || 'No registrada'}</p>
                    <hr>
                `;
            });
        } else {
            messageHTML += `<p>No tienes medicamentos registrados actualmente.</p>`;
        }

        messageHTML += `
                <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
                    <button class="quick-action-btn" onclick="navigateToPage('Registrar-medicacion.html')">
                        <i class="fas fa-external-link-alt"></i> Ir a Medicación
                    </button>
                </div>
            </div>
        `;
        addBotMessage(messageHTML);
    }

    function showHealthTips() {
        const randomIndex = Math.floor(Math.random() * userData.healthTips.length);
        const tip = userData.healthTips[randomIndex];

        let messageHTML = `
            <div class="medibot-card">
                <h4><i class="fas fa-lightbulb"></i> Consejo de Salud: ${tip.category}</h4>
                <p>${tip.text}</p>
                <p class="tip">${tip.tip}</p>
                <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
                    <button class="quick-action-btn" onclick="showHealthTips()">
                        <i class="fas fa-random"></i> Otro Consejo
                    </button>
                    <button class="quick-action-btn" onclick="navigateToPage('ConsejosSalud.html')">
                        <i class="fas fa-external-link-alt"></i> Ver más consejos
                    </button>
                </div>
            </div>
        `;
        addBotMessage(messageHTML);
    }

    function showRandomCuriosity() {
        const randomIndex = Math.floor(Math.random() * userData.curiosities.length);
        const curiosity = userData.curiosities[randomIndex];
        addBotMessage(`
            <div class="medibot-card">
                <h4><i class="fas fa-question-circle"></i> Dato Curioso</h4>
                <p>${curiosity}</p>
                <button class="quick-action-btn" onclick="showRandomCuriosity()">
                    <i class="fas fa-random"></i> Otra Curiosidad
                </button>
            </div>
        `);
    }

    function startSymptomLogging() {
        currentConversationState = 'logging_symptom_name';
        addBotMessage("Claro, ¿qué síntoma te gustaría registrar? Por ejemplo: 'dolor de cabeza', 'fiebre', 'cansancio'.");
    }

    function continueSymptomLogging(message) {
        if (currentConversationState === 'logging_symptom_name') {
            conversationData.currentSymptom = { name: message };
            currentConversationState = 'logging_symptom_details';
            addBotMessage(`Entendido, ¿qué intensidad tiene el ${message}? (leve, moderada, grave) ¿Y hace cuánto tiempo lo sientes?`);
        } else if (currentConversationState === 'logging_symptom_details') {
            const lowerCaseMessage = message.toLowerCase();
            const intensityMatch = lowerCaseMessage.match(/(leve|moderada|grave)/);
            const durationMatch = lowerCaseMessage.match(/(\d+)\s*(horas?|dias?|minutos?)/);

            let intensity = intensityMatch ? intensityMatch[1] : 'no especificada';
            let duration = durationMatch ? `${durationMatch[1]} ${durationMatch[2]}` : 'no especificada';

            conversationData.currentSymptom.intensity = intensity;
            conversationData.currentSymptom.duration = duration;
            conversationData.currentSymptom.timestamp = new Date().toLocaleString('es-ES');

            let confirmationMessage = `Perfecto, he registrado tu síntoma: <strong>${conversationData.currentSymptom.name}</strong>, intensidad <strong>${conversationData.currentSymptom.intensity}</strong>, duración <strong>${conversationData.currentSymptom.duration}</strong>.`;
            addBotMessage(confirmationMessage + " Recuerda que soy un asistente de información. Para un diagnóstico o tratamiento médico, siempre consulta a un profesional de la salud.");
            currentConversationState = 'initial';
            conversationData = {};
            setupQuickActions();
        }
    }

    // --- 6. Procesamiento de mensajes ---
    function processUserMessage(message) {
        const lowerCaseMessage = message.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // Manejo del estado de conversación para flujos guiados
        if (currentConversationState.startsWith('logging_symptom')) {
            continueSymptomLogging(message);
            return;
        }

        // Respuestas basadas en palabras clave
        if (lowerCaseMessage.includes("hola") || lowerCaseMessage.includes("saludos") || lowerCaseMessage.includes("que tal")) {
            showWelcomeMessage();
        } else if (lowerCaseMessage.includes("cita") || lowerCaseMessage.includes("citas") || lowerCaseMessage.includes("doctor")) {
            showAppointments();
        } else if (lowerCaseMessage.includes("medicamento") || lowerCaseMessage.includes("medicina") || lowerCaseMessage.includes("pildora")) {
            showMedications();
        } else if (lowerCaseMessage.includes("consejo") || lowerCaseMessage.includes("salud") || lowerCaseMessage.includes("tip")) {
            showHealthTips();
        } else if (lowerCaseMessage.includes("como estoy hoy") || lowerCaseMessage.includes("mi resumen") || lowerCaseMessage.includes("que tengo hoy")) {
            showDailySummary();
        } else if (lowerCaseMessage.includes("dato curioso") || lowerCaseMessage.includes("curiosidad")) {
            showRandomCuriosity();
        } else if (lowerCaseMessage.includes("sintoma") || lowerCaseMessage.includes("sintomas")) {
            startSymptomLogging();
        } else if (lowerCaseMessage.includes("gracias") || lowerCaseMessage.includes("muchas gracias")) {
            addBotMessage("De nada, estoy aquí para ayudarte. 😊");
        } else if (lowerCaseMessage.includes("ayuda") || lowerCaseMessage.includes("que puedes hacer")) {
            showWelcomeMessage();
        } else {
            addBotMessage("Lo siento, no he entendido tu solicitud. ¿Podrías reformularla? O quizás, ¿alguna de estas opciones te ayuda?");
            setupQuickActions();
        }
    }

    // --- 7. Manejo de notificaciones ---
    function incrementUnreadMessages() {
        unreadMessages++;
        notificationBadge.textContent = unreadMessages;
        notificationBadge.classList.remove('hidden');
        medibotToggle.classList.add('pulse');
    }

    function resetUnreadMessages() {
        unreadMessages = 0;
        notificationBadge.classList.add('hidden');
        medibotToggle.classList.remove('pulse');
    }

    // --- 8. Event Listeners ---
    medibotToggle.addEventListener('click', toggleMedibot);

    medibotHeader.addEventListener('click', (e) => {
        if (!e.target.closest('.control-btn')) {
            toggleMinimize();
        }
    });

    medibotMinimize.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMinimize();
    });

    medibotClose.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMedibot();
    });

    // Event listener para el botón de voz
    if (medibotVoice) {
        medibotVoice.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleVoiceEnabled();
        });
    }

    // Event listener para el botón de micrófono
    if (medibotVoiceInput) {
        medibotVoiceInput.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleVoiceInput();
        });
    }

    medibotSendButton.addEventListener('click', () => {
        const messageText = medibotInput.value.trim();
        if (messageText) {
            addUserMessage(messageText);
        }
    });

    medibotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            medibotSendButton.click();
        }
    });

    // --- 9. Funciones globales ---
    window.showWelcomeMessage = showWelcomeMessage;
    window.showDailySummary = showDailySummary;
    window.showAppointments = showAppointments;
    window.showMedications = showMedications;
    window.showHealthTips = showHealthTips;
    window.showRandomCuriosity = showRandomCuriosity;
    window.startSymptomLogging = startSymptomLogging;
    window.navigateToPage = navigateToPage;
    window.setupQuickActions = setupQuickActions;
    window.speakMessage = speakMessage;
    window.stopSpeaking = stopSpeaking;
    window.toggleVoice = toggleVoice;
    window.toggleVoiceEnabled = toggleVoiceEnabled;
    window.toggleVoiceInput = toggleVoiceInput;

    // --- 10. Inicialización ---
    // Inicializar el reconocimiento de voz cuando el DOM esté listo
    initializeSpeechRecognition();
});
