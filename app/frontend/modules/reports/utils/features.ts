interface FeatureFlags {
  ai_assistant_enabled?: boolean;
  [key: string]: boolean | undefined;
}

export const getFeatures = (): FeatureFlags => (
  // TODO: Should be replaced with Redux state when migrating to main app
  window.PsyGlobalState?.features || {}
)

/**
 * Get a specific feature flag value.
 *
 * @param {string} featureName - The name of the feature flag
 * @returns {boolean} The feature flag value, defaults to false if not found
 */
export const getFeature = (featureName: string): boolean => {
  const features = getFeatures()
  return features[featureName] || false
}

/**
 * Check if AI assistant feature is enabled.
 *
 * @returns {boolean} True if AI assistant feature is enabled
 */
export const isAiAssistantEnabled = (): boolean => (
  getFeature('ai_assistant_enabled')
)

export const isEnhanceWithAiEnabled = (): boolean => (
  getFeature('enhance_with_ai_enabled')
)
