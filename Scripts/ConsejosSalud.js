// ===== CONSEJOS DE SALUD - FUNCIONALIDADES AVANZADAS =====

// ===== INICIALIZACIÓN DEL SIDEBAR =====
document.addEventListener('DOMContentLoaded', function() {
    loadSidebar();
});

class HealthTipsApp {
    constructor() {
        this.favorites = JSON.parse(localStorage.getItem('healthTipsFavorites')) || [];
        this.userProgress = JSON.parse(localStorage.getItem('healthTipsProgress')) || {
            completedTips: 15,
            totalTips: 20,
            currentStreak: 7,
            achievements: 5,
            points: 120
        };
        this.currentChallenges = JSON.parse(localStorage.getItem('healthTipsChallenges')) || [];
        this.currentTab = 'featured';
        this.carouselIndex = 0;
        this.searchQuery = '';
        this.currentFilter = 'all';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.renderAllSections();
        this.initializeAnimations();
        this.setupModals();
        this.updateProgressDisplay();
        this.renderRoutineSection();
        // --- Mejoras UI/UX tiempo real ---
        setInterval(() => this.updateProgressDisplay(), 1000);
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('healthTips')) this.updateProgressDisplay();
        });
    }

    // ===== DATOS SIMULADOS =====
    loadData() {
        this.featuredTips = [
            {
                id: 'cardio-1',
                title: 'Salud Cardiovascular',
                subtitle: 'Camina 30 minutos',
                description: 'Realiza caminatas diarias para mejorar la circulación y reducir el estrés.',
                category: 'activity',
                difficulty: 3,
                duration: '30 min',
                icon: 'fas fa-walking',
                badge: 'Popular',
                benefits: ['Reduce riesgo cardíaco', 'Mejora circulación', 'Controla presión arterial', 'Reduce estrés'],
                instructions: ['Usa calzado cómodo', 'Mantén postura erguida', 'Comienza moderado', 'Puedes dividir en sesiones'],
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
            },
            {
                id: 'nutrition-1',
                title: 'Nutrición Balanceada',
                subtitle: 'Incluye frutas y verduras',
                description: 'Agrega al menos 5 porciones de frutas y verduras a tu dieta diaria.',
                category: 'nutrition',
                difficulty: 2,
                duration: 'Todo el día',
                icon: 'fas fa-apple-alt',
                badge: 'Nuevo',
                benefits: ['Vitaminas y minerales', 'Fibra dietética', 'Antioxidantes', 'Control de peso'],
                instructions: ['Varía los colores', 'Incluye en cada comida', 'Prefiere frescas', 'Lava bien'],
                image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'
            },
            {
                id: 'mental-1',
                title: 'Bienestar Mental',
                subtitle: 'Técnicas de respiración',
                description: 'Practica respiración profunda 5 minutos al día para reducir la ansiedad.',
                category: 'mental',
                difficulty: 1,
                duration: '5 min',
                icon: 'fas fa-leaf',
                badge: 'Recomendado',
                benefits: ['Reduce ansiedad', 'Mejora concentración', 'Regula presión arterial', 'Promueve relajación'],
                instructions: ['Siéntate cómodamente', 'Respira por la nariz', 'Cuenta hasta 4', 'Exhala lentamente'],
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
            },
            {
                id: 'sleep-1',
                title: 'Calidad del Sueño',
                subtitle: 'Rutina nocturna',
                description: 'Establece una rutina de 30 minutos antes de dormir para mejorar tu descanso.',
                category: 'sleep',
                difficulty: 2,
                duration: '30 min',
                icon: 'fas fa-moon',
                badge: 'Esencial',
                benefits: ['Mejor descanso', 'Recuperación muscular', 'Función cerebral', 'Sistema inmune'],
                instructions: ['Evita pantallas', 'Luz tenue', 'Temperatura fresca', 'Rutina consistente'],
                image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400'
            },
            {
                id: 'agua-1',
                title: 'Hidratación Óptima',
                subtitle: 'Bebe suficiente agua',
                description: 'Mantente hidratado bebiendo al menos 8 vasos de agua al día.',
                category: 'nutrition',
                difficulty: 1,
                duration: 'Todo el día',
                icon: 'fas fa-tint',
                badge: 'Básico',
                benefits: ['Mejora energía', 'Favorece digestión', 'Piel saludable', 'Regula temperatura'],
                instructions: ['Lleva una botella', 'Bebe antes de tener sed', 'Evita bebidas azucaradas'],
                image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400'
            },
            {
                id: 'postura-1',
                title: 'Mejora tu Postura',
                subtitle: 'Evita dolores de espalda',
                description: 'Corrige tu postura al sentarte y caminar para prevenir molestias.',
                category: 'activity',
                difficulty: 2,
                duration: 'Durante el día',
                icon: 'fas fa-user-alt',
                badge: 'Saludable',
                benefits: ['Reduce dolor lumbar', 'Mejora respiración', 'Previene lesiones'],
                instructions: ['Espalda recta', 'Hombros relajados', 'Pies apoyados'],
                image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'
            },
            {
                id: 'meditacion-1',
                title: 'Meditación Diaria',
                subtitle: '10 minutos de calma',
                description: 'Dedica 10 minutos al día a meditar para reducir el estrés.',
                category: 'mental',
                difficulty: 1,
                duration: '10 min',
                icon: 'fas fa-om',
                badge: 'Mindfulness',
                benefits: ['Reduce estrés', 'Mejora enfoque', 'Aumenta bienestar'],
                instructions: ['Busca un lugar tranquilo', 'Cierra los ojos', 'Concéntrate en la respiración'],
                image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400'
            },
            {
                id: 'desayuno-1',
                title: 'Desayuno Saludable',
                subtitle: 'Empieza bien el día',
                description: 'Incluye proteínas y fibra en tu desayuno para más energía.',
                category: 'nutrition',
                difficulty: 2,
                duration: 'Mañana',
                icon: 'fas fa-bread-slice',
                badge: 'Energía',
                benefits: ['Mejor concentración', 'Control de apetito', 'Energía sostenida'],
                instructions: ['Incluye huevo o yogur', 'Agrega fruta', 'Evita azúcares refinados'],
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'
            },
            {
                id: 'pausas-1',
                title: 'Pausas Activas',
                subtitle: 'Muévete cada hora',
                description: 'Realiza pausas activas de 3-5 minutos cada hora para evitar fatiga y mejorar la circulación.',
                category: 'activity',
                difficulty: 1,
                duration: '3-5 min',
                icon: 'fas fa-running',
                badge: 'Oficina',
                benefits: ['Reduce fatiga', 'Mejora circulación', 'Aumenta energía'],
                instructions: ['Levántate', 'Estira brazos y piernas', 'Camina un poco', 'Respira profundo'],
                image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400'
            },
            {
                id: 'azucar-1',
                title: 'Controla el Azúcar',
                subtitle: 'Reduce azúcares añadidos',
                description: 'Limita el consumo de bebidas azucaradas y postres para cuidar tu salud metabólica.',
                category: 'nutrition',
                difficulty: 2,
                duration: 'Todo el día',
                icon: 'fas fa-cube',
                badge: 'Metabólico',
                benefits: ['Previene diabetes', 'Mejora energía', 'Control de peso'],
                instructions: ['Lee etiquetas', 'Prefiere agua', 'Evita snacks procesados'],
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'
            },
            {
                id: 'estres-1',
                title: 'Manejo del Estrés',
                subtitle: 'Técnicas de relajación',
                description: 'Dedica tiempo a técnicas de relajación como respiración, meditación o yoga.',
                category: 'mental',
                difficulty: 2,
                duration: '10-15 min',
                icon: 'fas fa-spa',
                badge: 'Relajación',
                benefits: ['Reduce ansiedad', 'Mejora sueño', 'Aumenta bienestar'],
                instructions: ['Busca un lugar tranquilo', 'Respira profundo', 'Haz estiramientos suaves'],
                image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?w=400'
            },
            {
                id: 'higiene-1',
                title: 'Higiene del Sueño',
                subtitle: 'Ambiente adecuado',
                description: 'Asegura un ambiente oscuro, silencioso y fresco para dormir mejor.',
                category: 'sleep',
                difficulty: 1,
                duration: 'Noche',
                icon: 'fas fa-bed',
                badge: 'Descanso',
                benefits: ['Mejor descanso', 'Sueño profundo', 'Recuperación física'],
                instructions: ['Apaga luces', 'Evita pantallas', 'Ventila la habitación'],
                image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'
            },
            {
                id: 'fibra-1',
                title: 'Consume Fibra',
                subtitle: 'Incluye cereales integrales',
                description: 'Agrega alimentos ricos en fibra como avena, frutas y verduras a tu dieta.',
                category: 'nutrition',
                difficulty: 2,
                duration: 'Todo el día',
                icon: 'fas fa-seedling',
                badge: 'Digestión',
                benefits: ['Mejora digestión', 'Controla colesterol', 'Aumenta saciedad'],
                instructions: ['Prefiere pan integral', 'Agrega semillas', 'Incluye legumbres'],
                image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400'
            },
            {
                id: 'autocuidado-1',
                title: 'Autocuidado Mental',
                subtitle: 'Dedica tiempo a ti',
                description: 'Reserva al menos 15 minutos diarios para actividades que disfrutes y te relajen.',
                category: 'mental',
                difficulty: 1,
                duration: '15 min',
                icon: 'fas fa-smile-beam',
                badge: 'Bienestar',
                benefits: ['Reduce estrés', 'Aumenta felicidad', 'Mejora autoestima'],
                instructions: ['Lee un libro', 'Escucha música', 'Sal a caminar'],
                image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400'
            },
            {
                id: 'proteina-1',
                title: 'Incluye Proteína',
                subtitle: 'En cada comida',
                description: 'Asegúrate de incluir una fuente de proteína en cada comida principal.',
                category: 'nutrition',
                difficulty: 2,
                duration: 'Todo el día',
                icon: 'fas fa-drumstick-bite',
                badge: 'Fuerza',
                benefits: ['Mantiene masa muscular', 'Aumenta saciedad', 'Recuperación física'],
                instructions: ['Incluye huevo, pollo o legumbres', 'Evita frituras', 'Prefiere asados o al vapor'],
                image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400'
            },
            {
                id: 'frutas-1',
                title: 'Frutas de Temporada',
                subtitle: 'Varía tus opciones',
                description: 'Consume frutas frescas de temporada para aprovechar sus nutrientes y sabor.',
                category: 'nutrition',
                difficulty: 1,
                duration: 'Todo el día',
                icon: 'fas fa-lemon',
                badge: 'Natural',
                benefits: ['Vitaminas', 'Antioxidantes', 'Hidratación'],
                instructions: ['Compra local', 'Prueba nuevas frutas', 'Lava bien antes de comer'],
                image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400'
            }
        ];

        this.personalizedTips = [
            {
                id: 'personal-1',
                title: 'Rutina Matutina',
                subtitle: 'Estiramientos para empezar el día',
                description: 'Como sueles despertarte temprano, te recomendamos esta rutina de estiramientos.',
                category: 'activity',
                difficulty: 2,
                duration: '10 min',
                icon: 'fas fa-sun',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
                personalized: true
            },
            {
                id: 'personal-2',
                title: 'Snacks Saludables',
                subtitle: 'Opciones bajas en azúcar',
                description: 'Basado en tus preferencias, aquí tienes opciones de snacks nutritivos.',
                category: 'nutrition',
                difficulty: 1,
                duration: '5 min prep',
                icon: 'fas fa-carrot',
                image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
                personalized: true
            }
        ];

        this.challenges = [
            {
                id: 'challenge-1',
                title: 'Reto de Hidratación',
                description: 'Bebe 8 vasos de agua al día durante 7 días seguidos.',
                participants: 1245,
                progress: 65,
                duration: '7 días',
                icon: 'fas fa-tint',
                category: 'nutrition',
                rewards: ['Insignia Hidratación', '50 puntos'],
                image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'
            },
            {
                id: 'challenge-2',
                title: '10,000 Pasos',
                description: 'Camina al menos 10,000 pasos diarios durante un mes.',
                participants: 892,
                progress: 42,
                duration: '30 días',
                icon: 'fas fa-shoe-prints',
                category: 'activity',
                rewards: ['Insignia Caminante', '100 puntos'],
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
            },
            {
                id: 'challenge-3',
                title: 'Meditación Diaria',
                description: 'Medita 10 minutos cada día durante 21 días.',
                participants: 567,
                progress: 78,
                duration: '21 días',
                icon: 'fas fa-om',
                category: 'mental',
                rewards: ['Insignia Zen', '75 puntos'],
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
            },
            {
                id: 'challenge-4',
                title: 'Desayuno Saludable',
                description: 'Toma un desayuno balanceado cada mañana durante 14 días.',
                participants: 430,
                progress: 20,
                duration: '14 días',
                icon: 'fas fa-bread-slice',
                category: 'nutrition',
                rewards: ['Insignia Desayuno', '30 puntos'],
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'
            },
            {
                id: 'challenge-5',
                title: 'Sin Azúcar Añadida',
                description: 'Evita azúcares añadidos durante 10 días.',
                participants: 312,
                progress: 10,
                duration: '10 días',
                icon: 'fas fa-cube',
                category: 'nutrition',
                rewards: ['Insignia Sin Azúcar', '40 puntos'],
                image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'
            },
            {
                id: 'challenge-6',
                title: 'Dormir 8 Horas',
                description: 'Duerme al menos 8 horas cada noche durante 7 días.',
                participants: 520,
                progress: 35,
                duration: '7 días',
                icon: 'fas fa-bed',
                category: 'sleep',
                rewards: ['Insignia Descanso', '60 puntos'],
                image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'
            },
            {
                id: 'challenge-7',
                title: 'Pausas Activas',
                description: 'Realiza pausas activas cada hora durante tu jornada laboral por 5 días.',
                participants: 210,
                progress: 15,
                duration: '5 días',
                icon: 'fas fa-running',
                category: 'activity',
                rewards: ['Insignia Activo', '25 puntos'],
                image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400'
            },
            {
                id: 'challenge-8',
                title: 'Sin Pantallas Antes de Dormir',
                description: 'Evita pantallas al menos 30 minutos antes de dormir durante 10 días.',
                participants: 180,
                progress: 5,
                duration: '10 días',
                icon: 'fas fa-moon',
                category: 'sleep',
                rewards: ['Insignia Buen Dormir', '35 puntos'],
                image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400'
            },
            {
                id: 'challenge-9',
                title: 'Frutas y Verduras',
                description: 'Incluye al menos 5 porciones de frutas y verduras al día durante 7 días.',
                participants: 390,
                progress: 12,
                duration: '7 días',
                icon: 'fas fa-apple-alt',
                category: 'nutrition',
                rewards: ['Insignia Verde', '45 puntos'],
                image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'
            },
            {
                id: 'challenge-10',
                title: 'Sin Estrés',
                description: 'Practica técnicas de relajación cada día durante 14 días.',
                participants: 250,
                progress: 8,
                duration: '14 días',
                icon: 'fas fa-spa',
                category: 'mental',
                rewards: ['Insignia Relax', '55 puntos'],
                image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?w=400'
            }
        ];

        this.articles = [
            {
                id: 'article-1',
                title: 'Los Beneficios del Ejercicio Regular',
                excerpt: 'Descubre cómo el ejercicio constante puede mejorar tu salud física y mental de manera integral.',
                readingTime: '5 min',
                category: 'Fitness',
                author: 'Dr. Carlos Méndez',
                date: '2024-05-15',
                image: 'https://images.unsplash.com/photo-1535914254981-b5012eebbd15?w=400',
                url: '#',
                content: `<h4>¿Por qué es importante el ejercicio?</h4>
<p>El ejercicio regular ayuda a mantener un peso saludable, fortalece el corazón, mejora la circulación y reduce el riesgo de enfermedades crónicas como la diabetes y la hipertensión.</p>
<ul>
  <li><b>Salud mental:</b> El ejercicio libera endorfinas, mejorando el estado de ánimo y reduciendo el estrés.</li>
  <li><b>Fortalece músculos y huesos:</b> Actividades como caminar, correr o nadar previenen la osteoporosis.</li>
  <li><b>Mejora el sueño:</b> La actividad física regular ayuda a dormir mejor.</li>
</ul>
<p>¡Intenta realizar al menos 30 minutos de actividad física la mayoría de los días!</p>`
            },
            {
                id: 'article-2',
                title: 'Alimentación Consciente',
                excerpt: 'Aprende técnicas para desarrollar una relación saludable con la comida y mejorar tu nutrición.',
                readingTime: '7 min',
                category: 'Nutrición',
                author: 'Lic. Ana García',
                date: '2024-05-10',
                image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
                url: '#',
                content: `<h4>¿Qué es la alimentación consciente?</h4>
<p>Consiste en prestar atención plena a lo que comes, disfrutando cada bocado y reconociendo las señales de hambre y saciedad.</p>
<ul>
  <li>Come despacio y sin distracciones.</li>
  <li>Escucha a tu cuerpo: come cuando tengas hambre real, no por ansiedad.</li>
  <li>Elige alimentos frescos y variados.</li>
</ul>
<p>La alimentación consciente ayuda a prevenir el sobrepeso y mejora la digestión.</p>`
            },
            {
                id: 'article-3',
                title: 'Manejo del Estrés',
                excerpt: 'Estrategias efectivas para reducir el estrés y mejorar tu bienestar emocional.',
                readingTime: '6 min',
                category: 'Salud Mental',
                author: 'Psic. María López',
                date: '2024-05-08',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
                url: '#',
                content: `<h4>¿Cómo manejar el estrés?</h4>
<p>El estrés es una respuesta natural, pero si se vuelve crónico puede afectar la salud. Algunas estrategias útiles:</p>
<ul>
  <li>Practica respiración profunda y meditación.</li>
  <li>Haz ejercicio regularmente.</li>
  <li>Habla con amigos o familiares.</li>
  <li>Organiza tu tiempo y prioriza tareas.</li>
</ul>
<p>Recuerda pedir ayuda profesional si el estrés es abrumador.</p>`
            },
            {
                id: 'article-4',
                title: 'Importancia de la Hidratación',
                excerpt: 'Conoce cuánta agua necesitas y cómo la hidratación impacta tu energía y salud.',
                readingTime: '4 min',
                category: 'Nutrición',
                author: 'Dra. Laura Torres',
                date: '2024-05-12',
                image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400',
                url: '#',
                content: `<h4>¿Cuánta agua necesitas?</h4>
<p>La cantidad recomendada es de 6 a 8 vasos al día, pero puede variar según la edad, clima y actividad física.</p>
<ul>
  <li>La hidratación mejora la concentración y el rendimiento físico.</li>
  <li>Ayuda a regular la temperatura corporal.</li>
  <li>Evita bebidas azucaradas y prefiere agua natural.</li>
</ul>`
            },
            {
                id: 'article-5',
                title: 'Rutinas de Sueño Saludable',
                excerpt: 'Consejos prácticos para mejorar la calidad de tu sueño y descansar mejor cada noche.',
                readingTime: '5 min',
                category: 'Sueño',
                author: 'Dr. Juan Pérez',
                date: '2024-05-11',
                image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
                url: '#',
                content: `<h4>Consejos para dormir mejor</h4>
<ul>
  <li>Establece horarios regulares para acostarte y levantarte.</li>
  <li>Evita pantallas y cafeína antes de dormir.</li>
  <li>Mantén tu habitación oscura y silenciosa.</li>
  <li>Realiza una rutina relajante antes de acostarte.</li>
</ul>
<p>Un buen descanso mejora la memoria, el ánimo y la salud general.</p>`
            },
            {
                id: 'article-6',
                title: 'Cómo Crear Hábitos Saludables',
                excerpt: 'Descubre el poder de los pequeños cambios diarios y cómo mantenerlos en el tiempo.',
                readingTime: '6 min',
                category: 'Bienestar',
                author: 'Coach Ana Ruiz',
                date: '2024-05-09',
                image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400',
                url: '#',
                content: `<h4>Pasos para crear hábitos duraderos</h4>
<ol>
  <li>Empieza con metas pequeñas y alcanzables.</li>
  <li>Repite la acción diariamente.</li>
  <li>Registra tu progreso y celebra logros.</li>
  <li>Busca apoyo en amigos o familia.</li>
</ol>
<p>La constancia es clave para transformar tu salud.</p>`
            },
            {
                id: 'article-7',
                title: 'Mindfulness para Principiantes',
                excerpt: 'Aprende a practicar la atención plena y sus beneficios para la mente y el cuerpo.',
                readingTime: '8 min',
                category: 'Salud Mental',
                author: 'Psic. Sofía Gómez',
                date: '2024-05-07',
                image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400',
                url: '#',
                content: `<h4>¿Qué es el mindfulness?</h4>
<p>Es la capacidad de estar presente y consciente en el momento actual, sin juzgar.</p>
<ul>
  <li>Dedica unos minutos al día a respirar y observar tus pensamientos.</li>
  <li>Practica la gratitud y la compasión.</li>
  <li>El mindfulness reduce la ansiedad y mejora la concentración.</li>
</ul>`
            },
            {
                id: 'article-8',
                title: 'Alimentos para Fortalecer el Sistema Inmune',
                excerpt: 'Descubre qué alimentos ayudan a mantener tus defensas altas todo el año.',
                readingTime: '5 min',
                category: 'Nutrición',
                author: 'Lic. Pablo Díaz',
                date: '2024-05-06',
                image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400',
                url: '#',
                content: `<h4>Alimentos recomendados</h4>
<ul>
  <li>Cítricos (naranja, limón, mandarina): ricos en vitamina C.</li>
  <li>Yogur y probióticos: mejoran la flora intestinal.</li>
  <li>Frutos secos y semillas: fuente de zinc y vitamina E.</li>
  <li>Verduras de hoja verde: aportan antioxidantes.</li>
</ul>`
            },
            {
                id: 'article-9',
                title: 'Ejercicios para la Espalda',
                excerpt: 'Rutinas sencillas para fortalecer la espalda y prevenir dolores posturales.',
                readingTime: '6 min',
                category: 'Fitness',
                author: 'Fisioterapeuta Carlos Ríos',
                date: '2024-05-05',
                image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
                url: '#',
                content: `<h4>Rutina básica para la espalda</h4>
<ul>
  <li>Estiramiento de gato-vaca: mejora la flexibilidad.</li>
  <li>Puente de glúteos: fortalece la zona lumbar.</li>
  <li>Plancha: activa el core y protege la columna.</li>
</ul>
<p>Realiza estos ejercicios 3 veces por semana para mejores resultados.</p>`
            },
            {
                id: 'article-10',
                title: 'Cómo Leer Etiquetas Nutricionales',
                excerpt: 'Aprende a interpretar la información de los alimentos para tomar mejores decisiones.',
                readingTime: '7 min',
                category: 'Nutrición',
                author: 'Lic. Ana García',
                date: '2024-05-04',
                image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
                url: '#',
                content: `<h4>¿Qué mirar en una etiqueta?</h4>
<ul>
  <li>Porciones: verifica cuántas hay por envase.</li>
  <li>Calorías y grasas: elige opciones bajas en grasas saturadas.</li>
  <li>Azúcares y sodio: modera su consumo.</li>
  <li>Ingredientes: prefiere listas cortas y comprensibles.</li>
</ul>`
            },
            {
                id: 'article-11',
                title: 'Beneficios de la Meditación',
                excerpt: 'Explora cómo la meditación puede ayudarte a reducir el estrés y mejorar tu bienestar.',
                readingTime: '6 min',
                category: 'Salud Mental',
                author: 'Psic. María López',
                date: '2024-05-03',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
                url: '#',
                content: `<h4>¿Por qué meditar?</h4>
<ul>
  <li>Reduce el estrés y la ansiedad.</li>
  <li>Mejora la concentración y la memoria.</li>
  <li>Favorece el bienestar emocional.</li>
</ul>
<p>Empieza con sesiones cortas y aumenta el tiempo gradualmente.</p>`
            }
        ];

        this.ranking = [
            { name: 'María López', points: 120, avatar: '👩‍⚕️', streak: 15 },
            { name: 'Juan Pérez', points: 110, avatar: '👨‍💼', streak: 12 },
            { name: 'Ana Ruiz', points: 105, avatar: '👩‍🎓', streak: 10 },
            { name: 'Carlos Méndez', points: 98, avatar: '👨‍🔬', streak: 8 },
            { name: 'Laura Torres', points: 92, avatar: '👩‍🏫', streak: 7 }
        ];
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Búsqueda y filtros
        document.getElementById('search-tips-input')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.filterTips();
        });

        document.getElementById('filter-category')?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterTips();
        });

        // Botones de acción
        document.getElementById('show-favorites')?.addEventListener('click', () => this.showFavoritesModal());
        document.getElementById('export-tips')?.addEventListener('click', () => this.showExportModal());
        document.getElementById('share-tips')?.addEventListener('click', () => this.showShareModal());
        document.getElementById('view-ranking')?.addEventListener('click', () => this.showRankingModal());
        document.getElementById('refresh-personalized')?.addEventListener('click', () => this.refreshPersonalizedTips());
        document.getElementById('view-all-challenges')?.addEventListener('click', () => this.showAllChallengesModal());
        document.getElementById('view-all-articles')?.addEventListener('click', () => this.showAllArticles());
        document.getElementById('view-analysis')?.addEventListener('click', () => this.showAnalysisModal());
        document.getElementById('close-all-challenges-modal')?.addEventListener('click', () => this.hideAllChallengesModal());

        // Carrusel
        document.querySelector('.carousel-prev')?.addEventListener('click', () => this.previousSlide());
        document.querySelector('.carousel-next')?.addEventListener('click', () => this.nextSlide());

        // Exportar
        document.getElementById('export-pdf')?.addEventListener('click', () => this.exportToPDF());
        document.getElementById('export-excel')?.addEventListener('click', () => this.exportToExcel());
        document.getElementById('export-json')?.addEventListener('click', () => this.exportToJSON());

        // Compartir
        document.getElementById('share-whatsapp')?.addEventListener('click', () => this.shareToWhatsApp());
        document.getElementById('share-facebook')?.addEventListener('click', () => this.shareToFacebook());
        document.getElementById('share-copy')?.addEventListener('click', () => this.copyToClipboard());

        // Touch events para carrusel
        this.setupTouchEvents();

        // Cerrar el modal de detalles de consejo destacado
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                const modalId = btn.dataset.modalId;
                if (modalId) {
                    document.getElementById(modalId).style.display = 'none';
                }
            });
        });
    }

    // ===== RENDERIZADO =====
    renderAllSections() {
        this.renderProgressCarousel();
        this.renderFeaturedTips();
        this.renderPersonalizedTips();
        this.renderChallenges();
        this.renderArticles();
        this.renderFavorites();
    }

    renderProgressCarousel() {
        const carousel = document.getElementById('progress-carousel');
        if (!carousel) return;
        const cards = [
            `<div class="progress-card animate__animated animate__fadeIn">
                <div class="progress-circle" data-percent="75">
                    <svg class="progress-ring" width="100" height="100">
                        <circle class="progress-ring-circle" stroke="#4CAF50" stroke-width="6" fill="transparent" r="45" cx="50" cy="50"/>
                    </svg>
                    <span class="progress-percent">75%</span>
                </div>
                <h3>Consejos completados</h3>
                <p>15 de 20 este mes</p>
            </div>`,
            `<div class="progress-card animate__animated animate__fadeIn animate__delay-1s">
                <div class="progress-icon"><i class="fas fa-fire"></i></div>
                <h3>Racha actual</h3>
                <p>7 días seguidos</p>
                <small>¡Sigue así!</small>
            </div>`,
            `<div class="progress-card animate__animated animate__fadeIn animate__delay-2s">
                <div class="progress-icon"><i class="fas fa-trophy"></i></div>
                <h3>Logros</h3>
                <p>5 logros desbloqueados</p>
                <span class="badge">+5</span>
            </div>`,
            `<div class="progress-card animate__animated animate__fadeIn animate__delay-3s">
                <div class="progress-icon"><i class="fas fa-star"></i></div>
                <h3>Puntos totales</h3>
                <p id="progress-total-points">120 pts</p>
            </div>`,
            `<div class="progress-card animate__animated animate__fadeIn animate__delay-4s">
                <div class="progress-icon"><i class="fas fa-calendar-week"></i></div>
                <h3>Consejos esta semana</h3>
                <p id="progress-week-tips">4</p>
            </div>`,
            `<div class="progress-card animate__animated animate__fadeIn animate__delay-5s">
                <div class="progress-icon"><i class="fas fa-bolt"></i></div>
                <h3>Retos activos</h3>
                <p id="progress-active-challenges">2</p>
            </div>`,
            `<div class="progress-card animate__animated animate__fadeIn animate__delay-6s">
                <div class="progress-icon"><i class="fas fa-medal"></i></div>
                <h3>Nivel actual</h3>
                <p id="progress-level">Bronce</p>
            </div>`
        ];
        carousel.innerHTML = cards.join('');
        // Flechas del carrusel
        const leftBtn = document.getElementById('progress-carousel-left');
        const rightBtn = document.getElementById('progress-carousel-right');
        leftBtn.onclick = () => this.scrollProgressCarousel(carousel, -1);
        rightBtn.onclick = () => this.scrollProgressCarousel(carousel, 1);
        // Accesibilidad: scroll con flechas del teclado
        document.querySelector('.user-progress-section').onkeydown = (e) => {
            if (e.key === 'ArrowLeft') this.scrollProgressCarousel(carousel, -1);
            if (e.key === 'ArrowRight') this.scrollProgressCarousel(carousel, 1);
        };
    }
    scrollProgressCarousel(carousel, direction) {
        const card = carousel.querySelector('.progress-card');
        if (!card) return;
        const style = window.getComputedStyle(card);
        const gap = parseInt(style.marginRight || '16');
        const scrollAmount = card.offsetWidth + gap + 8;
        carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }

    renderFeaturedTips() {
        const grid = document.getElementById('featured-tips-grid');
        grid.innerHTML = this.featuredTips.map((tip, idx) => {
            const activeClass = idx === this.carouselIndex ? 'active' : '';
            return `<div class="carousel-tip-wrapper ${activeClass}" tabindex="0" aria-label="Consejo destacado ${idx+1} de ${this.featuredTips.length}">
                ${this.createTipCard(tip, 'featured')}
            </div>`;
        }).join('');
        this.updateCarousel();
        this.setupTipCardEvents();
        this.setupCarouselAccessibility();
    }

    renderPersonalizedTips() {
        this.generatePersonalizedTips();
        const grid = document.getElementById('personalized-tips-grid');
        if (!grid) return;
        const vistos = JSON.parse(localStorage.getItem('healthTipsPersonalizedVistos')) || [];
        const completados = this.userProgress.completedTipsIds || [];
        grid.innerHTML = this.personalizedTips.map((tip, idx) => {
            const inRoutine = (JSON.parse(localStorage.getItem('healthTipsRoutine')) || []).includes(tip.id);
            const hasReminder = (JSON.parse(localStorage.getItem('healthTipsReminders')) || []).includes(tip.id);
            const isCompleted = completados.includes(tip.id);
            const why = tip.personalizedReason || 'Basado en tus hábitos y preferencias recientes.';
            return `
                <div class="personalized-tip-card ${isCompleted ? 'completed' : ''} cat-${tip.category}" data-tip-id="${tip.id}">
                    <div class="tip-image" style="background-image:url('${tip.image}')">
                        <span class="tip-badge">${tip.badge || 'Personalizado'}</span>
                    </div>
                    <div class="tip-content">
                        <div class="tip-header-row">
                            <h3>${tip.title}</h3>
                        </div>
                        <h4>${tip.subtitle}</h4>
                        <p>${tip.description}</p>
                        <div class="tip-meta">
                            <span><i class="far fa-clock"></i> ${tip.duration}</span>
                            <span><i class="fas fa-tag"></i> ${this.getCategoryName(tip.category)}</span>
                        </div>
                        <div class="tip-why"><i class="fas fa-info-circle"></i> <span>${why}</span></div>
                        <div class="tip-actions-personalized">
                            <button class="secondary-button small add-routine-btn" data-tip-id="${tip.id}"><i class="fas fa-calendar-plus"></i></button>
                            <button class="secondary-button small add-reminder-btn" data-tip-id="${tip.id}"><i class="fas fa-bell"></i></button>
                            <button class="secondary-button small share-tip-btn" data-tip-id="${tip.id}"><i class="fas fa-share-alt"></i></button>
                            <button class="secondary-button small export-tip-btn" data-tip-id="${tip.id}"><i class="fas fa-file-export"></i></button>
                            <button class="icon-button like-btn" data-tip-id="${tip.id}" title="Me gusta"><i class="fas fa-thumbs-up"></i></button>
                            <button class="icon-button dislike-btn" data-tip-id="${tip.id}" title="No es relevante"><i class="fas fa-thumbs-down"></i></button>
                            <button class="secondary-button small suggest-another-btn" data-idx="${idx}"><i class="fas fa-sync-alt"></i> Sugerir otro</button>
                        </div>
                        <div class="tip-progress-bar"><div class="tip-progress-fill" style="width:${isCompleted ? '100%' : '0%'}"></div></div>
                        <div class="tip-badges-row">
                            ${isCompleted ? '<span class="tip-insignia"><i class="fas fa-medal"></i> ¡Completado!</span>' : ''}
                            ${vistos.includes(tip.id) ? '<span class="tip-insignia"><i class="fas fa-eye"></i> Visto</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        this.setupPersonalizedTipEvents();
    }

    renderChallenges() {
        const carousel = document.getElementById('challenges-carousel');
        if (!carousel) return;
        carousel.innerHTML = this.challenges.map(challenge => this.createChallengeCard(challenge)).join('');
        this.setupChallengeEvents();
        setTimeout(() => this.initializeChallengeProgressAnimations(), 100);
        document.querySelectorAll('.advance-progress-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const challengeId = btn.dataset.challengeId;
                this.advanceChallengeProgress(challengeId, 10);
            };
        });
        // Flechas del carrusel
        const leftBtn = document.getElementById('challenges-carousel-left');
        const rightBtn = document.getElementById('challenges-carousel-right');
        leftBtn.onclick = () => this.scrollMainChallengesCarousel(carousel, -1);
        rightBtn.onclick = () => this.scrollMainChallengesCarousel(carousel, 1);
        // Accesibilidad: scroll con flechas del teclado
        document.querySelector('.health-challenges').onkeydown = (e) => {
            if (e.key === 'ArrowLeft') this.scrollMainChallengesCarousel(carousel, -1);
            if (e.key === 'ArrowRight') this.scrollMainChallengesCarousel(carousel, 1);
        };
    }
    scrollMainChallengesCarousel(carousel, direction) {
        const card = carousel.querySelector('.challenge-card');
        if (!card) return;
        const style = window.getComputedStyle(card);
        const gap = parseInt(style.marginRight || '16');
        const scrollAmount = card.offsetWidth + gap + 8;
        carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }

    renderArticles() {
        const carousel = document.getElementById('articles-carousel');
        if (!carousel) return;
        carousel.innerHTML = this.articles.map(article => this.createArticleCard(article)).join('');
        this.setupArticleEvents();
        // Flechas del carrusel
        const leftBtn = document.getElementById('articles-carousel-left');
        const rightBtn = document.getElementById('articles-carousel-right');
        leftBtn.onclick = () => this.scrollArticlesCarousel(carousel, -1);
        rightBtn.onclick = () => this.scrollArticlesCarousel(carousel, 1);
        // Accesibilidad: scroll con flechas del teclado
        document.querySelector('.health-articles').onkeydown = (e) => {
            if (e.key === 'ArrowLeft') this.scrollArticlesCarousel(carousel, -1);
            if (e.key === 'ArrowRight') this.scrollArticlesCarousel(carousel, 1);
        };
    }
    scrollArticlesCarousel(carousel, direction) {
        const card = carousel.querySelector('.article-card');
        if (!card) return;
        const style = window.getComputedStyle(card);
        const gap = parseInt(style.marginRight || '16');
        const scrollAmount = card.offsetWidth + gap + 8;
        carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }

    renderFavorites() {
        const grid = document.getElementById('favorites-grid');
        if (!grid) return;

        const favoriteTips = [...this.featuredTips, ...this.personalizedTips]
            .filter(tip => this.favorites.includes(tip.id));

        if (favoriteTips.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><p>No tienes favoritos aún</p></div>';
        } else {
            grid.innerHTML = favoriteTips.map(tip => this.createTipCard(tip, 'favorite')).join('');
        }
    }

    // ===== CREACIÓN DE CARDS =====
    createTipCard(tip, type = 'featured') {
        const isFavorite = this.favorites.includes(tip.id);
        const isCompleted = (this.userProgress.completedTipsIds || []).includes(tip.id);
        const inRoutine = (JSON.parse(localStorage.getItem('healthTipsRoutine')) || []).includes(tip.id);
        const hasReminder = (JSON.parse(localStorage.getItem('healthTipsReminders')) || []).includes(tip.id);
        const difficultyStars = this.createDifficultyStars(tip.difficulty);
        // Tooltips para beneficios e instrucciones
        const benefitsTooltip = tip.benefits ? `<div class='tip-tooltip'><b>Beneficios:</b><ul>${tip.benefits.map(b=>`<li>${b}</li>`).join('')}</ul></div>` : '';
        const instructionsTooltip = tip.instructions ? `<div class='tip-tooltip'><b>Instrucciones:</b><ol>${tip.instructions.map(i=>`<li>${i}</li>`).join('')}</ol></div>` : '';
        return `
            <div class="tip-card ${type} ${isCompleted ? 'completed' : ''}" data-tip-id="${tip.id}" data-category="${tip.category}">
                ${tip.badge ? `<div class="card-badge">${tip.badge}</div>` : ''}
                <div class="tip-image" style="background-image: url('${tip.image}')">
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-tip-id="${tip.id}" title="${isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                        <i class="fas fa-star"></i>
                    </button>
                    ${isCompleted ? '<span class="tip-status completed" title="Completado"><i class="fas fa-check-circle"></i></span>' : ''}
                    ${inRoutine ? '<span class="tip-status routine" title="En rutina diaria"><i class="fas fa-calendar-check"></i></span>' : ''}
                    ${hasReminder ? '<span class="tip-status reminder" title="Recordatorio activo"><i class="fas fa-bell"></i></span>' : ''}
                </div>
                <div class="tip-content">
                    <i class="${tip.icon}"></i>
                    <h3>${tip.title}</h3>
                    <h4>${tip.subtitle}</h4>
                    <p>${tip.description}</p>
                    <div class="tip-meta">
                        <span class="duration"><i class="far fa-clock"></i> ${tip.duration}</span>
                        <span class="category"><i class="fas fa-tag"></i> ${this.getCategoryName(tip.category)}</span>
                    </div>
                    <div class="difficulty">
                        <span class="difficulty-label">Facilidad:</span>
                        <div class="stars">${difficultyStars}</div>
                    </div>
                    <div class="tip-extras">
                        ${tip.benefits ? `<button class='icon-button tip-benefits-btn' title='Ver beneficios'><i class='fas fa-heartbeat'></i>${benefitsTooltip}</button>` : ''}
                        ${tip.instructions ? `<button class='icon-button tip-instructions-btn' title='Ver instrucciones'><i class='fas fa-list-ol'></i>${instructionsTooltip}</button>` : ''}
                    </div>
                    <div class="card-actions clean-actions">
                        <button class="primary-button small view-tip-btn" data-tip-id="${tip.id}"><i class="fas fa-eye"></i> Ver más</button>
                        <button class="secondary-button small complete-tip-btn" data-tip-id="${tip.id}">
                            <i class="fas fa-check"></i> Completar
                        </button>
                        <button class="secondary-button small add-routine-btn" data-tip-id="${tip.id}">
                            <i class="fas fa-calendar-plus"></i> Agregar a rutina
                        </button>
                        <button class="secondary-button small add-reminder-btn" data-tip-id="${tip.id}">
                            <i class="fas fa-bell"></i> Recordar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createChallengeCard(challenge) {
        const isJoined = this.currentChallenges.includes(challenge.id);
        const progress = this.getChallengeProgress(challenge.id) || challenge.progress || 0;
        return `
            <div class="challenge-card" data-challenge-id="${challenge.id}">
                <div class="challenge-image" style="background-image: url('${challenge.image}')">
                    <i class="${challenge.icon}"></i>
                </div>
                <div class="challenge-content">
                    <div class="challenge-header">
                        <h3>${challenge.title}</h3>
                        <span class="participants">${challenge.participants} participantes</span>
                    </div>
                    <div class="challenge-progress">
                        <div class="challenge-progress-bar">
                            <div class="challenge-progress-fill" data-target="${progress}" style="width: 0%;"></div>
                        </div>
                        <span>${progress}% completado</span>
                    </div>
                    <p>${challenge.description}</p>
                    <div class="challenge-rewards">
                        <span class="rewards-label">Recompensas:</span>
                        <div class="rewards-list">
                            ${challenge.rewards.map(reward => `<span class="reward">${reward}</span>`).join('')}
                        </div>
                    </div>
                    <div class="challenge-footer">
                        <span class="duration"><i class="far fa-clock"></i> ${challenge.duration}</span>
                        <button class="primary-button small ${isJoined ? 'joined' : ''}" data-challenge-id="${challenge.id}">
                            ${isJoined ? 'Unido' : 'Unirse'}
                        </button>
                        <button class="secondary-button small advance-progress-btn" data-challenge-id="${challenge.id}" ${!isJoined ? 'disabled' : ''} title="Avanzar progreso">
                            <i class="fas fa-arrow-up"></i> Avanzar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createArticleCard(article) {
        return `
            <div class="article-card" data-article-id="${article.id}">
                <div class="article-image" style="background-image: url('${article.image}')">
                    <div class="article-overlay">
                        <button class="read-article-btn" data-article-id="${article.id}">
                            <i class="fas fa-book-open"></i> Leer
                        </button>
                    </div>
                </div>
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-meta">
                        <span class="reading-time"><i class="far fa-clock"></i> ${article.readingTime}</span>
                        <span class="article-category">${article.category}</span>
                    </div>
                    <div class="article-author">
                        <span><i class="fas fa-user"></i> ${article.author}</span>
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(article.date)}</span>
                    </div>
                    <button class="text-button read-full-btn" data-article-id="${article.id}">
                        Leer artículo completo <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ===== EVENTOS DE CARDS =====
    setupTipCardEvents() {
        // Favoritos
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const tipId = btn.dataset.tipId;
                const index = this.favorites.indexOf(tipId);
                if (index > -1) {
                    this.favorites.splice(index, 1);
                    btn.classList.remove('active');
                    this.showNotification('Favorito removido', 'info');
                } else {
                    this.favorites.push(tipId);
                    btn.classList.add('active');
                    this.showNotification('Agregado a favoritos', 'success');
                }
                localStorage.setItem('healthTipsFavorites', JSON.stringify(this.favorites));
            };
        });
        // Ver detalles
        document.querySelectorAll('.view-tip-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const tipId = btn.dataset.tipId;
                this.showTipDetails(tipId);
            };
            });
        // Completar consejo
        document.querySelectorAll('.complete-tip-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const tipId = btn.dataset.tipId;
                let completed = this.userProgress.completedTipsIds || [];
                if (!completed.includes(tipId)) {
                    completed.push(tipId);
                    this.userProgress.completedTipsIds = completed;
                    localStorage.setItem('healthTipsProgress', JSON.stringify(this.userProgress));
                    btn.closest('.tip-card').classList.add('completed');
                    this.showNotification('¡Consejo completado!', 'success');
                } else {
                    this.showNotification('Ya completaste este consejo', 'info');
                }
            };
        });
        // Botón Agregar a rutina
        document.querySelectorAll('.add-routine-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const tipId = btn.dataset.tipId;
                let routine = JSON.parse(localStorage.getItem('healthTipsRoutine')) || [];
                if (!routine.includes(tipId)) {
                    routine.push(tipId);
                    localStorage.setItem('healthTipsRoutine', JSON.stringify(routine));
                    this.renderRoutineSection();
                    this.renderFeaturedTips();
                    this.showNotification('Consejo agregado a tu rutina diaria', 'success');
                } else {
                    this.showNotification('Este consejo ya está en tu rutina', 'info');
                }
            };
        });
        // Botón Recordar
        document.querySelectorAll('.add-reminder-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const tipId = btn.dataset.tipId;
                let reminders = JSON.parse(localStorage.getItem('healthTipsReminders')) || [];
                if (!reminders.includes(tipId)) {
                    reminders.push(tipId);
                    localStorage.setItem('healthTipsReminders', JSON.stringify(reminders));
                    this.renderRoutineSection();
                    this.renderFeaturedTips();
                    this.showNotification('Recordatorio activado para este consejo', 'success');
                } else {
                    this.showNotification('Ya tienes un recordatorio para este consejo', 'info');
                }
            };
        });
    }

    setupChallengeEvents() {
        document.querySelectorAll('.challenge-card .primary-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const challengeId = btn.dataset.challengeId;
                this.joinChallenge(challengeId, btn);
            });
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('aria-pressed', btn.classList.contains('joined'));
            btn.setAttribute('aria-label', btn.classList.contains('joined') ? 'Salir del reto' : 'Unirse al reto');
            btn.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            };
        });
    }

    setupArticleEvents() {
        document.querySelectorAll('.read-article-btn, .read-full-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const articleId = btn.dataset.articleId;
                this.readArticle(articleId);
            });
        });
        // Listener para cerrar el modal
        const closeBtn = document.getElementById('close-full-article-modal');
        if (closeBtn) closeBtn.onclick = () => this.hideFullArticleModal();
        // Accesibilidad: cerrar con Esc
        document.getElementById('full-article-modal').onkeydown = (e) => {
            if (e.key === 'Escape') this.hideFullArticleModal();
        };
    }

    // ===== FUNCIONALIDADES PRINCIPALES =====
    toggleFavorite(tipId, btn) {
        const index = this.favorites.indexOf(tipId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            btn.classList.remove('active');
            this.showNotification('Favorito removido', 'info');
        } else {
            this.favorites.push(tipId);
            btn.classList.add('active');
            this.showNotification('Agregado a favoritos', 'success');
        }
        
        localStorage.setItem('healthTipsFavorites', JSON.stringify(this.favorites));
        this.renderFavorites();
    }

    showTipDetails(tipId) {
        const tip = [...this.featuredTips, ...this.personalizedTips].find(t => t.id === tipId);
        if (!tip) return;
        const isFavorite = this.favorites.includes(tip.id);
        const inRoutine = (JSON.parse(localStorage.getItem('healthTipsRoutine')) || []).includes(tip.id);
        const hasReminder = (JSON.parse(localStorage.getItem('healthTipsReminders')) || []).includes(tip.id);
        const reminderTimes = JSON.parse(localStorage.getItem('healthTipsReminderTimes')) || {};
        const isCompleted = (this.userProgress.completedTipsIds || []).includes(tip.id);
        const modal = document.getElementById('detailed-tip-modal');
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="detailed-tip-modal-visual">
                <div class="detailed-tip-image" style="background-image:url('${tip.image}')">
                    <span class="modal-badge">${tip.badge || ''}</span>
                    <button class="modal-fav-btn ${isFavorite ? 'active' : ''}" title="${isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}"><i class="fas fa-star"></i></button>
                                    </div>
                <div class="detailed-tip-header">
                    <div class="tip-icon-large"><i class="${tip.icon}"></i></div>
                                <div class="tip-header-content">
                        <h2>${tip.title}</h2>
                        <h4>${tip.subtitle}</h4>
                                    <div class="tip-meta">
                        <span class="category"><i class="fas fa-tag"></i> ${this.getCategoryName(tip.category)}</span>
                        <span class="difficulty"><i class="fas fa-star"></i> ${this.getDifficultyText(tip.difficulty)}</span>
                        <span class="duration"><i class="far fa-clock"></i> ${tip.duration}</span>
                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="detailed-tip-content">
                <div class="tip-description">
                    <h5>Descripción</h5>
                    <p>${tip.description}</p>
                </div>
                ${tip.benefits ? `<div class="tip-benefits"><h5>Beneficios</h5><ul>${tip.benefits.map(b=>`<li><i class='fas fa-check-circle'></i> ${b}</li>`).join('')}</ul></div>` : ''}
                ${tip.instructions ? `<div class="tip-instructions"><h5>Cómo hacerlo</h5><ol>${tip.instructions.map(i=>`<li>${i}</li>`).join('')}</ol></div>` : ''}
                <div class="tip-modal-actions">
                    <button class="primary-button modal-complete-btn" ${isCompleted ? 'disabled' : ''}><i class="fas fa-check"></i> ${isCompleted ? 'Completado' : 'Marcar como completado'}</button>
                    <button class="secondary-button modal-routine-btn ${inRoutine ? 'active' : ''}"><i class="fas fa-calendar-plus"></i> ${inRoutine ? 'Quitar de rutina' : 'Agregar a rutina'}</button>
                    <button class="secondary-button modal-reminder-btn ${hasReminder ? 'active' : ''}"><i class="fas fa-bell"></i> ${hasReminder ? 'Quitar recordatorio' : 'Recordar'}</button>
                    <input type="time" class="modal-reminder-time" value="${reminderTimes[tip.id] || '08:00'}" style="display:${hasReminder ? 'inline-block' : 'none'};margin-left:0.5em;">
                    </div>
                <div class="tip-modal-status">
                    ${isFavorite ? '<span class="status-badge fav"><i class="fas fa-star"></i> Favorito</span>' : ''}
                    ${inRoutine ? '<span class="status-badge routine"><i class="fas fa-calendar-check"></i> En rutina</span>' : ''}
                    ${hasReminder ? '<span class="status-badge reminder"><i class="fas fa-bell"></i> Recordatorio activo</span>' : ''}
                                </div>
                            </div>
                        `;
        // Listeners avanzados
        modalBody.querySelector('.modal-fav-btn').onclick = () => {
            const btn = modalBody.querySelector('.modal-fav-btn');
            this.toggleFavorite(tip.id, btn);
        };
        modalBody.querySelector('.modal-routine-btn').onclick = () => {
            if (inRoutine) this.removeFromRoutine(tip.id); else this.addToRoutine(tip.id);
            this.showTipDetails(tip.id);
        };
        modalBody.querySelector('.modal-reminder-btn').onclick = () => {
            this.toggleRoutineReminder(tip.id);
            this.showTipDetails(tip.id);
        };
        const timeInput = modalBody.querySelector('.modal-reminder-time');
        if (timeInput) {
            timeInput.onchange = (e) => {
                this.setRoutineReminderTime(tip.id, e.target.value);
                this.showTipDetails(tip.id);
            };
        }
        modalBody.querySelector('.modal-complete-btn').onclick = () => {
            this.completeTip(tip.id);
            this.showTipDetails(tip.id);
        };
        this.openModal('detailed-tip-modal');
        // Accesibilidad: focus automático
        setTimeout(()=>{
            const btn = modalBody.querySelector('.modal-complete-btn');
            if(btn) btn.focus();
        }, 100);
    }

    completeTip(tipId) {
        this.userProgress.completedTips++;
        this.userProgress.points += 5;
        this.userProgress.currentStreak++;
        
        localStorage.setItem('healthTipsProgress', JSON.stringify(this.userProgress));
        this.updateProgressDisplay();
        this.showNotification('¡Consejo completado! +5 puntos', 'success');
        
        // Animación de completado
        const tipCard = document.querySelector(`[data-tip-id="${tipId}"]`);
        if (tipCard) {
            tipCard.classList.add('completed');
            setTimeout(() => tipCard.classList.remove('completed'), 2000);
        }
    }

    joinChallenge(challengeId, btn) {
        const isJoined = this.currentChallenges.includes(challengeId);
        
        if (isJoined) {
            const index = this.currentChallenges.indexOf(challengeId);
            this.currentChallenges.splice(index, 1);
            btn.textContent = 'Unirse';
            btn.classList.remove('joined');
            this.showNotification('Te has salido del reto', 'info');
        } else {
            this.currentChallenges.push(challengeId);
            btn.textContent = 'Unido';
            btn.classList.add('joined');
            this.showNotification('¡Te has unido al reto!', 'success');
        }
        
        localStorage.setItem('healthTipsChallenges', JSON.stringify(this.currentChallenges));
        this.setChallengeProgress(challengeId, this.getChallengeProgress(challengeId) + 10);
        this.showChallengeFeedback();
    }

    readArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;
        // Simular afiliación y referencias
        const affiliation = article.author.includes('Dr.') ? 'Universidad Nacional de Salud' : 'Centro de Bienestar Integral';
        const abstract = article.excerpt;
        const modal = document.getElementById('full-article-modal');
        const body = document.getElementById('full-article-body');
        const title = document.getElementById('full-article-title');
        title.innerHTML = `<i class='fas fa-book-open'></i> ${article.title}`;
        body.innerHTML = `
            <div class='full-article-header'>
                <div class='full-article-title'>${article.title}</div>
                <div class='full-article-affiliation'>${article.author} &mdash; <span>${affiliation}</span></div>
                <div class='full-article-meta'>
                    <span><i class='fas fa-calendar'></i> ${this.formatDate(article.date)}</span>
                    <span><i class='fas fa-clock'></i> ${article.readingTime}</span>
                    <span class='full-article-category'><i class='fas fa-tag'></i> ${article.category}</span>
                </div>
                <div class='full-article-abstract'><b>Resumen:</b> ${abstract}</div>
                <div class='full-article-image' style='background-image:url(${article.image})'></div>
            </div>
            <div class='full-article-content'>${this.generateScientificArticleContent(article)}</div>
            <div class='full-article-references'><b>Referencias:</b><ol><li>Organización Mundial de la Salud. Guías de actividad física y salud.</li><li>Ministerio de Salud. Recomendaciones de nutrición y bienestar.</li><li>American Heart Association. Healthy Living Resources.</li></ol></div>
        `;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            document.getElementById('close-full-article-modal').focus();
        }, 100);
    }
    generateScientificArticleContent(article) {
        // Si el contenido ya tiene secciones, usarlo tal cual
        if (article.content && /<h4|<h3/i.test(article.content)) return article.content;
        // Si no, generar secciones simuladas
        return `
            <h4>Introducción</h4>
            <p>${article.excerpt}</p>
            <h4>Métodos</h4>
            <p>Se realizó una revisión de la literatura y se consultaron fuentes confiables para la elaboración de este artículo.</p>
            <h4>Resultados</h4>
            <p>Se identificaron los principales puntos clave y recomendaciones prácticas para el bienestar.</p>
            <h4>Discusión</h4>
            <p>Los resultados sugieren que la adopción de hábitos saludables tiene un impacto positivo en la calidad de vida.</p>
            <h4>Conclusión</h4>
            <p>Adoptar los consejos presentados puede mejorar significativamente la salud física y mental.</p>
        `;
    }

    hideFullArticleModal() {
        const modal = document.getElementById('full-article-modal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // ===== CARRUSEL =====
    setupTouchEvents() {
        const carousel = document.querySelector('.featured-carousel');
        if (!carousel) return;

        let startX = 0;
        let currentX = 0;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        carousel.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].clientX;
        });

        carousel.addEventListener('touchend', () => {
            const diff = startX - currentX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
        });
    }

    previousSlide() {
        this.carouselIndex = Math.max(0, this.carouselIndex - 1);
        this.updateCarousel();
    }

    nextSlide() {
        this.carouselIndex = Math.min(this.featuredTips.length - 1, this.carouselIndex + 1);
        this.updateCarousel();
    }

    updateCarousel() {
        const wrappers = document.querySelectorAll('.carousel-tip-wrapper');
        wrappers.forEach((el, idx) => {
            el.classList.toggle('active', idx === this.carouselIndex);
            if (idx === this.carouselIndex) {
                el.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
            }
        });
    }

    // ===== FILTRADO Y BÚSQUEDA =====
    filterTips() {
        const allTips = [...this.featuredTips, ...this.personalizedTips];
        let filteredTips = allTips;

        // Filtrar por categoría
        if (this.currentFilter !== 'all') {
            filteredTips = filteredTips.filter(tip => tip.category === this.currentFilter);
        }

        // Filtrar por búsqueda
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filteredTips = filteredTips.filter(tip => 
                tip.title.toLowerCase().includes(query) ||
                tip.description.toLowerCase().includes(query) ||
                tip.subtitle.toLowerCase().includes(query)
            );
        }

        this.renderFilteredTips(filteredTips);
    }

    renderFilteredTips(tips) {
        const featuredGrid = document.getElementById('featured-tips-grid');
        const personalizedGrid = document.getElementById('personalized-tips-grid');
        
        if (featuredGrid) {
            const featuredFiltered = tips.filter(tip => this.featuredTips.some(ft => ft.id === tip.id));
            featuredGrid.innerHTML = featuredFiltered.map(tip => this.createTipCard(tip, 'featured')).join('');
        }
        
        if (personalizedGrid) {
            const personalizedFiltered = tips.filter(tip => this.personalizedTips.some(pt => pt.id === tip.id));
            personalizedGrid.innerHTML = personalizedFiltered.map(tip => this.createTipCard(tip, 'personalized')).join('');
        }
        
        this.setupTipCardEvents();
    }

    // ===== MODALES =====
    setupModals() {
        // Cerrar modales
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.modalId;
                this.closeModal(modalId);
            });
        });

        // Cerrar al hacer clic fuera
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        setTimeout(() => {
            // Focus en el primer botón interactivo del modal
        const modal = document.getElementById(modalId);
            const btn = modal.querySelector('button, [tabindex="0"]');
            if (btn) btn.focus();
        }, 100);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    showFavoritesModal() {
        this.renderFavorites();
        this.openModal('favorites-modal');
    }

    showExportModal() {
        this.openModal('export-modal');
    }

    showShareModal() {
        this.openModal('share-modal');
    }

    showRankingModal() {
        // Insertar al usuario en el ranking según puntos
        const allUsers = [...this.ranking];
        const myUser = { name: 'Tú', points: this.userProgress.points, avatar: '🧑', streak: this.userProgress.currentStreak };
        allUsers.push(myUser);
        allUsers.sort((a, b) => b.points - a.points);
        const myIndex = allUsers.findIndex(u => u.name === 'Tú');
        const modal = document.getElementById('ranking-modal');
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="ranking-header">
                <h4>Top 5 Usuarios</h4>
                <p>Basado en consejos completados y racha actual</p>
            </div>
            <ol class="ranking-list">
                ${allUsers.slice(0, 5).map((user, index) => `
                    <li class="${index === 0 ? 'first-place' : ''} ${user.name === 'Tú' ? 'my-user' : ''}">
                        <span class="rank">${index + 1}</span>
                        <span class="user-avatar">${user.avatar}</span>
                        <span class="user">${user.name}</span>
                        <span class="score">${user.points} pts</span>
                        <span class="streak">${user.streak} días</span>
                    </li>
                `).join('')}
            </ol>
            <div class="user-position">
                <p>Tu posición: <strong>#${myIndex + 1}</strong> (${this.userProgress.points} puntos)</p>
            </div>
        `;
        this.openModal('ranking-modal');
    }

    showAnalysisModal() {
        this.openModal('analysis-modal');
        setTimeout(() => this.renderAnalysisChart(), 100); // Espera a que el modal esté visible
    }

    renderAnalysisChart() {
        const ctx = document.getElementById('analysisChart').getContext('2d');
        if (this.analysisChart) {
            this.analysisChart.destroy();
        }
        // Datos de ejemplo: hábitos por categoría
        const categories = ['Actividad', 'Nutrición', 'Mental', 'Sueño'];
        const completed = [
            this.featuredTips.filter(t => t.category === 'activity').length,
            this.featuredTips.filter(t => t.category === 'nutrition').length,
            this.featuredTips.filter(t => t.category === 'mental').length,
            this.featuredTips.filter(t => t.category === 'sleep').length
        ];
        const personalized = [
            this.personalizedTips.filter(t => t.category === 'activity').length,
            this.personalizedTips.filter(t => t.category === 'nutrition').length,
            this.personalizedTips.filter(t => t.category === 'mental').length,
            this.personalizedTips.filter(t => t.category === 'sleep').length
        ];
        this.analysisChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [
                    {
                        label: 'Consejos destacados',
                        data: completed,
                        backgroundColor: 'rgba(76, 175, 80, 0.7)'
                    },
                    {
                        label: 'Personalizados',
                        data: personalized,
                        backgroundColor: 'rgba(33, 150, 243, 0.7)'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Distribución de Consejos por Categoría' }
                }
            }
        });
        // Resumen de hábitos y riesgos
        const total = completed.reduce((a, b) => a + b, 0) + personalized.reduce((a, b) => a + b, 0);
        let summary = `<b>Total de consejos:</b> ${total}<br>`;
        summary += `<b>Actividad física:</b> ${completed[0] + personalized[0]}<br>`;
        summary += `<b>Nutrición:</b> ${completed[1] + personalized[1]}<br>`;
        summary += `<b>Salud mental:</b> ${completed[2] + personalized[2]}<br>`;
        summary += `<b>Sueño:</b> ${completed[3] + personalized[3]}<br>`;
        // Ejemplo de riesgo
        if ((completed[0] + personalized[0]) < 2) {
            summary += `<span style='color:#e53935'><b>Riesgo:</b> Poca actividad física detectada.</span><br>`;
        }
        if ((completed[1] + personalized[1]) < 2) {
            summary += `<span style='color:#e53935'><b>Riesgo:</b> Poca atención a la nutrición.</span><br>`;
        }
        document.getElementById('analysis-summary').innerHTML = summary;
    }

    // ===== EXPORTACIÓN REAL DE CONSEJOS =====
    exportToPDF() {
        const doc = new window.jspdf.jsPDF();
        doc.text('Consejos de Salud', 14, 16);
        const tips = this.getExportableTips();
        const rows = tips.map(tip => [tip.title, tip.subtitle, tip.description, this.getCategoryName(tip.category)]);
        doc.autoTable({
            head: [['Título', 'Subtítulo', 'Descripción', 'Categoría']],
            body: rows,
            startY: 22,
            styles: { fontSize: 10 }
        });
        doc.save('consejos_salud.pdf');
    }

    exportToExcel() {
        const tips = this.getExportableTips();
        const ws = XLSX.utils.json_to_sheet(tips.map(tip => ({
            Título: tip.title,
            Subtítulo: tip.subtitle,
            Descripción: tip.description,
            Categoría: this.getCategoryName(tip.category)
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Consejos');
        XLSX.writeFile(wb, 'consejos_salud.xlsx');
    }

    exportToJSON() {
        const tips = this.getExportableTips();
        const blob = new Blob([JSON.stringify(tips, null, 2)], { type: 'application/json' });
        saveAs(blob, 'consejos_salud.json');
    }

    getExportableTips() {
        // Exporta los consejos actualmente filtrados o todos si no hay filtro
        let tips = [];
        if (this.currentFilter === 'all') {
            tips = [...this.featuredTips, ...this.personalizedTips];
        } else {
            tips = [...this.featuredTips, ...this.personalizedTips].filter(tip => tip.category === this.currentFilter);
        }
        return tips;
    }

    // ===== COMPARTIR CONSEJOS DE FORMA REAL =====
    shareToWhatsApp() {
        const tips = this.getExportableTips();
        const text = tips.map(tip => `• ${tip.title}: ${tip.description}`).join('\n');
        const url = `https://wa.me/?text=${encodeURIComponent('Mis consejos de salud recomendados:%0A' + text)}`;
        window.open(url, '_blank');
    }

    shareToFacebook() {
        const tips = this.getExportableTips();
        const text = tips.map(tip => `• ${tip.title}: ${tip.description}`).join('\n');
        const url = `https://www.facebook.com/sharer/sharer.php?u=&quote=${encodeURIComponent('Mis consejos de salud recomendados:\n' + text)}`;
        window.open(url, '_blank');
    }

    copyToClipboard() {
        const tips = this.getExportableTips();
        const text = tips.map(tip => `• ${tip.title}: ${tip.description}`).join('\n');
        const uniqueLink = this.generateShareLink(text);
        navigator.clipboard.writeText(uniqueLink).then(() => {
            this.showNotification('¡Enlace copiado al portapapeles!', 'success');
        });
    }

    generateShareLink(text) {
        // Simula un enlace único (en producción sería un backend)
        const base = 'https://meditrack.salud/consejos?data=';
        const encoded = btoa(unescape(encodeURIComponent(text)));
        return base + encoded;
    }

    // ===== FUNCIONES AUXILIARES =====
    createDifficultyStars(difficulty) {
        const maxStars = 5;
        let stars = '';
        for (let i = 1; i <= maxStars; i++) {
            stars += `<i class="fas fa-star ${i <= difficulty ? 'filled' : ''}"></i>`;
        }
        return stars;
    }

    getCategoryName(category) {
        const categories = {
            'activity': 'Actividad física',
            'nutrition': 'Nutrición',
            'mental': 'Salud mental',
            'sleep': 'Sueño'
        };
        return categories[category] || category;
    }

    getDifficultyText(difficulty) {
        const difficulties = {
            1: 'Muy fácil',
            2: 'Fácil',
            3: 'Moderado',
            4: 'Difícil',
            5: 'Muy difícil'
        };
        return difficulties[difficulty] || 'Moderado';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    updateProgressDisplay() {
        // Actualizar círculo de progreso
        const progressCircle = document.querySelector('.progress-ring-circle');
        if (progressCircle) {
            const radius = progressCircle.r.baseVal.value;
            const circumference = 2 * Math.PI * radius;
            const percent = (this.userProgress.completedTips / this.userProgress.totalTips) * 100;
            const offset = circumference - (percent / 100) * circumference;
            progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
            progressCircle.style.transition = 'stroke-dashoffset 0.7s cubic-bezier(.4,1.4,.6,1)';
            progressCircle.style.strokeDashoffset = offset;
        }
        // Actualizar porcentaje animado
        const percentElement = document.querySelector('.progress-percent');
        if (percentElement) {
            const percent = Math.round((this.userProgress.completedTips / this.userProgress.totalTips) * 100);
            if (percentElement.textContent !== `${percent}%`) {
                percentElement.classList.remove('number-pop-anim');
                void percentElement.offsetWidth;
            percentElement.textContent = `${percent}%`;
                percentElement.classList.add('number-pop-anim');
        }
        }
        // Actualizar texto de progreso
        const progressText = document.querySelector('.progress-card p');
        if (progressText) {
            progressText.textContent = `${this.userProgress.completedTips} de ${this.userProgress.totalTips} este mes`;
        }
        // Actualizar racha
        const streakText = document.querySelector('.progress-card:nth-child(2) p');
        if (streakText) {
            streakText.textContent = `${this.userProgress.currentStreak} días seguidos`;
        }
        // Actualizar logros y badge visual
        const achievementsText = document.querySelector('.progress-card:nth-child(3) p');
        const badge = document.querySelector('.progress-card:nth-child(3) .badge');
        if (achievementsText) {
            achievementsText.textContent = `${this.userProgress.achievements} logros desbloqueados`;
            if (badge) badge.textContent = `+${this.userProgress.achievements}`;
        }
        // Tooltips
        document.querySelectorAll('.progress-card').forEach(card => {
            if (!card.querySelector('.tooltip')) {
                const tip = document.createElement('div');
                tip.className = 'tooltip';
                if (card.querySelector('.progress-percent')) tip.textContent = 'Porcentaje de consejos completados';
                else if (card.querySelector('.progress-icon .fa-fire')) tip.textContent = 'Días consecutivos completando consejos';
                else if (card.querySelector('.progress-icon .fa-trophy')) tip.textContent = 'Logros desbloqueados por hitos';
                card.appendChild(tip);
            }
        });
        // Puntos totales
        const pointsEl = document.getElementById('progress-total-points');
        if (pointsEl) pointsEl.textContent = `${this.userProgress.points} pts`;
        // Consejos esta semana (simulado: últimos 7 días)
        const weekTipsEl = document.getElementById('progress-week-tips');
        if (weekTipsEl) weekTipsEl.textContent = this.getWeeklyCompletedTips();
        // Retos activos
        const activeChallengesEl = document.getElementById('progress-active-challenges');
        if (activeChallengesEl) activeChallengesEl.textContent = this.currentChallenges.length;
        // Nivel actual (según puntos)
        const levelEl = document.getElementById('progress-level');
        if (levelEl) levelEl.textContent = this.getUserLevel();
    }
    getWeeklyCompletedTips() {
        // Simulación: si tuvieras fechas reales, aquí filtrarías por fecha
        // Por ahora, muestra un valor proporcional a los completados
        return Math.max(1, Math.round(this.userProgress.completedTips / 5));
    }
    getUserLevel() {
        const pts = this.userProgress.points;
        if (pts >= 300) return 'Platino';
        if (pts >= 200) return 'Oro';
        if (pts >= 120) return 'Plata';
        return 'Bronce';
    }

    refreshPersonalizedTips() {
        this.showNotification('Actualizando consejos personalizados...', 'info');
        setTimeout(() => {
            // Simular nueva recomendación
            const newTip = {
                id: `personal-${Date.now()}`,
                title: 'Nuevo Consejo Personalizado',
                subtitle: 'Basado en tu actividad reciente',
                description: 'Hemos detectado un nuevo patrón en tu comportamiento y te recomendamos este consejo.',
                category: 'activity',
                difficulty: 2,
                duration: '15 min',
                icon: 'fas fa-lightbulb',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
                personalized: true
            };
            
            this.personalizedTips.unshift(newTip);
            this.renderPersonalizedTips();
            this.showNotification('Consejos actualizados', 'success');
        }, 1500);
    }

    showAllChallengesModal() {
        const modal = document.getElementById('all-challenges-modal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.renderAllChallengesGrid();
        setTimeout(() => {
            const closeBtn = document.getElementById('close-all-challenges-modal');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }

    hideAllChallengesModal() {
        const modal = document.getElementById('all-challenges-modal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    renderAllChallengesGrid() {
        const carousel = document.getElementById('all-challenges-carousel');
        if (!carousel) return;
        carousel.innerHTML = this.challenges.map(challenge => this.createChallengeCard(challenge)).join('');
        this.setupChallengeEvents();
        setTimeout(() => this.initializeChallengeProgressAnimations(), 100);
        document.querySelectorAll('.advance-progress-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const challengeId = btn.dataset.challengeId;
                this.advanceChallengeProgress(challengeId, 10);
            };
        });
        // Flechas del carrusel
        const leftBtn = document.getElementById('carousel-left');
        const rightBtn = document.getElementById('carousel-right');
        leftBtn.onclick = () => this.scrollCarousel(carousel, -1);
        rightBtn.onclick = () => this.scrollCarousel(carousel, 1);
        // Accesibilidad: scroll con flechas del teclado
        document.getElementById('all-challenges-modal').onkeydown = (e) => {
            if (e.key === 'ArrowLeft') this.scrollCarousel(carousel, -1);
            if (e.key === 'ArrowRight') this.scrollCarousel(carousel, 1);
        };
    }
    scrollCarousel(carousel, direction) {
        // Calcula el ancho de un card + gap
        const card = carousel.querySelector('.challenge-card');
        if (!card) return;
        const style = window.getComputedStyle(card);
        const gap = parseInt(style.marginRight || '16');
        const scrollAmount = card.offsetWidth + gap + 8;
        carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }

    addToRoutine(tipId) {
        let routine = JSON.parse(localStorage.getItem('healthTipsRoutine')) || [];
        if (!routine.includes(tipId)) {
            routine.push(tipId);
            localStorage.setItem('healthTipsRoutine', JSON.stringify(routine));
            this.renderRoutineSection();
            this.showNotification('Consejo agregado a tu rutina diaria', 'success');
        } else {
            this.showNotification('Este consejo ya está en tu rutina', 'info');
        }
    }

    setReminder(tipId) {
        let reminders = JSON.parse(localStorage.getItem('healthTipsReminders')) || [];
        if (!reminders.includes(tipId)) {
            reminders.push(tipId);
            localStorage.setItem('healthTipsReminders', JSON.stringify(reminders));
            this.showNotification('Recordatorio activado para este consejo', 'success');
        } else {
            this.showNotification('Ya tienes un recordatorio para este consejo', 'info');
        }
    }

    showRoutineModal() {
        this.openModal('routine-modal');
        const routine = JSON.parse(localStorage.getItem('healthTipsRoutine')) || [];
        const tips = [...this.featuredTips, ...this.personalizedTips].filter(t => routine.includes(t.id));
        let html = tips.length ? tips.map(t => `<div class='routine-tip'><b>${t.title}</b><br>${t.description}</div>`).join('<hr>') : '<p>No tienes consejos en tu rutina diaria.</p>';
        document.getElementById('routine-list').innerHTML = html;
    }

    showRemindersModal() {
        this.openModal('reminders-modal');
        const reminders = JSON.parse(localStorage.getItem('healthTipsReminders')) || [];
        const tips = [...this.featuredTips, ...this.personalizedTips].filter(t => reminders.includes(t.id));
        let html = tips.length ? tips.map(t => `<div class='reminder-tip'><b>${t.title}</b><br>${t.description}</div>`).join('<hr>') : '<p>No tienes recordatorios activos.</p>';
        document.getElementById('reminders-list').innerHTML = html;
    }

    // ===== ANIMACIONES =====
    initializeAnimations() {
        // Animación de entrada para cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.tip-card, .challenge-card, .article-card').forEach(card => {
            observer.observe(card);
        });
    }

    // ===== NOTIFICACIONES =====
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`, 'animate__animated', 'animate__fadeInRight');
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        const container = document.getElementById('notification-container') || document.body;
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('animate__fadeOutRight');
            notification.addEventListener('animationend', () => notification.remove());
        }, duration);

        if (type === 'error') {
            try {
                const audio = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3');
                audio.volume = 0.18;
                audio.play();
            } catch {}
            if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
        }
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // ===== PERSISTENCIA AVANZADA =====
    backupData() {
        const data = {
            favorites: this.favorites,
            progress: this.userProgress,
            challenges: this.currentChallenges,
            backupDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        saveAs(blob, 'respaldo_consejos_salud.json');
        this.showNotification('Respaldo descargado', 'success');
    }

    restoreDataFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.favorites && data.progress) {
                    this.favorites = data.favorites;
                    this.userProgress = data.progress;
                    this.currentChallenges = data.challenges || [];
                    localStorage.setItem('healthTipsFavorites', JSON.stringify(this.favorites));
                    localStorage.setItem('healthTipsProgress', JSON.stringify(this.userProgress));
                    localStorage.setItem('healthTipsChallenges', JSON.stringify(this.currentChallenges));
                    this.renderAllSections();
                    this.showNotification('Datos restaurados correctamente', 'success');
                } else {
                    this.showNotification('Archivo inválido', 'error');
                }
            } catch {
                this.showNotification('Error al leer el archivo', 'error');
            }
        };
        reader.readAsText(file);
    }

    simulateSync() {
        this.showNotification('Sincronizando con la nube...', 'info');
        setTimeout(() => {
            this.showNotification('¡Sincronización exitosa!', 'success');
        }, 1500);
    }

    setupCarouselAccessibility() {
        const wrappers = document.querySelectorAll('.carousel-tip-wrapper');
        wrappers.forEach((el, idx) => {
            el.onkeydown = (e) => {
                if (e.key === 'ArrowRight') {
                    this.nextSlide();
                    wrappers[Math.min(idx+1, wrappers.length-1)].focus();
                } else if (e.key === 'ArrowLeft') {
                    this.previousSlide();
                    wrappers[Math.max(idx-1, 0)].focus();
                }
            };
        });
        // Enfocar el card activo al renderizar
        setTimeout(() => {
            const active = document.querySelector('.carousel-tip-wrapper.active');
            if (active) active.focus();
        }, 200);
    }

    // Renderizar la sección de Rutina Diaria
    renderRoutineSection() {
        const grid = document.getElementById('routine-cards-grid');
        if (!grid) return;
        const routine = JSON.parse(localStorage.getItem('healthTipsRoutine')) || [];
        const reminders = JSON.parse(localStorage.getItem('healthTipsReminders')) || [];
        const reminderTimes = JSON.parse(localStorage.getItem('healthTipsReminderTimes')) || {};
        const tips = this.featuredTips.filter(t => routine.includes(t.id));
        grid.innerHTML = tips.length ? tips.map(tip => `
            <div class='routine-card' data-tip-id='${tip.id}'>
                <div class='routine-icon'><i class='${tip.icon}'></i></div>
                <div class='routine-title'>${tip.title}</div>
                <button class='remove-routine-btn' title='Quitar de rutina' aria-label='Quitar de rutina' onclick='window.healthTipsApp.removeFromRoutine("${tip.id}")'><i class='fas fa-times'></i></button>
                <div class='routine-reminder'>
                    <span class='reminder-icon ${reminders.includes(tip.id) ? "active" : ""}' tabindex='0' title='${reminders.includes(tip.id) ? "Desactivar recordatorio" : "Activar recordatorio"}' aria-label='Recordatorio' onclick='window.healthTipsApp.toggleRoutineReminder("${tip.id}")'><i class='fas fa-bell'></i></span>
                    <input type='time' class='reminder-time-input' style='display:none;' value='${reminderTimes[tip.id] || "08:00"}' onchange='window.healthTipsApp.setRoutineReminderTime("${tip.id}", this.value)'>
                    <span class='reminder-time' ${reminders.includes(tip.id) ? '' : 'style="display:none;"'}>${reminderTimes[tip.id] ? '⏰ ' + reminderTimes[tip.id] : ''}</span>
                </div>
            </div>
        `).join('') : '<p>No tienes consejos en tu rutina diaria.</p>';
        // Listeners para mostrar input de hora al hacer doble click en el icono
        grid.querySelectorAll('.reminder-icon').forEach(icon => {
            icon.ondblclick = (e) => {
                const input = icon.parentElement.querySelector('.reminder-time-input');
                if (input) input.style.display = 'inline-block';
            };
        });
    }

    // Quitar de rutina
    removeFromRoutine(tipId) {
        let routine = JSON.parse(localStorage.getItem('healthTipsRoutine')) || [];
        routine = routine.filter(id => id !== tipId);
        localStorage.setItem('healthTipsRoutine', JSON.stringify(routine));
        this.renderRoutineSection();
        this.renderFeaturedTips();
        this.showNotification('Consejo quitado de la rutina', 'info');
    }

    // Recordatorio avanzado
    toggleRoutineReminder(tipId) {
        let reminders = JSON.parse(localStorage.getItem('healthTipsReminders')) || [];
        const idx = reminders.indexOf(tipId);
        if (idx > -1) {
            reminders.splice(idx, 1);
        } else {
            reminders.push(tipId);
        }
        localStorage.setItem('healthTipsReminders', JSON.stringify(reminders));
        this.renderRoutineSection();
        this.showNotification(idx > -1 ? 'Recordatorio desactivado' : 'Recordatorio activado', idx > -1 ? 'info' : 'success');
    }

    setRoutineReminderTime(tipId, time) {
        let reminderTimes = JSON.parse(localStorage.getItem('healthTipsReminderTimes')) || {};
        reminderTimes[tipId] = time;
        localStorage.setItem('healthTipsReminderTimes', JSON.stringify(reminderTimes));
        this.renderRoutineSection();
        this.showNotification('Hora de recordatorio actualizada', 'success');
    }

    // Eventos avanzados para personalized
    setupPersonalizedTipEvents() {
        // Marcar como visto
        document.querySelectorAll('.personalized-tip-card').forEach(card => {
            const tipId = card.dataset.tipId;
            let vistos = JSON.parse(localStorage.getItem('healthTipsPersonalizedVistos')) || [];
            if (!vistos.includes(tipId)) {
                vistos.push(tipId);
                localStorage.setItem('healthTipsPersonalizedVistos', JSON.stringify(vistos));
            }
        });
        // Agregar a rutina
        document.querySelectorAll('.personalized-tip-card .add-routine-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const tipId = btn.dataset.tipId;
                let routine = JSON.parse(localStorage.getItem('healthTipsRoutine')) || [];
                if (!routine.includes(tipId)) {
                    routine.push(tipId);
                    localStorage.setItem('healthTipsRoutine', JSON.stringify(routine));
                    this.renderRoutineSection();
                    this.renderPersonalizedTips();
                    this.showNotification('Consejo agregado a tu rutina diaria', 'success');
                } else {
                    this.showNotification('Este consejo ya está en tu rutina', 'info');
                }
            };
        });
        // Recordar
        document.querySelectorAll('.personalized-tip-card .add-reminder-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const tipId = btn.dataset.tipId;
                let reminders = JSON.parse(localStorage.getItem('healthTipsReminders')) || [];
                if (!reminders.includes(tipId)) {
                    reminders.push(tipId);
                    localStorage.setItem('healthTipsReminders', JSON.stringify(reminders));
                    this.renderRoutineSection();
                    this.renderPersonalizedTips();
                    this.showNotification('Recordatorio activado para este consejo', 'success');
                } else {
                    this.showNotification('Ya tienes un recordatorio para este consejo', 'info');
                }
            };
        });
        // Compartir
        document.querySelectorAll('.personalized-tip-card .share-tip-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const tipId = btn.dataset.tipId;
                const tip = this.personalizedTips.find(t => t.id === tipId);
                if (tip) {
                    const text = `${tip.title}: ${tip.description}`;
                    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                }
            };
        });
        // Exportar
        document.querySelectorAll('.personalized-tip-card .export-tip-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const tipId = btn.dataset.tipId;
                const tip = this.personalizedTips.find(t => t.id === tipId);
                if (tip) {
                    const blob = new Blob([JSON.stringify(tip, null, 2)], { type: 'application/json' });
                    saveAs(blob, `consejo_${tipId}.json`);
                    this.showNotification('Consejo exportado', 'success');
                }
            };
        });
        // Like/Dislike
        document.querySelectorAll('.personalized-tip-card .like-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                btn.classList.add('active');
                btn.parentElement.querySelector('.dislike-btn').classList.remove('active');
                this.showNotification('¡Gracias por tu feedback!', 'success');
            };
        });
        document.querySelectorAll('.personalized-tip-card .dislike-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                btn.classList.add('active');
                btn.parentElement.querySelector('.like-btn').classList.remove('active');
                this.showNotification('¡Gracias, mejoraremos tus recomendaciones!', 'info');
            };
        });
        // Sugerir otro
        document.querySelectorAll('.personalized-tip-card .suggest-another-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                // Buscar otro candidato que no esté en personalizedTips ni rutina
                const routine = JSON.parse(localStorage.getItem('healthTipsRoutine')) || [];
                const currentIds = this.personalizedTips.map(t=>t.id).concat(routine);
                const candidates = this.featuredTips.filter(t => !currentIds.includes(t.id));
                if (candidates.length > 0) {
                    this.personalizedTips[idx] = {
                        ...candidates[0],
                        personalizedReason: '¡Nueva sugerencia para ti!'
                    };
                    this.renderPersonalizedTips();
                } else {
                    this.showNotification('No hay más sugerencias disponibles', 'info');
                }
            };
        });
    }

    // Generar consejos personalizados dinámicamente según rutina diaria
    generatePersonalizedTips() {
        const routine = JSON.parse(localStorage.getItem('healthTipsRoutine')) || [];
        const routineTips = this.featuredTips.filter(t => routine.includes(t.id));
        const routineCats = [...new Set(routineTips.map(t => t.category))];
        // Sugerir consejos de categorías que NO estén en la rutina
        let candidates = this.featuredTips.filter(t => !routine.includes(t.id) && !routineCats.includes(t.category));
        // Si ya hay todas las categorías, sugerir los que refuercen hábitos no repetidos
        if (candidates.length === 0) {
            candidates = this.featuredTips.filter(t => !routine.includes(t.id));
        }
        // Si rutina vacía, sugerir básicos
        if (routine.length === 0) {
            candidates = this.featuredTips.slice(0, 3);
        }
        // Seleccionar hasta 2-3 consejos personalizados
        this.personalizedTips = candidates.slice(0, 3).map(t => ({
            ...t,
            personalizedReason: routine.length === 0
                ? '¡Ideal para comenzar tu rutina saludable!'
                : `Te sugerimos esto porque tu rutina está enfocada en: ${routineCats.map(c=>this.getCategoryName(c)).join(', ')}`
        }));
    }

    // 1. Animar barra de progreso de retos y feedback avanzado
    initializeChallengeProgressAnimations() {
        document.querySelectorAll('.challenge-card').forEach(card => {
            const fill = card.querySelector('.progress-fill, .challenge-progress-fill');
            if (fill) {
                const target = parseInt(fill.getAttribute('data-target') || fill.style.width || '0');
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.transition = 'width 0.9s cubic-bezier(.4,1.4,.6,1)';
                    fill.style.width = target + '%';
                }, 150);
            }
        });
    }

    // 2. Feedback visual y sonoro al unirse/completar reto
    showChallengeFeedback(type = 'join') {
        // Confeti visual
        if (window.confetti) window.confetti();
        // Sonido
        try {
            const audio = new Audio(type === 'join' ? 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3' : 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3');
            audio.volume = 0.25;
            audio.play();
        } catch {}
        // Vibración
        if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
        // Badge animada
        const badge = document.createElement('div');
        badge.className = 'challenge-feedback-badge';
        badge.innerHTML = type === 'join' ? '¡Te uniste al reto!' : '¡Reto completado!';
        document.body.appendChild(badge);
        setTimeout(() => badge.classList.add('show'), 50);
        setTimeout(() => badge.classList.remove('show'), 2000);
        setTimeout(() => badge.remove(), 2500);
    }

    // 3. Guardar progreso individual de retos
    getChallengeProgress(challengeId) {
        const progress = JSON.parse(localStorage.getItem('challengeProgress') || '{}');
        return progress[challengeId] || 0;
    }
    setChallengeProgress(challengeId, value) {
        const progress = JSON.parse(localStorage.getItem('challengeProgress') || '{}');
        progress[challengeId] = value;
        localStorage.setItem('challengeProgress', JSON.stringify(progress));
    }

    // 4. Permitir avanzar progreso con feedback
    advanceChallengeProgress(challengeId, amount = 10) {
        let current = this.getChallengeProgress(challengeId);
        current = Math.min(100, current + amount);
        this.setChallengeProgress(challengeId, current);
        this.renderChallenges();
        this.showChallengeFeedback(current === 100 ? 'complete' : 'progress');
    }
}

// ===== INICIALIZACIÓN =====
let healthTipsApp;

document.addEventListener('DOMContentLoaded', () => {
    healthTipsApp = new HealthTipsApp();
});

// ===== FUNCIONES GLOBALES PARA MODALES =====
function openModal(modalId) {
    if (healthTipsApp) {
        healthTipsApp.openModal(modalId);
    }
}

function closeModal(modalId) {
    if (healthTipsApp) {
        healthTipsApp.closeModal(modalId);
    }
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
    const currentPage = window.location.pathname.split('/').pop() || 'ConsejosSalud.html';
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

// ====== EVENTOS DE EXPORTAR Y COMPARTIR ======
document.addEventListener('DOMContentLoaded', function() {
    const app = window.healthTipsApp = new HealthTipsApp();
    document.getElementById('export-pdf').onclick = () => app.exportToPDF();
    document.getElementById('export-excel').onclick = () => app.exportToExcel();
    document.getElementById('export-json').onclick = () => app.exportToJSON();
    document.getElementById('share-whatsapp').onclick = () => app.shareToWhatsApp();
    document.getElementById('share-facebook').onclick = () => app.shareToFacebook();
    document.getElementById('share-copy').onclick = () => app.copyToClipboard();
    document.getElementById('view-analysis').onclick = () => app.showAnalysisModal();
});

// ====== BOTONES DE RESPALDO Y RESTAURACIÓN EN FAVORITOS ======
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    // Botón de respaldo
    const favModal = document.getElementById('favorites-modal');
    if (favModal) {
        const actionsDiv = document.createElement('div');
        actionsDiv.style.margin = '1em 0';
        actionsDiv.innerHTML = `
            <button class="primary-button" id="backup-btn"><i class="fas fa-download"></i> Respaldar</button>
            <label class="primary-button" style="margin-left:8px;cursor:pointer;">
                <i class="fas fa-upload"></i> Restaurar
                <input type="file" id="restore-input" accept="application/json" style="display:none;">
            </label>
            <button class="primary-button" id="sync-btn" style="margin-left:8px;"><i class="fas fa-cloud"></i> Sincronizar</button>
        `;
        favModal.querySelector('.modal-body').prepend(actionsDiv);
        document.getElementById('backup-btn').onclick = () => window.healthTipsApp.backupData();
        document.getElementById('restore-input').onchange = (e) => {
            if (e.target.files[0]) window.healthTipsApp.restoreDataFromFile(e.target.files[0]);
        };
        document.getElementById('sync-btn').onclick = () => window.healthTipsApp.simulateSync();
    }
});

// ====== AGREGAR BOTONES Y MODALES DE RUTINA Y RECORDATORIOS ======
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    // Botones para ver rutina y recordatorios
    const favModal = document.getElementById('favorites-modal');
    if (favModal) {
        const extraDiv = document.createElement('div');
        extraDiv.style.margin = '1em 0';
        extraDiv.innerHTML = `
            <button class="primary-button" id="view-routine-btn"><i class="fas fa-calendar-plus"></i> Ver Rutina</button>
            <button class="primary-button" id="view-reminders-btn" style="margin-left:8px;"><i class="fas fa-bell"></i> Ver Recordatorios</button>
        `;
        favModal.querySelector('.modal-body').appendChild(extraDiv);
        document.getElementById('view-routine-btn').onclick = () => window.healthTipsApp.showRoutineModal();
        document.getElementById('view-reminders-btn').onclick = () => window.healthTipsApp.showRemindersModal();
    }
});

// ===== ACCESIBILIDAD Y UX =====
document.addEventListener('DOMContentLoaded', function() {
    // Controles de accesibilidad
    let fontSize = 100;
    document.getElementById('toggle-contrast').onclick = function() {
        document.body.classList.toggle('high-contrast');
    };
    document.getElementById('increase-font').onclick = function() {
        fontSize = Math.min(fontSize + 10, 160);
        document.documentElement.style.fontSize = fontSize + '%';
    };
    document.getElementById('decrease-font').onclick = function() {
        fontSize = Math.max(fontSize - 10, 80);
        document.documentElement.style.fontSize = fontSize + '%';
    };
});

// Accesibilidad: cerrar con Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') healthTipsApp.hideAllChallengesModal();
});