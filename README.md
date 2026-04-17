# 🛒 Storefront Generation Platform

A full-stack, AI-powered multi-tenant e-commerce platform that enables **admins**, **merchants**, and **customers** to collaborate across a dynamic storefront ecosystem. Product catalogs are automatically populated via an autonomous LangChain-based web ingestion pipeline, and AI-generated images fill in any gaps.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [User Roles & Flows](#-user-roles--flows)
- [Data Ingestion Pipeline](#-data-ingestion-pipeline)
- [API Reference](#-api-reference)
- [Environment Setup](#-environment-setup)
- [Getting Started](#-getting-started)
- [Key Features](#-key-features)

---

## 🌟 Overview

The **Storefront Generation Platform** is a three-tier multi-role application:

| Role | Capability |
|------|-----------|
| **Admin** | Manage users, assign roles, create product categories, oversee all stores |
| **Merchant** | Create & configure a storefront, select products, set custom prices & stock |
| **Customer (User)** | Browse active stores, add products to cart, checkout, track orders |

When an admin creates a new product category, an **autonomous AI agent** automatically searches the web for real-world product data, scrapes sources, extracts structured product entries using a local **Llama 3** model via **Ollama**, deduplicates them, and stores them in MongoDB. Missing product images are generated on-demand using **Stable Diffusion**.

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework (App Router) |
| **React** | 19.2.3 | UI library |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | ^4 | Utility-first styling |
| **@react-oauth/google** | ^0.13.4 | Google OAuth integration |
| **jose** | ^6.2.2 | JWT decoding on client side |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | latest | Async REST API framework |
| **Uvicorn** | latest | ASGI server |
| **Motor** | latest | Async MongoDB driver |
| **MongoDB Atlas** | Cloud | Primary database (via `pymongo[srv]`) |
| **LangChain** | latest | Web retrieval agent orchestration |
| **langchain-community** | latest | Community integrations (SERP, loaders) |
| **langchain-ollama** | latest | Local LLM integration |
| **Ollama (Llama 3)** | local | Structured product extraction from scraped content |
| **SerpAPI** | latest | Google Search results for product discovery |
| **Playwright** | latest | Dynamic web scraping |
| **BeautifulSoup4** | latest | HTML parsing |
| **Diffusers + Torch** | latest | Stable Diffusion image generation |
| **google-auth** | latest | Google OAuth token verification |
| **python-jose** | latest | JWT creation and validation |
| **Pydantic** | latest | Data validation and schema enforcement |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                         │
│   ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐    │
│   │  Admin   │  │  Merchant  │  │   User   │  │   Store    │    │
│   │Dashboard │  │  Dashboard │  │Dashboard │  │  Storefront│    │
│   └────┬─────┘  └─────┬──────┘  └────┬─────┘  └──────┬─────┘    │
│        └──────────────┴──────────────┴───────────────┘          │
│                        API Proxy (/api/*)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTP (localhost:8000)
┌────────────────────────────▼────────────────────────────────────┐
│                     FastAPI Backend                             │
│  ┌──────┐ ┌──────┐ ┌───────┐ ┌──────┐ ┌──────┐ ┌───────────┐    │
│  │ Auth │ │Admin │ │ Store │ │ Cart │ │Order │ │ Category  │    │
│  │Route │ │Route │ │ Route │ │Route │ │Route │ │  Route    │    │
│  └──────┘ └──────┘ └───────┘ └──────┘ └──────┘ └─────┬─────┘    │
│                                                      │          │
│  ┌───────────────────────────────────────────────────▼────────┐ │
│  │              Data Ingestion Pipeline (Async)               │ │
│  │  SerpAPI → Playwright Scrape → Llama3/Ollama Extract →     │ │
│  │  Clean → Deduplicate → MongoDB → Stable Diffusion (img)    │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                  ┌──────────▼──────────┐
                  │    MongoDB Atlas    │
                  │  users, stores,     │
                  │  products, orders,  │
                  │  categories, carts  │
                  └─────────────────────┘
```

---

## 📁 Project Structure

```
storefront-generation/
├── backend/                        # Python FastAPI backend
│   ├── agents/
│   │   ├── ingestion_agent.py      # Pipeline orchestrator (4-step flow)
│   │   ├── langchain_web_agent.py  # LangChain LCEL search + scrape + extract
│   │   ├── cleaner.py              # Product normalization & filtering
│   │   └── deduplicator.py        # Hash-based deduplication & MongoDB upsert
│   ├── db/
│   │   └── mongo.py               # Motor async MongoDB client
│   ├── models/
│   │   ├── store_model.py          # Store document schema
│   │   ├── user_model.py           # User document schema
│   │   ├── order_model.py         # Order document schema
│   │   └── cart_model.py          # Cart document schema
│   ├── routes/
│   │   ├── admin.py               # Admin endpoints (users, roles, stores)
│   │   ├── auth.py                # Google OAuth + JWT endpoints
│   │   ├── store.py               # Store CRUD + product selection
│   │   ├── product.py             # Product read endpoints
│   │   ├── category.py            # Category management + ingestion trigger
│   │   ├── cart.py                # Cart add/remove/get
│   │   └── order.py               # Order placement & history
│   ├── services/
│   │   ├── store_service.py       # Store MongoDB operations
│   │   ├── product_service.py     # Product MongoDB operations
│   │   ├── category_service.py    # Category ops + ingestion trigger
│   │   ├── order_service.py       # Order creation & retrieval
│   │   ├── cart_service.py        # Cart operations
│   │   ├── user_service.py        # User lookup & role management
│   │   ├── google_auth.py         # Google token verification
│   │   ├── jwt_service.py         # JWT sign/verify
│   │   ├── ollama_service.py      # Ollama LLM client
│   │   └── image_generation_service.py  # Stable Diffusion async wrapper
│   ├── utils/                     # Shared utilities
│   ├── images/                    # Locally served generated images
│   ├── main.py                    # FastAPI app entrypoint & router registration
│   ├── requirements.txt           # Python dependencies
│   └── .env                       # Backend environment variables
│
├── src/                           # Next.js frontend (App Router)
│   ├── app/
│   │   ├── page.tsx               # Landing page with store discovery
│   │   ├── layout.tsx             # Root layout with auth context
│   │   ├── globals.css            # Global styles
│   │   ├── admin/dashboard/       # Admin management panel
│   │   ├── merchant/
│   │   │   ├── dashboard/         # Merchant product & store management
│   │   │   └── products/          # Merchant product selection page
│   │   ├── user/
│   │   │   ├── dashboard/         # User order history
│   │   │   └── signin/            # Google OAuth signin page
│   │   ├── store/[id]/            # Customer-facing storefront (dynamic route)
│   │   ├── unauthorized/          # Access-denied page
│   │   └── api/                   # Next.js API proxy routes → FastAPI
│   ├── components/
│   │   ├── admin/                 # Admin modals (UserRole, StoreDetails, CategoryProducts)
│   │   ├── auth/                  # Auth guard components
│   │   ├── layout/                # Shared layout (Navbar, etc.)
│   │   ├── providers/             # React context providers
│   │   ├── ui/                    # Reusable UI components
│   │   └── user/OrderModal/       # Order detail modal component
│   ├── context/                   # React context (Auth, Cart)
│   ├── services/                  # Frontend API service layer
│   ├── assets/                    # Static images and assets
│   └── proxy.ts                   # API proxy configuration
│
├── package.json
├── next.config.ts
├── tsconfig.json
└── .env.local                     # Frontend environment variables
```

---

## 👥 User Roles & Flows

### 🔐 Authentication
- Users sign in via **Google OAuth 2.0**
- Backend verifies the Google ID token and issues a **JWT**
- JWT is stored in cookies and validated on every protected route
- Role is embedded in the JWT payload: `admin`, `merchant`, or `user`

---

### 🛡 Admin Flow
1. Log in with a Google account that has been granted the `admin` role
2. Access `/admin/dashboard` to:
   - **Search and manage users** by email
   - **Assign roles** (user → merchant, merchant → user)
   - **View all stores** (name, status, products)
   - **Create product categories** — each triggers the AI ingestion pipeline
   - **Delete categories**
   - **Monitor ingestion status** (generating → ready / error)

---

### 🏪 Merchant Flow
1. Log in with a Google account that has been granted the `merchant` role
2. Access `/merchant/dashboard` to:
   - Create a store (name, description, category)
   - View store status (draft / active)
   - Select products from the master catalog under their chosen category
   - **Set custom price and stock** per product for their store
   - Publish the store (makes it publicly visible)
3. Access `/merchant/products` to browse and select product catalog items

---

### 🛍 Customer (User) Flow
1. Browse the **landing page** (`/`) to discover active stores
2. Click on a store to visit `/store/[id]`
3. View products with custom merchant-set prices and stock levels
4. **Add to Cart** using inline quantity controls
5. Proceed through the **checkout** flow
6. Place an order (authenticated users only — redirected to `/user/signin` if not logged in)
7. View order history with details at `/user/dashboard`

---

## 🤖 Data Ingestion Pipeline

When an admin creates a new category, the following 4-step pipeline runs **asynchronously in the background**:

```
┌─────────────────────────────────────────────────────────────┐
│           Autonomous LangChain Ingestion Pipeline           │
│                                                             │
│  STEP 1: LangChain Web Retrieval Agent                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  SerpAPI → Google Search results for category       │    │
│  │  Playwright → Scrape top URLs (dynamic JS pages)    │    │
│  │  Llama 3 (Ollama) → RAG extraction → Pydantic       │    │
│  │  validated product list                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  STEP 2: Clean & Normalize                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • Strip size/quantity variants from names          │    │
│  │  • Validate and normalize prices                    │    │
│  │  • Filter non-consumable/irrelevant items           │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  STEP 3: Deduplicate & Store                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • SHA-256 hash of (product name + category)        │    │
│  │  • Upsert into MongoDB "products" collection        │    │
│  │  • Track newly added vs. duplicates skipped         │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  STEP 4: Image Fallback                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • If image_url is missing → Stable Diffusion       │    │
│  │  • Check DB first (avoid regenerating)              │    │
│  │  • Save image locally under /images/                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Category status: generating → ready (or error)             │
└─────────────────────────────────────────────────────────────┘
```

**Result**: Each category has a set of real-world, clean, deduplicated product entries, ready for merchants to add to their stores.

---

## 📡 API Reference

### Authentication (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/google` | Exchange Google ID token for app JWT |
| `GET` | `/auth/me` | Get current authenticated user profile |

### Admin (`/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/users` | List all users (supports `?email=` filter) |
| `GET` | `/admin/users/{email}` | Get a specific user by email |
| `POST` | `/admin/update-role` | Assign a role to a user |
| `GET` | `/admin/stores` | List all stores (supports `?name=` filter) |
| `GET` | `/admin/store/{user_id}` | Get a store by its owner's user ID |

### Stores (`/stores`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/stores` | Create or retrieve store for logged-in merchant |
| `GET` | `/stores/me` | Get the current merchant's store |
| `GET` | `/stores/active` | List all published (active) stores |
| `GET` | `/stores/{store_id}` | Get a specific store by ID |
| `POST` | `/stores/publish` | Publish your store |
| `POST` | `/stores/products` | Select products to add to store |
| `DELETE` | `/stores/products/{product_id}` | Remove a product from your store |
| `PATCH` | `/stores/products/{product_id}/price` | Update product price in your store |
| `PATCH` | `/stores/products/{product_id}/stock` | Update product stock in your store |

### Products (`/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | List products by category |
| `GET` | `/products/{product_id}` | Get a single product by ID |

### Categories (`/categories`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/categories` | List all categories |
| `POST` | `/categories` | Create a category (triggers ingestion pipeline) |
| `DELETE` | `/categories/{category_id}` | Delete a category |

### Cart (`/cart`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cart` | Get current user's cart |
| `POST` | `/cart` | Add item to cart |
| `DELETE` | `/cart/{product_id}` | Remove item from cart |

### Orders (`/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders` | Place a new order |
| `GET` | `/orders/me` | Get current user's order history |

---

## ⚙️ Environment Setup

### Backend (`backend/.env`)
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
Client_ID=<google-oauth-client-id>
Client_Secret=<google-oauth-client-secret>
JWT_SECRET=<your-secret-key>
BASE_URL=http://localhost:8000
OLLAMA_URL=http://localhost:11434/api/generate
SERPAPI_API_KEY=<your-serpapi-key>
USER_AGENT=storefront-generation-bot/1.0
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-oauth-client-id>
```

### Prerequisites
- **Node.js** >= 18
- **Python** >= 3.10
- **Ollama** running locally with `llama3` model pulled (`ollama pull llama3`)
- **MongoDB Atlas** cluster (or local MongoDB instance)
- **SerpAPI** account for web search
- (Optional) **CUDA GPU** for Stable Diffusion image generation

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone git@github.com:Hrishikesh1408/storefront-generation.git
cd storefront-generation
```

### 2. Start the Backend
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers (for web scraping)
playwright install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start the server
uvicorn main:app --reload
```
Backend runs at: `http://localhost:8000`

### 3. Start the Frontend
```bash
# In the project root
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

### 4. Start Ollama (for AI ingestion)
```bash
ollama serve
ollama pull llama3
```

---

## ✨ Key Features

| Feature | Details |
|---------|---------|
| **Multi-role Auth** | Google OAuth 2.0 with JWT-based session management |
| **AI Product Ingestion** | LangChain + SerpAPI + Playwright + Llama 3 pipeline |
| **Real-time Deduplication** | SHA-256 hash-based upsert prevents duplicate products |
| **AI Image Generation** | Stable Diffusion fallback for missing product images |
| **Custom Merchant Pricing** | Each merchant sets independent price & stock per product |
| **Cart & Checkout** | Persistent cart with inline quantity controls and full checkout flow |
| **Order History** | Users can view detailed past orders with store navigation |
| **Dynamic Storefronts** | Each store at `/store/[id]` is independently configured |
| **Admin Control Panel** | Full user management, role assignment, and store oversight |
| **Async Pipeline** | Ingestion runs in background — category is immediately usable |

---

## 📦 MongoDB Collections

| Collection | Description |
|-----------|-------------|
| `users` | User profiles, roles, OAuth data |
| `stores` | Store configurations, product selections, prices, stock |
| `products` | Master product catalog (populated by ingestion agent) |
| `categories` | Product category definitions with ingestion status |
| `orders` | Customer order records |
| `carts` | Per-user cart state |

---

> Built with ❤️ using Next.js, FastAPI, LangChain, MongoDB, and Ollama.
