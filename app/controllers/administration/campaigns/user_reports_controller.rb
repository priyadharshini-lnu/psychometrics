# frozen_string_literal: true

module Administration
  module Campaigns
    class UserReportsController < Administration::Projects::BaseController
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

      private

      def user_assessments_and_reports
        assessments = ActiveModelSerializers::SerializableResource.new(
          campaign_user.user_assessments.includes(:assessment, :users_result),
          each_serializer: Administration::UserAssessmentSerializer
        )
        reports = ActiveModelSerializers::SerializableResource.new(
          campaign_user.user_reports.includes(:report, :report_family),
          each_serializer: Administration::UserReportSerializer
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
