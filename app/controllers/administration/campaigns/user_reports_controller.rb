# frozen_string_literal: true

module Administration
  module Campaigns
    class UserReportsController < Administration::Projects::BaseController
      include AuthenticateByToken

      prepend_before_action :authenticate_by_token!, only: %i[pdf_preview]
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

      def show
        @available_translations = ::Translation.available_translation_for_report(resource.id, nil)
        @selected_locale = params[:lang] || resource.report.default_language

        respond_to do |format|
          format.html { render 'administration/projects/new_campaigns/index' }

          format.json do
            render json: resource, report: resource.report,
                  results: UserReports::GroupedResultsByAssessment.call!(resource),
                  piped_text_context: {},
                  user_results: resource.user_results,
                  serializer: ::UserReportSerializer,
                  include: '**'
          end
        end
      end

      # This action is used to generate pdf by puppeter
      def pdf_preview
        selected_locale = params[:lang] || resource.report.default_language

        @data = ::UserReports::PrepareDataForReportPreview.call!(resource, locale: selected_locale)

        render 'shared/preview_report', layout: 'pdf'
      end

      def download
        options = { lang: params[:lang] }
        respond_to do |format|
          format.pdf do
            file_path = ::UserReports::GeneratePdf.call!(resource, current_user, options)

            send_file file_path, type: 'application/pdf'
          end
        end
      end

      def regenerate
        user_report_ids = campaign.user_reports.where(id: params[:ids]).pluck(:id)
        ::UserReports::GenerateAndSavePdfJob.perform_later(user_report_ids, current_user)

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
          each_serializer: Administration::UserAssessmentSerializer
        )
        reports = ActiveModelSerializers::SerializableResource.new(
          campaign_user.user_reports.where(campaign: campaign).includes(:report, :report_family),
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
