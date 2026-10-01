# 🎙️ Master Interview Presentation Script — OneStudio



## STUN = Session Traversal Utilities for NAT
It helps a device discover its public IP address and port so WebRTC can try to establish a direct connection.

**Simple example:**
Your laptop → Router/NAT → Internet
STUN tells your laptop: "Your public address is X:X."




## TURN = Traversal Using Relays around NAT
If WebRTC cannot establish a direct connection, TURN acts as a relay server.
Forwards connection when direct connection fails.

**Simple Example**
Without TURN:
A ───────────> B

If direct connection fails:
A ──> TURN Server ──> B




## WebRTC (Web Real-Time Communication) 
It is a technology that allows browsers/apps to do real-time audio, video, and data communication without needing a traditional video-call service.
It handles real-time communication between browsers.
**WebSocket** is a communication protocol that creates a persistent, two-way connection between the client and server.



## SFU (Selective Forwarding Unit) 
It is a server that receives video/audio from participants and forwards it to the other participants without mixing it.

**Simple Example**
For 3 people:
Person A ──┐
Person B ──┼──> SFU ──> A, B, C
Person C ──┘

Instead of A sending directly to B and C separately, everyone sends their stream to the SFU, and the SFU forwards the required streams.




## NAT = Network Address Translation
It is a technique used by a router to allow multiple devices in a private network to share one public IP address on the internet.

**Simple Example**
Laptop      192.168.1.10 ─┐
Phone       192.168.1.11 ─┼──> Router (NAT) ──> Internet
TV          192.168.1.12 ─┘

**NOTE:**
In WebRTC, NAT can make it difficult for two devices to connect directly.
That's why WebRTC uses:
STUN → discover how to reach the device through NAT
TURN → relay traffic when direct connection through NAT fails




## 1. Introduction

"Good morning.

My name is Mohd Arbab Rizvi, and today I’m going to present my project, **OneStudio**.

OneStudios is a full-stack and real-time video conferencing platform, designed and built entirely without using any third-party Video SDKs like Twilio or Agora.
Twilio and Agora are cloud platforms that provide developer tools (APIs and SDKs) to add real-time voice, video, and messaging features into mobile and web apps.

**Tech Stack (Spoken Version):**
"For the tech stack:
- I used **React** for the frontend UI, video grid layout, and in-browser canvas features.
- I used **Node.js & Express** for the backend REST APIs and user authentication.
- I used **WebSockets** for real-time signaling, live chat, and whiteboard sync.
- I used native **WebRTC** for direct 1:1 audio/video calls and P2P file transfers.
- I used **mediasoup** as the SFU media server to manage scalable group calls.
- I used **PostgreSQL & Prisma** to store user accounts and meeting history.
- And I used **Google Gemini** for generating meeting summaries and smart replies."


## 2. Why I Built OneStudio

In a normal web application, we usually send a request to the server and get a response.

But in a video meeting, many things are happening continuously — video, audio, chat, screen sharing, and participant updates.

<!-- One of the reasons I built this project was cost and infrastructure control. -->

Apps like Zoom offer only 40 minutes per meeting session on their free plans. For longer sessions, users are required to purchase a paid plan.

Similarly third-party video services / SDK's like Agora or Twilio also charge based on video usage, such as participant-minutes. As the number of users and meeting hours increase, these costs can also increase.

**SDK = Set of tools programmers use to make apps. It can include libraries, API's, documentation, debug tools etc.**
**API = Application Programming Interface = A way of 2 different software programs to talk to each other.**

So instead of using a ready-made video SDK ($0.04 for an hour with 10 participants using twilio or $0.032 for agora), I built the video layer using native WebRTC and a self-hosted mediasoup SFU for group calls.

This allowed me to avoid third-party video API charges and also gave us more control over how the video system works.


## 3. Main Features
"OneStudio has several features.

<!-- We choose 10 participants as application's current limit to control bandwidth and cpu usage (50% it can go)-->

## 1:1 Calls & Group Meetings
>Users can make 1:1 or group video/audio calls with up to 10 people. 
>WebRTC handles real-time communication between browsers.
>Mediasoup SFU manages and forwards video streams efficiently in group calls.
>Simple: WebRTC = real-time communication , mediasoup = manages group video streams.

## Screen Sharing
>Users can share their entire screen, a window, or a browser tab.
>Useful for presenting PPTs, code, or demonstrations.
>WebRTC sends the shared screen to other participants in real time.

## Local Browser Recording
>The meeting can be recorded directly on the user's device.
>Video feeds are combined using an HTML5 Canvas using captureStream() method.
>The final recording is saved locally on the laptop using MediaRecorder API, 
 so it doesn't need to be uploaded to a server.
>Benefit: Better privacy and no server-side storage required.

## P2P File Sharing
>Users can send files directly from one browser to another.
>Uses WebRTC RTCDataChannel.
>The file doesn't need to pass through a central server.
>Converts video / file to ArrayBuffer and divides to 128kb chunks.
>On other browser, its received in chunks and reconstructed to original.
>Simple: Browser A → Browser B directly.

## AI Productivity — Gemini
>Live Transcript: Web Speech API converts real-time speech into text captions.
>AI Summaries: Gemini summarizes the meeting transcript.
>Action Items: Identifies tasks discussed during the meeting.
>Smart Replies: Suggests quick responses for chat messages.
>Simple: Speech API creates live transcript → Gemini generates summaries & notes.

## Collaboration & Engagement
<!-- 1. Whiteboard: -->
>Participants can draw/write together in real time.
>WebSockets synchronize everyone's changes.

<!-- 2. Emoji Reactions: -->
>Users can send reactions like 👍 ❤️ 😂.
>They appear as floating animations/particles for other participants.

<!-- 3. Virtual Backgrounds: -->
>Uses MediaPipe to detect the person from the background.
>The background can then be blurred or replaced.
>Simple: MediaPipe identifies you → separates you from the background → applies blur/background effect.

## Meeting Analytics Dashboard
>Users can see stats and history of their past meetings.
>Shows total meetings held, time spent in calls, and participant details.
>Uses Recharts to display visual graphs and charts.
>Simple: Dashboard = meeting history + call stats + visual graphs.




## 4. How Video Calling Works (1:1 P2P)

> **Interview Pitch:** *"For 1-on-1 calls, I used native browser WebRTC so video and audio flow directly between users with zero server latency."*

- **The Signaling Step:** Before browsers can talk, they need to find each other. I built a **WebSocket** server that acts as a matchmaker to exchange connection details (SDP offers/answers and ICE candidate IP addresses).
- **Direct P2P Media:** Once the handshake is complete, WebSockets step back, and audio/video streams flow directly peer-to-peer between the browsers.
- **Key Takeaway:** WebSockets are only used for the initial handshake (signaling), **not** for streaming the heavy video data.

---

## 5. How Group Calls Work (mediasoup SFU)

> **Interview Pitch:** *"P2P mesh fails in group calls because of bandwidth limits. So I integrated mediasoup SFU to make group calls scalable."*

- **The Problem with Mesh:** In a 5-person P2P call, each user must upload their video to 4 different people. This quickly chokes home upload speeds and overheats the CPU.
- **The Solution (SFU):** `mediasoup` acts as a smart traffic router (Selective Forwarding Unit).
- **How it Works:** Each person uploads their video **just once** to the mediasoup server. The server then forwards copies of that stream to the other participants.
- **Key Takeaway:** Saves massive client upload bandwidth and lets the app smoothly handle multi-party calls.

---

## 6. Local In-Browser Recording (Zero Server Cost)

> **Interview Pitch:** *"Instead of paying for expensive cloud recording servers, I engineered a 100% client-side recording pipeline in the browser."*

- **Canvas Compositing:** All active participant video streams are drawn onto a single hidden HTML5 `<canvas>` grid in real time.
- **Audio Mixing:** The Web Audio API (`AudioContext`) combines microphone feeds into one single audio track.
- **Hardware-Accelerated Encoding:** The browser's native `MediaRecorder` API captures that combined canvas stream and saves it directly to the user's laptop as a `.webm` file.
- **Key Takeaway:** Zero server rendering costs and 100% private (no video is uploaded to the cloud).

---

## 7. Direct P2P File Sharing

> **Interview Pitch:** *"Users can send large files directly to each other without passing through any backend server."*

- **Uses WebRTC DataChannel:** File bytes travel directly peer-to-peer over an encrypted `RTCDataChannel`.
- **Chunking (128 KB):** To avoid memory crashes, files are converted to `ArrayBuffer`, sliced into 128 KB packets, sent sequentially, and reconstructed on the receiving browser.
- **Flow Control:** Uses `bufferedAmountLowThreshold` to pause sending if the network buffer gets full, preventing browser freezes.

---

## 8. AI Meeting Intelligence (Gemini 2.0 Flash)

> **Interview Pitch:** *"I integrated Google Gemini 2.0 Flash to turn spoken conversations into actionable meeting notes and smart chat replies."*

- **Live Transcript:** The browser's Web Speech API listens and converts speech into real-time text captions.
- **Automated Summary:** When the meeting ends, the transcript is sent to Google Gemini, which extracts a 2-3 sentence overview, key discussion points, and action items.
- **Smart Replies:** Inside the chat drawer, Gemini analyzes the last few spoken sentences and suggests 3 quick-reply buttons that users can click to send instantly.
- **Key Takeaway:** The AI is decoupled from the media engine—WebRTC handles video, while Gemini handles text.

---

## 9. Security & Privacy

> **Interview Pitch:** *"Privacy was built into the architecture from day one."*

- **Local Storage Only:** Meeting recordings stay on the user's computer—the backend server never touches or stores video files.
- **End-to-End Encrypted Chat (E2EE):** In-meeting chat messages are encrypted in the browser using the **Web Crypto API** (ECDH key exchange + AES-GCM-256). Even our server only sees scrambled ciphertext.

---

## 10. Virtual Background & Collaborative Whiteboard

> **Interview Pitch:** *"I added engaging in-call tools that run entirely client-side."*

- **Virtual Background (MediaPipe):** Uses Google MediaPipe ML directly in the browser to detect the person and blur or replace the background without sending video to an external server.
- **Real-Time Whiteboard:** A shared HTML5 canvas where drawing coordinates are synced between users in milliseconds via WebSockets.

---

## 11. Backend, Database & Authentication

> **Interview Pitch:** *"The backend is built with clean architecture using Express, Prisma, and PostgreSQL."*

- **Backend:** Node.js with **Express 5** for REST APIs and WebSocket real-time signaling.
- **Database:** **PostgreSQL** (hosted on Neon) with **Prisma 7 ORM** for managing user profiles, room codes, and past meeting history.
- **Authentication:** Salted **bcrypt** password hashing and **JWT access/refresh tokens** stored in secure `httpOnly` cookies to protect against XSS attacks.

---

## 12. Deployment & Infrastructure

> **Interview Pitch:** *"The application is fully containerized using Docker and Docker Compose."*

- **Containerization:** Frontend, Express backend, and mediasoup are containerized with Docker for reproducible builds.
- **WebRTC Networking:** Configured STUN/TURN servers to bypass strict NAT routers and firewalls, and opened the required UDP port range for mediasoup media routing.

---

## 13. The Hardest Part of the Project

> **Interview Pitch:** *"Managing real-time connection states and race conditions was the biggest technical challenge."*

- **What was difficult:** Handling sudden network drops, users switching between camera and screen share mid-call, and cleaning up WebRTC tracks so the browser doesn't leak memory.
- **How I solved it:** Built structured cleanup routines on component unmount and serialized signaling messages so state transitions happen predictably.

---

## 14. Key Learnings & Takeaways

> **Interview Pitch:** *"Building OneStudios helped me transition from simple CRUD apps to complex real-time distributed systems."*

- Mastered native **WebRTC** connection lifecycles and **SFU architecture** with mediasoup.
- Learned real-world **WebSockets** state management and synchronization.
- Gained hands-on experience with in-browser media pipelines (`Canvas`, `AudioContext`, `MediaRecorder`, Web Crypto API).

---

## 15. Closing Pitch

> *"Thank you for your time. I'd love to answer any questions!"*

---

## ❓ Critical Q&A Quick Reference

1. **Q: Why use WebSockets for signaling instead of HTTP REST?**  
   - *A:* WebSockets keep an open 2-way connection so the server can push SDP offers and ICE candidates instantly without the delay of polling.

2. **Q: How does mediasoup differ from Socket.io?**  
   - *A:* Socket.io is for lightweight JSON/text data. `mediasoup` is a high-performance C++ media server built specifically to route heavy audio/video RTP packets across server threads.

3. **Q: Why SFU instead of Mesh for group calls?**  
   - *A:* In Mesh, every user uploads to every other user ($N \times (N-1)$), crashing upload bandwidth. In an SFU, each user uploads their video **once**, and the server duplicates and forwards it.

4. **Q: How does local recording work without a backend server?**  
   - *A:* We draw video tiles onto an HTML5 `<canvas>`, mix audio using `AudioContext`, and pass that stream into the browser's native `MediaRecorder` API to save as WebM on the laptop.

5. **Q: What happens if two users are behind strict college/corporate firewalls?**  
   - *A:* Normal P2P connection fails. We use a **TURN relay server** (configured in our ICE servers list) which acts as an encrypted relay fallback so the call still connects.


---

## ⚠️ Challenges Faced & Solutions (Viva / Interview Notes)

> **Interview Tip:** Explain these in 3 simple steps: *What was the issue? Why did it happen? How did we handle it?*

1. **High CPU Usage in Large Group Calls (10+ Users + Screen Share)**
   - **The Problem:** When 10+ people opened video and someone shared their screen, laptops started heating up and lagging.
   - **Why it happened:** Browsers can only use hardware decoding for 4–6 video feeds at once. The rest are decoded using the laptop's CPU. Adding a sharp 1080p screen share pushed CPU usage to 100%.
   - **How we handled it:** We capped active video tiles to 10 and paused incoming streams for silent/inactive participants to save CPU.

2. **Virtual Background 1–2 Second Camera Lag**
   - **The Problem:** When moving hands or head with background blur turned on, the camera reacted 1–2 seconds late.
   - **Why it happened:** The MediaPipe AI model was running directly on the browser's main thread. Because each frame took ~40ms to process, video frames backed up in a queue, creating an accumulated delay.
   - **How we handled it:** We dropped the AI detection resolution to 320x240 and planned to move processing to a background Web Worker so the main UI thread never gets blocked.

3. **Audio/Video Out of Sync in Local Recording**
   - **The Problem:** If the host minimized the browser window while recording, the saved video had audio playing several seconds ahead of the video.
   - **Why it happened:** To save battery, Chrome slows down background tabs from 60 fps to 1 fps. The canvas video paused, but microphone audio kept recording in real time.
   - **How we handled it:** We warned users to keep the meeting tab open during recording, or use browser screen capture instead of canvas-only capture.

4. **AI Meeting Summary (Gemini 2.0 Free Tier Limits & Delay)**
   - **The Problem:** Generating notes took 3–5 seconds, occasionally misheard words, and paid API keys were avoided.
   - **Why it happened:** As a college project, we used Google's free API tier instead of paid keys. Inaccuracies happened because browser speech recognition doesn't distinguish between different speakers. The 3–5s wait occurred because the server waits for the entire summary instead of streaming it.
   - **How we handled it:** We used strict prompt instructions to return clean JSON (saving token limits) and built automatic fallback messages so the app never crashes if the free API rate limit (15 RPM) is hit.