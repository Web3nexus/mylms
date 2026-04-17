# Agile Development Roadmap 2026: The Strategic Expansion

This document outlines the expansion of MyLMS to compete with and exceed enterprise platforms like Moodle and Brightspace. We carry on from **Sprint 21** following the completion of the core Institutional Overhaul.

| Sprint | Focus Area | Key Features | Backend (PHP/Laravel) | Frontend (React/TS) |
| :--- | :--- | :--- | :--- | :--- |
| **21** | **Collaboration** | Discussion Forums, Group Management, Group-based Grading. | Forum/Topic/Post tables, Grouping service. | Forum UI, Discussion nested tree views. |
| **22** | **Interoperability** | SCORM 1.2/2004 Support, LTI 1.3 Consumer. | SCORM package management, LTI 1.3 secure keys. | SCORM player wrapper, LTI tool iframe. |
| **23** | **Behavioral Automation** | "Intelligent Agents" (Automated triggers based on behavior). | Trigger system (Event listeners), Agent logic. | Agent creation wizard, Trigger UI. |
| **24** | **Personalized Paths** | Release Conditions (Lock content based on grades/completion). | Conditional Release Service, visibility logic. | Requirement badges on content items. |
| **25** | **Gamification** | Digital Badges (OpenBadges standard), Leaderboards. | Badge factory service, Award criteria logic. | Badge collection UI, Milestone awards. |
| **26** | **Advanced Pedagogy** | Rubrics, Competency Tracking, Learning Outcomes. | Rubric editor, Competency mapping, Scale logic. | Interactive rubrics for instructors. |
| **27** | **Media & Accessibility** | Video/Audio Note recording, WCAG Compliance audit. | File micro-service, Audio transcoding. | Media recording hook, Accessibility check. |
| **28** | **Enterprise Integrations** | Zoom/Teams/BBB integration, Cloud Storage picker. | OAuth flows for external APIs, Webhook receivers. | Ext. File picker, Meeting link integration. |
| **29** | **Predictive Analytics** | AI-driven Data Hub, Predictive "At-Risk" alerts. | Data Hub aggregation, Predictive ML model. | Heatmaps, Intervention dashboard. |
| **30** | **Mobile Experience** | PWA/Mobile-first UX, Push notifications sync. | Push service, Better offline sync logic. | Mobile layout overhaul, Offline UI indicators. |

## 🛠️ Sprint Deliverable Standards

1.  **Clean Code**: Maintain the modular monolithic structure (`app/Modules`).
2.  **AI-First**: Every module should consider how AI can assist (e.g., auto-moderation for forums in Sprint 21).
3.  **Documentation**: All new API endpoints must be documented in the corresponding module.
4.  **Testing**: Basic unit and feature tests are required for all core business logic changes.
