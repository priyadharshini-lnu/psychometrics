module Threesixty
  class UsersReportsQuery < Rectify::Query
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
      ids << current_user.id if self_can_access? && is_available?
      ids.concat(manager_subjects_ids) if manager_can_see_subject_report?
      ids
    end

    def manager_subjects_ids
      @subjects.select do |subject|
        if subject.user_id != current_user.id
          if manager_cannot_see_report_until_requirements_are_met?
            subject.report_status_released?
          else
            true
          end
        end
      end.map(&:user_id)
    end

    def is_available?
      return false unless subject
      if subject.report_status_released? || !report_available_to_subject_on_criteria?
        return true
      end
      Threesixty::Reports::ResolveReleaseCondition.call!(@campaign, subject)
    end

    def self_can_access?
      options.reports.dig('access', 'self_can_access')
    end

    def manager_can_see_subject_report?
      manager_can_access? || manager_approves_reports?
    end

    def report_available_to_subject_on_criteria?
      options.reports.dig('availability', 'report_available_to_subject_on_criteria')
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
