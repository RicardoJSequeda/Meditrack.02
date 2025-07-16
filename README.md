# MediTrack: Tu Asistente Personal de Salud

MediTrack es una aplicación web intuitiva y completa diseñada para ayudarte a gestionar tu salud diaria de manera eficiente. Desde el seguimiento de tus medicamentos y citas médicas hasta el monitoreo de tus signos vitales y la obtención de consejos de salud personalizados, MediTrack te mantiene al tanto de tu bienestar.

## Tabla de Contenidos

1.  [Características Principales](#características-principales)
2.  [Demo y Credenciales](#demo-y-credenciales)
3.  [Capturas de Pantalla](#capturas-de-pantalla)
4.  [Tecnologías Utilizadas](#tecnologías-utilizadas)
5.  [Primeros Pasos (Getting Started)](#primeros-pasos-getting-started)
6.  [Requisitos](#requisitos)
7.  [Contribuciones](#contribuciones)
8.  [Licencia](#licencia)
9.  [Créditos](#créditos)

---

## Características Principales

### 🔐 **Sistema de Autenticación Avanzado**
* **Login Tradicional:** Sistema de autenticación seguro con validación de usuarios y contraseñas
* **Login Social:** Integración con Google, Facebook y Gmail para acceso rápido y seguro
* **Registro de Usuarios:** Formulario completo con validación de datos y fortaleza de contraseñas
* **Recuperación de Contraseñas:** Sistema de recuperación por email con códigos de verificación
* **Rate Limiting:** Protección contra ataques de fuerza bruta con bloqueo temporal
* **2FA (Autenticación de Dos Factores):** Seguridad adicional opcional para cuentas
* **Autorización de Dispositivos:** Control de dispositivos autorizados para el acceso
* **Logs de Actividad:** Registro detallado de intentos de login y actividad de usuario

### ✨ **Salpicadero Interactivo**
* Un resumen rápido de tu estado de salud actual, próximas dosis, citas y adherencia semanal
* Incluye una gráfica de presión arterial para un seguimiento visual de tus tendencias
* Saludo personalizado dinámico basado en la hora del día
* Información del usuario mostrada dinámicamente desde el sistema de login

### 🗓️ **Gestión de Citas**
* Organiza y visualiza todas tus citas médicas, con opciones para agendar y reagendar
* Integración con el sistema de usuarios para citas personalizadas

### 🚨 **Sección de Emergencia**
* Acceso rápido a información vital y contactos de emergencia
* Incluye tu ubicación actual (si se permite)
* Datos de emergencia vinculados al perfil del usuario

### 📊 **Informe Semanal**
* Un resumen detallado de tus métricas de salud a lo largo del tiempo
* Ideal para el seguimiento de progreso
* Datos personalizados por usuario

### 📋 **Historial Médico**
* Mantén un registro completo de diagnósticos, tratamientos, alergias y otras condiciones médicas importantes
* Historial vinculado al perfil del usuario

### 💡 **Consejos de Salud**
* Obtén recomendaciones personalizadas para mejorar tus hábitos y bienestar general
* Consejos adaptados al perfil del usuario

### 📝 **Notas Personales**
* Un espacio flexible para registrar pensamientos, preguntas para el médico o cualquier información relevante
* Notas privadas por usuario

### 🔔 **Recordatorios Extra**
* Configura alertas personalizadas para necesidades específicas, como tomar agua o realizar ejercicios
* Recordatorios personalizados por usuario

### ⚙️ **Perfil y Configuración**
* Personaliza tu información personal y ajusta las preferencias de la aplicación
* Configuración de notificaciones y tamaño de fuente
* Gestión de datos de usuario y preferencias de seguridad

### 🤖 **MediBot (Asistente de IA)**
* Un chatbot integrado que proporciona análisis generales de síntomas y consejos de salud
* Impulsado por la API de Gemini
* Interacciones personalizadas por usuario

## Demo y Credenciales

Puedes explorar la aplicación MediTrack en línea a través de GitHub Pages:

🔗 **Enlace del Proyecto Online:** [https://ricardocv1n.github.io/MediTrack/index.html](https://ricardojsequeda.github.io/Meditrack.02/)

### 🔐 **Sistema de Autenticación**

#### **Login Tradicional:**
Para probar la aplicación con el sistema tradicional, puedes usar las siguientes credenciales de ejemplo:
* **Usuario:** `Maria`
* **Contraseña:** `Maria123`

#### **Login Social (Simulado):**
También puedes probar el sistema de login social con:
* **Google:** Simula autenticación con cuenta de Google
* **Facebook:** Simula autenticación con cuenta de Facebook  
* **Gmail:** Simula autenticación con cuenta de Gmail

#### **Nuevas Funcionalidades de Seguridad:**
* **Registro de Usuarios:** Crea tu propia cuenta con validación completa
* **Recuperación de Contraseñas:** Sistema de recuperación por email
* **Rate Limiting:** Protección automática contra intentos fallidos
* **2FA:** Autenticación de dos factores opcional
* **Autorización de Dispositivos:** Control de acceso por dispositivo

## Capturas de Pantalla

Aquí puedes añadir algunas capturas de pantalla para mostrar la interfaz de usuario y las funcionalidades clave de MediTrack. Esto ayuda a los usuarios a visualizar la aplicación antes de probarla.

<img width="1549" height="806" alt="image" src="https://github.com/user-attachments/assets/2eea0051-3113-4fd1-bfbe-5d4cf6ab8d15" />
<img width="1916" height="943" alt="image" src="https://github.com/user-attachments/assets/36092898-3ac2-4d9e-bb0e-5ac369859340" />
<img width="1905" height="945" alt="image" src="https://github.com/user-attachments/assets/b652ff71-f602-49d1-a421-50aa9c077c6c" />
<img width="1898" height="933" alt="image" src="https://github.com/user-attachments/assets/aa749c58-d1ca-43d6-90cc-e9037383a79e" />
<img width="1904" height="945" alt="image" src="https://github.com/user-attachments/assets/e41fb51b-8b58-4020-9d76-05129c31f7e0" />
<img width="1915" height="949" alt="image" src="https://github.com/user-attachments/assets/639a236c-6e29-4239-a3ef-c93f09221057" />









## Tecnologías Utilizadas

* **HTML5:** Para la estructura semántica de todas las páginas de la aplicación.
* **CSS3:** Para el diseño, la estética y la adaptabilidad (responsive design) de la interfaz de usuario.
* **JavaScript (ES6+):** Para la interactividad del lado del cliente, la manipulación del DOM y la lógica de la aplicación.
* **Chart.js:** Una biblioteca flexible para la creación de gráficas interactivas, utilizada para visualizar datos de salud como la presión arterial.
* **Font Awesome:** Una popular biblioteca de iconos vectoriales para enriquecer la interfaz de usuario.
* **Google Gemini API:** Utilizada para potenciar las capacidades de inteligencia artificial del MediBot, permitiendo el análisis de síntomas y la generación de consejos de salud.

## 🎨 **Diseño y Experiencia de Usuario**

### **Sistema de Login Moderno:**
* **Diseño Responsivo:** Optimizado para todos los dispositivos (desktop, tablet, móvil)
* **Interfaz Intuitiva:** Formularios centrados y elementos touch-friendly
* **Animaciones Suaves:** Transiciones y efectos visuales modernos
* **Modal de Autorización:** Ventana de confirmación profesional para login social
* **Feedback Visual:** Indicadores de carga, mensajes de error/éxito
* **Accesibilidad:** Contraste adecuado y navegación por teclado

### **Características de Diseño:**
* **Paleta de Colores:** Esquema teal profesional y moderno
* **Tipografía:** Fuente Inter para mejor legibilidad
* **Iconografía:** Iconos Font Awesome para mejor UX
* **Layout Adaptativo:** Distribución inteligente del espacio en móviles
* **Componentes Reutilizables:** Botones, inputs y modales consistentes

## Primeros Pasos (Getting Started)

Para comenzar a usar MediTrack, sigue estos sencillos pasos:

1.  **Clonar el Repositorio (para desarrollo local):**
    Si deseas ejecutar el proyecto localmente o contribuir, puedes clonar el repositorio:
    ```bash
    git clone [https://github.com/tu-usuario/MediTrack.git](https://github.com/tu-usuario/MediTrack.git)
    cd MediTrack
    ```
    *(Asegúrate de reemplazar `tu-usuario` con tu nombre de usuario de GitHub real si estás compartiendo este README en tu propio repositorio).*

2.  **Abrir la Aplicación Localmente:**
    Simplemente abre el archivo `index.html` en tu navegador web preferido. Asegúrate de que todos los archivos y directorios estén en sus respectivas ubicaciones para que la aplicación cargue correctamente los estilos y scripts.

3.  **Despliegue en GitHub Pages (para tu propia instancia):**
    Este proyecto está optimizado para un despliegue rápido y sencillo en GitHub Pages.
    * Sube todos los archivos y carpetas a tu repositorio de GitHub.
    * Ve a la configuración de tu repositorio en GitHub.
    * En la sección "Pages", selecciona la rama `main` (o la que uses para tu código principal) y la carpeta raíz (`/`) como fuente de despliegue.
    * GitHub Pages generará automáticamente una URL para tu aplicación (ej: `https://tu-usuario.github.io/MediTrack/`).

## Requisitos

Para una experiencia óptima con MediTrack, se recomienda utilizar un navegador web moderno (Chrome, Firefox, Safari, Edge) con JavaScript habilitado.

## 🚀 **Mejoras Técnicas Implementadas**

### **Seguridad Avanzada:**
* **Validación de Datos:** Verificación completa de formularios en tiempo real
* **Encriptación Local:** Almacenamiento seguro de datos de usuario
* **Protección CSRF:** Tokens de seguridad para formularios
* **Sanitización de Inputs:** Prevención de inyección de código
* **Headers de Seguridad:** Configuración de seguridad del navegador

### **Performance y Optimización:**
* **Lazy Loading:** Carga diferida de componentes no críticos
* **Minificación:** Código CSS y JS optimizado
* **Caching:** Almacenamiento local inteligente
* **Compresión:** Recursos optimizados para carga rápida
* **Responsive Images:** Imágenes adaptativas según el dispositivo

### **Funcionalidades Avanzadas:**
* **Gestión de Estado:** Control centralizado del estado de la aplicación
* **Rutas Dinámicas:** Navegación sin recarga de página
* **Persistencia de Datos:** Almacenamiento local de preferencias
* **Sincronización:** Sincronización automática de datos
* **Backup y Restore:** Sistema de respaldo de datos del usuario

## Contribuciones

¡Las contribuciones son bienvenidas y animadas! Si tienes ideas para mejorar MediTrack, encuentras un error o quieres añadir nuevas funcionalidades, por favor, sigue estos pasos:

1.  Haz un "fork" de este repositorio.
2.  Crea una nueva rama para tu característica o corrección (`git checkout -b feature/nombre-de-tu-caracteristica` o `bugfix/descripcion-del-bug`).
3.  Realiza tus cambios y haz "commit" con un mensaje claro y descriptivo (`git commit -m 'feat: añade nueva característica X'` o `fix: corrige problema Y`).
4.  Sube tus cambios a tu repositorio "forkeado" (`git push origin feature/nombre-de-tu-caracteristica`).
5.  Abre un "Pull Request" a la rama `main` de este repositorio, describiendo tus cambios en detalle.

## Licencia

Este proyecto está bajo la Licencia MIT. 

## Créditos

* **Iconos:** Proporcionados por [Font Awesome](https://fontawesome.com/).
* **Gráficos:** Implementados con la biblioteca [Chart.js](https://www.chartjs.org/).
* **Funcionalidad de IA:** Impulsada por la [API de Google Gemini](https://ai.google.dev/models/gemini).
* **Fuentes:** [Inter](https://fonts.google.com/specimen/Inter) de Google Fonts para el sistema de login.
* **Diseño Responsivo:** Implementado con CSS Grid y Flexbox modernos.
* **Animaciones:** Efectos visuales con CSS3 y JavaScript ES6+.
* **Seguridad:** Implementación de mejores prácticas de seguridad web.

---

## 📝 **Changelog - Últimas Actualizaciones**

### **v2.0.0 - Sistema de Autenticación Completo**
* ✨ **Nuevo:** Sistema de login tradicional con validación completa
* 🔐 **Nuevo:** Login social con Google, Facebook y Gmail
* 📝 **Nuevo:** Formulario de registro con validación de datos
* 🔒 **Nuevo:** Sistema de recuperación de contraseñas
* 🛡️ **Nuevo:** Rate limiting y protección contra ataques
* 📱 **Mejorado:** Diseño completamente responsivo
* 🎨 **Mejorado:** Interfaz moderna con animaciones suaves
* 🔧 **Mejorado:** Código optimizado y mantenible

### **v1.0.0 - Funcionalidades Básicas**
* 🏥 **Funcionalidades principales de gestión de salud**
* 📊 **Dashboard interactivo con gráficas**
* 🤖 **MediBot con IA integrada**
* 📋 **Gestión de citas y recordatorios**
