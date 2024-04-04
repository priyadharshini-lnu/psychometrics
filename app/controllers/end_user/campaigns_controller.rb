# frozen_string_literal: true

module EndUser
  class CampaignsController < ApplicationController
    include ::Threesixty::InitialState
    include AuthenticateAnonymousUser
    layout 'layouts/end_user'

    prepend_before_action :authenticate_anonymous_user!
    before_action :set_campaign, except: %i[join_with_code join_with_token]
    initial_state_for %i[show insights]

    def show
      return redirect_to dashboard_path unless %(active closed).include?(@campaign.status)

      campaign_user = current_user.campaign_users.find_by(campaign_id: @campaign.id)
      return redirect_to dashboard_path unless campaign_user.schedule_started?

      respond_to do |format|
        format.html { render 'campaigns/show' }
        format.json do
          render json: ::EndUser::CampaignSerializer.new(
            context: { current_user: current_user,
                       include: '**' }
          ).serialize(@campaign)
        end
      end
    end

    def insights
      respond_to do |format|
        format.html { render 'campaigns/show' }
        format.json do
          campaign_dashboard_report = @campaign.campaign_reports.find_by(user_dashboard: true)
          if campaign_dashboard_report
            user_dashboard_report = @campaign.user_reports.find_by(
              user_id: current_user, report_id: campaign_dashboard_report.report_id, user_access: true
            )
          end
          if user_dashboard_report
            piped_text_context = { subject: user_dashboard_report.user }

            results = user_dashboard_report.user_results.map do |result|
              ::Reports::ResultSerializer.new(result, campaign: @campaign).to_h
            end.group_by { |result| result[:assessment_id] }

            user_dashboard = ::UserDashboardSerializer.new(user_dashboard_report, scope: current_user,
              report: user_dashboard_report.report, results: results,
              piped_text_context: piped_text_context).to_hash(include: '**')
          end
          user_reports = @campaign.user_reports.where(user_id: current_user, user_access: true).filter_map do |ur|
            unless ur == user_dashboard_report
              ::EndUser::UserReportSerializer.new(context: { user_report: ur }).serialize(ur)
            end
          end

          render json: { user_dashboard: user_dashboard, user_reports: user_reports }
        end
      end
    end

    def join_with_code
      registration_code = @current_project.project_registration_codes.find_by(code: params[:code])
      unless registration_code
        flash[:alert] = I18n.t('registration_code.invalid_code')
        redirect_to('/') and return
      end

      campaign = registration_code.campaign

      Campaigns::Users::JoinCampaign.call(current_user, campaign, registration_code) do
        on(:ok) { redirect_to campaign_path(campaign) }
        on(:error) do |message|
          flash[:alert] = message
          redirect_to('/')
        end
      end
    end

    def join_with_token
      data = ::Campaigns::JwtTokenizer.decode(params[:token])

      Campaigns::Users::JoinCampaignWithToken.call(current_user, @current_project, data) do
        on(:ok) { redirect_to campaign_path(campaign) }
        on(:error) do |message|
          flash[:alert] = message
          redirect_to('/')
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
