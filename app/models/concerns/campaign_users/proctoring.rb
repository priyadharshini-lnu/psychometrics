# frozen_string_literal: true

module CampaignUsers
  module Proctoring
    extend ActiveSupport::Concern

    included do
      has_many :proctoring_sessions, dependent: :destroy
    end

    def finish_proctoring_session
      proctoring_session = proctoring_sessions.last
      return unless proctoring_session

      Examus::FinishSession.call!(proctoring_session.session_id)
    end

    def all_proctored_assessments
      return UserAssessment.none unless proctoring_enabled?

      query = campaign_user_assessments.self_assessment.where(prework: false)
      query = query.where.not(assessment_id: workshop_assessment_ids) unless proctoring_enabled_on_workshop_activity?
      query
    end

    def remaining_proctoring_duration(proctoring_session = nil)
      return 0 unless campaign.fixed_time?
      return 0 unless real_expiry_date

      if proctoring_session&.started_at
        elapsed_seconds = Time.zone.now - proctoring_session.started_at
        remaining_seconds = [remaining_campaign_time - elapsed_seconds, 0].max
      else
        remaining_seconds = remaining_campaign_time
      end

      (remaining_seconds / 60.0).ceil
    end

    def all_proctored_assessments_completed?
      !all_proctored_assessments.pending_assessments.exists?
    end
  end
end
