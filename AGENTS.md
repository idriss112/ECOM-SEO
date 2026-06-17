# AGENTS.md

## Purpose

This file is the working guide for humans and coding agents touching this repo.

Goals:
- explain the project quickly
- capture the local development assumptions that already matter
- reduce accidental breakage when editing across `frontend`, `admin`, and `backend`
- list the places where we should pause and ask before making larger changes

This should be updated whenever the architecture, local setup, or editing rules change.

## Project Summary

This is a MERN-style e-commerce app split into 3 apps:

- `frontend`: customer storefront
- `admin`: admin dashboard for product and order management
- `backend`: Express API with MongoDB

Current product flow:
- frontend reads product data from the backend
- admin creates products through the backend
- backend stores products in MongoDB
- image upload currently depends on Cloudinary

## Current Local Dev Assumptions

These are the assumptions currently used in this repo:

- Node: use `nvm use 24`
- Backend port: `4000`
- Frontend port: `5173`
- Admin port: `5174`
- MongoDB: local MongoDB is expected for local dev
- MongoDB service name on this machine: `mongodb-community`
- Database name: the backend appends `/e-commerce` to `MONGODB_URI`

Important:
- `MONGODB_URI` should be the base URI only, for example `mongodb://127.0.0.1:27017`
- do not include `/e-commerce` inside the env var because [backend/config/mongodb.js](/Users/driss/Desktop/Ecom-Seo/backend/config/mongodb.js:7) already adds it

## Repo Map

- [frontend/src/App.jsx](/Users/driss/Desktop/Ecom-Seo/frontend/src/App.jsx:1): storefront routes
- [frontend/src/context/ShopContext.jsx](/Users/driss/Desktop/Ecom-Seo/frontend/src/context/ShopContext.jsx:1): frontend shared state and API calls
- [admin/src/App.jsx](/Users/driss/Desktop/Ecom-Seo/admin/src/App.jsx:1): admin login state, routes, backend base URL
- [admin/src/pages/Add.jsx](/Users/driss/Desktop/Ecom-Seo/admin/src/pages/Add.jsx:1): admin product creation form
- [backend/server.js](/Users/driss/Desktop/Ecom-Seo/backend/server.js:1): API boot and route mounting
- [backend/models/productModel.js](/Users/driss/Desktop/Ecom-Seo/backend/models/productModel.js:1): product schema
- [backend/controllers/productController.js](/Users/driss/Desktop/Ecom-Seo/backend/controllers/productController.js:1): product CRUD logic
- [backend/controllers/orderController.js](/Users/driss/Desktop/Ecom-Seo/backend/controllers/orderController.js:1): order creation and admin order updates

## Runbook

### 1. Start MongoDB locally

MongoDB is expected to run locally through Homebrew on this machine.

Start MongoDB:

```bash
brew services start mongodb-community
```

Check MongoDB status:

```bash
brew services list | rg mongodb-community
```

Open the local Mongo shell:

```bash
mongosh mongodb://127.0.0.1:27017/e-commerce
```

Quick DB connection check:

```bash
mongosh --quiet mongodb://127.0.0.1:27017/e-commerce --eval "db.products.countDocuments()"
```

If MongoDB is already running, the status should show `started`.

### 2. Start the backend

Backend:

```bash
cd /Users/driss/Desktop/Ecom-Seo/backend
source ~/.nvm/nvm.sh
nvm use 24
npm start
```

Expected backend startup output:

- `Server started on port: 4000`
- `Connected to MongoDB`

### 3. Start the storefront frontend

Frontend:

```bash
cd /Users/driss/Desktop/Ecom-Seo/frontend
source ~/.nvm/nvm.sh
nvm use 24
npm run dev
```

Expected frontend URL:

- `http://localhost:5173`

### 4. Start the admin app

Admin:

```bash
cd /Users/driss/Desktop/Ecom-Seo/admin
source ~/.nvm/nvm.sh
nvm use 24
npm run dev
```

Expected admin URL:

- `http://localhost:5174`

### 5. Full local startup order

Recommended order when starting from scratch:

1. start MongoDB
2. start backend
3. start frontend
4. start admin

### 6. Seed demo products

This repo now includes a local seed script for demo store products.

Run it with:

```bash
cd /Users/driss/Desktop/Ecom-Seo/backend
source ~/.nvm/nvm.sh
nvm use 24
npm run seed:products
```

What it does:

- inserts or updates demo products in local MongoDB
- uses local images from `frontend/public/products`
- avoids needing Cloudinary for the seeded catalog

## Env Files

Expected env files:

- `backend/.env`
- `frontend/.env`
- `admin/.env`

Expected variables:

Backend:
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLOUDINARY_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_SECRET_KEY`

Frontend:
- `VITE_BACKEND_URL`

Admin:
- `VITE_BACKEND_URL`

Important:
- keep `VITE_BACKEND_URL` as the actual backend origin, for example `http://localhost:4000/`
- frontend and admin code now normalize trailing slashes before building request URLs
- never commit real secrets intentionally

## API Shape

Mounted base routes in [backend/server.js](/Users/driss/Desktop/Ecom-Seo/backend/server.js:21):

- `/api/user`
- `/api/product`
- `/api/cart`
- `/api/order`

Notable route expectations:

- user auth:
  - `POST /api/user/register`
  - `POST /api/user/login`
  - `POST /api/user/admin`
- products:
  - `GET /api/product/list`
  - `POST /api/product/add`
  - `POST /api/product/remove`
  - `POST /api/product/single`
- cart:
  - `POST /api/cart/get`
  - `POST /api/cart/add`
  - `POST /api/cart/update`
- orders:
  - `POST /api/order/place`
  - `POST /api/order/list`
  - `POST /api/order/status`
  - `POST /api/order/userOrders`

## Product Data Expectations

Products are expected to have all of these fields:

- `name`
- `price`
- `description`
- `images`
- `category`
- `subCategory`
- `sizes`
- `bestseller`
- `date`

See [backend/models/productModel.js](/Users/driss/Desktop/Ecom-Seo/backend/models/productModel.js:1).

Because of this, direct manual MongoDB inserts are easy to get wrong. For local data setup:

- prefer the admin UI if Cloudinary is configured
- otherwise prefer a seed script over hand-editing Mongo documents

## Known Limitations

- Stripe and Razorpay order handlers are stubs in [backend/controllers/orderController.js](/Users/driss/Desktop/Ecom-Seo/backend/controllers/orderController.js:25)
- local checkout currently works through COD flow only
- admin product creation depends on Cloudinary-backed image upload
- seeded demo products do not need Cloudinary because they use local image paths
- README startup instructions are partially outdated:
  - backend dev workflow is `npm start` or `npm run server`
  - admin uses `npm run dev`, not `npm run start`

## Current Editing Guardrails

When editing this repo:

- keep changes small and targeted
- assume all backend route changes may affect both `frontend` and `admin`
- do not rename route paths without checking every caller
- do not change the product schema casually because storefront, admin, and DB all depend on it
- do not change auth token behavior casually because user auth and admin auth both depend on it
- do not change env variable names unless all 3 apps are updated together
- avoid reformatting large unrelated files while fixing bugs
- preserve current uncommitted work unless the user explicitly asks to discard it

## Things That Commonly Break 

- mismatched API paths between frontend/admin and backend
- extra or missing slashes around `VITE_BACKEND_URL`
- forgetting that `MONGODB_URI` must not include `/e-commerce`
- running the backend on a Node version newer than the current local-compatible version
- trying to add products from admin without Cloudinary configured
- changing cart or order response shapes without updating frontend expectations

## Before Editing These Areas, Pause

Ask the user first before:

- resetting or deleting database data
- changing the product schema
- changing auth rules or token format
- implementing or replacing payment flows
- changing Cloudinary strategy
- renaming routes used by multiple apps
- upgrading core dependencies if a bug can be solved without that
- replacing the local MongoDB setup with Atlas or another DB approach

## Verification Checklist

After backend or API changes:

- start backend on port `4000`
- load storefront home page
- verify product list request works
- verify admin login still works
- verify admin list page still loads
- if cart logic changed, test add to cart and cart refresh
- if order logic changed, test COD order creation and admin order listing

After env or startup changes:

- confirm MongoDB service is running
- confirm backend starts and connects to MongoDB
- confirm frontend loads on `5173`
- confirm admin loads on `5174`

## Questions To Ask Driss When Requirements Are Unclear

Use short, concrete questions when work touches unclear product decisions. Good examples:

- Do you want sample seed data or real product entry through admin?
- Should we optimize for local testing speed or production-like behavior?
- Is Cloudinary something you want configured now, or should we avoid image-upload dependent work?
- Do you want us to preserve current UI behavior, or is it okay to refactor structure while fixing bugs?
- For auth, should we keep the current simple admin login flow or improve it?

## Open Follow-Ups

Good next improvements for this repo:

- document Cloudinary setup steps
- add a root-level dev script to run all 3 apps
- add basic smoke tests for critical API routes
- clean up outdated README instructions
