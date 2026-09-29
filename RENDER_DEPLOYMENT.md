# 🚀 Quick Deployment Guide: Render (Backend) & Vercel (Frontend)

This guide walks you through deploying your **Node.js SAP API Gateway** on Render (free) and your **React Frontend** on Vercel (free).

---

## 🅰️ Part 1: Deploy Backend on Render (2 minutes)

1. Push your latest code to your GitHub repo:
   ```bash
   git add .
   git commit -m "feat: added Node.js SAP API Gateway BFF backend"
   git push origin main
   ```

2. Open [render.com](https://render.com) and log in with GitHub.
3. Click **"New +"** ➔ select **"Web Service"**.
4. Choose your repository: `SAP-Employee-Management`.
5. Fill in these exact settings:
   * **Name:** `sap-employee-backend` (or any name you like)
   * **Region:** Oregon (US West) or Frankfurt
   * **Root Directory:** `backend` ⚠️ *(Important: type `backend`)*
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Instance Type:** `Free`

6. Under **Environment Variables**, add:
   * `SAP_BASE_URL` = `https://merida.cob.csuchico.edu:8038`
   * `SAP_ODATA_PATH` = `/sap/opu/odata/sap/ZEMPLOYEE_SRV_SRV/ZEMPLY_MNG_DBTABSet`
   * `SAP_USER` = `GLBI-100`
   * `SAP_PASSWORD` = `Bt@123`

7. Click **"Deploy Web Service"**.
8. Once deployed, Render will give you a public URL (e.g. `https://sap-employee-backend.onrender.com`).
   * Test it by opening: `https://sap-employee-backend.onrender.com/api/employees` in your browser. You will see your real live SAP records!

---

## 🅱️ Part 2: Deploy Frontend on Vercel (1 minute)

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New..."** ➔ **"Project"**.
3. Import `SAP-Employee-Management`.
4. In the Project Configuration:
   * **Framework Preset:** `Vite`
   * **Root Directory:** `frontend`
5. Under **Environment Variables**, add:
   * **Key:** `VITE_BACKEND_URL`
   * **Value:** Your Render backend URL (e.g. `https://sap-employee-backend.onrender.com`)
6. Click **"Deploy"**!

---

## 🎯 What to Speak in Interviews

> *"My architecture uses the **Backend-For-Frontend (BFF)** pattern:*
> * 1. **React 18 Frontend:** Hosted on Vercel.
> * 2. **Node.js Express API Gateway:** Hosted on Render. It handles authentication securely and prevents browser CORS issues.
> * 3. **SAP NetWeaver Gateway:** Holds our custom ABAP table `ZEMPLY_MNG_DBTAB` and exposes the OData Service `ZEMPLOYEE_SRV_SRV`.
> * 4. When users open the app, React calls our Render API Gateway (`/api/employees`), which connects to the SAP NetWeaver server and streams the live ABAP data back to the UI."*
