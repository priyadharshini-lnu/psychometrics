# frozen_string_literal: true

module EndUser
  class CampaignsController < ApplicationController
    include ::Threesixty::InitialState
    include AuthenticateAnonymousUser
    layout 'layouts/end_user'

    prepend_before_action :authenticate_anonymous_user!
    before_action :set_campaign
    initial_state_for %i[show insights]

    def show
      respond_to do |format|
        format.html { render 'campaigns/show' }
        format.json do
          render json: ::EndUser::CampaignSerializer.new(@campaign, current_user: current_user, include: '**').to_h
        end
      end
    end

    def insights
      respond_to do |format|
        format.html { render 'campaigns/show' }
        format.json do
          dashboard = @campaign.campaign_reports.find_by(user_dashboard: true)
          if dashboard
            dashboard_report = @campaign.user_reports.find_by(user_id: current_user, report_id: dashboard.report_id)
            piped_text_context = { subject: dashboard_report.user }

            results = dashboard_report.user_results.map do |result|
              ::Reports::ResultSerializer.new(result, campaign: @campaign).to_h
            end.group_by { |result| result[:assessment_id] }

            user_dashboard = ::UserDashboardSerializer.new(dashboard_report, scope: current_user,
              report: dashboard_report.report, results: results,
              piped_text_context: piped_text_context).to_hash(include: '**')
          end
          user_reports = @campaign.user_reports.where(user_id: current_user, user_access: true)

          render json: {
            user_dashboard: user_dashboard,
            user_reports: user_reports.map { |user_repot| EndUser::UserReportSerializer.new(user_repot) }
          }
        end
      end
    end

    private

    def set_campaign
      campaign_ids = current_user.campaign_users.pluck(:campaign_id)
      @campaign = ::Campaign.visible_to_end_user.where(id: campaign_ids).find(params[:campaign_id] || params[:id])
    end
  end
end
