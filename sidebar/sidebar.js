// Clase para manejar la barra de navegación superior mejorada
if (typeof window.TopNavbarManager === 'undefined') {
class TopNavbarManager {
    constructor() {
        this.navbar = null;
        this.navbarToggle = null;
        this.navbarOverlay = null;
        this.navbarNav = null;
        this.isCollapsed = false;
        this.isMobile = false;
        this.currentPage = '';
        this.notifications = [];
        this.init();
    }

    init() {
        this.detectDevice();
        this.setupElements();
        this.setupEventListeners();
        this.setActiveMenuItem();
        this.setupResponsive();
        this.loadUserData();
        this.setupAnimations();
        this.setupGlobalFunctions();
    }

    // Detectar tipo de dispositivo
    detectDevice() {
            this.isMobile = window.innerWidth <= 768;
            this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
            this.isDesktop = window.innerWidth > 1024;
            
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
                const wasTablet = this.isTablet;
                
                this.isMobile = window.innerWidth <= 768;
                this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
                this.isDesktop = window.innerWidth > 1024;
            
                if (wasMobile !== this.isMobile || wasTablet !== this.isTablet) {
                this.handleResize();
            }
        });
    }

    // Configurar elementos del DOM
    setupElements() {
        this.navbar = document.getElementById('topNavbar');
        this.navbarToggle = document.getElementById('navbarToggle');
        this.navbarOverlay = document.getElementById('navbarOverlay');
        this.navbarNav = document.getElementById('navbarNav');
        
        if (!this.navbar) {
            console.error('Top navbar no encontrado');
            return;
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Toggle del navbar
        if (this.navbarToggle) {
            this.navbarToggle.addEventListener('click', () => {
                this.toggleNavbar();
            });
        }

        // Overlay para cerrar en móviles
        if (this.navbarOverlay) {
            this.navbarOverlay.addEventListener('click', () => {
                this.closeNavbar();
            });
        }

        // Navegación del menú
        this.setupMenuNavigation();

        // Acciones del usuario
        this.setupUserActions();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Click fuera del navbar
        document.addEventListener('click', (e) => {
            if (this.isMobile && this.navbarNav.classList.contains('show')) {
                if (!this.navbar.contains(e.target) && !this.navbarToggle.contains(e.target)) {
                    this.closeNavbar();
                }
            }
        });

        // Scroll para colapsar navbar en desktop
        if (!this.isMobile) {
            let lastScrollTop = 0;
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // Scrolling down
                    this.navbar.classList.add('collapsed');
                    this.isCollapsed = true;
                } else if (scrollTop < lastScrollTop) {
                    // Scrolling up
                    this.navbar.classList.remove('collapsed');
                    this.isCollapsed = false;
                }
                
                lastScrollTop = scrollTop;
            });
        }

        // Logo click para ir al inicio
        const logoContainer = this.navbar.querySelector('.logo-container');
        if (logoContainer) {
            logoContainer.addEventListener('click', () => {
                window.location.href = 'Inicio.html';
            });
        }
    }

    // Configurar navegación del menú
    setupMenuNavigation() {
        const navLinks = this.navbar.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Prevenir navegación si es el mismo enlace
                if (link.getAttribute('href') === this.currentPage) {
                    e.preventDefault();
                    return;
                }

                // Agregar efecto de loading
                this.addLoadingEffect(link);

                // Marcar como activo
                this.setActiveMenuItem(link);

                // Cerrar navbar en móviles después de hacer click
                if (this.isMobile) {
                    setTimeout(() => {
                        this.closeNavbar();
                    }, 300);
                }
            });

            // Efectos hover
            link.addEventListener('mouseenter', () => {
                this.addHoverEffect(link);
            });

            link.addEventListener('mouseleave', () => {
                this.removeHoverEffect(link);
            });
        });
    }

    // Configurar acciones del usuario
    setupUserActions() {
        const userActionBtns = this.navbar.querySelectorAll('.user-action-btn');
        
        userActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevenir que el evento se propague al enlace padre
                const action = btn.getAttribute('title');
                this.handleUserAction(action);
            });
        });

        // Configurar el enlace del perfil para evitar conflictos
        const userProfileLink = this.navbar.querySelector('.user-profile-link');
        if (userProfileLink) {
            userProfileLink.addEventListener('click', (e) => {
                // Solo navegar si no se hizo click en un botón de acción
                if (!e.target.closest('.user-action-btn')) {
                    // Permitir la navegación normal al perfil
                    return true;
                }
            });
        }
    }

    // Configurar atajos de teclado
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + B para toggle navbar
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleNavbar();
            }

            // Escape para cerrar navbar en móviles
            if (e.key === 'Escape' && this.isMobile && this.navbarNav.classList.contains('show')) {
                this.closeNavbar();
            }

            // Alt + N para nueva cita
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                window.location.href = 'Citas.html';
            }

            // Alt + H para ir al inicio
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                window.location.href = 'Inicio.html';
            }
        });
    }

    // Toggle del navbar
    toggleNavbar() {
        if (this.isMobile) {
            if (this.navbarNav.classList.contains('show')) {
                this.closeNavbar();
            } else {
                this.openNavbar();
            }
        } else {
            if (this.navbar.classList.contains('collapsed')) {
                this.expandNavbar();
            } else {
                this.collapseNavbar();
            }
        }
    }

    // Abrir navbar (móviles)
    openNavbar() {
        this.navbarNav.classList.add('show');
        this.navbarOverlay.classList.add('show');
        if (this.isMobile || this.isTablet) {
        document.body.style.overflow = 'hidden';
            }
        // Animar entrada
        this.navbarNav.classList.add('animate-in');
        setTimeout(() => {
            this.navbarNav.classList.remove('animate-in');
        }, 250);
    }

    // Cerrar navbar (móviles)
    closeNavbar() {
        this.navbarNav.classList.add('animate-out');
        this.navbarOverlay.classList.remove('show');
        setTimeout(() => {
            this.navbarNav.classList.remove('show', 'animate-out');
            document.body.style.overflow = '';
        }, 250);
    }

    // Colapsar navbar (desktop)
    collapseNavbar() {
        this.navbar.classList.add('collapsed');
        this.isCollapsed = true;
        this.saveNavbarState();
    }

    // Expandir navbar (desktop)
    expandNavbar() {
        this.navbar.classList.remove('collapsed');
        this.isCollapsed = false;
        this.saveNavbarState();
    }

    // Manejar resize de ventana
    handleResize() {
        if (this.isMobile) {
            this.navbar.classList.remove('collapsed');
            this.navbarNav.classList.remove('show');
            this.navbarOverlay.classList.remove('show');
            document.body.style.overflow = '';
        } else {
            this.navbarNav.classList.remove('show');
            this.navbarOverlay.classList.remove('show');
            document.body.style.overflow = '';
            // Restaurar estado colapsado si estaba
            if (this.isCollapsed) {
                this.navbar.classList.add('collapsed');
            }
        }
    }

    // Configurar responsive
    setupResponsive() {
            // Remover clases anteriores
            this.navbar.classList.remove('mobile', 'tablet', 'desktop', 'collapsed');
            
            // Agregar clase según el dispositivo
        if (this.isMobile) {
                this.navbar.classList.add('mobile');
                this.setupMobileNavigation();
            } else if (this.isTablet) {
                this.navbar.classList.add('tablet');
                this.setupTabletNavigation();
        } else {
                this.navbar.classList.add('desktop');
                this.setupDesktopNavigation();
            }
        }

        // Configurar navegación móvil
        setupMobileNavigation() {
            // Asegurar que el navbar esté cerrado por defecto en móvil
            this.closeNavbar();
            
            // Configurar gestos táctiles
            this.setupTouchGestures();
            
            // Configurar tooltips para móvil
            this.setupMobileTooltips();
        }

        // Configurar navegación tablet
        setupTabletNavigation() {
            // Mostrar navbar por defecto en tablet
            this.openNavbar();
            
            // Configurar tooltips para tablet
            this.setupTabletTooltips();
        }

        // Configurar navegación desktop
        setupDesktopNavigation() {
            // Mostrar navbar por defecto en desktop
            this.openNavbar();
            
            // Restaurar estado guardado
            this.restoreNavbarState();
        }

        // Configurar gestos táctiles para móvil
        setupTouchGestures() {
            let startX = 0;
            let startY = 0;
            let isSwiping = false;

            // Detectar swipe desde el borde izquierdo
            document.addEventListener('touchstart', (e) => {
                if (e.touches[0].clientX <= 20) {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                    isSwiping = true;
                }
            });

            document.addEventListener('touchmove', (e) => {
                if (!isSwiping) return;
                
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const diffX = currentX - startX;
                const diffY = Math.abs(currentY - startY);

                // Solo abrir si el swipe es horizontal y hacia la derecha
                if (diffX > 50 && diffY < 100) {
                    this.openNavbar();
                    isSwiping = false;
                }
            });

            document.addEventListener('touchend', () => {
                isSwiping = false;
            });
        }

        // Configurar tooltips para móvil
        setupMobileTooltips() {
            const navLinks = this.navbar.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                link.addEventListener('touchstart', () => {
                    // Mostrar tooltip táctil
                    this.showTouchTooltip(link);
                });
            });
        }

        // Configurar tooltips para tablet
        setupTabletTooltips() {
            const navLinks = this.navbar.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                link.addEventListener('mouseenter', () => {
                    this.showTabletTooltip(link);
                });

                link.addEventListener('mouseleave', () => {
                    this.hideTabletTooltip(link);
                });
            });
        }

        // Mostrar tooltip táctil
        showTouchTooltip(link) {
            const tooltip = document.createElement('div');
            tooltip.className = 'mobile-tooltip';
            tooltip.textContent = link.getAttribute('data-tooltip');
            
            // Posicionar tooltip
            const rect = link.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.top = `${rect.top - 40}px`;
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.zIndex = '9999';
            
            document.body.appendChild(tooltip);
            
            // Remover después de 2 segundos
            setTimeout(() => {
                tooltip.remove();
            }, 2000);
        }

        // Mostrar tooltip tablet
        showTabletTooltip(link) {
            // Los tooltips de tablet se manejan con CSS
            link.setAttribute('data-show-tooltip', 'true');
        }

        // Ocultar tooltip tablet
        hideTabletTooltip(link) {
            link.removeAttribute('data-show-tooltip');
    }

    // Guardar estado del navbar
    saveNavbarState() {
        if (!this.isMobile) {
            localStorage.setItem('navbarCollapsed', this.isCollapsed);
        }
    }

    // Restaurar estado del navbar
    restoreNavbarState() {
        if (!this.isMobile) {
            const savedState = localStorage.getItem('navbarCollapsed');
            if (savedState === 'true') {
                this.collapseNavbar();
            }
        }
    }

    // Marcar elemento activo del menú
    setActiveMenuItem(clickedLink = null) {
        // Remover clase activa de todos los elementos
        const navItems = this.navbar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });

        if (clickedLink) {
            // Marcar el elemento clickeado como activo
            const navItem = clickedLink.closest('.nav-item');
            if (navItem) {
                navItem.classList.add('active');
            }
        } else {
            // Marcar elemento activo basado en la página actual
            this.currentPage = window.location.pathname.split('/').pop() || 'Inicio.html';
            const activeLink = this.navbar.querySelector(`[href="${this.currentPage}"]`);
            if (activeLink) {
                const navItem = activeLink.closest('.nav-item');
                if (navItem) {
                    navItem.classList.add('active');
                }
            }
        }
    }

    // Agregar efecto de loading
    addLoadingEffect(link) {
        const icon = link.querySelector('.nav-icon i');
        if (icon) {
            icon.classList.add('fa-spin');
            setTimeout(() => {
                icon.classList.remove('fa-spin');
            }, 1000);
        }
    }

    // Agregar efecto hover
    addHoverEffect(link) {
        link.style.transform = 'translateY(-4px) scale(1.02)';
    }

    // Remover efecto hover
    removeHoverEffect(link) {
        link.style.transform = '';
    }

    // Manejar acciones del usuario
    handleUserAction(action) {
        switch (action) {
            case 'Configuración rápida':
                this.showQuickSettings();
                break;
            case 'Cerrar sesión':
                this.handleLogout();
                break;
            default:
                console.log('Acción no implementada:', action);
        }
    }

    // Mostrar configuración rápida
    showQuickSettings() {
        // Crear modal de configuración rápida
        const modal = document.createElement('div');
        modal.className = 'quick-settings-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-cog"></i> Configuración Rápida</h3>
                    <button class="close-btn" onclick="this.closest('.quick-settings-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="settings-options">
                    <button class="setting-btn" data-setting="notifications">
                        <i class="fas fa-bell"></i>
                        <span>Notificaciones</span>
                        <div class="setting-status">Activadas</div>
                    </button>
                    <button class="setting-btn" data-setting="theme">
                        <i class="fas fa-palette"></i>
                        <span>Tema</span>
                        <div class="setting-status">Claro</div>
                    </button>
                    <button class="setting-btn" data-setting="language">
                        <i class="fas fa-globe"></i>
                        <span>Idioma</span>
                        <div class="setting-status">Español</div>
                    </button>
                    <button class="setting-btn" data-setting="privacy">
                        <i class="fas fa-shield-alt"></i>
                        <span>Privacidad</span>
                        <div class="setting-status">Seguro</div>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Event listeners para el modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Animar entrada
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    // Manejar logout
    handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Limpiar datos de sesión
            localStorage.removeItem('userName');
            localStorage.removeItem('userData');
            
            console.log('Cerrando sesión...');
            this.showNotification('Sesión cerrada', 'Has cerrado sesión correctamente', 'success');
            
            // Redirigir a login después de un delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }

    // Cargar datos del usuario
    loadUserData() {
        // Obtener el nombre del usuario desde localStorage
        const userName = localStorage.getItem('userName');
        
        if (!userName) {
            // Si no hay usuario autenticado, redirigir al login
            window.location.href = 'index.html';
            return;
        }
        
        // Generar email basado en el nombre del usuario
        const userEmail = `${userName.toLowerCase().replace(/\s+/g, '.')}@email.com`;
        
        // Generar avatar con iniciales del usuario
        const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
        const userAvatar = `https://placehold.co/150x150/b2dfdb/00796b?text=${initials}`;
        
        const userData = {
            name: userName,
            role: 'Paciente',
            email: userEmail,
            avatar: userAvatar,
            status: 'online'
        };

        this.updateUserInfo(userData);
    }

    // Actualizar información del usuario
    updateUserInfo(userData) {
        const userName = this.navbar.querySelector('.user-name');
        const userRole = this.navbar.querySelector('.user-role');
        const userAvatar = this.navbar.querySelector('.user-avatar');
        const userStatus = this.navbar.querySelector('.user-status');
        
        // También buscar por ID para compatibilidad
        const sidebarUserName = document.getElementById('sidebarUserName');

        if (userName) userName.textContent = userData.name;
        if (sidebarUserName) sidebarUserName.textContent = userData.name;
        if (userRole) userRole.textContent = userData.role;
        if (userAvatar) userAvatar.src = userData.avatar;
        if (userStatus) {
            userStatus.className = `user-status ${userData.status}`;
        }
    }

    // Configurar animaciones
    setupAnimations() {
        // Animación de entrada para elementos del menú
        const navItems = this.navbar.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Animación para badges
        const badges = this.navbar.querySelectorAll('.nav-badge');
        badges.forEach(badge => {
            if (badge.textContent !== '0') {
                badge.style.animation = 'pulse 2s infinite';
            }
        });
    }

    // Actualizar badges de notificaciones
    updateBadges() {
        // Simular actualización de badges
        const badges = this.navbar.querySelectorAll('.nav-badge');
        badges.forEach(badge => {
            const currentValue = parseInt(badge.textContent) || 0;
            if (currentValue > 0) {
                badge.style.animation = 'pulse 2s infinite';
            } else {
                badge.style.animation = 'none';
            }
        });
    }

    // Mostrar notificación en el navbar
    showNavbarNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `navbar-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        this.navbar.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-remover
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Obtener icono de notificación
    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Configurar funciones globales
    setupGlobalFunctions() {
        // Hacer las funciones disponibles globalmente
        window.showQuickSettings = () => this.showQuickSettings();
        window.handleLogout = () => this.handleLogout();
        window.showNotification = (title, message, type) => this.showNavbarNotification(message, type);
    }

    // Métodos públicos para uso externo
    publicMethods() {
        return {
            toggle: () => this.toggleNavbar(),
            open: () => this.openNavbar(),
            close: () => this.closeNavbar(),
            collapse: () => this.collapseNavbar(),
            expand: () => this.expandNavbar(),
            updateBadges: () => this.updateBadges(),
            showNotification: (message, type) => this.showNavbarNotification(message, type)
        };
        }
    }
    window.TopNavbarManager = TopNavbarManager;
}

// Función para inicializar el sidebar
function initializeSidebar() {
    if (!window.topNavbarManager) {
        window.topNavbarManager = new window.TopNavbarManager();
    }
}

// Inicializar cuando el DOM esté listo
// (Solo si el HTML ya está presente)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeSidebar();
    }, 100);
});

window.initializeSidebar = initializeSidebar;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.TopNavbarManager;
} 