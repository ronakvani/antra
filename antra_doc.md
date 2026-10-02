# Antra: Technical Architecture and Development Specification

## 1. Executive Summary: What is Antra?

Antra is an innovative web-based platform designed to revolutionize website creation by merging interactive video technology with standard web development. Unlike traditional website builders that rely on static sections or standard video editors meant for rendering linear marketing content, Antra enables creators to build **interactive, video-based websites**.

In an Antra-built website, video serves as the foundational environment rather than a standalone media asset. The user's progression through the website is entirely dictated by the scroll wheel. Scrolling down advances the video forward, and scrolling up rewinds it. Standard media controls (play, pause, seek bars, volume) are entirely stripped away. On top of this scroll-bound media layer, Antra overlays an Interactive Canvas where creators can place both static elements (text, images) and functional web components (buttons, input fields, forms) that appear, disappear, and animate based on the video's specific timeline coordinates.

The ultimate goal of Antra is to provide a seamless drag-and-drop editor that empowers users to create highly immersive, narrative-driven, and experiential websites, which are then published seamlessly under custom subdomains (e.g., `userproject.antra.website`).

## 2. Core Mechanics and Layered Architecture

To achieve a seamless scroll-based video website, Antra's architecture is divided into two heavily synchronized but strictly separated layers.

### 2.1 The Media Layer (Base)

The Media Layer is responsible solely for rendering the video content. Because the video playback is tied to the browser's scroll event (e.g., mapping document scroll percentage to video duration), standard video delivery is insufficient.

* **Scroll-to-Seek Synchronization:** The system uses `requestAnimationFrame` coupled with damped Linear Interpolation (Lerp) and scroll event listeners to update `HTMLMediaElement.currentTime` dynamically.
* **Why Standard GOP Compression Fails:** Standard H.264 video compression uses long Group of Pictures (GOP = 250), meaning only 1 frame every ~8–10 seconds is a full Keyframe (I-frame). The remaining frames are P-frames and B-frames (delta frames) that store only movement differences. When seeking in reverse during upward scrolling, standard browser decoders choke and stutter because they must repeatedly jump backward to the prior I-frame and decode forward.
* **The All-Intra (I-Frame Only) Solution:** Antra enforces that **every single frame is encoded as an independent Keyframe (Intra-frame / I-frame)** using FFmpeg (`-g 1 -keyint_min 1 -movflags +faststart -an`). Because there are zero P or B delta-frames, the hardware decoder can jump directly to any timestamp forward or backward in $< 1\text{ms}$ with zero decode backlog or stuttering.
* **Elimination of Ping-Pong Hack:** Rather than artificially doubling file sizes and breaking linear scroll timeline mapping by concatenating reversed video into the file, Antra's All-Intra architecture allows true, natural bidirectional scrubbing across a clean $0\% \rightarrow 100\%$ linear timeline.

### 2.2 The Interactive Overlay Layer (Z-Index Canvas)

Sitting above the video player via CSS z-indexing is the Interactive Overlay Layer. This transparent DOM layer acts as the actual "website."

* **Timeline-Driven State:** Elements placed in this layer are tied to specific video timestamps (e.g., a "Contact Us" form appears precisely between 0:15 and 0:25 of the video).
* **Component Types:** The layer supports non-interactive elements (typography, branding images, vector graphics) and interactive elements (call-to-action buttons, lead capture forms, navigation links).
* **Decoupled Execution:** Because the interactive elements are standard HTML/CSS/JS rendered over the video, they maintain full SEO compliance, accessibility, and form-submission capabilities without interfering with the underlying media rendering.

## 3. Tech Stack and Open-Source Integration

Antra is built by aggressively leveraging and modifying established open-source projects to accelerate development while ensuring enterprise-grade stability.

### 3.1 Core Framework

* **Frontend:** React with Vite as the core development and build framework. It excels at complex state management (synchronizing video time with UI element visibility) and provides high-performance rendering.
* **Backend & Database:** Node.js with PostgreSQL for managing user accounts, project metadata (JSON structures linking timecodes to UI elements), and video asset references.

### 3.2 Media Player Engine: Video.js & Canvas Player

Antra supports dual high-performance playback engines:

* **Video.js Player (`VideoJsPlayer.jsx`):** Powers the core Media Layer for streaming All-Intra (`-g 1`) MP4 videos. Utilizes native hardware video decoders and optimized seek handlers to scrub smoothly across both Editor and Preview modes.
* **Canvas Sequence Player (`CanvasSequencePlayer.jsx`):** An alternative Apple-style rendering engine that renders pre-extracted WebP/PNG image sequences onto an HTML5 Canvas for guaranteed 120 FPS momentum scrolling.

### 3.3 Drag-and-Drop Web Builder: GrapesJS

To implement visual website building capabilities, Antra integrates **GrapesJS** (https://grapesjs.com).

* **Why GrapesJS?** GrapesJS is a framework-agnostic, heavily extensible open-source web builder framework designed specifically to be embedded into other applications. It provides the exact HTML/CSS DOM manipulation capabilities required to generate the transparent overlay layers.
* **Customization for Antra:** Custom GrapesJS blocks represent Antra's interactive elements (buttons, forms, text, vector shapes). These blocks link to the video timeline, ensuring that every element is registered with temporal Start/End coordinates alongside its X/Y spatial layout.

### 3.4 Video Editor and Timeline Synchronization: FrameTrail Reference

To handle the complexities of mapping web components to a video timeline, Antra references the JSON-driven architecture of **FrameTrail** (https://frametrail.org/).

* **Timebased JSON Documents:** FrameTrail's method of storing interactive overlay logic (when a DOM element mounts/unmounts) in lightweight, portable JSON files is adapted for Antra.
* **Playhead Tracking:** A custom timeline scrubber in the editor allows builders to scrub through the video and visually inspect which elements are active at the current playhead coordinate.

### 3.5 UI & Iconography: Penpot and Lucide Icons

* **UI/UX Design:** The interface of the Antra editor is styled based on **Penpot** design specifications.
* **Icons:** For all UI icons within the Antra web app (the editor interface, toolbars, and asset libraries), Antra exclusively uses **Lucide** (https://lucide.dev/icons/). 

## 4. Video Ingestion and Transcoding Pipeline

Antra provides two entry paths for getting video into the editor and preview pages. Regardless of which option is selected, **all media automatically passes through the All-Intra FFmpeg conversion pipeline** before reaching the Editor Canvas and Preview Viewport.

```
                    ┌────────────────────────┐
                    │  1. AI Video Generator │
                    │     (Higgsfield Wan 3) │
                    └───────────┬────────────┘
                                │
                                ▼
┌──────────────────────┐   ┌────────────────────────────────────────┐
│  2. Direct Video     │──▶│ Antra Transcoding Engine               │
│     File Upload      │   │ (FFmpeg All-Intra: -g 1 -keyint_min 1) │
└──────────────────────┘   └───────────────────┬────────────────────┘
                                               │
                                               ▼
                                 ┌───────────────────────────┐
                                 │   All-Intra MP4 Video     │
                                 │ (0ms seek delay, 100%     │
                                 │  I-Frames forward/reverse)│
                                 └─────────────┬─────────────┘
                                               │
                                 ┌─────────────┴─────────────┐
                                 ▼                           ▼
                        ┌─────────────────┐         ┌─────────────────┐
                        │  /editor View   │         │  /preview View  │
                        │  (VideoCanvas)  │         │ (ScrollViewer)  │
                        └─────────────────┘         └─────────────────┘
```

### 4.1 Entry Route 1: Direct File Upload
Developers can upload standard video files (MP4, WebM, MOV) from their local machine.
* The file is intercepted by `videoTranscodingEngine.js` and transmitted to the transcode service.
* FFmpeg converts the video stream into an All-Intra MP4 container.
* The resulting transcoded URL populates `videoSrc` in `EditorContext`, giving the developer instant, lag-free scrubbing in both the editor and preview viewports.

### 4.2 Entry Route 2: AI Video Generation (Higgsfield Wan 3.0)
Antra integrates a generative AI pipeline utilizing the **Higgsfield API** targeting the **Wan 3.0** (`wan-3`) model.
* **Input Capabilities:** Builders can generate scenes via Text-to-Video prompts or Image-to-Video conditioning (attaching up to 5 reference frames).
* **10-Second Continuous Take Constraint:** The payload enforces a single continuous tracking camera trajectory with zero scene cuts or angle switches.
* **Automated Post-Generation Transcoding:** Once synthesized, the raw AI video output is automatically piped into the All-Intra FFmpeg Transcoder. Every frame is converted to an I-Frame before entering the Editor Canvas.

### 4.3 FFmpeg Processing Environments: Localhost vs. Cloud Architecture

To ensure a seamless developer experience during development and frictionless usage for end users in production, Antra employs a two-tier execution strategy:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Localhost Development Period (Active Phase)                         │
│                                                                        │
│  [Browser Client] ──POST /api/transcode-video──▶ [Vite Dev Middleware] │
│                                                            │           │
│                                                     (System FFmpeg)    │
│                                                            ▼           │
│                                                  [ffmpeg.exe Process]  │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ 2. Public Production Cloud Architecture (Go-Live Phase)                │
│                                                                        │
│  [Builder Browser] ──POST /api/transcode──▶ [Cloud Transcode Worker]   │
│  (No FFmpeg installed on user PC)            (Serverless Container     │
│                                               w/ GPU/CPU FFmpeg)       │
│                                                            │           │
│                                                     (Cloudflare R2)    │
│                                                            ▼           │
│                                                  [Headless CDN Stream] │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Localhost Development Period (Under Active Development):**
   * The developer runs Antra locally (`npm run dev`).
   * Transcoding is orchestrated automatically via Vite dev server middleware (`ffmpegDevPlugin.js`).
   * When a video is uploaded or synthesized, the Vite server spawns the local system's `ffmpeg` binary to convert the media in seconds.
   * **FFmpeg Command Executed:**
     ```bash
     ffmpeg -y -i input.mp4 -c:v libx264 -crf 22 -preset veryfast -pix_fmt yuv420p -g 1 -keyint_min 1 -movflags +faststart -an output_intra.mp4
     ```
   * If local FFmpeg is not detected, the client logs a helpful notice and falls back gracefully.

2. **Public Production Cloud Architecture (Go-Live Phase):**
   * Once Antra goes public (`*.antra.website`), end-user builders will **not** need FFmpeg installed on their personal computers.
   * The frontend transcode engine (`videoTranscodingEngine.js`) seamlessly targets the production cloud endpoint (`VITE_CLOUD_TRANSCODE_URL`).
   * Cloud microservices (e.g. AWS Lambda with FFmpeg layer, Google Cloud Run, or Cloudflare Workers) ingest the video, transcode it to All-Intra format, and store the output on CDN-backed cloud object storage (Cloudflare R2 / AWS S3).

## 5. Publishing and Hosting Architecture

A critical feature of Antra is its frictionless publishing ecosystem. To keep hosting scalable and cost-effective, the platform heavily decouples video delivery from interactive website rendering.

### 5.1 Subdomain Provisioning (`*.antra.website`)

Antra operates on the primary domain `www.antra.website`. When a user publishes a project, they claim a unique identifier, resulting in a URL like `mybrand.antra.website`. Using wildcard DNS routing and edge middleware, the server intercepts the request and retrieves the specific project.

### 5.2 Decoupled Rendering and Storage

* **The Web Runtime (HTML/JSON):** The user's actual interactive website—comprising the GrapesJS HTML/CSS output, the FrameTrail-style JSON timeline manifest, and the Video.js playback logic—is served as a lightweight static application.
* **Headless Video Delivery with Range Requests:** All-Intra video files are stored on egress-free or low-cost S3-compatible storage (such as Cloudflare R2). These servers are configured to support `HTTP 206 Partial Content` (Byte-Range Requests), allowing the Video.js engine on the frontend to jump directly to any byte offset and frame without needing to download the full video upfront.