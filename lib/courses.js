/* ─────────────────────────────────────────────────────────────
   Apps & Scripts Summer Bootcamp — Course Data
   Single source of truth, consumed by /courses, /courses/[id],
   and /student/course/[id]. Will move fully to Supabase later.
───────────────────────────────────────────────────────────── */

export const TUTORS = {
  samuel: {
    name: 'Samuel',
    role: 'Lead Developer & Web Fundamentals Instructor',
    bio: 'Samuel leads development at Apps & Scripts and teaches HTML, CSS, and JavaScript fundamentals. He\'s passionate about helping beginners build real, working websites from scratch.',
    initials: 'SM',
  },
  stephen: {
    name: 'Stephen',
    role: 'Data Science Instructor',
    bio: 'Stephen is a data scientist who teaches practical, beginner-friendly data science — from Python basics to building real machine learning projects.',
    initials: 'ST',
  },
  opeyemi: {
    name: 'Opeyemi',
    role: 'AI Content Creation Instructor',
    bio: 'Opeyemi teaches AI Content Creation, helping students use responsible AI tools to build their personal brand and create compelling digital content.',
    initials: 'OP',
  },
  odunayo: {
    name: 'Odunayo',
    role: 'No-Code Development Instructor',
    bio: 'Odunayo specialises in no-code website development, teaching students to build and launch professional websites using WordPress, Wix, and Shopify.',
    initials: 'OD',
  },
}

/* Curriculum shapes:
   - "flat"    → modules: [{title, lessonsCount}]
   - "grouped" → groups: [{groupTitle, modules: [...]}]
*/

export const COURSES = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'html-css-javascript-basics',
    title: 'HTML, CSS & JavaScript Basics',
    shortTitle: 'Web Dev Basics',
    category: 'Web Development',
    level: 'Beginner',
    tutorKey: 'samuel',
    price: 0,
    label: 'free',
    gradient: 'linear-gradient(135deg,#4a9eff,#1e3a5f)',
    icon: '🌐',
    description: 'Learn to build real, working websites from the ground up. This course takes you from your very first HTML tag through CSS layouts and responsive design, all the way to writing interactive JavaScript — finishing with a capstone project you can show off.',
    outcomes: [
      'Write semantic, well-structured HTML',
      'Style and lay out pages confidently with CSS',
      'Build fully responsive websites',
      'Understand core JavaScript programming concepts',
      'Manipulate the DOM to create interactivity',
      'Ship a complete interactive web page as a capstone project',
    ],
    curriculumType: 'grouped',
    groups: [
      { groupTitle: 'HTML Fundamentals', modules: [
        { title: 'Introduction to the Web', lessonsCount: 3 },
        { title: 'HTML Essentials', lessonsCount: 4 },
      ]},
      { groupTitle: 'CSS Styling & Layouts', modules: [
        { title: 'CSS Foundations', lessonsCount: 4 },
        { title: 'CSS Layouts', lessonsCount: 4 },
        { title: 'Responsive Design', lessonsCount: 3 },
      ]},
      { groupTitle: 'JavaScript Programming', modules: [
        { title: 'JavaScript Foundations', lessonsCount: 4 },
        { title: 'Functions, Arrays & Objects', lessonsCount: 4 },
        { title: 'JavaScript & the DOM', lessonsCount: 4 },
      ]},
      { groupTitle: 'Capstone Project', modules: [
        { title: 'Build an Interactive Web Page', lessonsCount: 3 },
      ]},
    ],
    features: { liveClasses:true, liveClassesCompulsory:true, assignments:true, quizzes:true, projects:true, projectType:'Capstone Project', certificateAvailable:'conditional' },
    rating: 4.8, reviews: 0, students: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    slug: 'data-science',
    title: 'Data Science',
    shortTitle: 'Data Science',
    category: 'Data Science',
    level: 'Beginner',
    tutorKey: 'stephen',
    price: 0,
    label: 'new',
    gradient: 'linear-gradient(135deg,#8c64ff,#4a9eff)',
    icon: '📊',
    description: 'A beginner-to-intermediate journey into data science. Learn Python programming, work with real data, build visualisations, and get a hands-on introduction to machine learning — finishing with a mini AI project you present at a final showcase.',
    outcomes: [
      'Understand the data science workflow end-to-end',
      'Write Python code confidently for data tasks',
      'Clean, organise, and work with real datasets',
      'Analyse and visualise data to find insights',
      'Get a practical introduction to machine learning',
      'Build and present a mini AI project',
    ],
    curriculumType: 'flat',
    modules: [
      { title: 'Introduction to Data Science', lessonsCount: 3 },
      { title: 'Python Programming Fundamentals', lessonsCount: 5 },
      { title: 'Working with Data', lessonsCount: 4 },
      { title: 'Data Analysis', lessonsCount: 4 },
      { title: 'Data Visualization', lessonsCount: 4 },
      { title: 'Introduction to Machine Learning', lessonsCount: 4 },
      { title: 'Mini AI Project', lessonsCount: 3 },
      { title: 'Project Presentation and Showcase', lessonsCount: 2 },
    ],
    features: { liveClasses:false, liveClassesCompulsory:false, assignments:true, quizzes:true, projects:true, projectType:'Capstone Project', certificateAvailable:'conditional' },
    rating: 4.7, reviews: 0, students: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    slug: 'ai-content-creation',
    title: 'AI Content Creation',
    shortTitle: 'AI Content Creation',
    category: 'AI & Content',
    level: 'Beginner',
    tutorKey: 'opeyemi',
    price: 0,
    label: 'new',
    gradient: 'linear-gradient(135deg,#f5a623,#8c64ff)',
    icon: '✨',
    description: 'Learn to use AI responsibly to build your personal brand and create compelling digital content. From prompt engineering to AI-generated visuals and video, this course takes you from curious beginner to confident creator with a capstone brand showcase.',
    outcomes: [
      'Use AI tools responsibly and effectively',
      'Master prompt engineering for creative output',
      'Create digital art and visual designs with AI',
      'Understand basic AI video and animation tools',
      'Build a personal brand using AI-assisted content',
      'Present a capstone brand showcase project',
    ],
    curriculumType: 'flat',
    modules: [
      { title: 'The AI Playground (Responsible AI)', lessonsCount: 3 },
      { title: 'The Ultimate Study Buddy (AI for Academics)', lessonsCount: 3 },
      { title: 'The Prompt Masterclass & Creative Storytelling', lessonsCount: 4 },
      { title: 'Digital Art & Visual Design with AI', lessonsCount: 4 },
      { title: 'Cinematography (Video & Animation Basics)', lessonsCount: 3 },
      { title: 'Build Your Brand & Capstone Showcase', lessonsCount: 3 },
    ],
    features: { liveClasses:true, liveClassesCompulsory:true, assignments:true, quizzes:true, projects:true, projectType:'Capstone Showcase', certificateAvailable:false },
    rating: 4.9, reviews: 0, students: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    slug: 'no-code-website-design',
    title: 'No-Code Website Design',
    shortTitle: 'No-Code Web Design',
    category: 'No-Code',
    level: 'Beginner',
    tutorKey: 'odunayo',
    price: 0,
    label: 'popular',
    gradient: 'linear-gradient(135deg,#3ee87a,#1ab55c)',
    icon: '🧩',
    description: 'Build and launch professional websites without writing code. This course covers three of the most in-demand no-code platforms — WordPress, Wix, and Shopify — so you can confidently build sites for businesses, personal brands, and online stores.',
    outcomes: [
      'Understand no-code and low-code platforms',
      'Build and launch a WordPress website with Elementor',
      'Design pages visually using Wix and Wix Studio',
      'Set up an online store with Shopify',
      'Optimise sites for SEO and responsiveness',
      'Publish live, custom-domain websites on each platform',
    ],
    curriculumType: 'grouped',
    groups: [
      { groupTitle: 'WordPress', modules: [
        { title: 'Introduction to No-Code & Low-Code Development', lessonsCount: 2 },
        { title: 'Introduction to WordPress, Hosting & Domains', lessonsCount: 3 },
        { title: 'Installation of cPanel, File Manager & Email', lessonsCount: 2 },
        { title: 'WordPress Installation on Domain & Subdomain', lessonsCount: 2 },
        { title: 'Clearing Default Materials', lessonsCount: 2 },
        { title: 'Creating Pages, Posts & Designs with Elementor', lessonsCount: 4 },
        { title: 'Installing & Activating Plugins & Themes', lessonsCount: 3 },
        { title: 'SEO & Responsiveness', lessonsCount: 3 },
      ]},
      { groupTitle: 'Wix', modules: [
        { title: 'Account Setup, Wix, Wix Studio, Wix ADI & Velo', lessonsCount: 3 },
        { title: 'Building Pages & Customising Layout', lessonsCount: 3 },
        { title: 'Installing Apps for Functionality, SEO & Responsiveness', lessonsCount: 3 },
        { title: 'Custom Domain & Publishing Live', lessonsCount: 2 },
      ]},
      { groupTitle: 'Shopify', modules: [
        { title: 'Introduction to Shopify & Navigation', lessonsCount: 2 },
        { title: 'Installing Apps & Themes, Basic Layout', lessonsCount: 3 },
        { title: 'Building on Shopify, CMS & Product Display', lessonsCount: 3 },
        { title: 'AI, SEO & Developing on Shopify', lessonsCount: 3 },
        { title: 'Publishing & Shipping with Shopify', lessonsCount: 2 },
      ]},
    ],
    features: { liveClasses:true, liveClassesCompulsory:true, assignments:true, quizzes:true, projects:true, projectType:'Capstone Project', certificateAvailable:'conditional' },
    rating: 4.8, reviews: 0, students: 0,
  },
]

export function getCourseById(id) {
  return COURSES.find(c => c.id === id) || null
}

export function getTutor(tutorKey) {
  return TUTORS[tutorKey] || null
}

export function getModuleCount(course) {
  if (course.curriculumType === 'grouped') {
    return course.groups.reduce((sum, g) => sum + g.modules.length, 0)
  }
  return course.modules.length
}

export function getLessonCount(course) {
  if (course.curriculumType === 'grouped') {
    return course.groups.reduce((sum, g) =>
      sum + g.modules.reduce((s2, m) => s2 + m.lessonsCount, 0), 0)
  }
  return course.modules.reduce((s, m) => s + m.lessonsCount, 0)
}

/* Flat lesson list with stable IDs — used for progress tracking
   and sequential locking, regardless of curriculum shape */
export function getFlatLessons(course) {
  if (course.curriculumType === 'grouped') {
    return course.groups.flatMap((g, gi) =>
      g.modules.map((m, mi) => ({
        id: `${course.id}-g${gi}-m${mi}`,
        title: m.title,
        group: g.groupTitle,
        lessonsCount: m.lessonsCount,
      }))
    )
  }
  return course.modules.map((m, mi) => ({
    id: `${course.id}-m${mi}`,
    title: m.title,
    group: null,
    lessonsCount: m.lessonsCount,
  }))
}