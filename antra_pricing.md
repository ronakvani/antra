Antra Pricing Strategy & Infrastructure Tiering
===============================================

1\. Executive Summary & Launch Strategy
---------------------------------------

Antra is a specialized website builder transforming web design by replacing traditional video controls with scroll-driven timecode navigation. Instead of hand-coding GSAP ScrollTrigger scripts or modeling complex 3D meshes in Blender, builders author interactive video websites using a dual-layer engine: a background media layer bound to scroll position and a transparent, time-synchronized DOM/Canvas overlay layer.

### Early Adopter Launch Campaign (Pro Plan)

*   **Launch Pricing:** Pro Plan launches at **$4.50 / month** (50% off standard $9.00 pricing).
    
*   **Window & Availability:** Valid for the first **10 to 15 days** only, capped at the first **50 builders**.
    
*   **Founder Incentive:** Builders keep the discounted rate for life in exchange for qualitative feedback via an embedded in-editor feedback widget.
    
*   **Rollout Horizon:** Feedback collected during this window directly informs the final release of the Ultra and Max pipelines.
    

2\. Master Plan Comparison Matrix
---------------------------------

**Feature**                                     | Pro Plan                          | Ultra Plan                        | Max Plan 
**Standard Monthly Price**                      | $9/month                          | $19/month                         | $39/month
**Early Launch Price**                          | $4.50/month (15-day window)       | N/A (Phase 2 rollout)             | N/A (Phase 2 rollout)
**Active Published Websites**                   | 1 Active Site                     | 5 Active Sites                    | 15 Active Sites
**Video Scrub Duration**                        | 10 – 15 seconds                   | Up to 30 seconds                  | Up to 60 seconds (or multi-scene)
**Domain & Network Routing**                    | \[name\].antra.website            | 1 Custom Apex Domain + Subdomains | 5 Custom Apex Domains + Wildcard Subdomains 
**Media Storage (Cloudflare R2)**               | 500 MB (Zero-egress streaming)    | 2.5 GB (Zero-egress streaming)    | 10 GB (Zero-egress streaming)
**Antra Branding / Watermark**                  | Removed (Clean site)              | Removed (Clean site)              | Removed + White-label portal 
**AI LLM Code Generation**                      | Auto Mode (Standard)              | Auto Mode (Premium)               | Manual Mode (Custom Selection)                               
**Generative Reference Video (Previs)**         | Not Available                     | Available                         | Available
**Photorealistic AI Video**                     | Pay-as-you-go ($1/clip) or Self-Upload 5 Generations/mo included (Text/Image-to-Video) 15 Generations/mo included (Higgsfield Previs Reference-to-Video) 
**Interactive DOM Overlay**                     | Available                         | Available                         | Available
**Media Delivery Protocols**                    | HTTP 206 Byte-Range Streaming     | HTTP 206 Byte-Range Streaming     | HTTP 206 Byte-Range Streaming

3\. In-Depth Plan Specifications
--------------------------------

### Pro Plan ($9 / month — Launching at $4.50)

_Targeted at independent developers, portfolio creators, and design freelancers testing scroll-driven micro-sites._

*   **Hosting & Delivery Infrastructure:**
    
    *   **1 Active Published Project:** Hosted on a custom subdomain (\[project\].antra.website) provisioned via Cloudflare edge routing.
        
    *   **500 MB Video Storage:** Hosted on Cloudflare R2 with zero bandwidth/egress fees and native HTTP 206 Partial Content byte-range support.
        
    *   **Zero Watermarks:** Published sites feature no "Built with Antra" badges or external branding.
        
*   **Programmatic Motion & Previs:**
    
    *   **Remotion Integration (2D Motion Graphics):** Generates kinetic typography, SVG animations, and 2D layouts compiled directly to video via Remotion.
        
    *   **AI Code Assistant (Auto Mode - Standard):** Automatically routes builder prompts to high-speed models (GroqCloud Llama 3.3 70B) to generate clean React Remotion code.
        
*   **Video Layer Ingestion:**
    
    *   **Direct Local Uploads:** Builders can upload local MP4/WebM files processed client-side via FFmpeg.wasm or optimized with short GOP keyframing (-g 1).
        
    *   **Higgsfield AI Video:** Available on a pay-as-you-go basis ($1.00 per 10s video generation).
        
*   **Interactivity Layer:**
    
    *   Full GrapesJS visual overlay editor.
        
    *   FrameTrail-style JSON manifest compilation.
        
    *   Timestamp-bound clickable hotspots and external navigational hyperlinks.
        

### Ultra Plan ($19 / month)

_Targeted at digital agencies, commercial product landing pages, and interactive brand storytellers._

*   **Hosting & Delivery Infrastructure:**
    
    *   **5 Active Published Projects:** Includes 1 custom apex domain (yourbrand.com) with automated Cloudflare for SaaS SSL termination, plus unlimited \*.antra.website subdomains.
        
    *   **2.5 GB Video Storage:** High-performance Cloudflare R2 bucket with automated CDN edge caching.
        
    *   **Traffic Allocation:** Up to 100,000 monthly page impressions across all sites.
        
*   **Programmatic Motion & Previs:**
    
    *   **Full Remotion Engine:** Complex multi-sequence 2D motion graphics.
        
    *   **Three.js / React Three Fiber (R3F) Previs Canvas:** Embedded lightweight 3D canvas where builders define camera paths and spatial geometry without external 3D software.
        
    *   **AI Code Assistant (Auto Mode - Premium):** Automatically routes to high-reasoning coding models (DeepSeek V3 via OpenRouter / Groq) to convert natural language prompts into working Remotion JSX and R3F camera choreography.
        
*   **Video Layer Ingestion:**
    
    *   **5 Included Photorealistic Generations / Month:** Powered by Higgsfield API (Kling 2.5 / Seedance 2.5) with enforced continuous single-shot camera motion (no scene cuts) and automated 2K upscaling.
        
    *   **Text-to-Video & Image-to-Video Workflows:** Generate motion directly from prompts or seed images.
        
*   **Interactivity Layer:**
    
    *   Clickable hotspots and animated typography.
        
    *   Responsive DOM overlay components: interactive lead-capture forms, dynamic CTAs, newsletter signups, and custom iframe modals.
        

### Max Plan ($39 / month)

_Targeted at high-volume studios, creative production teams, and enterprise product launches requiring advanced 3D camera pipelines._

*   **Hosting & Delivery Infrastructure:**
    
    *   **15 Active Published Projects:** Up to 5 custom apex domains with automated SSL issuance and multi-tenant routing.
        
    *   **10 GB Video Storage:** Zero-egress Cloudflare R2 storage accommodating high-bitrate video and image sequences.
        
    *   **Traffic Allocation:** Up to 500,000 monthly page impressions with dedicated edge routing rules.
        
*   **Programmatic Motion & Previs:**
    
    *   **Full Remotion + Three.js / R3F Suite:** Advanced scene composition and procedural geometry.
        
    *   **AI Code Assistant (Manual Model Selection):** Builders can manually pick their preferred LLM (e.g., DeepSeek V3, Llama 3.3 70B, Claude 3.5 Sonnet, GPT-4o) to generate complex spatial math, custom shaders, and Remotion sequences.
        
*   **Video Layer Ingestion:**
    
    *   **15 Included Photorealistic Generations / Month:** High-priority execution queue.
        
    *   **Reference-to-Video Pipeline (Three.js Previs $\\to$ Higgsfield):** AI generates Three.js camera trajectory $\\to$ Remotion renders the wireframe previs video $\\to$ video is piped into Higgsfield as structural motion conditioning to produce photorealistic 4K output.
        
*   **Interactivity Layer:**
    
    *   Full interaction suite: branching narrative decision trees, user-triggered timeline jumps, and CRM/webhook endpoints (Stripe, Zapier, Webhook URLs).
        
    *   Interaction telemetry: scroll-depth completion tracking and hotspot interaction heatmaps.
        

4\. Add-Ons & Credit Packs
--------------------------

To protect subscription margins from unpredictable model usage, all heavy AI video generations beyond tier allowances are decoupled into credit packs:

*   **AI Video Pack (5 Renders):** **$5.00** ($1.00 per 10s video)
    
    *   Direct API cost: ~$0.55–$0.65 (Higgsfield Kling 2.5 + Upscaler).
        
    *   Antra Gross Margin: **35% – 45%**.
        
*   **Storage Add-on (10 GB):** **$3.00 / month**
    
    *   Direct Cloudflare R2 cost: ~$0.15 / month.
        
    *   Antra Gross Margin: **\>90%**.
        
*   **Extra Custom Domain Slot:** **$2.00 / month per domain**
    

5\. Unit Economics & Margin Safety Architecture
-----------------------------------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   ┌─────────────────────────────────────────────────────────────┐  │                    ANTRA BILLING PIPELINE                   │  │                                                             │  │  Builder Pays Subscription / Add-on                         │  │  └─► Razorpay / Stripe (Deducts 2.0% - 2.5% fee)            │  │      └─► Net Revenue into Antra Account                     │  │          ├─► Shared Infrastructure (Cloudflare + VPS + DB)  │  │          ├─► LLM Token Ingestion (OpenRouter / GroqCloud)   │  │          ├─► Video Diffusion Renders (Higgsfield API)       │  │          └─► 20%+ Antra Net Margin Protection               │  └─────────────────────────────────────────────────────────────┘   `

1.  **Why Video Length Caps Prevent Margin Collapse:**Higgsfield charges per second of generated output (~$0.042/s to $0.074/s). A 300-second video would cost over $12.60 in raw compute per render. Capping clips at 10–30s preserves high-performance browser decoding (preventing DOM memory exhaustion) while keeping single-render generation costs between $0.42 and $0.85.
    
2.  **Near-Zero Cost for Code Generation:**Routing text prompts through GroqCloud (Llama 3.3 70B at ~$0.79/M output tokens) and OpenRouter (DeepSeek V3 at ~$1.00/M output tokens) costs less than **$0.002 per generated Remotion/Three.js component**. This makes generous LLM code generation sustainable across all tiers.
    
3.  **Bandwidth Immunity:**Because video streams run on Cloudflare R2's zero-egress architecture using HTTP 206 range requests, a published site experiencing viral traffic incurs zero additional bandwidth costs for the builder or Antra.