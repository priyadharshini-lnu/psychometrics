# frozen_string_literal: true

module Threesixty
  class ReportsController < ApplicationController
    include AuthenticateByToken
    include ::Threesixty::InitialState

    layout 'layouts/end_user'
    before_action :set_campaign
    before_action :set_user_report
    prepend_before_action :authenticate_by_token!, only: %i[show]
    before_action :load_campaign_report!, only: %i[show download]
    initial_state_for %i[index show]

    def index
      respond_to do |format|
        format.html { render 'end_user/users/dashboard' }
      end
    end

    # rubocop:disable Metrics/BlockLength
    def show
      authorize @user_report
      @user_report.threesixty_subject.evaluation_status_completed!
      respond_to do |format|
        format.html { render 'end_user/users/dashboard' }
        format.json do
          results = Threesixty::Reports::ResultsForSubject.call!(@user_report, current_user)
          piped_text_context = {
            subject: @user_report.user,
            threesixty_campaign: @campaign
          }
          render json: ::Threesixty::UserReportSerializer.new(
            context: {
              report: @user_report.report,
              results: results,
              piped_text_context: piped_text_context,
              current_option: @campaign.option,
              current_user: current_user,
              threesixty_campaign: @campaign,
              default_language: @campaign_report.effective_default_language,
              available_languages: @campaign_report.available_languages,
              lang: params[:lang] || @campaign_report.effective_default_language,
              user_results: @user_report.user_results(view_report_as: current_user)
            }
          ).serialize(@user_report)
        end
        format.pdf do
          @data = ::Reports::PrepareDataForReport.call!(
            user_report: @user_report,
            locale: @campaign_report.effective_default_language,
            current_user: current_user,
            lang: params[:lang]
          )
          @pdf_export = true
          audit! :download_report, @user_report, campaign: @campaign,
            payload: { user_email: @user_report.user.email }

          render :export, formats: :html, layout: 'pdf', content_type: 'text/html'
        end
      end
    end
    # rubocop:enable Metrics/BlockLength

    def update_status
      authorize @user_report
      subject = @user_report.threesixty_subject
      subject.update!(report_approval_status: params[:status])
      Threesixty::Emails::Send.
        call!(Threesixty::Emails::Name::SUBJECT_REPORT_READY, threesixty_campaign: @campaign, subject: subject)
      render json: { status: subject.report_approval_status }
    end

    def download
      authorize @user_report
      subject = Threesixty::Subject.find_by!(
        campaign_id: @campaign.campaign_id, user_id: @user_report.user_id
      )

      ::Threesixty::Reports::DownloadJob.
        perform_later(
          @campaign, current_user, subject, @user_report,
          lang: params[:lang] || @campaign_report.effective_default_language
        )
      render json: { success: true }
    end

    def check_report
      if @user_report.pdf_download_url(locale: params[:lang])
        render json: {
          type: 'success',
          message: I18n.t('jobs.threesixty.reports.download.message'),
          description: I18n.t(
            'jobs.threesixty.reports.download.description',
            url: @user_report.pdf_download_url(locale: params[:lang])
          )
        }
      else
        render json: nil
      end
    end

    private

    def set_user_report
      @user_report = UserReport.find_by!(
        id: params[:report_id] || params[:id], campaign_id: @campaign.campaign_id
      )
    end

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

    def load_campaign_report!
      @campaign_report = CampaignReport.includes(:report).find_by!(report_id: @campaign.report_id,
                                                                   campaign_id: @campaign.campaign_id)
    end

    def translated_report_request?
      params[:lang].present? && params[:lang] != @user_report.report.default_language
    end
  end
end
