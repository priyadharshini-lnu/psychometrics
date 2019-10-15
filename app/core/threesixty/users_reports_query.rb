# frozen_string_literal: true

module Threesixty
  class UsersReportsQuery < Rectify::Query
    AVAILABLE_STATUSES = [
      Threesixty::Participants::GetReportStatus::APPROVED,
      Threesixty::Participants::GetReportStatus::AVAILABLE
    ].freeze

    def initialize(campaign, managed_subjects, current_user)
      @campaign = campaign
      @options = campaign.option
      @current_user = current_user
      @subjects = managed_subjects
      @subject = @campaign.subjects.find_by(user_id: current_user.id)
    end

    def query
      UsersReport.where(campaign_id: @campaign.campaign_id, user_id: user_ids)
    end

    private

    def user_ids
      ids = []
      ids << current_user.id if self_can_access? && available?
      ids.concat(manager_subjects_ids) if manager_can_see_subject_report?
      ids
    end

    def manager_subjects_ids
      @subjects.select do |subject|
        if subject.user_id != current_user.id
          if manager_cannot_see_report_until_requirements_are_met?
            subject_report_available_for_manager?(subject)
          else
            true
          end
        end
      end.map(&:user_id)
    end

    def available?
      return false unless subject

      subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
        [subject.user_id],
        @campaign
      ).dig(subject.user_id, :completed) || {}

      status = Threesixty::Participants::GetReportStatus.call!(
        subject,
        @options,
        subject_evaluator_counters
      )

      AVAILABLE_STATUSES.include?(status)
    end

    def subject_report_available_for_manager?(subject)
      Threesixty::Reports::ResolveReleaseCondition.call!(
        subject,
        @options,
        subject_evaluator_counters.dig(subject.user_id, :completed) || {}
      )
    end

    def subject_evaluator_counters
      user_ids = @subjects.pluck(:user_id)
      user_ids = user_ids.push(subject.user_id) if subject

      @subject_evaluator_counters ||= ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
        user_ids,
        @campaign
      )
    end

    def self_can_access?
      options.reports.dig('access', 'self_can_access')
    end

    def manager_can_see_subject_report?
      manager_can_access? || manager_approves_reports?
    end

    def manager_can_access?
      options.reports.dig('access', 'manager_can_access')
    end

    def manager_approves_reports?
      options.reports.dig('approval', 'manager_approves_reports')
    end

    def manager_cannot_see_report_until_requirements_are_met?
      options.reports.dig('access', 'manager_cannot_see_report_until_requirements_are_met')
    end

    attr_reader :subject, :subjects, :options, :current_user
  end
end
