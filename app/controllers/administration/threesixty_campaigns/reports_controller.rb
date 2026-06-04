# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class ReportsController < Administration::ThreesixtyCampaigns::BaseController
      include AuthenticateByToken

      prepend_before_action :set_resource_class
      before_action :load_available_languages, only: %i[show]
      before_action :set_resource, only: %i[show export download regenerate]
      prepend_before_action :authenticate_by_token!, only: %i[show]
      append_before_action :pundit_authorize

      def show
        @user_report = UserReport.find_by!(
          campaign_id: threesixty_campaign.campaign_id, user_id: resource.user_id
        )
        set_available_translations(@user_report.report)
        @data = ::Reports::PrepareDataForReport.call!(
          user_report: @user_report,
          locale: campaign_report.effective_default_language,
          current_user: current_user,
          lang: params[:lang]
        )

        respond_to do |format|
          format.html do
            audit! :view_report, @user_report, campaign: threesixty_campaign.campaign,
              payload: params.merge(@user_report.details_to_log)
          end
          format.pdf do
            selected_locale = params[:lang] || @user_report.report.default_language
            I18n.locale = selected_locale
            @pdf_export = true

            render :export, formats: :html, layout: 'pdf', content_type: 'text/html'
          end
        end
      end

      def download
        user_report = UserReport.find_by!(
          campaign_id: threesixty_campaign.campaign_id, user_id: resource.user_id
        )
        options = {
          lang: params[:lang] || campaign_report.effective_default_language,
          file_path: Settings.aws.s3.one_day_expiry_folder,
          notify_user: true,
          update_record: false,
          skip_logic: params[:skip_logic]
        }
        respond_to do |format|
          format.json do
            ::Threesixty::Reports::DownloadJob.perform_later(
              threesixty_campaign, current_user, resource, user_report, options
            )
            render json: { success: true }
          end
          format.pdf do
            add_cookie_for_file_download
            data = ::UserReports::GeneratePdf.call!(user_report, current_user, options)
            send_tmp_file data[:file_path], type: 'application/pdf'
          end
        end
      end

      def regenerate
        AdminJob.call(
          :regenerate_threesixty_report, {
            subject_id: resource.id,
            threesixty_campaign_id: threesixty_campaign.id,
            locales: params[:selected_locales],
            force_regenerate: params[:force_regenerate]
          }, current_user
        )
        render json: :ok
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Subject # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def set_resource
        @_resource = policy_scope(resource_class).find(params[:subject_id])
      end

      def pundit_authorize
        authorize %i[threesixty report], nil, {
          threesixty_campaign: threesixty_campaign,
          project_id: params[:project_id] || threesixty_campaign&.campaign&.project_id
        }
      end

      def add_cookie_for_file_download
        cookies[:fileDownload] = true
      end

      def set_available_translations(report)
        @available_translations = Translation.available_translation_for_report(report.id, report.assessments.first)
      end

      def load_available_languages
        @available_languages = [campaign_report.effective_default_language] + campaign_report.available_languages
      end

      def campaign_report
        @campaign_report ||= CampaignReport.includes(:report).find_by!(report_id: threesixty_campaign.report_id,
                                                                       campaign_id: threesixty_campaign.campaign_id)
      end
    end
  end
end
