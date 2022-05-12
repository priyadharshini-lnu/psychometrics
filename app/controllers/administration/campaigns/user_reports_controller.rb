# frozen_string_literal: true

module Administration
  module Campaigns
    class UserReportsController < Administration::Projects::BaseController
      include UserReports::PdfGeneration

      before_action :set_resource, only: %i[show approve destroy download pdf_preview toggle_user_access]

      def create
        form = ::Campaigns::UserReports::AddForm.from_params(resource_params)
        if form.valid?
          ::Campaigns::UserReports::Add.call(form, campaign_user) do
            on(:ok) do
              audit! :create, campaign_user, payload: params.permit!, campaign: campaign
              render json: campaign_user.user, serializer: Administration::UserDetailSerializer,
                campaign: campaign_user.campaign
            end
            on(:error) { |errors| return render json: { errors: errors }, status: 422 }
          end
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def destroy
        audit! :delete, resource, payload: resource.log_attribute_for_delete, campaign: resource.campaign
        resource.destroy!

        render json: resource.user, serializer: Administration::UserDetailSerializer, campaign: resource.campaign
      end

      def approve
        audit! :approve, resource, campaign: resource.campaign
        resource.update!(approved: true)
        head :ok
      end

      def regenerate
        AdminJob.call(:bulk_regenerate_user_reports, { ids: params[:ids], campaign_id: campaign.id }, current_user)
        audit! :regenerate_report, resource, payload: { ids: params[:ids], campaign_id: campaign.id },
               campaign: campaign

        head :ok
      end

      def toggle_user_access
        resource.toggle!(:user_access)
        audit! :toggle_user_access, resource, campaign: campaign
        head :ok
      end

      private

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          project_id: campaign.project_id
        )
      end

      def campaign_user
        CampaignUser.find_by!(campaign: campaign, user_id: params[:user_id])
      end

      def resource_class
        UserReport
      end
    end
  end
end
