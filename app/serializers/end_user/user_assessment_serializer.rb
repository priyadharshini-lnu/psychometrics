# frozen_string_literal: true

module EndUser
  class UserAssessmentSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers

    attributes :id, :type, :url, :assessment_name, :timing, :assessment_category, :completed_at,
               :assessment_extra, :assessment_id, :status, :completion_percent, :completion_reason, :available_locales,
               :selected_locale, :assessment_icon_url, :prework, :schedule_time, :workshop_activity_duration,
               :workshop_activity, :meeting_time, :meeting_link, :require_scheduling, :evaluation_session_id,
               :caching_enabled, :proctoring_enabled, :is_timed, :fixed_time_duration

    def evaluation_session_id
      'session_id'
    end

    def meeting_link
      object.real_meeting_link(current_user)
    end

    def meeting_time
      object.linked_assessor_user_assessment&.schedule_time&.iso8601
    end

    def status
      object.real_status
    end

    def url
      UserAssessments::GetUrl.call!(object)
    end

    def type
      return 'hogan' if object.assessment.hogan?
      return 'microsite' if object.assessment.microsite? && !Settings.microsite.internal_assessment_enabled

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
      object.assessment.icon_url(:thumb)
    end

    def normalize_hogan_type(type)
      return 'Raw' if type == 'RAW'
      return 'Percentile' if type == 'percentile'

      raise "Not supported hogan type #{type}"
    end

    # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    def completion_percent
      result = object.users_result
      return 0 unless result
      return 100 if completed_without_timed_out?(result)

      return result.progress == 100 ? 99 : result.progress if result.progress.present?

      answered = result.answers&.size || 0
      total = object.assessment.questions&.size
      return 0 if total.nil? || total.zero?

      progress = (100 * answered) / total
      return 99 if progress > 99

      progress
    end
    # rubocop:enable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity

    def assessment_extra
      object.assessment.extra
    end

    def proctoring_enabled
      object.proctoring_enabled?
    end

    def is_timed
      !!object.assessment.fixed_timed?
    end

    def fixed_time_duration
      object.assessment.extra&.[]('timer').to_i if object.assessment.fixed_timed?
    end

    def timing
      object.assessment.timing
    end

    def assessment_category
      object.assessment.category
    end

    def schedule_time
      object.schedule_time&.iso8601
    end

    def completed_at
      object.completed_at&.iso8601
    end

    def caching_enabled
      object.campaign_assessment&.caching_enabled
    end

    private

    def current_user
      context[:current_user]
    end

    def completed_without_timed_out?(result)
      result.deemed_completed? && !result.timed_out?
    end
  end
end
