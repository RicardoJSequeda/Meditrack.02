document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const showForgotPasswordLink = document.getElementById('show-forgot-password');
    const showLoginFromForgotLink = document.getElementById('show-login-from-forgot');
    const showLoginFromResetLink = document.getElementById('show-login-from-reset');
    const formTitle = document.getElementById('form-title');
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const messageCloseBtn = document.getElementById('message-close');

    // Variables para rate limiting
    let loginAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
    let currentUserAttempts = 0;
    let isAccountLocked = false;
    let lockoutTime = 0;

    // Usuarios almacenados en memoria (simulación de base de datos)
    // Se inicializa con un usuario por defecto
    let users = [
        { username: 'Maria', password: 'Maria123', fullname: 'María López', email: 'maria.lopez@email.com' }
    ];

    // Cargar usuarios desde localStorage si existen
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (savedUsers.length > 0) {
        users = savedUsers;
    }

    // Función para verificar rate limiting
    function checkRateLimit(username) {
        const now = Date.now();
        const userAttempts = loginAttempts[username] || { count: 0, lastAttempt: 0, lockoutUntil: 0 };
        
        // Si la cuenta está bloqueada, verificar si ya pasó el tiempo
        if (userAttempts.lockoutUntil > now) {
            const remainingTime = Math.ceil((userAttempts.lockoutUntil - now) / 1000 / 60);
            return { blocked: true, remainingMinutes: remainingTime };
        }
        
        // Si han pasado más de 15 minutos desde el último intento, resetear contador
        if (now - userAttempts.lastAttempt > 15 * 60 * 1000) {
            userAttempts.count = 0;
        }
        
        return { blocked: false, attempts: userAttempts.count };
    }

    // Función para registrar intento de login
    function recordLoginAttempt(username, success) {
        const now = Date.now();
        const userAttempts = loginAttempts[username] || { count: 0, lastAttempt: 0, lockoutUntil: 0 };
        
        if (success) {
            // Resetear contador en login exitoso
            userAttempts.count = 0;
            userAttempts.lockoutUntil = 0;
        } else {
            // Incrementar contador en login fallido
            userAttempts.count++;
            userAttempts.lastAttempt = now;
            
            // Bloquear cuenta después de 5 intentos fallidos
            if (userAttempts.count >= 5) {
                userAttempts.lockoutUntil = now + (15 * 60 * 1000); // 15 minutos
            }
        }
        
        loginAttempts[username] = userAttempts;
        localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
    }

    // Función para calcular fortaleza de contraseña
    function calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];
        
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        
        if (password.length < 6) {
            return { strength: 'weak', score: 0, text: 'Muy débil' };
        } else if (score <= 2) {
            return { strength: 'weak', score: score, text: 'Débil' };
        } else if (score <= 3) {
            return { strength: 'fair', score: score, text: 'Regular' };
        } else if (score <= 4) {
            return { strength: 'good', score: score, text: 'Buena' };
        } else {
            return { strength: 'strong', score: score, text: 'Fuerte' };
        }
    }

    // Función para actualizar indicador de fortaleza de contraseña
    function updatePasswordStrength(password, strengthElementId) {
        const strengthElement = document.getElementById(strengthElementId);
        if (!strengthElement) return;
        
        const strength = calculatePasswordStrength(password);
        
        strengthElement.innerHTML = `
            <div class="strength-bar ${strength.strength}"></div>
            <div class="strength-bar ${strength.score >= 2 ? strength.strength : ''}"></div>
            <div class="strength-bar ${strength.score >= 3 ? strength.strength : ''}"></div>
            <div class="strength-bar ${strength.score >= 4 ? strength.strength : ''}"></div>
            <div class="strength-bar ${strength.score >= 5 ? strength.strength : ''}"></div>
            <span class="strength-text ${strength.strength}">${strength.text}</span>
        `;
    }

    // Función para generar código de recuperación
    function generateRecoveryCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Función para enviar código de recuperación (simulado)
    function sendRecoveryCode(email) {
        const code = generateRecoveryCode();
        localStorage.setItem('recoveryCode', code);
        localStorage.setItem('recoveryEmail', email);
        
        // Simular envío de email
        console.log(`Código de recuperación enviado a ${email}: ${code}`);
        return true;
    }

    // Función para validar código de recuperación
    function validateRecoveryCode(code) {
        const storedCode = localStorage.getItem('recoveryCode');
        return code === storedCode;
    }

    /**
     * Muestra un mensaje en la caja de mensajes.
     * @param {string} message - El texto del mensaje.
     * @param {string} type - El tipo de mensaje ('success' o 'error').
     */
    const showMessage = (message, type) => {
        messageText.textContent = message;
        messageBox.className = `message-box show ${type}`; // Añade clases para mostrar y tipo
        setTimeout(() => {
            messageBox.classList.remove('show'); // Oculta el mensaje después de 3 segundos
        }, 3000);
    };

    // Cierra el mensaje al hacer clic en el botón 'X'
    messageCloseBtn.addEventListener('click', () => {
        messageBox.classList.remove('show');
    });

    /**
     * Alterna la visibilidad de la contraseña en un campo de entrada.
     * @param {string} inputId - El ID del campo de entrada de contraseña.
     */
    window.togglePasswordVisibility = (inputId) => {
        const passwordInput = document.getElementById(inputId);
        const icon = passwordInput.nextElementSibling.querySelector('i'); // El icono es el siguiente hermano del input

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };

    /**
     * Verifica si 2FA está habilitado para un usuario
     */
    function is2FAEnabled(username) {
        const twoFactorAuth = JSON.parse(localStorage.getItem('twoFactorAuth') || 'false');
        return twoFactorAuth;
    }

    /**
     * Valida código 2FA
     */
    function validate2FACode(code) {
        const secret = localStorage.getItem('twoFactorSecret');
        if (!secret) return false;
        
        // Simular validación TOTP (mismo algoritmo que en PerfilConfiguracion.js)
        const timestamp = Math.floor(Date.now() / 30000);
        const hash = btoa(secret + timestamp).replace(/[^0-9]/g, '');
        const expectedCode = hash.substring(0, 6).padStart(6, '0');
        
        return code === expectedCode;
    }

    // Variables para el modal de autorización social
    let currentProvider = '';
    let currentUserData = {};

    /**
     * Maneja el login social
     * @param {string} provider - El proveedor de login social ('google', 'facebook', 'gmail')
     */
    window.socialLogin = (provider) => {
        currentProvider = provider;
        
        // Configurar datos según el proveedor
        switch(provider) {
            case 'google':
                currentUserData = {
                    username: 'usuario_google',
                    fullname: 'Usuario Google',
                    email: 'usuario.google@gmail.com',
                    provider: 'Google'
                };
                break;
            case 'facebook':
                currentUserData = {
                    username: 'usuario_facebook',
                    fullname: 'Usuario Facebook',
                    email: 'usuario.facebook@email.com',
                    provider: 'Facebook'
                };
                break;
            case 'gmail':
                currentUserData = {
                    username: 'usuario_gmail',
                    fullname: 'Usuario Gmail',
                    email: 'usuario.gmail@gmail.com',
                    provider: 'Gmail'
                };
                break;
        }
        
        // Mostrar modal de autorización
        showSocialAuthModal(provider, currentUserData);
    };

    /**
     * Muestra el modal de autorización social
     * @param {string} provider - El proveedor de login social
     * @param {object} userData - Los datos del usuario
     */
    function showSocialAuthModal(provider, userData) {
        const modal = document.getElementById('social-auth-modal');
        const providerIcon = document.getElementById('modal-provider-icon');
        const providerTitle = document.getElementById('modal-provider-title');
        const userName = document.getElementById('modal-user-name');
        const userEmail = document.getElementById('modal-user-email');
        const providerName = document.getElementById('modal-provider-name');
        
        // Configurar icono y título según el proveedor
        switch(provider) {
            case 'google':
                providerIcon.className = 'fab fa-google';
                providerTitle.textContent = 'Autorización de Google';
                break;
            case 'facebook':
                providerIcon.className = 'fab fa-facebook-f';
                providerTitle.textContent = 'Autorización de Facebook';
                break;
            case 'gmail':
                providerIcon.className = 'fas fa-envelope';
                providerTitle.textContent = 'Autorización de Gmail';
                break;
        }
        
        // Actualizar datos del usuario
        userName.textContent = userData.fullname;
        userEmail.textContent = userData.email;
        providerName.textContent = userData.provider;
        
        // Mostrar modal con animación
        modal.classList.add('show');
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    }

    /**
     * Cierra el modal de autorización social
     */
    window.closeSocialModal = () => {
        const modal = document.getElementById('social-auth-modal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Restaurar botón social
        const btn = event.target.closest('.social-btn') || document.querySelector('.social-btn');
        if (btn) {
            btn.disabled = false;
            const provider = currentProvider;
            switch(provider) {
                case 'google':
                    btn.innerHTML = '<i class="fab fa-google"></i><span>Google</span>';
                    break;
                case 'facebook':
                    btn.innerHTML = '<i class="fab fa-facebook-f"></i><span>Facebook</span>';
                    break;
                case 'gmail':
                    btn.innerHTML = '<i class="fas fa-envelope"></i><span>Gmail</span>';
                    break;
            }
        }
    };

    /**
     * Confirma la autorización social
     */
    window.confirmSocialAuth = () => {
        const confirmBtn = document.getElementById('confirm-auth-btn');
        const originalText = confirmBtn.innerHTML;
        
        // Mostrar loading en el botón de confirmación
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Autorizando...</span>';
        confirmBtn.disabled = true;
        
        // Simular proceso de autorización
        setTimeout(() => {
            // Guardar datos del usuario
            localStorage.setItem('currentUser', JSON.stringify(currentUserData));
            localStorage.setItem('isLoggedIn', 'true');
            
            // Cerrar modal
            closeSocialModal();
            
            // Mostrar mensaje de éxito
            showMessage(`¡Bienvenido! Has iniciado sesión con ${currentUserData.provider}`, 'success');
            
            // Simular redirección después de 1.5 segundos
            setTimeout(() => {
                window.location.href = 'Inicio.html';
            }, 1500);
            
        }, 2000); // Simular 2 segundos de autorización
    };

    // Event listener para cerrar modal al hacer clic fuera
    document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('social-auth-modal');
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeSocialModal();
            }
        });
        
        // Cerrar modal con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeSocialModal();
            }
        });
    });

    /**
     * Muestra modal de 2FA
     */
    function show2FAModal(callback) {
        // Crear modal de 2FA dinámicamente
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-shield-alt"></i> Verificación en Dos Pasos</h2>
                    <button class="close-button" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="twofa-login">
                        <div class="qr-section">
                            <h3>Ingresa tu código de verificación</h3>
                            <p>Usa tu aplicación de autenticación para generar un código de 6 dígitos</p>
                            <div class="form-group">
                                <input type="text" id="login2FACode" placeholder="000000" maxlength="6" style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem; width: 200px; margin: 0 auto; display: block;">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="secondary-button" onclick="this.closest('.modal').remove()">Cancelar</button>
                    <button type="button" class="primary-button" id="verifyLogin2FA">
                        <i class="fas fa-check"></i> Verificar y Continuar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar validación
        document.getElementById('verifyLogin2FA').addEventListener('click', function() {
            const code = document.getElementById('login2FACode').value;
            
            if (!code || code.length !== 6) {
                showMessage('Por favor ingresa un código de 6 dígitos', 'error');
                return;
            }
            
            if (validate2FACode(code)) {
                modal.remove();
                callback(true);
            } else {
                showMessage('Código incorrecto. Por favor verifica e intenta de nuevo', 'error');
                document.getElementById('login2FACode').value = '';
                document.getElementById('login2FACode').focus();
            }
        });
        
        // Auto-focus en el campo de código
        setTimeout(() => {
            document.getElementById('login2FACode').focus();
        }, 100);
    }

    /**
     * Muestra el formulario de registro con animación.
     */
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        // Pequeño retraso para que la animación de salida del login se vea antes de la entrada del registro
        setTimeout(() => {
            registerForm.classList.add('active');
            formTitle.textContent = 'Registrarse';
            clearFormErrors(); // Limpia errores al cambiar de formulario
        }, 300); // Ajusta este tiempo si la animación no se ve fluida
    });

    /**
     * Muestra el formulario de inicio de sesión con animación.
     */
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.remove('active');
        forgotPasswordForm.classList.remove('active');
        resetPasswordForm.classList.remove('active');
        // Pequeño retraso para que la animación de salida del registro se vea antes de la entrada del login
        setTimeout(() => {
            loginForm.classList.add('active');
            formTitle.textContent = 'Iniciar Sesión';
            clearFormErrors(); // Limpia errores al cambiar de formulario
        }, 300); // Ajusta este tiempo si la animación no se ve fluida
    });

    /**
     * Muestra el formulario de recuperación de contraseña.
     */
    showForgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        registerForm.classList.remove('active');
        resetPasswordForm.classList.remove('active');
        setTimeout(() => {
            forgotPasswordForm.classList.add('active');
            formTitle.textContent = 'Recuperar Contraseña';
            clearFormErrors();
        }, 300);
    });

    /**
     * Vuelve al login desde recuperación de contraseña.
     */
    showLoginFromForgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordForm.classList.remove('active');
        setTimeout(() => {
            loginForm.classList.add('active');
            formTitle.textContent = 'Iniciar Sesión';
            clearFormErrors();
        }, 300);
    });

    /**
     * Vuelve al login desde reset de contraseña.
     */
    showLoginFromResetLink.addEventListener('click', (e) => {
        e.preventDefault();
        resetPasswordForm.classList.remove('active');
        setTimeout(() => {
            loginForm.classList.add('active');
            formTitle.textContent = 'Iniciar Sesión';
            clearFormErrors();
        }, 300);
    });

    /**
     * Limpia todos los mensajes de error de los formularios.
     */
    const clearFormErrors = () => {
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    };

    // Event listeners para indicador de fortaleza de contraseña
    document.getElementById('register-password').addEventListener('input', (e) => {
        updatePasswordStrength(e.target.value, 'register-password-strength');
    });

    document.getElementById('reset-new-password').addEventListener('input', (e) => {
        updatePasswordStrength(e.target.value, 'reset-password-strength');
    });

    /**
     * Valida los campos del formulario de registro.
     * @param {string} fullname - El nombre completo.
     * @param {string} email - El correo electrónico.
     * @param {string} username - El nombre de usuario.
     * @param {string} password - La contraseña.
     * @param {string} confirmPassword - La confirmación de la contraseña.
     * @returns {boolean} - True si la validación es exitosa, false en caso contrario.
     */
    const validateRegisterForm = (fullname, email, username, password, confirmPassword) => {
        let isValid = true;
        clearFormErrors();

        // Validación de nombre completo
        if (fullname.length < 2) {
            document.getElementById('register-fullname-error').textContent = 'El nombre debe tener al menos 2 caracteres.';
            isValid = false;
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(fullname)) {
            document.getElementById('register-fullname-error').textContent = 'El nombre solo puede contener letras y espacios.';
            isValid = false;
        }

        // Validación de correo electrónico
        if (!email) {
            document.getElementById('register-email-error').textContent = 'El correo electrónico es obligatorio.';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('register-email-error').textContent = 'Por favor ingresa un correo electrónico válido.';
            isValid = false;
        } else if (users.some(user => user.email && user.email.toLowerCase() === email.toLowerCase())) {
            document.getElementById('register-email-error').textContent = 'Este correo electrónico ya está registrado.';
            isValid = false;
        }

        // Validación de nombre de usuario
        if (username.length < 3) {
            document.getElementById('register-username-error').textContent = 'El usuario debe tener al menos 3 caracteres.';
            isValid = false;
        } else if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
            document.getElementById('register-username-error').textContent = 'Este usuario ya existe.';
            isValid = false;
        }

        // Validación de contraseña
        if (password.length < 6) {
            document.getElementById('register-password-error').textContent = 'La contraseña debe tener al menos 6 caracteres.';
            isValid = false;
        } else if (!/[A-Z]/.test(password)) {
            document.getElementById('register-password-error').textContent = 'La contraseña debe contener al menos una mayúscula.';
            isValid = false;
        } else if (!/[a-z]/.test(password)) {
            document.getElementById('register-password-error').textContent = 'La contraseña debe contener al menos una minúscula.';
            isValid = false;
        } else if (!/[0-9]/.test(password)) {
            document.getElementById('register-password-error').textContent = 'La contraseña debe contener al menos un número.';
            isValid = false;
        }

        // Validación de confirmación de contraseña
        if (password !== confirmPassword) {
            document.getElementById('register-confirm-password-error').textContent = 'Las contraseñas no coinciden.';
            isValid = false;
        }

        return isValid;
    };

    /**
     * Maneja el envío del formulario de registro.
     */
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullname = document.getElementById('register-fullname').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const confirmPassword = document.getElementById('register-confirm-password').value.trim();

        if (validateRegisterForm(fullname, email, username, password, confirmPassword)) {
            // Si la validación es exitosa, añade el nuevo usuario
            users.push({ username, password, fullname, email });
            
            // Guardar en localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            showMessage('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
            // Limpia los campos del formulario de registro
            registerForm.reset();
            // Vuelve al formulario de login
            setTimeout(() => {
                showLoginLink.click(); // Simula un clic para volver al login
            }, 1500); // Pequeño retraso para que el usuario vea el mensaje de éxito
        } else {
            showMessage('Por favor, corrige los errores en el formulario de registro.', 'error');
        }
    });

    /**
     * Maneja el envío del formulario de recuperación de contraseña.
     */
    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value.trim();
        
        if (!email) {
            document.getElementById('forgot-email-error').textContent = 'Por favor ingresa tu correo electrónico.';
            return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('forgot-email-error').textContent = 'Por favor ingresa un correo electrónico válido.';
            return;
        }
        
        // Verificar si el correo electrónico existe en la base de datos
        const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            document.getElementById('forgot-email-error').textContent = 'No se encontró una cuenta con este correo electrónico.';
            return;
        }
        
        // Simular envío de código
        const button = e.target.querySelector('button');
        const originalText = button.textContent;
        button.innerHTML = '<span class="loading-spinner"></span> Enviando...';
        button.disabled = true;
        
        setTimeout(() => {
            if (sendRecoveryCode(email)) {
                showMessage('Código de recuperación enviado a tu correo electrónico.', 'success');
                // Cambiar al formulario de reset
                forgotPasswordForm.classList.remove('active');
                setTimeout(() => {
                    resetPasswordForm.classList.add('active');
                    formTitle.textContent = 'Cambiar Contraseña';
                    clearFormErrors();
                }, 300);
            } else {
                showMessage('Error al enviar el código. Por favor intenta de nuevo.', 'error');
            }
            
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
    });

    /**
     * Maneja el envío del formulario de cambio de contraseña.
     */
    resetPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('reset-code').value.trim();
        const newPassword = document.getElementById('reset-new-password').value.trim();
        const confirmPassword = document.getElementById('reset-confirm-password').value.trim();
        
        // Validar código
        if (!validateRecoveryCode(code)) {
            document.getElementById('reset-code-error').textContent = 'Código de verificación incorrecto.';
            return;
        }
        
        // Validar nueva contraseña
        const passwordStrength = calculatePasswordStrength(newPassword);
        if (passwordStrength.strength === 'weak') {
            document.getElementById('reset-new-password-error').textContent = 'La contraseña es muy débil.';
            return;
        }
        
        // Validar confirmación
        if (newPassword !== confirmPassword) {
            document.getElementById('reset-confirm-password-error').textContent = 'Las contraseñas no coinciden.';
            return;
        }
        
        // Actualizar contraseña del usuario
        const email = localStorage.getItem('recoveryEmail');
        const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
            user.password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.removeItem('recoveryCode');
            localStorage.removeItem('recoveryEmail');
            
            showMessage('Contraseña actualizada correctamente. Puedes iniciar sesión.', 'success');
            resetPasswordForm.reset();
            
            setTimeout(() => {
                showLoginFromResetLink.click();
            }, 1500);
        } else {
            showMessage('No se encontró una cuenta con ese correo electrónico.', 'error');
        }
    });

    /**
     * Registra un evento de actividad de inicio de sesión en localStorage
     */
    function logLoginActivity({ username, status }) {
        const activities = JSON.parse(localStorage.getItem('loginActivity') || '[]');
        // Simular dispositivo y ubicación
        const device = navigator.userAgent.includes('Mobile') ? 'Android - Chrome Mobile' : 'Chrome - Windows';
        const location = device.includes('Mobile') ? 'Barranquilla, Colombia' : 'Montería, Colombia';
        const now = new Date();
        activities.unshift({
            username,
            status, // 'success' o 'fail'
            device,
            location,
            time: now.toISOString()
        });
        // Limitar a los últimos 20 eventos
        localStorage.setItem('loginActivity', JSON.stringify(activities.slice(0, 20)));
    }

    /**
     * Registra un dispositivo autorizado en localStorage
     */
    function registerAuthorizedDevice(username) {
        const devices = JSON.parse(localStorage.getItem('authorizedDevices') || '[]');
        const deviceId = getDeviceId();
        const deviceName = navigator.userAgent.includes('Mobile') ? 'Android - Chrome Mobile' : 'Chrome - Windows';
        const location = deviceName.includes('Mobile') ? 'Barranquilla, Colombia' : 'Montería, Colombia';
        const now = new Date();
        // Si ya existe, actualiza la fecha y estado
        const existing = devices.find(d => d.deviceId === deviceId && d.username === username);
        if (existing) {
            existing.lastActive = now.toISOString();
            existing.status = 'active';
        } else {
            devices.push({
                deviceId,
                username,
                deviceName,
                location,
                firstLogin: now.toISOString(),
                lastActive: now.toISOString(),
                status: 'active'
            });
        }
        localStorage.setItem('authorizedDevices', JSON.stringify(devices));
    }

    /**
     * Obtiene un identificador único para el dispositivo actual
     */
    function getDeviceId() {
        let id = localStorage.getItem('deviceId');
        if (!id) {
            id = 'dev-' + Math.random().toString(36).substr(2, 12);
            localStorage.setItem('deviceId', id);
        }
        return id;
    }

    /**
     * Maneja el envío del formulario de inicio de sesión.
     */
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        // Verificar rate limiting
        const rateLimit = checkRateLimit(username);
        if (rateLimit.blocked) {
            showMessage(`Cuenta bloqueada temporalmente. Intenta de nuevo en ${rateLimit.remainingMinutes} minutos.`, 'error');
            return;
        }

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Registrar intento exitoso
            recordLoginAttempt(username, true);
            
            // Guardar el nombre completo del usuario en localStorage para usar en la bienvenida
            if (user.fullname) {
                localStorage.setItem('userName', user.fullname);
            } else {
                // Si no hay nombre completo, usar el username como fallback
                localStorage.setItem('userName', user.username);
            }
            
            // Registrar actividad exitosa
            logLoginActivity({ username, status: 'success' });
            // Registrar dispositivo autorizado
            registerAuthorizedDevice(username);
            
            // Mostrar loading en el botón
            const button = e.target.querySelector('button');
            const originalText = button.textContent;
            button.innerHTML = '<span class="loading-spinner"></span> Iniciando sesión...';
            button.disabled = true;
            
            // Verificar si 2FA está habilitado
            if (is2FAEnabled(username)) {
                showMessage('Verificación en dos pasos requerida', 'info');
                show2FAModal((success) => {
                    if (success) {
                        showMessage(`¡Bienvenido, ${user.fullname || user.username}! Has iniciado sesión correctamente.`, 'success');
                        setTimeout(() => {
                            window.location.href = 'Inicio.html';
                        }, 1000);
                    } else {
                        button.textContent = originalText;
                        button.disabled = false;
                    }
                });
            } else {
                showMessage(`¡Bienvenido, ${user.fullname || user.username}! Has iniciado sesión correctamente.`, 'success');
                setTimeout(() => {
                    window.location.href = 'Inicio.html';
                }, 1000);
            }
        } else {
            // Registrar intento fallido
            recordLoginAttempt(username, false);
            logLoginActivity({ username, status: 'fail' });
            
            const attempts = rateLimit.attempts + 1;
            if (attempts >= 3) {
                showMessage(`Usuario o contraseña incorrectos. ${5 - attempts} intentos restantes antes del bloqueo.`, 'error');
            } else {
                showMessage('Usuario o contraseña incorrectos.', 'error');
            }
        }
    });
});
