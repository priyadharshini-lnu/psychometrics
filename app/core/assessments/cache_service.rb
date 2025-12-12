# frozen_string_literal: true

module Assessments
  class CacheService
    CACHE_EXPIRY = 30.days

    def initialize(assessment, selected_locale = nil, piped_text_context = {})
      @assessment = assessment
      @selected_locale = selected_locale
      @cache_key = assessment.assessment_data_serializer_key(selected_locale)
      @piped_text_context = piped_text_context
    end

    def fetch_serialized_assessment
      if @assessment.skill_rater?
        return serialize_assessment(@piped_text_context)
      end

      cached = Rails.cache.read(@cache_key)
      return JSON.parse(cached) if cached

      serialized = serialize_assessment(@piped_text_context, true)
      Rails.cache.write(@cache_key, serialized.to_json, expires_in: CACHE_EXPIRY)
      serialized
    end

    def invalidate_cache
      # TODO: Only get assessment available locales instead of all locales?
      I18n.available_locales.each do |locale|
        key = @assessment.assessment_data_serializer_key(locale)
        Rails.cache.delete(key)
      end
    end

    private

    def serialize_assessment(piped_text_context, ignore_pipetext_substitution = false)
      ::AssessmentSerializer.new(
        context: {
          selected_locale: @selected_locale,
          piped_text_context: ignore_pipetext_substitution ? {} : piped_text_context,
          include: '**',
          ignore_pipetext_substitution: ignore_pipetext_substitution
        }
      ).serialize(@assessment)
    end
  end
end
