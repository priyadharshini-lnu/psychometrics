# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class ReportsController < Administration::ThreesixtyCampaigns::BaseController
      include AuthenticateByToken

      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show export download]
      prepend_before_action :authenticate_by_token!, only: %i[show]
      append_before_action :pundit_authorize

      def show
        @users_report = UsersReport.find_by!(campaign_id: threesixty_campaign.campaign_id, user_id: resource.user_id)
        set_available_translations(@users_report.report)
        @data = ::Reports::PrepareDataForReport.call!(
          users_report: @users_report,
          locale: user_locale,
          current_user: current_user
        )

        respond_to do |format|
          format.html {}
          format.pdf { render :export, formats: 'html', layout: 'pdf', content_type: 'text/html' }
        end
      end

      def download
        users_report = UsersReport.find_by!(campaign_id: threesixty_campaign.campaign_id, user_id: resource.user_id)
        options = { lang: params[:lang] }
        respond_to do |format|
          format.json do
            ::Threesixty::Reports::DownloadJob.perform_later(
              threesixty_campaign, current_user, resource, users_report, options
            )
            render json: { success: true }
          end
          format.pdf do
            add_cookie_for_file_download

            pdf_file = ::Threesixty::Reports::ExportReport.call!(
              current_user, threesixty_campaign, @_resource, users_report, options
            )
            send_file pdf_file, type: 'application/pdf'
          end
        end
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
        authorize %i[threesixty report]
      end

      def add_cookie_for_file_download
        cookies[:fileDownload] = true
      end

      def set_available_translations(report)
        @available_translations = Translation.available_translation_for_report(report.id, report.assessments.first)
      end
    end
  end
end
