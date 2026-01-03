document.addEventListener('DOMContentLoaded', () => {
    // === Theme Switching Logic ===
    const themeSelector = document.querySelector('#theme-selector');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeSelector.value = savedTheme;

    themeSelector.addEventListener('change', () => {
        const selectedTheme = themeSelector.value;
        document.documentElement.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('theme', selectedTheme);
    });




    
    // === إعداد الخلفية ثلاثية الأبعاد ===
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // إضاءة الخلفية
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // نظام الجسيمات للخلفية
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x3498db,
        transparent: true,
        opacity: 0.8
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    camera.position.z = 5;

    // الرسوم المتحركة للخلفية
    function animateBackground() {
        requestAnimationFrame(animateBackground);
        particles.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animateBackground();

    // === إعداد الشخصية ثلاثية الأبعاد في قسم Home ===
    const heroModel = document.querySelector('.home-3d-element');
    const homeScene = new THREE.Scene();
    const homeCamera = new THREE.PerspectiveCamera(75, heroModel.clientWidth / heroModel.clientHeight, 0.1, 1000);
    const homeRenderer = new THREE.WebGLRenderer({ alpha: true });
    homeRenderer.setSize(heroModel.clientWidth, heroModel.clientHeight);
    document.getElementById('home-character-canvas').appendChild(homeRenderer.domElement);

    // إضاءة للشخصية
    const homeAmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
    homeScene.add(homeAmbientLight);
    const homePointLight = new THREE.PointLight(0xffffff, 1);
    homePointLight.position.set(5, 5, 5);
    homeScene.add(homePointLight);
    const homeSpotLight = new THREE.SpotLight(0x3498db, 1);
    homeSpotLight.position.set(0, 5, 5);
    homeSpotLight.angle = Math.PI / 6;
    homeScene.add(homeSpotLight);

    // تحميل نموذج GLTF (شخصية)
    const loader = new THREE.GLTFLoader();
    let character;
    let mixer;
    loader.load(
        'https://threejs.org/examples/models/gltf/RobotExpressive.glb',
        (gltf) => {
            character = gltf.scene;
            character.scale.set(1.5, 1.5, 1.5);
            character.position.y = -2;
            homeScene.add(character);

            // تشغيل الرسوم المتحركة إذا وجدت
            mixer = new THREE.AnimationMixer(character);
            const animations = gltf.animations;
            if (animations && animations.length) {
                const action = mixer.clipAction(animations[0]);
                action.play();
            }
        },
        undefined,
        (error) => console.error('Error loading GLTF model:', error)
    );

    homeCamera.position.z = 5;

    // الرسوم المتحركة للشخصية
    const homeClock = new THREE.Clock();
    function animateCharacter() {
        requestAnimationFrame(animateCharacter);
        const delta = homeClock.getDelta();
        if (mixer) mixer.update(delta);
        if (character) {
            character.rotation.y += 0.02;
            character.position.y = -2 + Math.sin(Date.now() * 0.002) * 0.5;
        }
        homeRenderer.render(homeScene, homeCamera);
    }
    animateCharacter();

    // تعديل حجم النافذة
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        homeCamera.aspect = heroModel.clientWidth / heroModel.clientHeight;
        homeCamera.updateProjectionMatrix();
        homeRenderer.setSize(heroModel.clientWidth, heroModel.clientHeight);
    });

    // === إدارة شاشة التحميل ===
    const progressBar = document.querySelector('.progress');
    const loadingScreen = document.querySelector('.loading-screen');
    gsap.to(progressBar, {
        width: '100%',
        duration: 2,
        ease: 'power2.out',
        onComplete: () => {
            gsap.to(loadingScreen, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    loadingScreen.style.display = 'none';
                    document.getElementById('home').style.opacity = '1';
                }
            });
        }
    });

    // === زر التمرير لأعلى ===
    const backToTop = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('active');
        } else {
            backToTop.classList.remove('active');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // === القائمة المنسدلة ===
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navbar.classList.toggle('active');
    });

    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navbar.classList.remove('active');
        });
    });

    // === تأثير الكتابة الآلية ===
    const roles = ['Web Development Experts', 'Game Development Enthusiasts', 'Digital Creators'];
    let roleIndex = 0;
    let charIndex = 0;
    const typingText = document.querySelector('.typing-text');
    
    function type() {
        if (charIndex < roles[roleIndex].length) {
            typingText.textContent = roles[roleIndex].slice(0, charIndex + 1);
            charIndex++;
            setTimeout(type, 100);
        } else {
            setTimeout(erase, 2000);
        }
    }

    function erase() {
        if (charIndex > 0) {
            typingText.textContent = roles[roleIndex].slice(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, 50);
        } else {
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(type, 500);
        }
    }

    type();

    // === تصفية المشاريع ===
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    gsap.fromTo(card, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5 });
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // === تأثيرات الظهور عند التمرير ===
    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section.querySelectorAll('.section-header, .home-content, .about-container, .skills-container, .projects-container, .games-container, .blog-container, .contact-container'), {
            opacity: 0,
            y: 50,
            duration: 1,
            stagger: 0.2,
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Language translations
    const translations = {
        en: {
            home: "Home",
            about: "About",
            skills: "Skills",
            projects: "Projects",
            games: "Games",
            blog: "Blog",
            contact: "Contact",
            welcome: "Welcome to",
            getInTouch: "Get In Touch",
            learnMore: "Learn More",
            aboutTitle: "About DevUnion",
            webDevExperts: "Web Development & Game Development Experts",
            aboutText1: "We are a dedicated team of web and game development enthusiasts specializing in creating seamless digital experiences and captivating games. With expertise in both front-end/back-end technologies and game design, we craft solutions that blend aesthetics with functionality.",
            aboutText2: "Our journey began with a shared passion for web and gaming technologies, and we've grown into a team focused on delivering innovative solutions for complex challenges in the digital and gaming space.",
            team: "Team",
            location: "Location",
            email: "Email",
            availability: "Availability",
            openForProjects: "Open for projects",
            technicalSkills: "Technical Skills",
            frontEndDev: "Front-End Development",
            backEndDev: "Back-End Development",
            gameDev: "Game Development",
            featuredProjects: "Featured Projects",
            all: "All",
            webDevelopment: "Web Development",
            applications: "Applications",
            viewProject: "View Project",
            sourceCode: "Source Code",
            featuredGames: "Featured Games",
            download: "Download",
            latestArticles: "Latest Articles",
            readMore: "Read More",
            viewAllArticles: "View All Articles",
            letsConnect: "Let's Connect",
            connectText: "We are always open to discussing new projects, creative ideas, or opportunities to be part of your vision in web or game development.",
            phone: "Phone",
            findUsOn: "Find us on",
            yourName: "Your Name",
            yourEmail: "Your Email",
            subject: "Subject",
            yourMessage: "Your Message",
            sendMessage: "Send Message",
            quickLinks: "Quick Links",
            stayUpdated: "Stay Updated",
            newsletterText: "Subscribe to our newsletter for the latest articles and game releases.",
            enterEmail: "Enter your email",
            subscribe: "Subscribe",
            rightsReserved: "All Rights Reserved",
            designedWith: "Designed with",
            by: "by",
            lunaGameTitle: "Luna: Magical Adventure",
            lunaGameDesc: "A 2D adventure game with a magical world full of challenges and quests.",
            shadowRealmTitle: "Shadow Realm",
            shadowRealmDesc: "An exciting 3D action game with poly-style graphics.",
            modernWebTitle: "Modern Web Development Architecture",
            modernWebDesc: "Exploring the latest trends in web development frameworks and architecture patterns.",
            aiWebTitle: "Integrating AI into Web Applications",
            aiWebDesc: "How to leverage artificial intelligence to create smarter, more responsive web experiences.",
            ecommerceTitle: "A complete school system website",
            ecommerceDesc: "a platform that distinguishes the school from others and makes it advanced, allowing students to take exams and follow up with teacher.",
            taskManagementTitle: "Task Management System",
            taskManagementDesc: "Collaborative project management tool with real-time updates and analytics dashboard.",
            cmsTitle: "Custom CMS Platform",
            cmsDesc: "Scalable content management system with advanced user permissions and multi-language support.",
            techStack: "Tech Stack",
            unity: "Unity",
            csharp: "C#",
            art2d: "2D Art",
            unreal: "Unreal Engine",
            cpp: "C++",
            art3d: "3D Art",
            react: "React",
            nodejs: "Node.js",
            mongodb: "MongoDB",
            stripe: "Stripe API",
            vuejs: "Vue.js",
            express: "Express",
            socketio: "Socket.io",
            postgresql: "PostgreSQL",
            laravel: "Laravel",
            mysql: "MySQL",
            jquery: "jQuery",
            redis: "Redis"
        },
        ar: {
            home: "الرئيسية",
            about: "من نحن",
            skills: "المهارات",
            projects: "المشاريع",
            games: "الألعاب",
            blog: "المدونة",
            contact: "اتصل بنا",
            welcome: "مرحباً بك في",
            getInTouch: "تواصل معنا",
            learnMore: "اعرف المزيد",
            aboutTitle: "عن ديف يونيون",
            webDevExperts: "خبراء تطوير الويب والألعاب",
            aboutText1: "نحن فريق متخصص في تطوير الويب والألعاب، نقدم تجارب رقمية سلسة وألعاب جذابة. بفضل خبرتنا في تقنيات الواجهة الأمامية والخلفية وتصميم الألعاب، نقدم حلولاً تجمع بين الجمالية والوظائفية.",
            aboutText2: "بدأت رحلتنا بشغف مشترك لتقنيات الويب والألعاب، وتطورنا إلى فريق يركز على تقديم حلول مبتكرة للتحديات المعقدة في المجال الرقمي والألعاب.",
            team: "الفريق",
            location: "الموقع",
            email: "البريد الإلكتروني",
            availability: "التوفر",
            openForProjects: "متاح للمشاريع",
            technicalSkills: "المهارات التقنية",
            frontEndDev: "تطوير الواجهة الأمامية",
            backEndDev: "تطوير الخلفية",
            gameDev: "تطوير الألعاب",
            featuredProjects: "المشاريع المميزة",
            all: "الكل",
            webDevelopment: "تطوير الويب",
            applications: "التطبيقات",
            viewProject: "عرض المشروع",
            sourceCode: "الكود المصدري",
            featuredGames: "الألعاب المميزة",
            download: "تحميل",
            latestArticles: "أحدث المقالات",
            readMore: "اقرأ المزيد",
            viewAllArticles: "عرض جميع المقالات",
            letsConnect: "دعنا نتواصل",
            connectText: "نحن دائماً متاحون لمناقشة المشاريع الجديدة والأفكار الإبداعية أو الفرص للمشاركة في رؤيتك في تطوير الويب أو الألعاب.",
            phone: "الهاتف",
            findUsOn: "تابعنا على",
            yourName: "اسمك",
            yourEmail: "بريدك الإلكتروني",
            subject: "الموضوع",
            yourMessage: "رسالتك",
            sendMessage: "إرسال الرسالة",
            quickLinks: "روابط سريعة",
            stayUpdated: "ابق على اطلاع",
            newsletterText: "اشترك في نشرتنا البريدية للحصول على أحدث المقالات وإصدارات الألعاب.",
            enterEmail: "أدخل بريدك الإلكتروني",
            subscribe: "اشتراك",
            rightsReserved: "جميع الحقوق محفوظة",
            designedWith: "صمم بـ",
            by: "بواسطة",
            lunaGameTitle: "لونا: مغامرة سحرية",
            lunaGameDesc: "لعبة مغامرات ثنائية الأبعاد مع عالم سحري مليء بالتحديات والمهام.",
            
            shadowRealmDesc: "لعبة أكشن ثلاثية الأبعاد مثيرة مع رسومات بنظام poly.",
            modernWebTitle: "هندسة تطوير الويب الحديثة",
            modernWebDesc: "استكشاف أحدث الاتجاهات في أطر عمل تطوير الويب وأنماط الهندسة.",
            aiWebTitle: "دمج الذكاء الاصطناعي في تطبيقات الويب",
            aiWebDesc: "كيفية الاستفادة من الذكاء الاصطناعي لإنشاء تجارب ويب أكثر ذكاءً واستجابة.",
            ecommerceTitle: "منصة التجارة الإلكترونية",
            ecommerceDesc: "حل متكامل للتجارة الإلكترونية مع معالجة آمنة للمدفوعات وإدارة المخزون.",
            taskManagementTitle: "نظام إدارة المهام",
            taskManagementDesc: "أداة إدارة مشاريع تعاونية مع تحديثات فورية ولوحة تحليلات.",
            cmsTitle: "منصة إدارة المحتوى المخصصة",
            cmsDesc: "نظام إدارة محتوى قابل للتطوير مع صلاحيات مستخدم متقدمة ودعم متعدد اللغات.",
            techStack: "المجموعة التقنية",
            unity: "يونيتي",
            csharp: "سي شارب",
            art2d: "فن ثنائي الأبعاد",
            unreal: "أنريل إنجن",
            cpp: "سي بلس بلس",
            art3d: "فن ثلاثي الأبعاد",
            react: "رياكت",
            nodejs: "نود جي إس",
            mongodb: "مونجو دي بي",
            stripe: "سترايب",
            vuejs: "فيو جي إس",
            express: "اكسبرس",
            socketio: "سوكيت آي أو",
            postgresql: "بوستجري إس كيو إل",
            laravel: "لارافيل",
            mysql: "ماي إس كيو إل",
            jquery: "جيكويري",
            redis: "ريديس"
        }
    };

    // Language toggle functionality
    let currentLang = 'en';
    const langToggle = document.getElementById('language-toggle');
    const langText = langToggle.querySelector('.lang-text');

    function updateLanguage(lang) {
        currentLang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        
        // Update navigation links
        document.querySelectorAll('.navbar a').forEach(link => {
            const key = link.getAttribute('href').replace('#', '');
            if (translations[lang][key]) {
                link.textContent = translations[lang][key];
            }
        });

        // Update other text content
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });

        // Update button text
        langText.textContent = lang === 'en' ? 'عربي' : 'English';
    }

    langToggle.addEventListener('click', () => {
        const newLang = currentLang === 'en' ? 'ar' : 'en';
        updateLanguage(newLang);
    });

    // Initialize language
    updateLanguage('en');
});