# 📸 PicForge AI

**AI-Powered Photo Editor Micro SaaS** built with **Next.js, Framer Motion, Stripe, Prisma, and ImageKit** — enabling creators to transform, enhance, and expand their images with cutting-edge AI tools.

---

<img width="1919" height="816" alt="image" src="https://github.com/user-attachments/assets/f04812c2-7c6b-4331-a187-ed38c73868b5" />


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

## 💡 Key Highlights

- ✅ Fully functional SaaS — no backend setup required beyond environment config
- ✅ Real-time AI-powered transformations using ImageKit
- ✅ Stripe billing with usage metering
- ✅ Clean UI built with Tailwind + shadcn/ui
- ✅ Smooth animations powered by Framer Motion
- ✅ Modular and easily extensible architecture

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

| Category                  | Technology                                                     |
| ------------------------- | -------------------------------------------------------------- |
| Framework                 | [**Next.js 14 (App Router)**](https://nextjs.org/)             |
| Database                  | [**MongoDB**](https://www.mongodb.com/)                        |
| ORM                       | [**Prisma**](https://www.prisma.io/)                           |
| Authentication            | [**NextAuth.js (Google Provider)**](https://next-auth.js.org/) |
| Payments                  | [**Stripe**](https://stripe.com/)                              |
| Image CDN / AI Processing | [**ImageKit.io**](https://imagekit.io/)                        |
| Styling                   | [**Tailwind CSS**](https://tailwindcss.com/)                   |
| UI Library                | [**shadcn/ui**](https://ui.shadcn.com/)                        |
| Animation                 | [**Framer Motion**](https://www.framer.com/motion/)            |
| Icons                     | [**Lucide React**](https://lucide.dev/)                        |

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

## 3️⃣ Set Up the Database

- Create a MongoDB Atlas cluster.
- Obtain your connection URI.

## 4️⃣ Configure Environment Variables

Create a .env file in your project root:

```bash
# Prisma / MongoDB
DATABASE_URL="your_mongodb_connection_string"

# NextAuth
NEXTAUTH_SECRET="a_random_secret_string_for_nextauth"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."

# ImageKit
IMAGEKIT_PUBLIC_KEY="public_..."
IMAGEKIT_PRIVATE_KEY="private_..."

```

Where to find them:

- _DATABASE_URL_: MongoDB Atlas

- _GOOGLE\_..._: Google Cloud Console

- _STRIPE\_..._: Stripe Dashboard

- _IMAGEKIT\_..._: ImageKit Dashboard -> Developer Options

## 5️⃣ Push Database Schema

```bash
npx prisma db push
```

## 6️⃣ Run the Development Server

```bash
npm run dev
```

**Open http://localhost:3000 to view the app.**

## 7️⃣ Configure Stripe Webhook

For subscription events to work, set up Stripe’s webhook listener by entering the below command in your terminal:

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

Copy the generated whsec\_... secret and add it to .env under:

```bash
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 🧾 License

This project is licensed under the MIT License.
Feel free to fork, modify, and use it in your own projects — attribution is appreciated!

## 💬 Acknowledgements

- Next.js
- Stripe
- ImageKit.io
- NextAuth.js
- Prisma
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React
