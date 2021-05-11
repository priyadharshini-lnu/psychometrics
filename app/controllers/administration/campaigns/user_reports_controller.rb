# frozen_string_literal: true

module Administration
  module Campaigns
    class UserReportsController < Administration::Projects::BaseController
      include UserReports::PdfGeneration

      before_action :set_resource, only: %i[show destroy download pdf_preview toggle_user_access]

      def create
        form = ::Campaigns::UserReports::AddForm.from_params(resource_params)
        if form.valid?
          ::Campaigns::UserReports::Add.call(form, campaign_user) do
            on(:ok) { render json: user_assessments_and_reports }
            on(:error) { |errors| return render json: { errors: errors }, status: 422 }
          end
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def destroy
        resource.destroy!
        render json: resource.id
      end

      def regenerate
        AdminJob.call(:bulk_regenerate_user_reports, { ids: params[:ids], campaign_id: campaign.id }, current_user)

        head :ok
      end

      def toggle_user_access
        resource.toggle!(:user_access)
        head :ok
      end

      private

      def user_assessments_and_reports
        assessments = ActiveModelSerializers::SerializableResource.new(
          campaign_user.user_assessments.where(campaign: campaign).includes(:assessment, :users_result),
          each_serializer: Administration::UserAssessmentSerializer, current_user: current_user
        )
        reports = ActiveModelSerializers::SerializableResource.new(
          campaign_user.user_reports.where(campaign: campaign).includes(:report, :report_family),
          each_serializer: Administration::UserReportSerializer, current_user: current_user
        )
        { user_assessments: assessments, user_reports: reports }
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
