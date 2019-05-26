module Threesixty
  class UsersReportsQuery < Rectify::Query
    def initialize(campaign, subjects, current_user)
      @campaign = campaign
      @options = campaign.option
      @current_user = current_user
      @subjects = subjects
      @subject = subjects.query.find_by(user_id: current_user.id)
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
            subject.released?
          else
            true
          end
        end
      end.map(&:user_id)
    end

    def is_available?
      return true if subject.released?
      if options.reports['availability']['report_available_to_subject_on_criteria']
        Threesixty::Reports::ReleaseConditionResolver.call!(@campaign, subject)
      else
        true
      end
    end

    def self_can_access?
      options.reports['access']['self_can_access']
    end

    def manager_can_see_subject_report?
      manager_can_access? || manager_approves_reports?
    end

    def manager_can_access?
      options.reports['access']['manager_can_access']
    end

    def manager_approves_reports?
      options.reports['approval']['manager_approves_reports']
    end

    def manager_cannot_see_report_until_requirements_are_met?
      options.reports['access']['manager_cannot_see_report_until_requirements_are_met']
    end

    attr_reader :subject, :subjects, :options, :current_user
  end
end
