# 🎯 Quick Interview Answers (README2)

### 1. "Explain the Architecture — How does Frontend connect to SAP?"
> *"My project follows a standard **3-tier enterprise architecture**:*
> 1. **Database (SE11):** Transparent table `ZEMPLY_MNG_DBTAB` in SAP stores the employee data.
> 2. **OData Service (SEGW):** In transaction SEGW, I exposed this table as an OData REST API (`ZEMPLOYEE_SRV_SRV`) returning JSON.
> 3. **API Gateway (Node.js on Render):** Acts as the middleman between React and SAP using basic auth & CSRF tokens.
> 4. **Frontend (React on Vercel):** Calls the Node.js gateway to fetch live records and process leave approvals."

**Flow:**
`[ React (Vercel) ] ──► [ Node.js Gateway (Render) ] ──► [ SAP OData (SEGW) ] ──► [ Table (SE11) ]`

---

### 2. "Why not connect React directly to SAP?"
> 1. **Security:** Calling SAP directly from the browser exposes SAP credentials in the network tab.
> 2. **CORS:** SAP Gateway blocks direct cross-origin browser requests by default. The Node.js server fixes both.

---

### 3. "Is the data really from the backend or mock?"
> "It is from a **live Node.js backend on Render** connected to a real **SAP NetWeaver Gateway** (`ZEMPLOYEE_SRV_SRV`).
> Because SAP sandbox servers are read-only, our Node.js server caches and saves the data so approvals and edits never fail during the demo."

---

### 4. "Why does it load so fast?"
> "We use the **BFF (Backend-For-Frontend) pattern**. The browser talks to our fast Node.js server instead of waiting 5 seconds for SAP ABAP, making the website instant."

---

### 5. "Why is there a 2-second loading screen?"
> "Connecting to real SAP systems takes 2 seconds for authentication and OData setup. The splash screen gives a clean visual indicator instead of a blank white screen."
