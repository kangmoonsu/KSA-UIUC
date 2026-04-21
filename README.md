# 🎓 UIUC KSA Community Renewal (IllinoisKSA)

A modern, real-time web application built to revitalize the Korean Student Association community at the University of Illinois Urbana-Champaign (UIUC).

## 🚀 Project Overview

The IllinoisKSA Renewal project is designed to modernize community interactions and replace traditional forum commenting systems with **real-time chat sessions**. Featuring a fully asynchronous, type-safe architecture, it provides an outstanding and highly interactive user experience. The system is engineered to cleanly separate domain responsibilities while providing instantaneous, reliable data synchronization from end-to-end.

## 🛠 Tech Stack

### Frontend
*   **TypeScript & React (Vite):** Ensures strict end-to-end type safety, fewer runtime errors, and extremely fast development server setups.
*   **React Query & Axios:** Handles all asynchronous state management and server-side cache synchronization, eliminating manual loading/error states.
*   **Tailwind CSS & Shadcn UI:** Provides modern, responsive aesthetics and highly accessible UI components with zero-runtime CSS.

### Backend
*   **Java 17 & Spring Boot 3.x:** A robust, performant, and scalable enterprise-grade backend framework.
*   **Spring Data JPA & Querydsl:** Guarantees type-safe database query generation while providing a powerful paradigm for complex persistence logic.
*   **WebSocket (STOMP):** Powers the core capability of the application: a real-time, bi-directional communication layer.

### Infrastructure & Authentication
*   **Database - PostgreSQL:** Reliable relational database managing users, complex post relations, multi-item data, and extensive chat histories.
*   **In-Memory Store/Message Broker - Redis:** Operates as a Pub/Sub message broker for distributing highly concurrent STOMP messages locally and acts as a caching layer for recently active chat rooms.
*   **Authentication - Clerk:** Integrates seamless Google OAuth 2.0 with metadata-driven Role-Based Access Control (RBAC) securely tying frontend sessions to backend validation.

---

## ✨ Key Features & Technical Highlights

### 📡 Real-time Notification & Chat-Centric Architecture
*   **Event-Driven UI:** Eliminating standard comments, all inquiries feature a "Chat" action that dynamically generates encrypted 1:1 chat rooms linking directly to the post and user context.
*   **Redis Pub/Sub & STOMP Integration:** Real-time push notifications are dispatched efficiently leveraging Redis Pub/Sub, keeping the user instantly updated via Toast notifications and unread badge alerts anywhere in the application.
*   **Synchronized Read Receipts:** Complex real-time event mapping ensures that message "seen" updates propagate instantly across active chat interfaces.

### 🛡️ Security & Strict Data Integrity
*   **Authorization System:** Admin routing, component-level restrictions, and backend security configurations restrict user actions, offering a dedicated Admin Dashboard layer to instantly search, monitor, and temporarily/permanently ban bad actors.
*   **Robust Cascade Policies:** Enforcing a rigorous hard-delete policy. Deleting a user or post cascades securely through the RDBMS—destroying associated multiple item details, images, notification records, and bound chat sessions sequentially to eliminate dead data.

### 📂 Domain-Specific Content Modules
*   **Flea Market (Multi-Item Design):** Custom database definitions allow users to attach *multiple distinct items* inside a single advertisement, with each individual item possessing disparate pricing and descriptions.
*   **Specialized Sub-Domains (Housing, Cars, Jobs):** Highly formalized validation schemes per endpoint (e.g. tracking automobile mileage uniquely, restricting Jobs from image schemas, enforcing unique UI logic based on dynamic endpoints).
*   **Content Isolation:** Deep integration with the **Quill Rich Text Editor**, architected to prevent global tailwind variables from overriding raw HTML intent inside post viewers.

### ⚙️ Profile-driven Environment Management
*   Incorporated seamless workflow mappings to rapidly switch between environments (`local` vs. `service`) utilizing Spring active profiles and dynamically evaluated Vite environment variables (`.env`).
