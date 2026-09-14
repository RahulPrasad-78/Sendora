const DEFAULT_MASTER_LATEX = `\\documentclass[]{kyvernitis-resume}
% \\raggedright % avoid text break
\\fullname{Rahul Prasad}
% \\jobtitle{Software Engineer}

\\begin{document}
\\resumeheader
{\\email{rahulprasad4653@gmail.com}}
{\\github{/RahulPrasad-78}}
{\\linkedin{/rahul-prasad-}}
{\\phone{+91 9350884937}}
{\\leetcode{LeetCode}}
{\\geeksforgeeks{GeeksForGeeks}}
 \\vspace{-0.5em} % Adjust the value as needed

 \\begin{section}{Projects}
\\begin{subsection}{ShopNow - Full Stack E-Commerce Web Application}{Node.js · Express · MongoDB · JWT · Razorpay · Redux · Cloudinary}{June 2026 }{\\href{https://github.com/RahulPrasad-78/ShopNow}{GitHub} \\;|\\; \\href{https://shopnow-mmrd.onrender.com}{Demo}}
    \\item Built 15+ RESTful endpoints for product management, order processing, and admin analytics.
    \\item Implemented JWT authentication and role-based authorization for admin and user roles.
    \\item Designed 3 MongoDB schemas for Users, Products, and Orders with Cloudinary for image storage.
    \\item Integrated \\textbf{\\fontsize{10.8}{12}\\selectfont Razorpay} payment gateway with HMAC-SHA256 verification, Redux Toolkit for cart, and Nodemailer for order confirmation emails.
\\end{subsection}


\\begin{subsection}{Horizon – Learning Management System}
{C\\# · ASP.NET Core MVC · .NET 8 · Microservices · YARP · JWT · Serilog}{March 2026}{
    \\href{https://github.com/RahulPrasad-78/Horizon-LMS-}{Project}
}
    \\item Engineered a full-stack LMS using \\textbf{\\fontsize{10.8}{12}\\selectfont ASP.NET Core MVC} and a 5-service Microservices architecture.
    \\item Designed a YARP API Gateway securing communication across 5 microservices with JWT authentication.
    \\item Established \\textbf{\\fontsize{10.8}{12}\\selectfont role-based access control} supporting 3 user roles and protected application routes.
    \\item Integrated centralized logging and monitoring using Serilog across 5 microservices, improving debugging and error tracing.
    \\item Added 4+ core features including course enrollment, XP tracking, bookmarks, and real-time chat.
\\end{subsection}

\\end{section}

\\vspace{0.5em}

\\begin{section}{Training Experience}
    \\begin{subsection}{.NET Core with Azure -- Capgemini Industry Training}{Trainee}{January 2026 -- May 2026}{}

    \\item Completed a 5-month industry training in \\textbf{\\fontsize{10.8}{12}\\selectfont .NET 8} and Microsoft Azure covering ASP.NET Core MVC, Web APIs, Entity Framework Core, SQL Server, JWT Authentication, Azure DevOps, and cloud services.

    \\item Sharpened RESTful API development skills across 15+ ASP.NET Core exercises, applying Repository pattern, Dependency Injection, and LINQ-driven data access to reinforce industry design standards.

    \\item Built and tested REST APIs using Entity Framework Core, LINQ, Postman, and JWT authentication.

    \\item Leveraged 5+ Azure services, including Azure DevOps, App Service, Azure SQL, and Blob Storage, to deploy and manage cloud-based applications through CI/CD pipelines.

    \\item Led a Database-First Hospital Management System project using a 3-layer architecture, separating UI, business logic, and data access while managing relationships between healthcare roles and patients \\href{https://github.com/CG-HMS/Hospital_Management}{GitHub}.

\\end{subsection}
\\end{section}


\\vspace{0.5em}

\\sectiontable{Technical skills}
{
    \\entry{Languages}{Java, C\\#, JavaScript, HTML, CSS}
    \\entry{Fundamentals}{Data Structures and Algorithms, System Design, Computer Networks, DBMS}
    \\entry{Web Development}{ASP.NET Core, Node.js, Express.js, Redux Toolkit, JWT, REST APIs, YARP}
    \\entry{Databases}{SQL Server, MongoDB, PostgreSQL}
    \\entry{Tools}{Git, GitHub, Visual Studio, Postman, Swagger, Serilog, Razorpay, Nodemailer}
    \\entry{Cloud}{Microsoft Azure (App Service, Azure Storage, RBAC)}
}

\\begin{section}{Education}

    \\begin{subsectionnobullet}
        {Bachelor of Engineering - Information Technology}
        {Chandigarh University}
        {\\textbf{7.59 CGPA }}
        {2022 -- 2026}
    \\end{subsectionnobullet}


\\end{section}


\\vspace{0.5em}

\\begin{section}{Achievements}
    \\begin{itemize}[itemsep=0.2em, parsep=0pt, topsep=0pt, leftmargin=0.9em]
        \\item Solved over \\textbf{450+} DSA problems across \\href{https://leetcode.com/u/Rahul__78/}{LeetCode} and \\href{https://www.geeksforgeeks.org/user/rahul_prasad/}{GeeksforGeeks}.
        \\item Earned the NPTEL Cloud Computing certification (Nov 2024).
        \\item Completed the Metacrafters Summer Training Program on Blockchain Technology (June 2024), building ERC-20 smart contracts and exploring Ethereum and Polygon ecosystems. \\href{https://drive.google.com/file/d/1uHnucAVvAFsY9SzZZPW1cewkehKtJq0r/view?usp=sharing}{Certificate}.
    \\end{itemize}
\\end{section}


\\end{document}
`;

const DEFAULT_PROJECT_SEEDS = [
  {
    title: "ShopNow",
    slug: "shopnow",
    tagline: "Full Stack E-Commerce Web Application (MERN + Razorpay)",
    techStack: ["Node.js", "Express", "MongoDB", "JWT", "Razorpay", "Redux", "Cloudinary"],
    repoUrl: "https://github.com/RahulPrasad-78/ShopNow",
    liveUrl: "https://shopnow-mmrd.onrender.com",
    isFeatured: true,
    source: "default_seed",
    content: `# ShopNow - E-Commerce Platform

A production-ready full-stack e-commerce web application featuring secure role-based access control, Razorpay payment processing, product catalog management, and automated order fulfillment emails.

## Key Features & Architecture
- **Authentication**: JWT authentication with httpOnly cookie storage and bcrypt password hashing.
- **Payment Gateway**: End-to-end Razorpay integration with HMAC-SHA256 signature verification.
- **State Management**: Redux Toolkit for cart state, product caching, and user session management.
- **Notifications**: Automated transaction and order confirmation emails using Nodemailer.
- **Media**: Cloudinary asset management for multi-image product uploads.

## Tech Stack
- Frontend: React 18, Redux Toolkit, Tailwind CSS, Lucide Icons
- Backend: Node.js, Express.js, MongoDB Atlas, Mongoose
- Integrations: Razorpay, Cloudinary, Nodemailer
`,
  },
  {
    title: "Horizon LMS",
    slug: "horizon-lms",
    tagline: "Distributed Learning Management System (.NET 8 Microservices)",
    techStack: ["ASP.NET Core", "C#", ".NET 8", "Microservices", "YARP", "JWT", "Serilog", "SQL Server"],
    repoUrl: "https://github.com/RahulPrasad-78/Horizon-LMS-",
    liveUrl: "",
    isFeatured: true,
    source: "default_seed",
    content: `# Horizon – Learning Management System

Enterprise-grade distributed learning management system built on ASP.NET Core MVC with a 5-service Microservices architecture, YARP Reverse Proxy API Gateway, and centralized logging.

## Core Microservices Architecture
- **API Gateway**: Reverse proxy using Microsoft YARP routing traffic securely across downstream services with JWT validation.
- **Auth Service**: Identity management, role-based access control (Admin, Instructor, Student), and claims-based auth.
- **Course & Catalog Service**: Manages curriculums, multimedia lectures, bookmarks, and enrollment states.
- **Gamification Service**: Real-time XP tracking, leaderboard ranks, and student achievement badges.
- **Chat & Discussion Service**: Real-time student-instructor communication.

## Tech Stack
- Framework: ASP.NET Core MVC (.NET 8), Entity Framework Core
- Architecture: Microservices, YARP API Gateway, Repository Pattern
- Database: Microsoft SQL Server, Azure SQL
- Observability: Serilog centralized logging
`,
  },
  {
    title: "Sendora",
    slug: "sendora",
    tagline: "AI-Powered Recruiter Cold Email & Dynamic LaTeX ATS Resume Generator",
    techStack: ["React", "Vite", "Node.js", "Express", "MongoDB Atlas", "Gemini AI", "XeLaTeX", "Nodemailer"],
    repoUrl: "https://github.com/RahulPrasad-78/Sendora",
    liveUrl: "",
    isFeatured: true,
    source: "default_seed",
    content: `# Sendora - AI Recruiter Outreach & ATS Resume Engine

Sendora automates personalized job outreach and ATS-optimized LaTeX resume tailoring using Google Gemini 2.5 Flash and local XeLaTeX compilation.

## Key Capabilities
- **Recruiter Cold Email Generator**: Context-aware outreach email generation matched to job descriptions.
- **ATS Resume Generator**: Dynamically injects matching projects and relevant skills into a clean XeLaTeX template.
- **MongoDB Knowledge Base**: Cloud-stored Project READMEs and master LaTeX templates editable in real time.
- **Nodemailer Dispatch**: Direct cold email dispatch with PDF attachments and delivery verification.
`,
  },
];

const DEFAULT_CLS_CONTENT = `\\ProvidesClass{kyvernitis-resume}[2023/06/06 Kyvernitis class]
\\NeedsTeXFormat{LaTeX2e}

% Set font size and paper type
\\LoadClass[11pt,letterpaper]{article}

\\RequirePackage{enumitem}

% Enable custom and named colors
\\RequirePackage[usenames,dvipsnames]{color}

% Remove paragraph indentation
\\RequirePackage[parfill]{parskip}

% Set margin width
\\RequirePackage[hmargin=1.25cm,vmargin=1cm, paperwidth=21cm, paperheight=29.7cm]{geometry}

% Use cool fonts
\\RequirePackage{fontspec}
\\RequirePackage{fontawesome5}

% serif
\\usepackage{charter} 
\\usepackage[defaultsups]{XCharter}

% line spacing
\\usepackage{setspace}
\\setstretch{1.05}

% Use hyperref
\\RequirePackage[xetex]{hyperref}

% Use extended columns definitions
\\RequirePackage{array}

% Make custom tables
\\RequirePackage{tabularx}

% Adjust page width in the middle of the page
\\RequirePackage{changepage}

% Adjust bullet size
\\RequirePackage{scalerel}

% Remove page numbers
\\pagestyle{empty}

% Define navy-blue color for later use. Color code is taken from Canva
\\definecolor{navyblue}{RGB}{0, 83, 137}
\\definecolor{links}{RGB}{3, 43, 198}

% Define new resizable bullet with default 0.7 size for later use
\\newcommand{\\vbullet}[1][.7]{\\mathbin{\\ThisStyle{\\vcenter{\\hbox{%
  \\scalebox{#1}{$\\SavedStyle\\bullet$}}}}}%
}

% Setup Hyperlink style
\\hypersetup{
    colorlinks=true,
    urlcolor=links
}

% Define social accounts and contact information formats
\\newcommand{\\linkedin}[1]{%
    \\href{https://linkedin.com/in#1}{\\textcolor{black}{\\faLinkedinIn}\\hspace{0.5em}#1}%
}
\\newcommand{\\email}[1]{%
    \\href{mailto:#1}{\\textcolor{black}{\\faEnvelope[regular]}\\hspace{0.5em}#1}%
}
\\newcommand{\\github}[1]{%
    \\href{https://github.com/#1}{\\textcolor{black}{\\faGithub}\\hspace{0.5em}#1}%
}
\\newcommand{\\geeksforgeeks}[1]{%
    \\href{https://www.geeksforgeeks.org/user/rahul_prasad}{\\textcolor{black}{\\faCode}\\hspace{0.5em}#1}%
}
\\newcommand{\\leetcode}[1]{%
    \\href{https://leetcode.com/u/Rahul__78/}{\\textcolor{black}{\\faCode}\\hspace{0.5em}#1}%
}
\\newcommand{\\phone}[1]{%
    \\textcolor{black}{\\faPhone*}\\hspace{0.5em}#1%
}
\\newcommand{\\website}[1]{%
    \\href{https://#1}{\\textcolor{black}{\\faGlobeAmericas}\\hspace{0.5em}#1}%
}

% Define commands for fullname and job title
\\def \\fullname#1{\\def\\@name{#1}}
\\def \\@name {}
\\def \\jobtitle#1{\\def\\@title{#1}}
\\def \\@title {}

% Convenience commands
\\newcommand{\\italicitem}[1]{\\item{\\textit{#1}}}
\\newcommand{\\bolditem}[1]{\\item{\\textbf{#1}}}
\\newcommand{\\entry}[2]{#1 & #2 \\tabularnewline}

% Define the resume header
\\newcommand{\\resumeheader}[6]{
    \\begin{tabularx}{\\textwidth}{@{} >{\\hspace{-1em}} r X @{}}{
        \\begin{tabular}[c]{l}
            \\fontsize{28}{35}\\selectfont{\\color{navyblue}{\\textbf{\\@name}}}
            \\ifx\\empty\\@title\\empty\\else
                \\\\ \\textit{\\small\\@title}
            \\fi
       \\end{tabular}
    } & {
        \\begin{tabular}[c]{l@{\\hspace{1em}}l}
            \\entry{\\small#4}{\\small#1}
            \\entry{\\small#5}{\\small#2}
            \\entry{\\small#6}{\\small#3}
        \\end{tabular}
    }
    \\end{tabularx}
}

% Renew section command for resume section
\\renewenvironment{section}[1]{
    \\phantomsection
    \\vspace{- 0.1em}
    \\addcontentsline{toc}{section}{#1}
    {\\color{navyblue}{\\textbf{\\textit{#1}}}}
    \\vspace{- 0.3em}
    \\medskip
    {\\color{navyblue}\\hrule}
    \\begin{list}{}{
        \\setlength{\\leftmargin}{1.5em}
    }
    \\item[]
}{
    \\end{list}
}

% Renew subsection command for resume subsections
\\renewenvironment{subsection}[4]{
    \\phantomsection
    \\addcontentsline{toc}{subsection}{#1}
    \\textbf{#1} \\hfill {#3} \\newline
    \\textit{#2} \\hfill \\textit{#4}
    \\smallskip
    \\begin{list}{$\\vbullet$}{
        \\leftmargin=0.9em
    }
    \\itemsep -0.5em \\vspace{-0.5em}
}{
    \\end{list}
    \\vspace{0.5em}
}

% Define command for resume subsections with no bullets
\\newenvironment{subsectionnobullet}[4]{
    \\phantomsection
    \\addcontentsline{toc}{subsection}{#1}
    \\textbf{#1} \\hfill {#3} \\newline
    \\textit{#2} \\hfill \\textit{#4}
    \\vspace{0.7em}
    \\begin{list}{}{
        \\leftmargin=0em \\itemindent=0em \\labelwidth=0em \\labelsep=0em
    }
    \\item[]
    \\itemsep -0.7em \\vspace{-0.7em}
}{
    \\end{list}
    \\vspace{0em}
}

% Define new sectiontable command, which makes a section with a table
\\newcommand{\\sectiontable}[2]{
    \\begin{section}{#1}
        \\begin{adjustwidth}{0.0in}{0.1in}
            \\begin{tabularx}{\\linewidth}{@{} >{\\bfseries}l @{\\hspace{5ex}} X @{}}
                #2
            \\end{tabularx}
        \\end{adjustwidth}
    \\end{section}
}
`;

module.exports = {
  DEFAULT_MASTER_LATEX,
  DEFAULT_CLS_CONTENT,
  DEFAULT_PROJECT_SEEDS,
};
