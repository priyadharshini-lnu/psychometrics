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
        users_report = UsersReport.find_by!(campaign_id: threesixty_campaign.campaign_id, user_id: resource.user_id)

        @data = ::Reports::PrepareDataForReport.call!({
          users_report: users_report,
          locale: user_locale,
          current_user: current_user
        })

        respond_to do |format|
          format.html { }
          format.pdf { render :export, formats: 'html', layout: 'pdf', content_type: 'text/html' }
        end
      end

      def download
        users_report = UsersReport.find_by!(campaign_id: threesixty_campaign.campaign_id, user_id: resource.user_id)
        ::Threesixty::Reports::DownloadJob.perform_later(threesixty_campaign, current_user, resource, users_report)

        render json: { success: true }
      end

      private

      # Set model
      def set_resource_class
        @_resource_class ||= ::Threesixty::Subject
      end

      def set_resource
        @_resource = policy_scope(resource_class).find(params[:subject_id])
      end

      def pundit_authorize
        authorize [:threesixty, :report]
      end
    end
  end
end
