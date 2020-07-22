# frozen_string_literal: true

module Threesixty
  class ReportsController < ApplicationController
    include AuthenticateByToken
    include ::Threesixty::InitialState
    layout 'layouts/end_user'
    before_action :set_campaign
    before_action :set_campaigns_users_report
    prepend_before_action :authenticate_by_token!, only: %i[show]
    initial_state_for %i[index show]

    def index
      respond_to do |format|
        format.html { render 'end_user/users/dashboard' }
      end
    end

    def show
      authorize @campaigns_users_report
      @campaigns_users_report.threesixty_subject.evaluation_status_completed!
      respond_to do |format|
        format.html { render 'end_user/users/dashboard' }
        format.json do
          results = Threesixty::Reports::ResultsForSubject.call!(@campaigns_users_report, current_user)
          piped_text_context = {
            subject: @campaigns_users_report.user,
            threesixty_campaign: @campaign
          }
          render json: @campaigns_users_report, report: @campaign.report,
                 options: @campaign.option, results: results,
                 piped_text_context: piped_text_context, threesixty_campaign: @campaign,
                 include: '**'
        end
        format.pdf do
          @data = ::Reports::PrepareDataForReport.call!(
            campaigns_users_report: @campaigns_users_report,
            locale: user_locale,
            current_user: current_user
          )

          render :export, formats: 'html', layout: 'pdf', content_type: 'text/html'
        end
      end
    end

    def update_status
      authorize @campaigns_users_report
      subject = @campaigns_users_report.threesixty_subject
      subject.update!(report_approval_status: params[:status])
      Threesixty::Emails::Send.
        call!(Threesixty::Emails::Name::SUBJECT_REPORT_READY, threesixty_campaign: @campaign, subject: subject)
      render json: { status: subject.report_approval_status }
    end

    def download
      authorize @campaigns_users_report
      subject = Threesixty::Subject.find_by!(
        campaign_id: @campaign.campaign_id, user_id: @campaigns_users_report.user_id
      )
      ::Threesixty::Reports::DownloadJob.perform_later(@campaign, current_user, subject, @campaigns_users_report,
                                                       lang: params[:lang])
      render json: { success: true }
    end

    private

    def set_campaigns_users_report
      @campaigns_users_report = CampaignsUsersReport.find_by!(
        id: params[:report_id] || params[:id], campaign_id: @campaign.campaign_id
      )
    end

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end
  end
end
