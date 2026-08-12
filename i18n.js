/* ═══════════════════════════════════════════════════════════════════
   OPERIX i18n ENGINE
   Supports: Arabic (ar) / English (en)
   Strategy: JSON locale files + localStorage persistence + RTL/LTR
   Extensible: Add any new language by adding a locales/{lang}.json file
   ═══════════════════════════════════════════════════════════════════ */

const I18n = (() => {
  // ─── Config ────────────────────────────────────────────────────────
  const STORAGE_KEY = 'operix_lang';
  const DEFAULT_LANG = 'en';
  const SUPPORTED = ['en', 'ar'];
  const RTL_LANGS = ['ar'];
  const ARABIC_FONT_URL =
    'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap';

  let currentLang = DEFAULT_LANG;
  let translations = {};

  const LOCALES = {
    en: {
      "nav": { "services": "Services", "portfolio": "Portfolio", "results": "Results", "contact": "Contact", "start_project": "Start Project" },
      "hero": { "badge": "Systems Online", "btn_primary": "Initialize Project", "btn_secondary": "View Systems", "status_live": "Live Systems Status", "status_uptime": "System Uptime", "status_agents": "Active Agents", "status_deployments": "Live Deployments", "term_cmd": "operix build --project=\"your-business\"", "term_1": "setting up your business data", "term_2": "connecting your existing tools", "term_3": "custom system configured", "term_4": "dashboard ready", "term_5": "workflows connected", "term_6": "system ready", "bento_title": "PLATFORM BENEFITS", "b_custom": "Custom Built", "b_custom_desc": "Designed around your business", "b_central": "Centralized", "b_central_desc": "Everything in one place", "b_scale": "Scalable", "b_scale_desc": "Ready as your business grows" },
      "mobile_menu": { "services": "Services", "portfolio": "Portfolio", "results": "Results", "contact": "Contact", "start_project": "Start Project" },
      "chat": { "title": "Operix AI", "subtitle": "Autonomous Agent", "welcome": "Welcome to Operix! I am your AI Assistant. I can answer questions about our automation systems, services, and technical capabilities. How can I help you today?" },
      "sections": { "view_all": "View All Systems", "system_status_ready": "System Status: Ready" },
      "contact": { "terminal_title": "Initialize Deployment", "label_name": "Operator Name", "placeholder_name": "Enter name...", "label_email": "Operator Email", "placeholder_email": "operix006@gmail.com", "label_phone": "Phone Number", "placeholder_phone": "Enter phone number...", "label_type": "System Requirements", "type_placeholder": "Select Architecture...", "type_rag": "RAG AI Agent", "type_web": "High-Performance Web Architecture", "type_auto": "Complex Workflow Automation", "type_custom": "Custom Enterprise System", "label_budget": "Resource Allocation (Budget)", "budget_placeholder": "Select Range...", "budget_under100": "Under $100", "budget_100_300": "$100 - $300", "budget_300_500": "$300 - $500", "budget_500_1000": "$500 - $1,000", "budget_1000plus": "$1,000+", "submit": "Initialize Deployment ➔", "heading": "Start a", "heading_dim": "project.", "subheading": "Tell us what you're building. We'll engineer how to build it better, faster, and autonomously.", "info_comms": "System Comms", "info_phone": "Phone", "info_ops": "Operations" },
      "validation": { "name_required": "Operator name is required.", "email_required": "Email address is required.", "email_invalid": "Please enter a valid email address.", "phone_required": "Phone number is required.", "type_required": "Please select a system type.", "budget_required": "Please select a budget range." },
      "toast": { "title": "Transmission Received", "body": "We'll respond within 24 hours." },
      "marquee": { "i1": "AI RAG Systems", "i2": "n8n Automation", "i3": "WhatsApp Pipelines", "i4": "Enterprise Dashboards", "i5": "LangChain Agents", "i6": "Vector Databases", "i7": "Custom Web Apps", "i8": "DevOps & CI/CD", "i9": "Operations Architecture", "i10": "Cloud Infrastructure" },
      "footer": { "systems": "Our Services", "s_ai": "AI & RAG Agents", "s_web": "Web Architecture", "s_auto": "Automation", "company": "Company", "c_portfolio": "Portfolio", "c_results": "Results", "c_contact": "Contact", "legal": "Legal", "l_privacy": "Privacy Policy", "l_terms": "Terms & Conditions", "l_security": "Security", "tagline": "Engineering autonomous AI systems and digital infrastructure for companies that refuse to stay manual.", "copyright": "© 2026 Operix. All systems reserved." },
      "legal_pages": {
        "privacy_title": "Privacy Policy",
        "privacy_last_updated": "Last Updated: August 2026",
        "privacy_h1": "1. Data Collection",
        "privacy_p1": "At Operix, we collect strictly necessary data required for initializing project deployments. This includes Operator Name, Corporate Entity data, System Requirements, and Resource Allocations submitted through our Intake Terminal.",
        "privacy_h2": "2. System Security",
        "privacy_p2": "We deploy enterprise-grade encryption for all communications. Any proprietary data shared during the discovery or architecture phases of development is kept strictly confidential under default NDAs.",
        "privacy_h3": "3. Usage of Information",
        "privacy_p3": "Your contact details (email and phone number) are used exclusively by our engineering team to establish communication regarding your requested system architectures.",
        "privacy_h4": "4. Contact Us",
        "privacy_p4": "For questions or requests regarding your data privacy, please contact:",
        
        "terms_title": "Terms & Conditions",
        "terms_last_updated": "Last Updated: August 2026",
        "terms_h1": "1. Introduction",
        "terms_p1": "Welcome to Operix. By accessing our website and utilizing our engineering services, you agree to be bound by these Terms and Conditions. Please read them carefully before engaging our systems.",
        "terms_h2": "2. Services Provided",
        "terms_p2": "Operix specializes in autonomous AI systems, RAG AI agents, complex workflow automation, and high-performance web architecture. All project scopes, timelines, and budgets are defined within individual Statements of Work (SOW) provided prior to deployment.",
        "terms_h3": "3. Resource Allocation & Pricing",
        "terms_p3": "All pricing estimations displayed on our platform are represented in Egyptian Pounds (EGP) unless otherwise specified. Final deployment costs depend on system complexity and architecture requirements.",
        "terms_h4": "4. Intellectual Property",
        "terms_p4": "Upon final payment and successful deployment, the client retains the intellectual property rights to the custom systems developed, unless explicitly utilizing Operix proprietary underlying models.",
        "terms_h5": "5. Contact Information",
        "terms_p5": "For any legal inquiries regarding these terms, please contact our network operations:",
        
        "security_title": "Security",
        "security_last_updated": "Last Updated: August 2026",
        "security_h1": "1. Infrastructure",
        "security_p1": "Operix systems are deployed on highly secure, scalable infrastructure designed to protect data integrity and ensure maximum uptime.",
        "security_h2": "2. Data Protection",
        "security_p2": "We employ industry-standard encryption protocols for data at rest and in transit. Access to sensitive information is strictly controlled and monitored.",
        
        "contact_email_label": "Email:",
        "contact_phone_label": "Phone:",
        "contact_location_label": "Location:",
        
        "return_link": "Back"
      },
      "testimonials": {
        "eyebrow": "// client outcomes",
        "title": "Real projects. Real feedback.",
        "subtitle": "<span class=\"dim\">See what it's like to build with Operix.</span>",
        "view_project": "View Project"
      }
    },
    ar: {
      "nav": { "services": "الخدمات", "portfolio": "المشاريع", "results": "النتائج", "contact": "تواصل معنا", "start_project": "ابدأ مشروعك" },
      "hero": { "badge": "الأنظمة تعمل", "btn_primary": "تهيئة المشروع", "btn_secondary": "استعرض الأنظمة", "status_live": "حالة الأنظمة المباشرة", "status_uptime": "وقت تشغيل النظام", "status_agents": "الوكلاء النشطون", "status_deployments": "النشرات المباشرة", "term_cmd": "operix build --project=\"business\"", "term_1": "جاري إعداد بيانات عملك...", "term_2": "جاري الربط مع أدواتك الحالية...", "term_3": "تمت تهيئة النظام المخصص", "term_4": "لوحة التحكم جاهزة", "term_5": "تم ربط مسارات العمل", "term_6": "النظام جاهز للعمل", "bento_title": "مزايا المنصة", "b_custom": "بناء مخصص", "b_custom_desc": "مصمم خصيصاً ليناسب عملك", "b_central": "مركزية تامة", "b_central_desc": "كل شيء في مكان واحد", "b_scale": "قابل للتوسع", "b_scale_desc": "جاهز للنمو مع تطور أعمالك" },
      "mobile_menu": { "services": "الخدمات", "portfolio": "المشاريع", "results": "النتائج", "contact": "تواصل معنا", "start_project": "ابدأ مشروعك" },
      "chat": { "title": "مساعد أوبيركس", "subtitle": "مساعد ذكي", "welcome": "مرحباً بك في Operix! أنا المساعد الذكي الخاص بالموقع. أنا هنا للإجابة على جميع استفساراتك حول أنظمتنا، خدماتنا، وأي تفاصيل تقنية تحتاجها. كيف يمكنني مساعدتك اليوم؟" },
      "sections": { "view_all": "عرض جميع الأنظمة", "system_status_ready": "حالة النظام: جاهز" },
      "contact": { "terminal_title": "تهيئة النشر", "label_name": "اسم المشغّل", "placeholder_name": "أدخل الاسم...", "label_email": "البريد الإلكتروني", "placeholder_email": "operix006@gmail.com", "label_phone": "رقم الهاتف", "placeholder_phone": "أدخل رقم الهاتف...", "label_type": "متطلبات النظام", "type_placeholder": "اختر البنية التحتية...", "type_rag": "وكيل RAG بالذكاء الاصطناعي", "type_web": "بنية ويب عالية الأداء", "type_auto": "أتمتة سير عمل معقدة", "type_custom": "نظام مؤسسي مخصص", "label_budget": "تخصيص الموارد (الميزانية)", "budget_placeholder": "اختر النطاق...", "budget_under100": "أقل من $100", "budget_100_300": "$100 - $300", "budget_300_500": "$300 - $500", "budget_500_1000": "$500 - $1,000", "budget_1000plus": "$1,000 وأكثر", "submit": "تهيئة النشر ➔", "heading": "ابدأ", "heading_dim": "مشروعك.", "subheading": "أخبرنا بما تبنيه. سنُهندس كيف يُبنى بشكل أفضل، وأسرع، وباستقلالية تامة.", "info_comms": "التواصل", "info_phone": "الهاتف", "info_ops": "العمليات" },
      "validation": { "name_required": "اسم المشغّل مطلوب.", "email_required": "البريد الإلكتروني مطلوب.", "email_invalid": "يرجى إدخال بريد إلكتروني صحيح.", "phone_required": "رقم الهاتف مطلوب.", "type_required": "يرجى اختيار نوع النظام.", "budget_required": "يرجى اختيار نطاق الميزانية." },
      "toast": { "title": "تم استقبال الرسالة", "body": "سنرد عليك خلال 24 ساعة." },
      "marquee": { "i1": "أنظمة RAG بالذكاء الاصطناعي", "i2": "أتمتة n8n", "i3": "خطوط عمل WhatsApp", "i4": "لوحات تحكم للمؤسسات", "i5": "وكلاء LangChain", "i6": "قواعد البيانات المتجهة", "i7": "تطبيقات ويب مخصصة", "i8": "عمليات التطوير DevOps", "i9": "هندسة العمليات", "i10": "البنية التحتية السحابية" },
      "footer": { "systems": "خدماتنا", "s_ai": "أنظمة الذكاء الاصطناعي وRAG", "s_web": "بنية الويب", "s_auto": "أتمتة العمليات", "company": "الشركة", "c_portfolio": "المعرض", "c_results": "النتائج", "c_contact": "تواصل معنا", "legal": "القانونية", "l_privacy": "سياسة الخصوصية", "l_terms": "الشروط والأحكام", "l_security": "الأمان", "tagline": "نهندس أنظمة الذكاء الاصطناعي المستقلة والبنية التحتية الرقمية للشركات التي ترفض البقاء يدوية.", "copyright": "© 2026 Operix. جميع الحقوق محفوظة." },
      "legal_pages": {
        "privacy_title": "سياسة الخصوصية",
        "privacy_last_updated": "آخر تحديث: أغسطس 2026",
        "privacy_h1": "1. جمع البيانات",
        "privacy_p1": "في Operix، نقوم بجمع البيانات الضرورية فقط واللازمة لتهيئة ونشر المشاريع. يشمل ذلك اسم المشغّل، بيانات الكيان المؤسسي، متطلبات النظام، وتخصيص الموارد المقدمة عبر منصة الاستقبال الخاصة بنا.",
        "privacy_h2": "2. أمان النظام",
        "privacy_p2": "نقوم بتطبيق تشفير على مستوى المؤسسات لجميع الاتصالات. أي بيانات ملكية يتم مشاركتها خلال مراحل الاستكشاف أو بناء الهيكلية للمشروع تُحفظ بسرية تامة بموجب اتفاقيات عدم الإفصاح الافتراضية.",
        "privacy_h3": "3. استخدام المعلومات",
        "privacy_p3": "تُستخدم تفاصيل الاتصال الخاصة بك (البريد الإلكتروني ورقم الهاتف) حصرياً من قبل فريق الهندسة لدينا لإنشاء قناة تواصل بشأن الهياكل النظامية المطلوبة.",
        "privacy_h4": "4. تواصل معنا",
        "privacy_p4": "لأية أسئلة أو طلبات تتعلق بخصوصية بياناتك، يرجى التواصل مع:",
        
        "terms_title": "الشروط والأحكام",
        "terms_last_updated": "آخر تحديث: أغسطس 2026",
        "terms_h1": "1. مقدمة",
        "terms_p1": "مرحباً بكم في Operix. من خلال الوصول إلى موقعنا الإلكتروني واستخدام خدماتنا الهندسية، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل التفاعل مع أنظمتنا.",
        "terms_h2": "2. الخدمات المقدمة",
        "terms_p2": "تتخصص Operix في أنظمة الذكاء الاصطناعي المستقلة، وكلاء RAG، أتمتة سير العمل المعقدة، وبنية الويب عالية الأداء. يتم تحديد جميع نطاقات المشاريع، الجداول الزمنية، والميزانيات ضمن بيانات عمل منفصلة (SOW) يتم تقديمها قبل النشر.",
        "terms_h3": "3. تخصيص الموارد والتسعير",
        "terms_p3": "جميع تقديرات الأسعار المعروضة على منصتنا هي بالجنيه المصري (EGP) ما لم يُنص على خلاف ذلك. تعتمد تكاليف النشر النهائية على تعقيد النظام ومتطلبات الهيكلية.",
        "terms_h4": "4. الملكية الفكرية",
        "terms_p4": "عند الدفع النهائي والنشر الناجح، يحتفظ العميل بحقوق الملكية الفكرية للأنظمة المخصصة التي تم تطويرها، ما لم يتم استخدام النماذج الأساسية الخاصة بـ Operix بشكل صريح.",
        "terms_h5": "5. معلومات التواصل",
        "terms_p5": "لأية استفسارات قانونية بخصوص هذه الشروط، يرجى التواصل مع عمليات الشبكة لدينا:",
        
        "security_title": "الأمان",
        "security_last_updated": "آخر تحديث: أغسطس 2026",
        "security_h1": "1. البنية التحتية",
        "security_p1": "يتم نشر أنظمة Operix على بنية تحتية آمنة للغاية وقابلة للتطوير، مصممة لحماية سلامة البيانات وضمان أقصى وقت تشغيل.",
        "security_h2": "2. حماية البيانات",
        "security_p2": "نستخدم بروتوكولات التشفير المتوافقة مع معايير الصناعة للبيانات أثناء الراحة وأثناء النقل. يتم التحكم في الوصول إلى المعلومات الحساسة ومراقبته بدقة.",
        
        "contact_email_label": "البريد الإلكتروني:",
        "contact_phone_label": "الهاتف:",
        "contact_location_label": "الموقع:",
        
        "return_link": "العودة"
      },
      "testimonials": {
        "eyebrow": "نتائج العملاء //",
        "title": "مشاريع حقيقية. آراء حقيقية.",
        "subtitle": "<span class=\"dim\">شاهد كيف تبدو تجربة البناء مع أوبيريكس.</span>",
        "view_project": "عرض المشروع"
      }
    }
  };

  // ─── Load locale JSON ───────────────────────────────────────────────
  async function loadTranslations(lang) {
    return LOCALES[lang] || LOCALES[DEFAULT_LANG];
  }

  // ─── Resolve nested key (e.g. "nav.services") ──────────────────────
  function resolve(obj, keyPath) {
    return keyPath.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), obj);
  }

  // ─── Apply translations to DOM ──────────────────────────────────────
  function applyTranslations() {
    // Text content: data-i18n="key.path"
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = resolve(translations, key);
      if (value !== null) el.textContent = value;
    });

    // HTML content: data-i18n-html="key.path"
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const value = resolve(translations, key);
      if (value !== null) el.innerHTML = value;
    });

    // Placeholder: data-i18n-placeholder="key.path"
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = resolve(translations, key);
      if (value !== null) el.placeholder = value;
    });

    // Aria-label: data-i18n-aria="key.path"
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const value = resolve(translations, key);
      if (value !== null) el.setAttribute('aria-label', value);
    });

    // Dataset Text for Typing Animation: data-i18n-data-text="key.path"
    document.querySelectorAll('[data-i18n-data-text]').forEach(el => {
      const key = el.getAttribute('data-i18n-data-text');
      const value = resolve(translations, key);
      if (value !== null) {
         el.setAttribute('data-text', value);
         // If it has already started typing, force text update to avoid broken text
         if (el.textContent.length > 0) el.textContent = value;
      }
    });
  }

  // ─── Apply RTL / LTR to document ───────────────────────────────────
  function applyDirection(lang) {
    const isRTL = RTL_LANGS.includes(lang);
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.body.classList.toggle('rtl', isRTL);
    document.body.classList.toggle('ltr', !isRTL);
  }

  // ─── Load Arabic font lazily ────────────────────────────────────────
  function ensureArabicFont() {
    if (!document.getElementById('operix-arabic-font')) {
      const link = document.createElement('link');
      link.id = 'operix-arabic-font';
      link.rel = 'stylesheet';
      link.href = ARABIC_FONT_URL;
      document.head.appendChild(link);
    }
  }

  // ─── Update Language Switcher UI ────────────────────────────────────
  function updateSwitcherUI(lang) {
    document.querySelectorAll('.lang-switcher').forEach(btn => {
      const isAR = lang === 'ar';
      btn.setAttribute('data-lang', lang);
      btn.setAttribute('aria-label', isAR ? 'Switch to English' : 'التبديل إلى العربية');

      const flagEl = btn.querySelector('.lang-flag');
      const labelEl = btn.querySelector('.lang-label');
      if (flagEl) flagEl.textContent = isAR ? '🇯🇴' : '🇺🇸';
      if (labelEl) labelEl.textContent = isAR ? 'EN' : 'ع';
    });
  }

  // ─── Main: Apply Language ───────────────────────────────────────────
  async function applyLanguage(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // Load font for Arabic
    if (lang === 'ar') ensureArabicFont();

    // Load translations
    translations = await loadTranslations(lang);

    // Apply to DOM
    applyDirection(lang);
    applyTranslations();
    updateSwitcherUI(lang);

    // Notify the rest of the app
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  // ─── Toggle between ar / en ─────────────────────────────────────────
  function toggle() {
    const next = currentLang === 'en' ? 'ar' : 'en';
    return applyLanguage(next);
  }

  // ─── Init ───────────────────────────────────────────────────────────
  async function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const browserLang = navigator.language?.split('-')[0];
    const preferred = saved || (SUPPORTED.includes(browserLang) ? browserLang : DEFAULT_LANG);
    await applyLanguage(preferred);
  }

  // ─── Attach switcher click handlers ────────────────────────────────
  function bindSwitchers() {
    document.querySelectorAll('.lang-switcher').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggle();
      });
    });
  }

  // ─── Public helpers ─────────────────────────────────────────────────
  function t(keyPath) {
    return resolve(translations, keyPath) ?? keyPath;
  }

  function getLang() {
    return currentLang;
  }

  function isRTL() {
    return RTL_LANGS.includes(currentLang);
  }

  // ─── Auto-init on DOMContentLoaded ─────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      await init();
      bindSwitchers();
    });
  } else {
    init().then(bindSwitchers);
  }

  return { applyLanguage, toggle, t, getLang, isRTL, init };
})();

// Make globally available
window.I18n = I18n;
