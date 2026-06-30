# frozen_string_literal: true

module Assessors
  class UserReportsController < Assessors::BaseController
    include UserReports::PdfGeneration

    append_before_action :pundit_authorize
    before_action :set_resource, only: %i[show download pdf_preview]

    private

    def resource_class
      UserReport
    end

    def set_resource
      @_resource = policy_scope(resource_class).assessor_report_for_campaign(campaign.id).find(params[:id])
    end

    def campaign
      @campaign ||= current_user.assessors_campaigns.find(params[:campaign_id])
    end

    def view_report_as
      lead_assessor = Users::GetLeadAssessor.call!(campaign, resource.user)

      lead_assessor&.id == current_user.id ? :lead_assessor : :assessor
    end
  end
end
