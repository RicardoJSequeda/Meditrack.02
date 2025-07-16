// ===== INICIALIZACIÓN DEL SIDEBAR =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar datos de perfil
    profileData = getProfileData();
    
    // Cargar sidebar
    loadSidebar();
    
    // Actualizar nombres en la página
    updateProfileNames();
    
    // Actualizar sidebar después de que se cargue
    setTimeout(() => {
        updateSidebarUserName();
    }, 100);
});

// Función para actualizar los nombres en la página de perfil
function updateProfileNames() {
    if (profileData) {
        // Actualizar nombre en el header
        const profileNameElement = document.getElementById('profileName');
        if (profileNameElement) {
            profileNameElement.textContent = profileData.name;
        }
        
        // Actualizar nombre en el campo de información
        const profileNameFieldElement = document.getElementById('profileNameField');
        if (profileNameFieldElement) {
            profileNameFieldElement.textContent = profileData.name;
        }
        
        // Actualizar email
        const profileEmailFieldElement = document.getElementById('profileEmailField');
        if (profileEmailFieldElement) {
            profileEmailFieldElement.textContent = profileData.email;
        }
        
        // Actualizar imagen de perfil
        const profileImageElement = document.getElementById('profileImage');
        if (profileImageElement) {
            profileImageElement.src = profileData.profileImage;
            profileImageElement.alt = `Foto de perfil de ${profileData.name}`;
        }
    }
}

// Función para actualizar el nombre del usuario en el sidebar
function updateSidebarUserName() {
    const sidebarUserNameElement = document.getElementById('sidebarUserName');
    if (sidebarUserNameElement && profileData) {
        sidebarUserNameElement.textContent = profileData.name;
    }
    
    // También actualizar usando la clase por compatibilidad
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement && profileData) {
        userNameElement.textContent = profileData.name;
    }
}

// Función para obtener datos de perfil dinámicos basados en el usuario autenticado
function getProfileData() {
    // Obtener el nombre del usuario desde localStorage
    const userName = localStorage.getItem('userName');
    
    if (!userName) {
        // Si no hay usuario autenticado, redirigir al login
        window.location.href = 'index.html';
        return null;
    }
    
    // Datos de perfil dinámicos basados en el usuario autenticado
    return {
        name: userName,
        role: "Paciente",
        email: `${userName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        phone: "+57 310 123 4567",
        address: "Calle 29 # 14-50, Montería, Córdoba",
        bio: `Paciente en MediTrack, interesada en el bienestar integral.`,
        profileImage: "https://placehold.co/150x150/b2dfdb/00796b?text=" + userName.split(' ').map(n => n[0]).join('').toUpperCase()
    };
}

// Variable global para los datos de perfil
let profileData = null;

// Traducciones para los elementos de la interfaz
const translations = {
    es: {
        profileAndSettings: "Perfil y Configuración",
        managePersonalInformation: "Gestiona tu información personal y preferencias de la cuenta.",
        profile: "Perfil",
        security: "Seguridad",
        preferences: "Preferencias",
        accountActions: "Acciones de Cuenta",
        personalInfo: "Información personal",
        contactDetails: "Datos de contacto",
        email: "Correo electrónico",
        phone: "Teléfono",
        address: "Dirección",
        saveChanges: "Guardar cambios",
        securitySettings: "Configuración de seguridad",
        changePassword: "Cambiar contraseña",
        updatePasswordRegularly: "Actualiza tu contraseña regularmente para mayor seguridad",
        change: "Cambiar",
        twoFactorAuth: "Verificación en dos pasos",
        addSecurityLayer: "Añade una capa adicional de seguridad a tu cuenta",
        loginActivity: "Actividad de inicio de sesión",
        reviewRecentAccess: "Revisa los accesos recientes a tu cuenta",
        viewActivity: "Ver actividad",
        activeSessions: "Sesiones activas",
        manageConnectedDevices: "Gestiona los dispositivos conectados a tu cuenta",
        manage: "Gestionar",
        preferencesTitle: "Preferencias",
        language: "Idioma",
        selectPreferredLanguage: "Selecciona tu idioma preferido",
        notifications: "Notificaciones",
        toggleSystemNotifications: "Activa o desactiva las notificaciones del sistema",
        accountSettings: "Configuración de la cuenta",
        downloadMyData: "Descargar mis datos",
        deleteAccount: "Eliminar cuenta",
        logout: "Cerrar Sesión",
        editProfile: "Editar perfil",
        fullName: "Nombre completo",
        biography: "Biografía",
        cancel: "Cancelar",
        currentPassword: "Contraseña actual",
        newPassword: "Nueva contraseña",
        confirmNewPassword: "Confirmar nueva contraseña",
        securityLow: "Seguridad: baja",
        securityMedium: "Seguridad: media",
        securityHigh: "Seguridad: alta",
        updatePassword: "Actualizar contraseña",
        recentActivity: "Actividad reciente",
        close: "Cerrar",
        activeSessionsTitle: "Sesiones activas",
        closeSession: "Cerrar sesión",
        closeAllSessions: "Cerrar todas las sesiones",
        deleteAccountConfirm: "¿Estás seguro de que deseas eliminar tu cuenta?",
        irreversibleAction: "Esta acción es irreversible. Se eliminarán todos tus datos personales, historial médico y configuraciones asociadas a esta cuenta.",
        confirmDeletePrompt: "Para confirmar, escribe \"ELIMINAR\" en el siguiente campo:",
        deleteAccountPermanently: "Eliminar cuenta permanentemente",
        downloadMyDataTitle: "Descargar mis datos",
        downloadFormat: "Formato de descarga",
        jsonFormat: "JSON (Formato universal)",
        csvFormat: "CSV (Para hojas de cálculo)",
        pdfFormat: "PDF (Documento imprimible)",
        dataRange: "Rango de datos",
        allMyData: "Todos mis datos",
        onlyProfileInfo: "Solo información de perfil",
        onlyMedicalHistory: "Solo historial médico",
        last12Months: "Últimos 12 meses",
        generateFile: "Generar archivo",
        changesSaved: "Cambios guardados correctamente",
        passwordsDoNotMatch: "Las contraseñas no coinciden",
        passwordUpdated: "Contraseña actualizada correctamente",
        accountDeleted: "Cuenta eliminada permanentemente",
        downloadingData: "Descargando datos en formato {format} ({range})",
        downloadCompleted: "Descarga completada",
        twoFactorAuthEnabled: "Verificación en dos pasos activada",
        twoFactorAuthDisabled: "Verificación en dos pasos desactivada",
        notificationsEnabled: "Notificaciones activadas",
        notificationsDisabled: "Notificaciones desactivadas",
        chromeWindows: "Navegador Chrome - Windows",
        androidChrome: "Android - Chrome Mobile",
        monteriaColombia: "Montería, Colombia",
        barranquillaColombia: "Barranquilla, Colombia",
        activeNow: "Activo ahora",
        active2HoursAgo: "Activo hace 2 horas"
    },
    en: {
        profileAndSettings: "Profile & Settings",
        managePersonalInformation: "Manage your personal information and account preferences.",
        profile: "Profile",
        security: "Security",
        preferences: "Preferences",
        accountActions: "Account Actions",
        personalInfo: "Personal Information",
        contactDetails: "Contact Details",
        email: "Email",
        phone: "Phone",
        address: "Address",
        saveChanges: "Save changes",
        securitySettings: "Security Settings",
        changePassword: "Change Password",
        updatePasswordRegularly: "Update your password regularly for better security",
        change: "Change",
        twoFactorAuth: "Two-factor authentication",
        addSecurityLayer: "Add an extra layer of security to your account",
        loginActivity: "Login Activity",
        reviewRecentAccess: "Review recent access to your account",
        viewActivity: "View activity",
        activeSessions: "Active Sessions",
        manageConnectedDevices: "Manage devices connected to your account",
        manage: "Manage",
        preferencesTitle: "Preferences",
        language: "Language",
        selectPreferredLanguage: "Select your preferred language",
        notifications: "Notifications",
        toggleSystemNotifications: "Enable or disable system notifications",
        accountSettings: "Account Settings",
        downloadMyData: "Download My Data",
        deleteAccount: "Delete Account",
        logout: "Log Out",
        editProfile: "Edit Profile",
        fullName: "Full Name",
        biography: "Biography",
        cancel: "Cancel",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmNewPassword: "Confirm New Password",
        securityLow: "Security: low",
        securityMedium: "Security: medium",
        securityHigh: "Security: high",
        updatePassword: "Update Password",
        recentActivity: "Recent Activity",
        close: "Close",
        activeSessionsTitle: "Active Sessions",
        closeSession: "Close session",
        closeAllSessions: "Close all sessions",
        deleteAccountConfirm: "Are you sure you want to delete your account?",
        irreversibleAction: "This action is irreversible. All your personal data, medical history, and settings associated with this account will be deleted.",
        confirmDeletePrompt: "To confirm, type \"DELETE\" in the field below:",
        deleteAccountPermanently: "Delete account permanently",
        downloadMyDataTitle: "Download My Data",
        downloadFormat: "Download Format",
        jsonFormat: "JSON (Universal format)",
        csvFormat: "CSV (For spreadsheets)",
        pdfFormat: "PDF (Printable document)",
        dataRange: "Data Range",
        allMyData: "All my data",
        onlyProfileInfo: "Only profile information",
        onlyMedicalHistory: "Only medical history",
        last12Months: "Last 12 months",
        generateFile: "Generate file",
        changesSaved: "Changes saved successfully",
        passwordsDoNotMatch: "Passwords do not match",
        passwordUpdated: "Password updated successfully",
        accountDeleted: "Account deleted permanently",
        downloadingData: "Downloading data in {format} format ({range})",
        downloadCompleted: "Download completed",
        twoFactorAuthEnabled: "Two-factor authentication enabled",
        twoFactorAuthDisabled: "Two-factor authentication disabled",
        notificationsEnabled: "Notifications enabled",
        notificationsDisabled: "Notifications disabled",
        chromeWindows: "Chrome Browser - Windows",
        androidChrome: "Android - Chrome Mobile",
        monteriaColombia: "Montería, Colombia",
        barranquillaColombia: "Barranquilla, Colombia",
        activeNow: "Active now",
        active2HoursAgo: "Active 2 hours ago"
    }
};

// Obtener el idioma actual de localStorage o usar 'es' por defecto
let currentLanguage = localStorage.getItem('appLanguage') || 'es';

// Función para aplicar las traducciones
function applyTranslations() {
    // Seleccionar todos los elementos con el atributo data-translate-key
    const translatableElements = document.querySelectorAll('[data-translate-key]');

    translatableElements.forEach(element => {
        const key = element.getAttribute('data-translate-key');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            // Para inputs con placeholder, usar setAttribute
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.setAttribute('placeholder', translations[currentLanguage][key]);
            } else {
                // Para otros elementos, actualizar textContent
                element.textContent = translations[currentLanguage][key];
            }
        }
    });

    // Actualizar el valor seleccionado en el dropdown de idioma
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.value = currentLanguage;
    }

    // Actualizar texto de seguridad de contraseña (si el modal está activo)
    const passwordStrengthText = document.querySelector('#changePasswordModal .strength-text');
    if (passwordStrengthText) {
        const newPasswordInput = document.getElementById('newPassword');
        const password = newPasswordInput ? newPasswordInput.value : '';
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]+/)) strength++;
        if (password.match(/[A-Z]+/)) strength++;
        if (password.match(/[0-9]+/)) strength++;
        if (password.match(/[$@#&!]+/)) strength++;

        let strengthKey = 'securityLow';
        if (strength >= 4) strengthKey = 'securityHigh';
        else if (strength >= 2) strengthKey = 'securityMedium';
        passwordStrengthText.textContent = translations[currentLanguage][strengthKey];
    }
}


// Cargar el sidebar y aplicar datos de perfil
document.addEventListener('DOMContentLoaded', () => {
    fetch('sidebar/sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;

            // Actualizar la foto de perfil en el sidebar
            const sidebarProfileImage = document.getElementById('sidebarProfileImage');
            if (sidebarProfileImage) {
                sidebarProfileImage.src = profileData.profileImage;
                sidebarProfileImage.alt = `Foto de perfil de ${profileData.name}`;
            }

            // Marcar como activo el elemento del menú correspondiente
            const currentPage = window.location.pathname.split('/').pop() || 'Inicio.html';
            document.querySelectorAll('.sidebar-menu a').forEach(link => {
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active');
                }
            });

            // Aplicar datos de perfil a la página
            document.querySelector('.profile-image').src = profileData.profileImage;
            document.querySelector('.profile-image').alt = `Foto de perfil de ${profileData.name}`;
            document.querySelector('.profile-name').textContent = profileData.name;
            document.querySelector('.profile-role').textContent = profileData.role;
            document.getElementById('email').value = profileData.email;
            document.getElementById('phone').value = profileData.phone;
            document.getElementById('address').value = profileData.address;
            document.getElementById('newName').value = profileData.name;
            document.getElementById('newEmail').value = profileData.email;
            document.getElementById('newPhone').value = profileData.phone;
            document.getElementById('newAddress').value = profileData.address;
            document.getElementById('newBio').value = profileData.bio;

            applyTranslations(); // Aplicar traducciones después de cargar el sidebar y datos iniciales
        })
        .catch(error => console.error('Error al cargar el sidebar:', error));

    // Funcionalidad de las pestañas
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Desactivar todas las pestañas y contenidos
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activar la pestaña y el contenido correspondiente
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            tab.classList.add('active');
        });
    });

    // Funcionalidad de los modales
    const openModalButtons = document.querySelectorAll('[data-modal-id]');
    const closeModalButtons = document.querySelectorAll('.close-button, .close-modal');
    const modals = document.querySelectorAll('.modal');

    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal-id');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden'; // Evitar el scroll del fondo
            }
        });
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const modalId = button.getAttribute('data-modal-id');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = 'auto'; // Restablecer el scroll
            } else {
                // Si el botón de cierre no tiene data-modal-id, cierra todos los modales activos
                modals.forEach(m => {
                    m.classList.remove('active');
                    m.setAttribute('aria-hidden', 'true');
                });
                document.body.style.overflow = 'auto';
            }
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
            event.target.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto'; // Restablecer el scroll
        }
    });

    // Funcionalidad del botón "Guardar cambios" (ejemplo básico)
    // Este botón ahora solo existe dentro del modal de edición de perfil
    const editProfileForm = document.querySelector('#editProfileModal .modal-form');
    editProfileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // Aquí iría la lógica para guardar los cambios del perfil (por ejemplo, enviar a un servidor)
        // Actualizar los datos en la página principal con los nuevos valores del modal
        profileData.name = document.getElementById('newName').value;
        profileData.email = document.getElementById('newEmail').value;
        profileData.phone = document.getElementById('newPhone').value;
        profileData.address = document.getElementById('newAddress').value;
        profileData.bio = document.getElementById('newBio').value;

        document.querySelector('.profile-name').textContent = profileData.name;
        document.getElementById('email').value = profileData.email;
        document.getElementById('phone').value = profileData.phone;
        document.getElementById('address').value = profileData.address;

        showNotification(translations[currentLanguage].changesSaved, 'success');
        document.getElementById('editProfileModal').classList.remove('active');
        document.getElementById('editProfileModal').setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    });


    // Funcionalidad para cambiar la contraseña
    const changePasswordForm = document.querySelector('#changePasswordModal .modal-form');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordStrengthBar = document.querySelectorAll('#changePasswordModal .strength-bar');
    const passwordStrengthText = document.querySelector('#changePasswordModal .strength-text');

    newPasswordInput.addEventListener('input', () => {
        const password = newPasswordInput.value;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]+/)) strength++;
        if (password.match(/[A-Z]+/)) strength++;
        if (password.match(/[0-9]+/)) strength++;
        if (password.match(/[$@#&!]+/)) strength++;

        for (let i = 0; i < passwordStrengthBar.length; i++) {
            passwordStrengthBar[i].style.backgroundColor = i < strength ? '#4caf50' : '#ddd';
        }

        let strengthKey = 'securityLow';
        if (strength >= 4) strengthKey = 'securityHigh';
        else if (strength >= 2) strengthKey = 'securityMedium';
        passwordStrengthText.textContent = translations[currentLanguage][strengthKey];
    });

    changePasswordForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (newPasswordInput.value !== confirmPasswordInput.value) {
            showNotification(translations[currentLanguage].passwordsDoNotMatch, 'error');
            return;
        }
        showNotification(translations[currentLanguage].passwordUpdated, 'success');
        changePasswordForm.reset();
        document.getElementById('changePasswordModal').classList.remove('active');
        document.getElementById('changePasswordModal').setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    });

    // Funcionalidad para eliminar la cuenta
    const confirmDeleteInput = document.getElementById('confirmDelete');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');

    confirmDeleteInput.addEventListener('input', () => {
        confirmDeleteButton.disabled = confirmDeleteInput.value !== 'ELIMINAR';
    });

    confirmDeleteButton.addEventListener('click', () => {
        showNotification(translations[currentLanguage].accountDeleted, 'error'); // Usar 'error' para indicar una acción destructiva
        setTimeout(() => {
            window.location.href = 'Login/login.html'; // Redirigir a la página de login
        }, 1500); // Dar tiempo para que la notificación sea visible
    });

    // Funcionalidad para descargar datos
    const downloadDataForm = document.getElementById('downloadDataModal').querySelector('.modal-form');
    downloadDataForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const dataFormat = document.getElementById('dataFormat').value;
        const dataRange = document.getElementById('dataRange').value;
        showNotification(translations[currentLanguage].downloadingData.replace('{format}', dataFormat).replace('{range}', dataRange), 'info');
        setTimeout(() => {
            showNotification(translations[currentLanguage].downloadCompleted, 'success');
            document.getElementById('downloadDataModal').classList.remove('active');
            document.getElementById('downloadDataModal').setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
        }, 2000);
    });

    // Funcionalidad del interruptor de verificación en dos pasos
    const twoFactorAuthSwitch = document.getElementById('twoFactorAuth');
    twoFactorAuthSwitch.addEventListener('change', () => {
        if (twoFactorAuthSwitch.checked) {
            showNotification(translations[currentLanguage].twoFactorAuthEnabled, 'success');
        } else {
            showNotification(translations[currentLanguage].twoFactorAuthDisabled, 'info');
        }
    });

    // Funcionalidad del interruptor de notificaciones
    const notificationsEnabledSwitch = document.getElementById('notificationsEnabled');
    notificationsEnabledSwitch.addEventListener('change', () => {
        if (notificationsEnabledSwitch.checked) {
            showNotification(translations[currentLanguage].notificationsEnabled, 'success');
        } else {
            showNotification(translations[currentLanguage].notificationsDisabled, 'info');
        }
    });

    // Funcionalidad del selector de idioma
    const languageSelect = document.getElementById('language');
    languageSelect.addEventListener('change', (event) => {
        currentLanguage = event.target.value;
        localStorage.setItem('appLanguage', currentLanguage); // Guardar en localStorage
        applyTranslations();
        showNotification(`Idioma cambiado a ${event.target.options[event.target.selectedIndex].text}`, 'info');
    });

    // Botón de cerrar sesión
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            showNotification("Cerrando sesión...", 'info');
            setTimeout(() => {
                window.location.href = 'index.html'; // Redirigir a la página de login
            }, 1000);
        });
    }

    // Función para mostrar notificaciones
    function showNotification(message, type) {
        const notificationContainer = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        notificationContainer.appendChild(notification);

        // Eliminar la notificación después de un tiempo
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
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
            
            // Actualizar el nombre del usuario en el sidebar después de cargarlo
            updateSidebarUserName();
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
        });
}

/**
 * Marca el elemento activo del menú
 */
function markActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'PerfilConfiguracion.html';
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

// ===== FUNCIONALIDAD AVANZADA DE PERFIL =====

document.addEventListener('DOMContentLoaded', function() {
    // Tabs avanzados con animación, accesibilidad, scroll y swipe
    const tabs = Array.from(document.querySelectorAll('.profile-tabs-advanced .tab'));
    const tabIndicator = document.querySelector('.profile-tabs-advanced .tab-indicator');
    const tabContents = Array.from(document.querySelectorAll('.tab-content'));
    const tabList = document.querySelector('.profile-tabs-advanced');
    let currentTabIdx = tabs.findIndex(t => t.classList.contains('active')) || 0;
    let lastTabIdx = currentTabIdx;
    // ARIA live region
    let ariaLive = document.getElementById('aria-live-profile');
    if (!ariaLive) {
        ariaLive = document.createElement('div');
        ariaLive.id = 'aria-live-profile';
        ariaLive.setAttribute('aria-live', 'polite');
        ariaLive.className = 'visually-hidden';
        document.body.appendChild(ariaLive);
    }
    function moveTabIndicator() {
        const activeTab = document.querySelector('.profile-tabs-advanced .tab.active');
        if (activeTab && tabIndicator) {
            const rect = activeTab.getBoundingClientRect();
            const parentRect = activeTab.parentElement.getBoundingClientRect();
            tabIndicator.style.left = (rect.left - parentRect.left) + 'px';
            tabIndicator.style.width = rect.width + 'px';
        }
    }
    function scrollTabIntoView(tab) {
        if (tab && tabList) {
            const tabRect = tab.getBoundingClientRect();
            const listRect = tabList.getBoundingClientRect();
            if (tabRect.left < listRect.left || tabRect.right > listRect.right) {
                tab.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
            }
        }
    }
    function animateTabContent(newIdx, oldIdx) {
        // Ocultar todos primero
        tabContents.forEach(tc => {
            tc.classList.remove('active', 'slide-left', 'slide-right', 'swiping', 'animating');
            tc.style.display = 'none';
            tc.style.visibility = 'hidden';
        });
        
        // Si hay un tab anterior, mostrarlo brevemente para la animación de salida
        if (oldIdx !== undefined && oldIdx !== newIdx) {
            const oldTab = tabContents[oldIdx];
            const newTab = tabContents[newIdx];
            
            // Mostrar ambos tabs
            oldTab.style.display = 'block';
            oldTab.style.visibility = 'visible';
            newTab.style.display = 'block';
            newTab.style.visibility = 'visible';
            
            // Aplicar animación de salida al tab anterior
            const direction = newIdx > oldIdx ? 'slide-left' : 'slide-right';
            oldTab.classList.add(direction);
            
            // Después de un breve delay, activar el nuevo tab
            setTimeout(() => {
                oldTab.style.display = 'none';
                oldTab.style.visibility = 'hidden';
                oldTab.classList.remove(direction);
                
                newTab.classList.add('active');
                newTab.style.position = 'relative';
                newTab.style.zIndex = '2';
            }, 50);
        } else {
            // Si es el primer tab, activarlo directamente
            tabContents[newIdx].classList.add('active');
            tabContents[newIdx].style.display = 'block';
            tabContents[newIdx].style.visibility = 'visible';
            tabContents[newIdx].style.position = 'relative';
            tabContents[newIdx].style.zIndex = '2';
        }
    }
    function activateTab(tab, fromSwipe) {
        lastTabIdx = currentTabIdx;
        currentTabIdx = tabs.indexOf(tab);
        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
            t.tabIndex = -1;
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.tabIndex = 0;
        // Loader breve solo si no es swipe
        if (!fromSwipe) {
            const loader = document.createElement('div');
            loader.className = 'tab-loader';
            loader.innerHTML = '<span class="loader"></span>';
            tab.parentElement.appendChild(loader);
            setTimeout(() => loader.remove(), 250);
        }
        animateTabContent(currentTabIdx, lastTabIdx);
        moveTabIndicator();
        scrollTabIntoView(tab);
        // Persistencia y deep linking
        localStorage.setItem('lastProfileTab', tab.dataset.tab);
        if (history.replaceState) {
            const url = new URL(window.location);
            url.searchParams.set('tab', tab.dataset.tab);
            history.replaceState(null, '', url);
        }
        // Accesibilidad: anunciar cambio y enfocar primer input/botón
        ariaLive.textContent = `Sección ${tab.textContent.trim()} activada.`;
        setTimeout(() => {
            const panel = document.getElementById(tab.dataset.tab);
            if (panel) {
                const focusable = panel.querySelector('input,button,select,textarea,a[href],[tabindex]:not([tabindex="-1"])');
                if (focusable) focusable.focus();
            }
        }, 350);
    }
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            activateTab(this);
            this.focus();
        });
        tab.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                activateTab(this);
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                let idx = tabs.indexOf(document.activeElement);
                if (e.key === 'ArrowRight') idx = (idx + 1) % tabs.length;
                else idx = (idx - 1 + tabs.length) % tabs.length;
                tabs[idx].focus();
            }
        });
    });
    // Swipe en móvil
    let touchStartX = null;
    let touchStartY = null;
    let isSwiping = false;
    document.querySelectorAll('.tab-content').forEach(panel => {
        panel.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                isSwiping = true;
            }
        });
        panel.addEventListener('touchmove', function(e) {
            if (!isSwiping) return;
            const dx = e.touches[0].clientX - touchStartX;
            const dy = Math.abs(e.touches[0].clientY - touchStartY);
            if (Math.abs(dx) > 30 && dy < 40) {
                panel.classList.add('swiping');
            }
        });
        panel.addEventListener('touchend', function(e) {
            if (!isSwiping) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 60) {
                let newIdx = currentTabIdx + (dx < 0 ? 1 : -1);
                if (newIdx >= 0 && newIdx < tabs.length) {
                    activateTab(tabs[newIdx], true);
                }
            }
            panel.classList.remove('swiping');
            isSwiping = false;
        });
    });
    // Al cargar, restaurar último tab o deep link
    let initialTab = null;
    const urlTab = new URL(window.location).searchParams.get('tab');
    if (urlTab) {
        initialTab = tabs.find(t => t.dataset.tab === urlTab);
    } else {
        const lastTab = localStorage.getItem('lastProfileTab');
        if (lastTab) initialTab = tabs.find(t => t.dataset.tab === lastTab);
    }
    if (initialTab) activateTab(initialTab);
    else moveTabIndicator();
    window.addEventListener('resize', moveTabIndicator);
    setTimeout(moveTabIndicator, 200);

    // Avatar editable
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    document.getElementById('profileImage').src = ev.target.result;
                    showNotification('Foto de perfil actualizada', 'success');
                    updateProfileProgress();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Barra de progreso de completitud
    function updateProfileProgress() {
        let percent = 40;
        if (document.getElementById('profileBioField').textContent.trim().length > 10) percent += 10;
        if (document.getElementById('profileImage').src.indexOf('placehold.co') === -1) percent += 20;
        if (document.getElementById('profilePhoneField').textContent.trim().length > 5) percent += 10;
        if (document.getElementById('profileAddressField').textContent.trim().length > 5) percent += 10;
        if (document.getElementById('profileEmailField').textContent.trim().length > 5) percent += 10;
        document.getElementById('profileProgress').style.width = percent + '%';
        document.getElementById('completionText').textContent = percent >= 90 ? '¡Perfil completo!' : '¡Perfil casi completo!';
    }
    updateProfileProgress();

    // Medidor de seguridad de contraseña
    const passwordInput = document.getElementById('newPassword');
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const val = passwordInput.value;
            let strength = 1;
            if (val.length > 7 && /[A-Z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) strength = 3;
            else if (val.length > 5 && /[A-Z]/.test(val) && /[0-9]/.test(val)) strength = 2;
            strengthBar.setAttribute('data-strength', strength);
            strengthBar.style.width = (strength * 33) + '%';
            if (strength === 1) strengthText.textContent = 'Débil';
            else if (strength === 2) strengthText.textContent = 'Media';
            else strengthText.textContent = 'Fuerte';
        });
    }

    // Preferencias: idioma y modo oscuro
    function setupPreferences() {
        // Idioma
        const languageSelect = document.getElementById('language');
        if (languageSelect) {
            // Cargar idioma guardado
            const savedLang = localStorage.getItem('appLanguage') || 'es';
            languageSelect.value = savedLang;
            applyLanguage(savedLang);
            languageSelect.addEventListener('change', function() {
                localStorage.setItem('appLanguage', this.value);
                applyLanguage(this.value);
                showNotification(`Idioma cambiado a ${this.options[this.selectedIndex].text}`, 'info');
            });
        }
        // Modo oscuro
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            // Cargar preferencia guardada
            const savedDark = localStorage.getItem('darkMode') === 'true';
            darkModeToggle.checked = savedDark;
            setDarkMode(savedDark);
            darkModeToggle.addEventListener('change', function() {
                setDarkMode(this.checked);
                localStorage.setItem('darkMode', this.checked);
                showNotification(this.checked ? 'Modo oscuro activado' : 'Modo claro activado', 'info');
            });
        }
    }

    function setDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    function applyLanguage(lang) {
        // Aquí puedes integrar traducción real si tienes textos dinámicos
        // Por ahora solo cambia el valor del select y podrías recargar textos si lo deseas
    }

    // Inicializar mejoras al cargar
    function initPerfilMejorado() {
        // Cargar datos guardados al iniciar
        renderPerfil();
        
        // Configurar funcionalidades
        setupPerfilEdicion();
        setupPerfilFoto();
        setupSecurityModals();
        setupPreferences();
    }

    document.addEventListener('DOMContentLoaded', initPerfilMejorado);
});

// ===== MEJORAS AVANZADAS SECCIÓN PERFIL =====
const perfilFields = ['name', 'email', 'phone', 'address', 'bio'];
const perfilDefaults = {
    name: 'María López',
    email: 'Maria.Lopez@email.com',
    phone: '+57 310 123 4567',
    address: 'Calle 29 # 14-50, Montería, Córdoba',
    bio: 'Paciente en MediTrack, interesada en el bienestar integral.',
    profileImage: 'https://placehold.co/150x150/b2dfdb/00796b?text=SR'
};

function validatePerfilField(field, value) {
    if (!value.trim()) return `${field} es requerido`;
    
    switch (field) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return 'Email inválido';
            break;
        case 'phone':
            const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
            if (!phoneRegex.test(value)) return 'Teléfono inválido';
            break;
    }
    return null;
}

function getPerfilData() {
    const savedData = JSON.parse(localStorage.getItem('perfilData') || '{}');
    return {...perfilDefaults, ...savedData};
}

function setPerfilData(data) {
    localStorage.setItem('perfilData', JSON.stringify(data));
}

function renderPerfil() {
    const data = getPerfilData();
    
    // Función para actualizar campo con efecto visual
    function updateFieldWithEffect(elementId, newValue, oldValue) {
        const element = document.getElementById(elementId);
        if (element) {
            const currentValue = element.textContent;
            element.textContent = newValue;
            
            // Si el valor cambió, mostrar efecto de actualización
            if (currentValue !== newValue) {
                element.classList.add('updated');
                setTimeout(() => {
                    element.classList.remove('updated');
                }, 2000);
            }
        }
    }
    
    // Actualizar cada campo con efectos
    updateFieldWithEffect('profileNameField', data.name);
    updateFieldWithEffect('profileEmailField', data.email);
    updateFieldWithEffect('profilePhoneField', data.phone);
    updateFieldWithEffect('profileAddressField', data.address);
    updateFieldWithEffect('profileBioField', data.bio);
    
    // Actualizar imagen de perfil
    const profileImage = document.getElementById('profileImage');
    if (profileImage) {
        profileImage.src = data.profileImage;
    }
}

function setupPerfilEdicion() {
    const editBtn = document.getElementById('editProfileBtn');
    if (!editBtn) return;
    
    editBtn.onclick = function() {
        // Crear modal de edición
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Editar Perfil</h2>
                    <button class="close-button" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <form class="modal-form" id="editProfileForm">
                    <div class="form-group">
                        <label for="editName">Nombre completo</label>
                        <input type="text" id="editName" value="${getPerfilData().name}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="editEmail">Correo electrónico</label>
                        <input type="email" id="editEmail" value="${getPerfilData().email}" required>
                    </div>
                    <div class="form-group">
                        <label for="editPhone">Teléfono</label>
                        <input type="tel" id="editPhone" value="${getPerfilData().phone}" required>
                    </div>
                    <div class="form-group">
                        <label for="editAddress">Dirección</label>
                        <input type="text" id="editAddress" value="${getPerfilData().address}" required>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="secondary-button" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button type="submit" class="primary-button">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Manejar envío del formulario
        document.getElementById('editProfileForm').onsubmit = function(e) {
            e.preventDefault();
            const formData = {
                email: document.getElementById('editEmail').value,
                phone: document.getElementById('editPhone').value,
                address: document.getElementById('editAddress').value
            };
            
            // Validar datos
            let hasError = false;
            Object.keys(formData).forEach(field => {
                const msg = validatePerfilField(field, formData[field]);
                if (msg) {
                    hasError = true;
                    showNotification(msg, 'error');
                }
            });
            
            if (hasError) return;
            
            // Guardar datos en localStorage
            const currentData = getPerfilData();
            Object.assign(currentData, formData);
            setPerfilData(currentData);
            
            // Actualizar la interfaz inmediatamente
            renderPerfil();
            
            // Cerrar modal
            modal.remove();
            
            // Mostrar notificación de éxito con animación
            showNotification('Perfil actualizado correctamente', 'success');
            
            // Efecto visual de actualización en la sección de perfil
            const profileCard = document.querySelector('.profile-card-advanced');
            if (profileCard) {
                profileCard.style.transform = 'scale(1.02)';
                profileCard.style.transition = 'transform 0.3s ease';
                setTimeout(() => {
                    profileCard.style.transform = 'scale(1)';
                }, 300);
            }
        };
    };
}

function setupPerfilFoto() {
    const avatarUpload = document.getElementById('avatarUpload');
    const profileImage = document.getElementById('profileImage');
    const originalSrc = profileImage.src;
    
    avatarUpload.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validar tipo y tamaño
        if (!file.type.startsWith('image/')) {
            showNotification('Por favor selecciona una imagen válida', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            showNotification('La imagen debe ser menor a 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(ev) {
            profileImage.src = ev.target.result;
            // Guardar en localStorage
            const data = getPerfilData();
            data.profileImage = ev.target.result;
            setPerfilData(data);
            showNotification('Foto de perfil actualizada', 'success');
        };
        reader.readAsDataURL(file);
    };
}

// Funcionalidad avanzada de cambio de contraseña
function setupAdvancedPasswordChange() {
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmNewPassword');
    const updatePasswordBtn = document.getElementById('updatePasswordBtn');
    
    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput || !updatePasswordBtn) return;
    
    // Obtener datos de login del localStorage
    function getLoginData() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.length === 0) {
            // Si no hay usuarios en localStorage, usar el usuario por defecto
            return [{ username: 'Maria', password: 'Maria123' }];
        }
        return users;
    }
    
    // Guardar datos de login en localStorage
    function saveLoginData(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Validar contraseña actual
    function validateCurrentPassword(password) {
        const users = getLoginData();
        const currentUser = users.find(user => user.username === 'Maria'); // Usuario actual
        return currentUser && currentUser.password === password;
    }
    
    // Calcular fortaleza de contraseña
    function calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];
        
        // Longitud
        if (password.length >= 8) {
            score += 20;
            feedback.push('length');
        }
        
        // Mayúsculas
        if (/[A-Z]/.test(password)) {
            score += 20;
            feedback.push('uppercase');
        }
        
        // Minúsculas
        if (/[a-z]/.test(password)) {
            score += 20;
            feedback.push('lowercase');
        }
        
        // Números
        if (/[0-9]/.test(password)) {
            score += 20;
            feedback.push('number');
        }
        
        // Caracteres especiales
        if (/[^A-Za-z0-9]/.test(password)) {
            score += 20;
            feedback.push('special');
        }
        
        // Diferente a la contraseña actual
        const currentPassword = document.getElementById('currentPassword').value;
        if (password !== currentPassword) {
            feedback.push('different');
        }
        
        return { score, feedback };
    }
    
    // Actualizar medidor de fortaleza
    function updateStrengthMeter(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        const { score, feedback } = calculatePasswordStrength(password);
        
        // Limpiar clases anteriores
        strengthFill.className = 'strength-fill';
        strengthText.className = 'strength-text';
        
        // Aplicar clase según fortaleza
        if (score <= 20) {
            strengthFill.classList.add('very-weak');
            strengthText.classList.add('very-weak');
            strengthText.textContent = 'Muy débil';
        } else if (score <= 40) {
            strengthFill.classList.add('weak');
            strengthText.classList.add('weak');
            strengthText.textContent = 'Débil';
        } else if (score <= 60) {
            strengthFill.classList.add('medium');
            strengthText.classList.add('medium');
            strengthText.textContent = 'Media';
        } else if (score <= 80) {
            strengthFill.classList.add('strong');
            strengthText.classList.add('strong');
            strengthText.textContent = 'Fuerte';
        } else {
            strengthFill.classList.add('very-strong');
            strengthText.classList.add('very-strong');
            strengthText.textContent = 'Muy fuerte';
        }
        
        // Actualizar requisitos
        updateRequirements(feedback);
    }
    
    // Actualizar lista de requisitos
    function updateRequirements(metRequirements) {
        const requirements = ['length', 'uppercase', 'lowercase', 'number', 'special', 'different'];
        
        requirements.forEach(req => {
            const element = document.getElementById(`req-${req}`);
            if (element) {
                if (metRequirements.includes(req)) {
                    element.classList.add('met');
                } else {
                    element.classList.remove('met');
                }
            }
        });
    }
    
    // Validar coincidencia de contraseñas
    function validatePasswordMatch() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const matchElement = document.getElementById('passwordMatch');
        
        if (confirmPassword === '') {
            matchElement.textContent = '';
            matchElement.className = 'password-match';
            return false;
        }
        
        if (newPassword === confirmPassword) {
            matchElement.textContent = '✓ Las contraseñas coinciden';
            matchElement.className = 'password-match matching';
            return true;
        } else {
            matchElement.textContent = '✗ Las contraseñas no coinciden';
            matchElement.className = 'password-match not-matching';
            return false;
        }
    }
    
    // Verificar si se puede habilitar el botón de actualizar
    function checkCanUpdate() {
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        const isCurrentValid = validateCurrentPassword(currentPassword);
        const { score } = calculatePasswordStrength(newPassword);
        const isPasswordMatch = validatePasswordMatch();
        
        const canUpdate = isCurrentValid && score >= 60 && isPasswordMatch && newPassword.length > 0;
        
        updatePasswordBtn.disabled = !canUpdate;
        
        // Actualizar estado de contraseña actual
        const statusElement = document.getElementById('currentPasswordStatus');
        if (currentPassword === '') {
            statusElement.textContent = '';
            statusElement.className = 'password-status';
        } else if (isCurrentValid) {
            statusElement.textContent = '✓ Contraseña actual correcta';
            statusElement.className = 'password-status correct';
        } else {
            statusElement.textContent = '✗ Contraseña actual incorrecta';
            statusElement.className = 'password-status incorrect';
        }
    }
    
    // Event listeners
    currentPasswordInput.addEventListener('input', checkCanUpdate);
    
    newPasswordInput.addEventListener('input', function() {
        updateStrengthMeter(this.value);
        checkCanUpdate();
    });
    
    confirmPasswordInput.addEventListener('input', checkCanUpdate);
    
    // Actualizar contraseña
    updatePasswordBtn.addEventListener('click', function() {
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        
        if (!validateCurrentPassword(currentPassword)) {
            showNotification('La contraseña actual es incorrecta', 'error');
            return;
        }
        
        const { score } = calculatePasswordStrength(newPassword);
        if (score < 60) {
            showNotification('La nueva contraseña no cumple con los requisitos de seguridad', 'error');
            return;
        }
        
        if (!validatePasswordMatch()) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        
        // Actualizar contraseña en localStorage
        const users = getLoginData();
        const userIndex = users.findIndex(user => user.username === 'Maria');
        
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            saveLoginData(users);
            
            showNotification('Contraseña actualizada correctamente', 'success');
            
            // Limpiar formulario
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            
            // Cerrar modal
            const modal = document.getElementById('changePasswordModal');
            if (modal) {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
            }
            
            // Resetear medidor y requisitos
            updateStrengthMeter('');
            updateRequirements([]);
            checkCanUpdate();
        } else {
            showNotification('Error al actualizar la contraseña', 'error');
        }
    });
}

// Función para toggle de visibilidad de contraseña
window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};

// Funcionalidad de Verificación en Dos Pasos (2FA)
function setupTwoFactorAuth() {
    const twoFactorSwitch = document.getElementById('twoFactorAuth');
    const configure2FABtn = document.getElementById('configure2FABtn');
    const verify2FABtn = document.getElementById('verify2FABtn');
    
    if (!twoFactorSwitch || !configure2FABtn || !verify2FABtn) return;
    
    // Obtener estado 2FA del localStorage
    function get2FAStatus() {
        return JSON.parse(localStorage.getItem('twoFactorAuth') || 'false');
    }
    
    // Guardar estado 2FA en localStorage
    function save2FAStatus(enabled) {
        localStorage.setItem('twoFactorAuth', JSON.stringify(enabled));
    }
    
    // Generar secreto para 2FA
    function generateSecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 32; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return secret;
    }
    
    // Generar código QR
    function generateQRCode(secret, username) {
        const issuer = 'MediTrack';
        const otpauth = `otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`;
        
        // Crear URL para QR code usando un servicio externo
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
        
        return qrUrl;
    }
    
    // Generar código TOTP (simulado)
    function generateTOTP(secret) {
        // En una implementación real, esto usaría una librería como speakeasy
        // Por ahora, simulamos un código de 6 dígitos
        const timestamp = Math.floor(Date.now() / 30000); // 30 segundos
        const hash = btoa(secret + timestamp).replace(/[^0-9]/g, '');
        return hash.substring(0, 6).padStart(6, '0');
    }
    
    // Validar código ingresado
    function validateTOTP(secret, code) {
        const expectedCode = generateTOTP(secret);
        return code === expectedCode;
    }
    
    // Configurar 2FA
    configure2FABtn.addEventListener('click', function() {
        const modal = document.getElementById('twoFactorModal');
        if (!modal) return;
        
        // Generar nuevo secreto
        const secret = generateSecret();
        const username = 'Maria'; // Usuario actual
        const qrUrl = generateQRCode(secret, username);
        
        // Actualizar QR code en el modal
        const qrPlaceholder = modal.querySelector('.qr-placeholder');
        if (qrPlaceholder) {
            qrPlaceholder.innerHTML = `
                <img src="${qrUrl}" alt="QR Code para 2FA" style="width: 200px; height: 200px;">
                <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--gray-medium);">
                    Escanea con Google Authenticator, Authy o similar
                </p>
            `;
        }
        
        // Mostrar modal
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Guardar secreto temporalmente para validación
        modal.dataset.tempSecret = secret;
        
        // Configurar validación
        verify2FABtn.onclick = function() {
            const code = document.getElementById('twofaCode').value;
            
            if (!code || code.length !== 6) {
                showNotification('Por favor ingresa un código de 6 dígitos', 'error');
                return;
            }
            
            if (validateTOTP(secret, code)) {
                // 2FA configurado exitosamente
                save2FAStatus(true);
                twoFactorSwitch.checked = true;
                
                // Guardar secreto en localStorage (en producción debería estar en servidor)
                localStorage.setItem('twoFactorSecret', secret);
                
                showNotification('Verificación en dos pasos activada correctamente', 'success');
                
                // Cerrar modal
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
                
                // Limpiar código
                document.getElementById('twofaCode').value = '';
                
                // Actualizar estado visual
                update2FAStatus(true);
            } else {
                showNotification('Código incorrecto. Por favor verifica e intenta de nuevo', 'error');
                document.getElementById('twofaCode').value = '';
                document.getElementById('twofaCode').focus();
            }
        };
    });
    
    // Manejar switch de 2FA
    twoFactorSwitch.addEventListener('change', function() {
        if (this.checked) {
            // Activar 2FA - abrir modal de configuración
            configure2FABtn.click();
        } else {
            // Desactivar 2FA
            if (confirm('¿Estás seguro de que quieres desactivar la verificación en dos pasos? Esto hará tu cuenta menos segura.')) {
                save2FAStatus(false);
                localStorage.removeItem('twoFactorSecret');
                showNotification('Verificación en dos pasos desactivada', 'info');
                update2FAStatus(false);
            } else {
                // Revertir el switch si el usuario cancela
                this.checked = true;
            }
        }
    });
    
    // Actualizar estado visual
    function update2FAStatus(enabled) {
        const configureBtn = document.getElementById('configure2FABtn');
        if (configureBtn) {
            if (enabled) {
                configureBtn.innerHTML = '<i class="fas fa-cog"></i> Reconfigurar';
                configureBtn.classList.add('configured');
            } else {
                configureBtn.innerHTML = '<i class="fas fa-cog"></i> Configurar';
                configureBtn.classList.remove('configured');
            }
        }
    }
    
    // Cargar estado inicial
    const is2FAEnabled = get2FAStatus();
    twoFactorSwitch.checked = is2FAEnabled;
    update2FAStatus(is2FAEnabled);
    
    // Función para verificar 2FA durante login (para usar en login.js)
    window.verify2FADuringLogin = function(code) {
        const secret = localStorage.getItem('twoFactorSecret');
        if (!secret) return false;
        
        return validateTOTP(secret, code);
    };
    
    // Función para verificar si 2FA está habilitado
    window.is2FAEnabled = function() {
        return get2FAStatus();
    };
}

// Mostrar historial de actividad de inicio de sesión en el modal
function renderLoginActivity() {
    const modal = document.getElementById('loginActivityModal');
    if (!modal) return;
    const activityList = modal.querySelector('.activity-list');
    if (!activityList) return;
    const activities = JSON.parse(localStorage.getItem('loginActivity') || '[]');
    if (activities.length === 0) {
        activityList.innerHTML = '<div class="activity-item"><div class="activity-info"><span class="activity-details">No hay actividad registrada.</span></div></div>';
        return;
    }
    activityList.innerHTML = activities.map(act => {
        const icon = act.status === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
        const statusClass = act.status === 'success' ? 'success' : 'warning';
        const statusText = act.status === 'success' ? 'Inicio de sesión exitoso' : 'Intento fallido';
        const timeAgo = timeAgoString(new Date(act.time));
        return `
            <div class="activity-item">
                <div class="activity-info">
                    <i class="fas ${icon} activity-icon"></i>
                    <div class="activity-details">
                        <h4>${statusText}</h4>
                        <p>${act.device} • ${act.location}</p>
                        <span class="activity-time">${timeAgo}</span>
                    </div>
                </div>
                <div class="activity-status ${statusClass}">
                    <i class="fas ${icon}"></i>
                </div>
            </div>
        `;
    }).join('');
}

// Utilidad para mostrar tiempo relativo
function timeAgoString(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Hace unos segundos';
    if (diff < 3600) return `Hace ${Math.floor(diff/60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff/3600)} h`;
    return `Hace ${Math.floor(diff/86400)} días`;
}

// Botón para limpiar historial
function setupClearLoginActivity() {
    const modal = document.getElementById('loginActivityModal');
    if (!modal) return;
    let clearBtn = modal.querySelector('#clearLoginActivityBtn');
    if (!clearBtn) {
        clearBtn = document.createElement('button');
        clearBtn.id = 'clearLoginActivityBtn';
        clearBtn.className = 'secondary-button';
        clearBtn.innerHTML = '<i class="fas fa-trash"></i> Limpiar historial';
        modal.querySelector('.modal-actions')?.prepend(clearBtn);
    }
    clearBtn.onclick = function() {
        if (confirm('¿Seguro que deseas borrar el historial de actividad?')) {
            localStorage.removeItem('loginActivity');
            renderLoginActivity();
        }
    };
}

// Mostrar dispositivos autorizados en el modal
function renderAuthorizedDevices() {
    const modal = document.getElementById('devicesModal');
    if (!modal) return;
    const devicesList = modal.querySelector('.devices-list');
    if (!devicesList) return;
    const devices = JSON.parse(localStorage.getItem('authorizedDevices') || '[]');
    const currentDeviceId = localStorage.getItem('deviceId');
    const username = 'Maria'; // Usuario actual
    const filtered = devices.filter(d => d.username === username);
    if (filtered.length === 0) {
        devicesList.innerHTML = '<div class="device-item"><div class="device-info"><span class="device-details">No hay dispositivos autorizados.</span></div></div>';
        return;
    }
    devicesList.innerHTML = filtered.map(device => {
        const isCurrent = device.deviceId === currentDeviceId;
        return `
            <div class="device-item${isCurrent ? ' current' : ''}">
                <div class="device-info">
                    <i class="fas ${isCurrent ? 'fa-laptop' : 'fa-mobile-alt'} device-icon"></i>
                    <div class="device-details">
                        <h4>${device.deviceName}</h4>
                        <p>${device.location} • ${isCurrent ? 'Activo ahora' : 'Última vez: ' + timeAgoString(new Date(device.lastActive))}</p>
                        ${isCurrent ? '<span class="device-tag current">Dispositivo actual</span>' : ''}
                    </div>
                </div>
                <div class="device-actions">
                    ${isCurrent ? `<button class="icon-button" title="No se puede cerrar sesión en el dispositivo actual" disabled><i class="fas fa-lock"></i></button>` : `<button class="danger-button" title="Cerrar sesión en este dispositivo" onclick="logoutDevice('${device.deviceId}')"><i class="fas fa-sign-out-alt"></i></button>`}
                </div>
            </div>
        `;
    }).join('');
}

// Cerrar sesión en un dispositivo individual
window.logoutDevice = function(deviceId) {
    const devices = JSON.parse(localStorage.getItem('authorizedDevices') || '[]');
    const username = 'Maria';
    const updated = devices.map(d => d.deviceId === deviceId && d.username === username ? { ...d, status: 'loggedout' } : d);
    localStorage.setItem('authorizedDevices', JSON.stringify(updated));
    renderAuthorizedDevices();
    showNotification('Sesión cerrada en el dispositivo seleccionado', 'success');
};

// Botón para cerrar todas las sesiones excepto la actual
function setupCloseAllDevices() {
    const btn = document.getElementById('closeAllSessionsBtn');
    if (!btn) return;
    btn.onclick = function() {
        if (confirm('¿Seguro que deseas cerrar sesión en todos los dispositivos excepto este?')) {
            const devices = JSON.parse(localStorage.getItem('authorizedDevices') || '[]');
            const currentDeviceId = localStorage.getItem('deviceId');
            const username = 'Maria';
            const updated = devices.map(d => d.username === username && d.deviceId !== currentDeviceId ? { ...d, status: 'loggedout' } : d);
            localStorage.setItem('authorizedDevices', JSON.stringify(updated));
            renderAuthorizedDevices();
            showNotification('Sesiones cerradas en todos los dispositivos excepto el actual', 'success');
        }
    };
}

// Integrar con la apertura del modal
function setupSecurityModals() {
    // Configurar cambio de contraseña avanzado
    setupAdvancedPasswordChange();
    
    // Configurar 2FA
    setupTwoFactorAuth();
    
    // Botón cambiar contraseña
    document.getElementById('changePasswordBtn')?.addEventListener('click', function() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    });

    // Botón configurar 2FA
    document.getElementById('configure2FABtn')?.addEventListener('click', function() {
        const modal = document.getElementById('twoFactorModal');
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    });

    // Botón ver actividad de login
    document.getElementById('viewLoginActivity')?.addEventListener('click', function() {
        const modal = document.getElementById('loginActivityModal');
        if (modal) {
            renderLoginActivity();
            setupClearLoginActivity();
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    });

    // Botón gestionar sesiones
    document.getElementById('manageSessions')?.addEventListener('click', function() {
        const modal = document.getElementById('sessionsModal');
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    });

    // Botón configuración de privacidad
    document.getElementById('privacySettingsBtn')?.addEventListener('click', function() {
        const modal = document.getElementById('privacyModal');
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    });

    // Botón dispositivos autorizados
    document.getElementById('manageDevicesBtn')?.addEventListener('click', function() {
        const modal = document.getElementById('devicesModal');
        if (modal) {
            renderAuthorizedDevices();
            setupCloseAllDevices();
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    });

    // Cerrar todas las sesiones
    document.getElementById('closeAllSessionsBtn')?.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres cerrar todas las sesiones excepto la actual?')) {
            showNotification('Todas las sesiones han sido cerradas', 'success');
            document.getElementById('devicesModal').classList.remove('active');
        }
    });

    // Terminar todas las sesiones
    document.getElementById('terminateAllSessionsBtn')?.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres terminar todas las sesiones?')) {
            showNotification('Todas las sesiones han sido terminadas', 'success');
            document.getElementById('sessionsModal').classList.remove('active');
        }
    });

    // Cerrar modales al hacer clic en botones de cerrar
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    });

    // Cerrar modales al hacer clic fuera del contenido
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                this.setAttribute('aria-hidden', 'true');
            }
        });
    });
}

// ===== FUNCIONALIDAD AVANZADA PARA ACCIONES DE CUENTA =====

// Configurar modales avanzados de acciones de cuenta
function setupAdvancedAccountActions() {
    // Botón Descargar mis datos
    document.getElementById('downloadDataBtn')?.addEventListener('click', function() {
        const modal = document.getElementById('downloadDataModal');
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    });

    // Botón Eliminar cuenta
    document.getElementById('deleteAccountBtn')?.addEventListener('click', function() {
        const modal = document.getElementById('deleteAccountModal');
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            setupDeleteConfirmation();
        }
    });

    // Botón Cerrar Sesión - Redirección directa
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        console.log('Botón de cerrar sesión encontrado, agregando event listener...');
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botón de cerrar sesión clickeado');
            
            // Limpiar datos de sesión inmediatamente
            sessionStorage.clear();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('authorizedDevices');
            
            console.log('Datos de sesión limpiados');
            
            // Mostrar notificación
            showNotification('Sesión cerrada correctamente', 'success');
            
            // Redirigir directamente al login
            setTimeout(() => {
                console.log('Redirigiendo a index.html...');
                window.location.href = 'index.html';
            }, 500);
        });
    } else {
        console.error('Botón de cerrar sesión no encontrado');
        }

    // Configurar funcionalidades específicas de cada modal
    setupDownloadDataModal();
    setupDeleteAccountModal();
}

// Configurar modal de descarga de datos
function setupDownloadDataModal() {
    const generateBtn = document.getElementById('generateDownloadBtn');
    if (!generateBtn) return;

    generateBtn.addEventListener('click', function() {
        const format = document.querySelector('input[name="downloadFormat"]:checked')?.value || 'json';
        const range = document.querySelector('input[name="dataRange"]:checked')?.value || 'all';
        
        // Simular proceso de generación
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
        
        setTimeout(() => {
            // Simular descarga
            const userData = generateUserData(format, range);
            downloadFile(userData, `meditrack_data_${format}_${new Date().toISOString().split('T')[0]}.${format}`, format);
            
            // Mostrar notificación
            showNotification(`Archivo ${format.toUpperCase()} generado y descargado correctamente`, 'success');
            
            // Restaurar botón
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-download"></i> Generar archivo';
            
            // Cerrar modal
            document.getElementById('downloadDataModal').classList.remove('active');
        }, 2000);
    });
}

// Generar datos del usuario según formato y rango
function generateUserData(format, range) {
    const profileData = getPerfilData();
    const baseData = {
        user: {
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            address: profileData.address,
            bio: profileData.bio
        },
        preferences: {
            language: localStorage.getItem('appLanguage') || 'es',
            darkMode: localStorage.getItem('darkMode') === 'true'
        },
        security: {
            twoFactorEnabled: get2FAStatus(),
            lastPasswordChange: new Date().toISOString(),
            loginActivity: JSON.parse(localStorage.getItem('loginActivity') || '[]')
        }
    };

    // Agregar datos según el rango seleccionado
    if (range === 'all') {
        baseData.medicalHistory = generateMedicalHistory();
        baseData.appointments = generateAppointments();
        baseData.devices = JSON.parse(localStorage.getItem('authorizedDevices') || '[]');
    } else if (range === 'medical') {
        baseData.medicalHistory = generateMedicalHistory();
        baseData.appointments = generateAppointments();
    } else if (range === 'recent') {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        baseData.recentActivity = {
            since: twelveMonthsAgo.toISOString(),
            loginActivity: JSON.parse(localStorage.getItem('loginActivity') || '[]').filter(
                activity => new Date(activity.timestamp) > twelveMonthsAgo
            )
        };
    }

    return baseData;
}

// Generar historial médico ficticio
function generateMedicalHistory() {
    return {
        conditions: [
            {
                name: "Hipertensión",
                diagnosed: "2023-01-15",
                status: "Controlada",
                medications: ["Losartán 50mg", "Amlodipino 5mg"]
            }
        ],
        allergies: ["Penicilina", "Polen"],
        surgeries: [
            {
                procedure: "Apendicectomía",
                date: "2018-06-10",
                hospital: "Hospital San Jerónimo"
            }
        ]
    };
}

// Generar citas médicas ficticias
function generateAppointments() {
    return [
        {
            date: "2024-12-15",
            time: "10:00",
            doctor: "Dr. Carlos Mendoza",
            specialty: "Cardiología",
            status: "Completada",
            notes: "Control de presión arterial, todo normal"
        },
        {
            date: "2024-11-20",
            time: "14:30",
            doctor: "Dra. Ana García",
            specialty: "Medicina General",
            status: "Completada",
            notes: "Revisión anual, análisis de sangre solicitados"
        }
    ];
}

// Descargar archivo
function downloadFile(data, filename, format) {
    let content, mimeType;
    
    if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
    } else if (format === 'csv') {
        content = convertToCSV(data);
        mimeType = 'text/csv';
    } else if (format === 'pdf') {
        // Para PDF, crear un contenido HTML simple
        content = generatePDFContent(data);
        mimeType = 'text/html';
    }
    
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

// Convertir datos a CSV
function convertToCSV(data) {
    const flatten = (obj, prefix = '') => {
        const result = {};
        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                Object.assign(result, flatten(obj[key], prefix + key + '_'));
            } else {
                result[prefix + key] = obj[key];
            }
        }
        return result;
    };
    
    const flatData = flatten(data);
    const headers = Object.keys(flatData);
    const values = Object.values(flatData);
    
    return [headers.join(','), values.join(',')].join('\n');
}

// Generar contenido HTML para PDF
function generatePDFContent(data) {
    return `
        <html>
        <head>
            <title>Datos de MediTrack - ${data.user.name}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .section h2 { color: #26a69a; border-bottom: 2px solid #26a69a; }
                .field { margin-bottom: 10px; }
                .field label { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Datos de MediTrack</h1>
                <p>Generado el ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
                <h2>Información Personal</h2>
                <div class="field"><label>Nombre:</label> ${data.user.name}</div>
                <div class="field"><label>Email:</label> ${data.user.email}</div>
                <div class="field"><label>Teléfono:</label> ${data.user.phone}</div>
                <div class="field"><label>Dirección:</label> ${data.user.address}</div>
            </div>
            
            <div class="section">
                <h2>Preferencias</h2>
                <div class="field"><label>Idioma:</label> ${data.preferences.language}</div>
                <div class="field"><label>Modo oscuro:</label> ${data.preferences.darkMode ? 'Activado' : 'Desactivado'}</div>
            </div>
        </body>
        </html>
    `;
}

// Configurar modal de eliminación de cuenta
function setupDeleteAccountModal() {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const confirmInput = document.getElementById('confirmDeleteText');
    const statusDiv = document.getElementById('confirmationStatus');
    
    if (!confirmBtn || !confirmInput || !statusDiv) return;
    
    confirmInput.addEventListener('input', function() {
        const inputValue = this.value.trim();
        const isCorrect = inputValue === 'ELIMINAR';
        
        confirmBtn.disabled = !isCorrect;
        
        if (inputValue === '') {
            statusDiv.textContent = '';
            statusDiv.className = 'confirmation-status';
        } else if (isCorrect) {
            statusDiv.textContent = '✓ Confirmación correcta';
            statusDiv.className = 'confirmation-status correct';
        } else {
            statusDiv.textContent = '✗ Debes escribir "ELIMINAR" exactamente';
            statusDiv.className = 'confirmation-status incorrect';
        }
    });
    
    confirmBtn.addEventListener('click', function() {
        if (confirmInput.value.trim() === 'ELIMINAR') {
            // Simular eliminación de cuenta
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';
            
            setTimeout(() => {
                // Limpiar datos locales
                localStorage.clear();
                sessionStorage.clear();
                
                // Mostrar notificación final
                showNotification('Cuenta eliminada permanentemente', 'info');
                
                // Redirigir a página de inicio
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }, 3000);
        }
    });
}



// Función global para cerrar sesión directamente
function logoutDirect() {
    console.log('Función logoutDirect() ejecutada');
        
    // Limpiar datos de sesión inmediatamente
        sessionStorage.clear();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionToken');
    localStorage.removeItem('authorizedDevices');
        
    console.log('Datos de sesión limpiados');
    
    // Mostrar notificación simple
    try {
        showNotification('Sesión cerrada correctamente', 'success');
    } catch (error) {
        console.log('Notificación mostrada o función no disponible');
    }
        
    // Redirigir directamente al login
    console.log('Redirigiendo a index.html...');
    window.location.href = 'index.html';
}

// Inicializar funcionalidades avanzadas
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando funcionalidades...');
    setupAdvancedAccountActions();
    
    // Configurar botón de cerrar sesión de forma independiente
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        console.log('Botón de cerrar sesión encontrado en DOMContentLoaded');
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botón de cerrar sesión clickeado desde DOMContentLoaded');
            logoutDirect();
        });
    } else {
        console.error('Botón de cerrar sesión no encontrado en DOMContentLoaded');
    }
});
