# frozen_string_literal: true

module Administration
  class CampaignReportPolicy < BasePolicy
    def report_families?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
    end

    def assessments_and_reports?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
    end
  end
end
