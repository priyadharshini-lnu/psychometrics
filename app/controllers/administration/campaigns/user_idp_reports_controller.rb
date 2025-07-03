# frozen_string_literal: true

module Administration
  module Campaigns
    class UserIdpReportsController < Administration::Campaigns::BaseController
      include AuthenticateByToken
      include UserReports::IdpReportGeneration

      before_action :set_resource, only: %i[show download pdf_preview]
      before_action :pundit_authorize

      def show
        Mobility.with_locale(params[:lang]) do
          @data = {
            template: IdpTemplateSerializer.new.serialize(resource.idp_template),
            user_idp: UserIdpPlanSerializer.new(
              context: {
                reflection_answers: user_reflection_question_answers
              }
            ).serialize(resource)
          }
        end
        respond_to do |format|
          format.json do
            render json: @data
          end
        end
      end

      def download
        options = {
          lang: selected_locale || resource.default_language,
          file_path: Settings.aws.s3.one_day_expiry_folder,
          notify_user: true,
          update_record: false,
          include_reflective_questions: allow_include_reflective_questions?
        }
        @result = ::UserReports::GenerateIdpReportPdf.call!(resource, current_user, options)
        audit! :download_idp_report, resource, campaign: resource.campaign,
          payload: params.merge(resource.details_to_log)
        respond_to do |format|
          format.html do
            if Settings.features.url_to_pdf_faas
              redirect_to "/admin/projects/#{resource.campaign.project_id}/new_campaigns/#{resource.campaign_id}/user_idp_reports/#{resource.id}?lang=#{params[:lang]}" # rubocop:disable Layout/LineLength
            else
              send_file @result[:file_path], type: 'application/pdf', disposition: 'attachment'
            end
          end

          format.json { head :ok }
        end
      end

      def user_reflection_question_answers
        resource.user_reflection_question_answers.group_by(&:reflection_question_id).transform_values do |answers|
          answers.map(&:answer).first
        end
      end

      private

      def allow_include_reflective_questions?
        current_user.superadmin? && params[:include_reflective_questions] == true
      end

      # rubocop:disable Naming/MemoizedInstanceVariableName
      def set_resource
        @_resource ||= UserIdpPlan.find_by(campaign_id: campaign.id, id: params[:id])
      end
      # rubocop:enable Naming/MemoizedInstanceVariableName
    end
  end
end
