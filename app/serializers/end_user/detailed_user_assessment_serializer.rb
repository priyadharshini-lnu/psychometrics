# frozen_string_literal: true

module EndUser
  class DetailedUserAssessmentSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :type, :url, :assessment_name, :timing, :assessment_category,
               :assessment_extra, :assessment_id, :available_locales,
               :selected_locale, :privacy_consent_required, :campaign_id

    def privacy_consent_required
      context[:current_user].privacy_consent_required?
    end

    def url
      UserAssessments::GetUrl.call!(object)
    end

    def type
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

    def timing
      object.assessment.timing
    end

    def assessment_category
      object.assessment.category
    end

    private

    def has_question_type(type)
      available_questions = object.assessment.questions.not_deleted.uniq { |q| q[:type] }

      available_questions.any? { |q| q[:type] == type }
    end
  end
end
