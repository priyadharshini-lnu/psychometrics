# frozen_string_literal: true

module Administration
  module Campaigns
    class UserIdpReportsController < Administration::Campaigns::BaseController
      include AuthenticateByToken

      before_action :set_resource, only: %i[show download pdf_preview]
      before_action :pundit_authorize
      prepend_before_action :authenticate_by_token!, only: %i[pdf_preview]

      def show
        @selected_locale = params[:lang]
        @data = {
          template: IdpTemplateSerializer.new.serialize(resource.idp_template),
          user_idp: UserIdpPlanSerializer.new.serialize(resource)
        }
        respond_to do |format|
          format.json do
            render json: @data
          end
        end
      end

      def download
        options = {
          lang: params[:lang],
          file_path: Settings.aws.s3.one_day_expiry_folder,
          async: true,
          notify_user: true,
          update_record: false
        }
        data = ::UserReports::GenerateIdpReportPdf.call!(resource, current_user, options)
        audit! :download_idp_report, resource, campaign: resource.campaign,
          payload: params.merge(resource.details_to_log)

        respond_to do |format|
          format.pdf do
            send_tmp_file data[:file_path], type: 'application/pdf'
          end

          format.json { head :ok }
        end
      end

      # This action is used to generate pdf by puppeter
      def pdf_preview
        @selected_locale = params[:lang]
        @data = {
          template: IdpTemplateSerializer.new.serialize(resource.idp_template),
          user_idp: UserIdpPlanSerializer.new.serialize(resource)
        }
        @pdf_export = true

        render 'administration/campaigns/user_idp_reports/idp_report', layout: 'pdf'
      end

      # rubocop:disable Naming/MemoizedInstanceVariableName
      def set_resource
        @_resource ||= UserIdpPlan.find_by(campaign_id: campaign.id, id: params[:id])
      end
      # rubocop:enable Naming/MemoizedInstanceVariableName
    end
  end
end
