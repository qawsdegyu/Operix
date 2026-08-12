-- ==============================================================================
-- OPERIX i18n MIGRATION — Arabic Language Support
-- ==============================================================================
-- Run this script in your Supabase SQL Editor.
-- Safe to run on existing data — uses IF NOT EXISTS / ON CONFLICT DO NOTHING.
-- All existing English data is preserved as-is.
-- ==============================================================================

-- ──────────────────────────────────────────────
-- 1. SERVICES TABLE — Add Arabic columns
-- ──────────────────────────────────────────────
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS title_ar text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description_ar text;

-- Seed Arabic translations for default services
UPDATE public.services SET
  title_ar = 'أنظمة الذكاء الاصطناعي وRAG المستقلة',
  description_ar = 'وكلاء ذكاء اصطناعي مدرَّبون خصيصًا بتقنية <span class="highlight">الاسترجاع المعزَّز بالتوليد (RAG)</span>. نبني أنظمة <span class="highlight">أتمتة واتساب</span> ذكية، ومساعدي قواعد المعرفة، وأنظمة ذكاء اصطناعي متعددة النماذج تفهم سياق عملك.'
WHERE title = 'Autonomous AI & RAG Systems';

UPDATE public.services SET
  title_ar = 'هندسة الويب عالية الأداء',
  description_ar = 'منصات قابلة للتوسع، ومنتجات SaaS، ولوحات بيانات في الوقت الفعلي. تحميل فائق السرعة. بدون تقلبات في التخطيط. مبنية للتحويل.'
WHERE title = 'High-Performance Web Architecture';

UPDATE public.services SET
  title_ar = 'أتمتة العمليات والتشغيل',
  description_ar = 'استبدال سير العمل اليدوي بعُقد مستقلة ذكية. نُنسّق البيانات عبر منظومتك البرمجية بالكامل.'
WHERE title = 'Process Automation & Ops';


-- ──────────────────────────────────────────────
-- 2. PROJECTS TABLE — Add Arabic columns
-- ──────────────────────────────────────────────
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS title_ar text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description_ar text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS badge_text_ar text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tags_ar text[];

-- Seed Arabic translations for default projects
UPDATE public.projects SET
  title_ar = 'بوت دعم العملاء (مُرشد)',
  description_ar = 'وكيل ذكاء اصطناعي للرد على استفسارات العملاء على مدار الساعة بدقة عالية.',
  badge_text_ar = 'ذكاء اصطناعي',
  tags_ar = ARRAY['الرد الآلي', 'خدمة العملاء', 'تحليل البيانات']
WHERE title = 'Customer Support Bot (Murshid)';

UPDATE public.projects SET
  title_ar = 'نظام إدارة المهام الذكي',
  description_ar = 'نظام مؤتمت بالكامل لإدارة العمليات، مع تنبيهات لحظية وتقارير أداء دورية.',
  badge_text_ar = 'نظام رئيسي',
  tags_ar = ARRAY['الذكاء الاصطناعي', 'الأتمتة', 'لوحة تحكم']
WHERE title = 'Smart Task Management System';

UPDATE public.projects SET
  title_ar = 'بنية AGS',
  description_ar = 'منصة حوكمة آلية متكاملة مع لوحات RBAC وأتمتة الامتثال.',
  badge_text_ar = 'نظام مؤسسي',
  tags_ar = ARRAY['n8n', 'صلاحيات الاستخدام', 'PostgreSQL', 'Next.js']
WHERE title = 'AGS Architecture';

UPDATE public.projects SET
  title_ar = 'نظام SanaSkills',
  description_ar = 'تعلم تكيفي مدعوم بالذكاء الاصطناعي مع مسارات شخصية، وتقييمات المهارات، والتحليلات.',
  badge_text_ar = 'منصة تعليمية',
  tags_ar = ARRAY['Node.js', 'React', 'وكلاء التعلم']
WHERE title = 'SanaSkills System';

UPDATE public.projects SET
  title_ar = 'دورة الأمن السيبراني ومكافحة الابتزاز',
  description_ar = 'حزمة تدريبية شاملة لحماية نفسك وعائلتك من الابتزاز الإلكتروني. تشمل 5 دورات تغطي الجوانب القانونية والتقنية والنفسية للتعامل مع المبتزين وتأمين أجهزتك من الاختراق.',
  badge_text_ar = 'الأمن السيبراني والقانون',
  tags_ar = ARRAY['الحماية القانونية', 'الأمن السيبراني', 'الخصوصية الرقمية', 'الصحة النفسية']
WHERE title = 'Cybersecurity & Anti-Extortion Course';


-- ──────────────────────────────────────────────
-- 3. METRICS TABLE — Add Arabic columns
-- ──────────────────────────────────────────────
ALTER TABLE public.metrics ADD COLUMN IF NOT EXISTS label_ar text;

-- Seed Arabic translations for default metrics
UPDATE public.metrics SET label_ar = 'ساعة عمل مُؤتمتة'     WHERE label = 'Hours Automated';
UPDATE public.metrics SET label_ar = 'بنية تحتية منشورة'    WHERE label = 'Architectures Deployed';
UPDATE public.metrics SET label_ar = 'سير عمل نشط'          WHERE label = 'Workflows Running';
UPDATE public.metrics SET label_ar = 'مركز — Vision Jo Startup' WHERE label = 'Place - Vision jo Startup';


-- ──────────────────────────────────────────────
-- 4. TEAM_MEMBERS TABLE — Add Arabic columns
-- ──────────────────────────────────────────────
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS role_ar text;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS description_ar text;

-- Seed Arabic translations for default team members
UPDATE public.team_members SET
  name_ar = 'عبدالرحمن الصلحوت',
  role_ar = 'المؤسس ومهندس أنظمة الذكاء الاصطناعي',
  description_ar = 'تصميم وكلاء RAG المعقدة، وخطوط أتمتة الأعمال المستقلة، والبنية التحتية الأساسية للأتمتة.',
  tags_ar = ARRAY['واجهات المستخدم', 'بنية n8n', 'ذكاء اصطناعي RAG', 'تطوير شامل', 'هندسة النظم']
WHERE name = 'Abdelrahman Al-Salhout';

UPDATE public.team_members SET
  name_ar = 'عبدالله طهاطح',
  role_ar = 'مصمم تطبيقات الويب الرئيسي / شريك',
  description_ar = 'تصميم واجهات مستخدم عالية الأداء ومُحسَّنة للتحويل، وتجارب رقمية سلسة.',
  tags_ar = ARRAY['أنظمة بصرية', 'هوية العلامة التجارية', 'تصميم جرافيك', 'تجربة المستخدم']
WHERE name = 'Abdallah Tahat';


-- ──────────────────────────────────────────────
-- 5. SITE_CONTENT TABLE — Add Arabic content keys
-- ──────────────────────────────────────────────
-- Strategy: Add new rows with _ar suffix keys for all Arabic content.
-- The frontend will pick the right key based on the selected language.

INSERT INTO public.site_content (section_key, content_value) VALUES
  ('hero_title_ar',          'هندسة مستقبل<br/><span class="gradient-epic">العمليات المستقلة.</span>'),
  ('hero_subtitle_ar',       'نبني أنظمة ذكية قابلة للتطوير. وكلاء ذكاء اصطناعي مخصصة، وسير عمل آلية، ومنصات مؤسسية — مُهندَسة للشركات التي ترفض البقاء يدوية.'),
  ('hero_btn_primary_ar',    'تهيئة المشروع ➔'),
  ('hero_btn_secondary_ar',  'استعرض الأنظمة'),
  
  ('engine_room_eyebrow',    '// the engine room'),
  ('engine_room_title',      'Systems we <span class="dim">engineer.</span>'),
  ('engine_room_subtitle',   'From autonomous AI agents to self-running infrastructure — precision-built for infinite scale.'),
  
  ('engine_room_eyebrow_ar', '// غرفة المحركات'),
  ('engine_room_title_ar',   'الأنظمة التي <span class="dim">نُهندسها.</span>'),
  ('engine_room_subtitle_ar','من وكلاء الذكاء الاصطناعي المستقلين إلى البنية التحتية ذاتية التشغيل — مُصمَّمة بدقة لقياس لا نهائي.'),
  
  ('portfolio_eyebrow',      '// published systems'),
  ('portfolio_title',        'Featured <span class="dim">Deployments.</span>'),
  ('portfolio_subtitle',     'Production-grade systems engineered for real-world impact.'),
  
  ('portfolio_eyebrow_ar',   '// الأنظمة المنشورة'),
  ('portfolio_title_ar',     'أعمال <span class="dim">مميزة.</span>'),
  ('portfolio_subtitle_ar',  'منصات احترافية مُهندَسة لأثر حقيقي في العالم.'),
  
  ('metrics_eyebrow',        '// proof of execution'),
  ('metrics_title',          'Measured in <span class="dim">results.</span>'),
  ('metrics_subtitle',       'Real systems. Real numbers. Real impact.'),
  
  ('metrics_eyebrow_ar',     '// دليل التنفيذ'),
  ('metrics_title_ar',       'مُقاسة <span class="dim">بالنتائج.</span>'),
  ('metrics_subtitle_ar',    'أنظمة حقيقية. أرقام حقيقية. أثر حقيقي.'),
  
  ('team_eyebrow',           '// THE ARCHITECTS'),
  ('team_title',             'The minds engineering your <span class="dim">autonomous future.</span>'),
  
  ('team_eyebrow_ar',        '// المهندسون المعماريون'),
  ('team_title_ar',          'العقول التي تُهندس <span class="dim">مستقبلك المستقل.</span>')
ON CONFLICT (section_key) DO UPDATE SET content_value = EXCLUDED.content_value;

-- ==============================================================================
-- END OF MIGRATION
-- All changes are additive — no existing data was modified or deleted.
-- ==============================================================================

-- ──────────────────────────────────────────────
-- 6. TAGS — Add Arabic columns
-- ──────────────────────────────────────────────
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tags_ar text[];
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS tags_ar text[];
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS tags_ar text[];
