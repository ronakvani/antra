/**
 * Antra Plan Configuration & Feature Access Control Matrix
 * Enforces tier capabilities based on active user plan (pro, ultra, max).
 */

export const ANTRA_PLANS = {
  pro: {
    id: 'pro',
    name: 'pro',
    displayName: 'Antra Pro',
    price: '$4.50/mo',
    regularPrice: '$9.00/mo',
    status: 'active',
    limits: {
      maxVideoDuration: 15.0, // seconds
      maxSites: 1,
      storageMB: 500,
      monthlyImpressions: 'Uncapped',
      branding: 'removed',
      streamingProtocol: 'HTTP 206 Byte-Range'
    },
    features: {
      motionGraphics2D: true,
      spatial3DPrevis: false,
      referenceVideoGen: false,
      aiAssistantMode: 'auto-standard', // Auto mode (Standard)
      includedAIVideoGens: 0, // Pay-as-you-go ($1/clip)
      localAllIntraIngestion: true,
      previsDiffusionPipeline: false,
      visualCanvasEditor: true,
      clickableHotspots: true,
      leadGenForms: false,
      branchingNarrativeLogic: false,
      webhooksCRM: false,
      telemetry: 'basic'
    }
  },
  ultra: {
    id: 'ultra',
    name: 'ultra',
    displayName: 'Antra Ultra',
    price: '$19.00/mo',
    regularPrice: '$19.00/mo',
    status: 'upcoming',
    limits: {
      maxVideoDuration: 30.0,
      maxSites: 5,
      storageMB: 2500,
      monthlyImpressions: '100,000',
      branding: 'removed',
      streamingProtocol: 'HTTP 206 Byte-Range'
    },
    features: {
      motionGraphics2D: true,
      spatial3DPrevis: true,
      referenceVideoGen: true,
      aiAssistantMode: 'auto-premium', // Auto mode (High-reasoning)
      includedAIVideoGens: 5, // 5 included 2K generations/mo
      localAllIntraIngestion: true,
      previsDiffusionPipeline: false,
      visualCanvasEditor: true,
      clickableHotspots: true,
      leadGenForms: true,
      branchingNarrativeLogic: false,
      webhooksCRM: false,
      telemetry: 'scroll-telemetry'
    }
  },
  max: {
    id: 'max',
    name: 'max',
    displayName: 'Antra Max',
    price: '$39.00/mo',
    regularPrice: '$39.00/mo',
    status: 'upcoming',
    limits: {
      maxVideoDuration: 60.0,
      maxSites: 15,
      storageMB: 10000,
      monthlyImpressions: '500,000',
      branding: 'removed + white-label',
      streamingProtocol: 'HTTP 206 Byte-Range'
    },
    features: {
      motionGraphics2D: true,
      spatial3DPrevis: true,
      referenceVideoGen: true,
      aiAssistantMode: 'manual', // Manual model picker
      includedAIVideoGens: 15, // 15 included 4K generations/mo
      localAllIntraIngestion: true,
      previsDiffusionPipeline: true,
      visualCanvasEditor: true,
      clickableHotspots: true,
      leadGenForms: true,
      branchingNarrativeLogic: true,
      webhooksCRM: true,
      telemetry: 'full-heatmaps'
    }
  }
};

/**
 * Feature mapping defining minimum required plan
 */
export const FEATURE_REQUIREMENTS = {
  motionGraphics2D: { requiredPlan: 'pro', label: '2d motion graphics video' },
  spatial3DPrevis: { requiredPlan: 'ultra', label: 'spatial 3d scene previs' },
  referenceVideoGen: { requiredPlan: 'ultra', label: 'reference video generation' },
  leadGenForms: { requiredPlan: 'ultra', label: 'lead-gen forms & dynamic ctas' },
  aiAssistantAutoHighReasoning: { requiredPlan: 'ultra', label: 'ai assistant auto (high-reasoning)' },
  aiAssistantManual: { requiredPlan: 'max', label: 'manual ai model picker' },
  previsDiffusionPipeline: { requiredPlan: 'max', label: 'spatial previs to diffusion pipeline' },
  branchingNarrativeLogic: { requiredPlan: 'max', label: 'branching narrative decision trees' },
  webhooksCRM: { requiredPlan: 'max', label: 'webhooks & crm endpoints' },
  fullHeatmaps: { requiredPlan: 'max', label: 'full heatmaps & advanced telemetry' }
};

/**
 * Get active plan definition (defaults to 'pro' for subscribed creators)
 */
export function getUserPlanConfig(user) {
  const planId = (user?.plan || 'pro').toLowerCase();
  return ANTRA_PLANS[planId] || ANTRA_PLANS.pro;
}

/**
 * Check if a specific feature is enabled for the current user's plan
 */
export function isFeatureAllowed(user, featureKey) {
  const plan = getUserPlanConfig(user);
  return Boolean(plan.features[featureKey]);
}

/**
 * Get maximum video scrub duration permitted by the user's plan
 */
export function getMaxDurationForUser(user) {
  const plan = getUserPlanConfig(user);
  return plan.limits.maxVideoDuration || 15.0;
}

/**
 * Check if a given plan name is marked as upcoming
 */
export function isUpcomingPlan(planId) {
  const plan = ANTRA_PLANS[(planId || '').toLowerCase()];
  return plan?.status === 'upcoming';
}
