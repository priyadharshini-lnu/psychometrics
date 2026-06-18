# frozen_string_literal: true

module EndUser
  class DetailedUserAssessmentSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers

    attributes :id, :type, :url, :assessment_name, :timing, :assessment_category,
               :assessment_extra, :assessment_id, :available_locales,
               :selected_locale, :privacy_consent_required, :campaign_id,
               :custom_consent_text, :custom_consent_policy_version, :data_role,
               :is_data_controller, :instructions, :started_at, :current_campaign_expiry_date,
               :piped_text_mapping, :locale_data, :custom_acknowledgment_text, :selective_proctoring_enabled,
               :proctoring_integration_type, :should_run_assessment_level_checks, :enable_mobile_proctoring

    def privacy_consent_required
      if is_data_controller
        object.not_started? || object.data_controller_consent_required?(context[:current_user])
      else
        context[:current_user].privacy_consent_required?
      end
    end

    def custom_consent_text
      return unless is_data_controller

      object.assessment.custom_consent_text
    end

    def custom_acknowledgment_text
      return unless is_data_controller

      object.assessment.custom_acknowledgment_text
    end

    def custom_consent_policy_version
      object.assessment.policy_version
    end

    def data_role
      object.assessment.data_role
    end

    def is_data_controller
      object.assessment.data_role_controller?
    end

    def url
      UserAssessments::GetUrl.call!(object)
    end

    def type
      return Assessment::TYPES[:common] if internal_microsite?

      object.assessment.type
    end

    def user_id
      object.evaluator_id
    end

    def assessment_id
      object.assessment.id
    end

    def assessment_name
      object.assessment.name
    end

    def assessment_extra
      extra = object.assessment.extra
      return extra if extra['enable_audio_check'] && extra['enable_video_check']

      audio_and_video_check_data = {
        enable_audio_check: extra['enable_audio_check'] || has_question_type('AudioResponse'),
        enable_video_check: extra['enable_video_check'] || has_question_type('VideoResponse')
      }

      extra.merge(audio_and_video_check_data)
    end

    def current_campaign_expiry_date
      current_campaign_user&.real_expiry_date
    end

    def timing
      object.assessment.timing
    end

    def assessment_category
      object.assessment.category
    end

    def instructions
      assessment = object.assessment
      return unless assessment

      return assessment.instructions if locale.to_s == assessment.default_language.to_s

      instructions = assessment.instructions
      translated_content = translated_instructions_content
      instructions['content'] = translated_content if translated_content

      instructions
    end

    def piped_text_mapping
      if generate_piped_text_mapping?
        object.assessment.generate_piped_text_mapping_for_instructions(piped_text_context)
      end
    end

    def locale_data
      {
        code: locale,
        name: I18n.t("languages.#{locale}"),
        direction: Settings.rtl_languages.include?(locale) ? 'rtl' : 'ltr'
      }
    end

    def selective_proctoring_enabled
      campaign.campaign_options.selective_proctoring_enabled && object.proctoring_enabled?
    end

    def proctoring_integration_type
      campaign.campaign_options.integration_type
    end

    def enable_mobile_proctoring
      campaign.campaign_options.enable_mobile_proctoring
    end

    def should_run_assessment_level_checks
      campaign.should_run_assessment_level_checks?
    end

    private

    def internal_microsite?
      object.assessment.microsite? && Settings.microsite.internal_assessment_enabled
    end

    def campaign
      context[:campaign]
    end

    def current_user
      context[:current_user]
    end

    def current_campaign_user
      context[:campaign_user]
    end

    def piped_text_context
      context[:piped_text_context] || {}
    end

    def generate_piped_text_mapping?
      context[:generate_piped_text_mapping] || false
    end

    def current_participant
      context[:participant]
    end

    def locale
      context[:locale] || object.selected_locale || I18n.default_locale
    end

    def translated_instructions_content
      Translation.instructions_content_for_assessment(
        object.assessment_id, locale, translations_migrated: object.assessment.translations_migrated?
      )
    end

    def has_question_type(type)
      available_questions = object.assessment.questions.not_deleted.uniq { |q| q[:type] }

      available_questions.any? { |q| q[:type] == type }
    end
  end
end
