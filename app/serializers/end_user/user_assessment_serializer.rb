# frozen_string_literal: true

module EndUser
  class UserAssessmentSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :type, :url, :assessment_name, :questions_count, :timing, :assessment_category,
               :assessment_extra, :assessment_id, :status, :completion_percent, :need_confirm, :available_locales,
               :selected_locale, :assessment_icon_url

    def status
      object.real_status
    end

    def url
      UserAssessments::GetUrl.call!(object)
    end

    def type
      return 'hogan' if object.assessment.hogan?

      'user_assessment'
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

    def assessment_icon_url
      object.assessment.icon.thumb.url
    end

    def normalize_hogan_type(type)
      return 'Raw' if type == 'RAW'
      return 'Percentile' if type == 'percentile'

      raise "Not supported hogan type #{type}"
    end

    def completion_percent
      result = object.users_result
      return 100 if result.completed?

      return result.progress if result.progress.present?

      answered = result.answers&.size || 0
      total = object.assessment.questions&.size
      return 0 if total.nil? || total.zero?

      progress = (100 * answered) / total
      99 if progress > 99
      progress
    end

    def questions_count
      object.assessment.questions.count
    end

    def assessment_extra
      object.assessment.extra
    end

    def timing
      object.assessment.timing
    end

    def assessment_category
      object.assessment.category
    end

    def need_confirm
      object.campaign.project.privacy_consent && object.user.privacy_consent.nil?
    end
  end
end
