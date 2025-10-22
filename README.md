# 📸 PicForge AI

**AI-Powered Photo Editor Micro SaaS** built with **Next.js, Framer Motion, Stripe, Prisma, and ImageKit** — enabling creators to transform, enhance, and expand their images with cutting-edge AI tools.

---

## ✨ Overview

**PicForge AI** is a full-featured **AI Photo Editor Micro SaaS** that combines a sleek UI with powerful backend automation.  
It lets users upload photos and apply **AI-powered transformations** such as background removal, generative fill, AI editing via text prompts, smart cropping, and upscaling — all within a polished, responsive interface.

Beyond editing, it includes **complete SaaS functionality**, including authentication, payments, and usage tracking.

---

## 🪄 AI Editing Suite

| Feature                        | Description                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 🧠 **AI Edit (Prompt-based)**  | Modify your image using natural language prompts like _“make the sky blue”_ or _“add cinematic lighting”_. |
| 🪄 **AI Background Removal**   | Instantly remove image backgrounds with a single click.                                                    |
| 🌆 **AI Generative Fill**      | Expand your canvas and let AI fill new areas while keeping context.                                        |
| 🔍 **Smart Crop & Face Focus** | Automatically crop to highlight faces or key objects.                                                      |
| 🪞 **AI Drop Shadow**          | Add realistic drop shadows for product or portrait images.                                                 |
| 📈 **AI Upscale (2x)**         | Increase resolution and clarity using advanced upscaling algorithms.                                       |

---

## 💼 SaaS Functionality

### 🔐 Authentication

- Secure Google OAuth sign-in powered by **NextAuth.js**.

### 💳 Payments

- Fully integrated **Stripe** subscription system.
- “Pro” plan unlocks unlimited editing.
- **Stripe Webhooks** automatically manage subscription state and usage limits.

### ⚙️ Usage Limiting

- Free-tier users receive a fixed number of edits (e.g. 20).
- Usage count is stored and updated in **MongoDB**.

### 🧾 Payment Modals

- Users are prompted to upgrade when they hit their limit.

---

## 🖼️ Image Handling

| Feature                          | Description                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 🚀 **Optimized Uploads**         | Secure, authenticated uploads directly to ImageKit.                                                                                         |
| 🔄 **Real-time Transformations** | Dynamically generate new ImageKit URLs with chained transformation parameters.                                                              |
| ⏱️ **Async Job Polling**         | The frontend polls ImageKit’s `HEAD` endpoint until the AI job is ready, using the `is-intermediate-response` header for progress tracking. |

---

## 🛠️ Tech Stack

| Category                  | Technology                        |
| ------------------------- | --------------------------------- |
| Framework                 | **Next.js 14 (App Router)**       |
| Database                  | **MongoDB**                       |
| ORM                       | **Prisma**                        |
| Authentication            | **NextAuth.js (Google Provider)** |
| Payments                  | **Stripe**                        |
| Image CDN / AI Processing | **ImageKit**                      |
| Styling                   | **Tailwind CSS**                  |
| UI Library                | **shadcn/ui**                     |
| Animation                 | **Framer Motion**                 |
| Icons                     | **Lucide React**                  |

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Ucode-uvais/picforge.git
cd picforge
```

### 2️⃣ Install Dependencies

```bash
npm install
```
