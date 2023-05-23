# frozen_string_literal: true

module Api
  module V1
    class ReportsController < Api::V1::BaseController
      before_action :ensure_campaign, except: %i[dimensions]
      before_action :set_user_report, only: %i[update results pdf]
      before_action :pundit_authorize
      skip_before_action :ensure_project, :pundit_authorize, only: [:dimensions]

      def index
        user_reports = UserReport.where(user: user, campaign: @campaign.id).includes(:report)
        user_assessments = UserAssessment.where(subject_id: user.id, evaluator_id: user.id, campaign_id: @campaign.id).
                           joins(:users_result, :assessment).
                           index_by(&:assessment_id)

        render json: user_reports.includes(report: :modules).
          map { |r| Api::V1::UserReportSerializer.new(r, user_assessments: user_assessments).to_h }
      end

      def results
        unless @user_report
          raise Api::Errors::ResourceNotFound,
                "Report ID: #{params[:id]} not found for user in Campaign: #{@campaign.id}."
        end

        unless @user_report.all_assessments_are_completed?
          raise Api::Errors::AssessmentsNotCompleted, "Assessments for report #{report.id} are not completed"
        end

        if @user_report.report.data_only? && report_user_results.length.zero?
          raise Api::Errors::AssessmentsNotCompleted, "Assessments for report #{report.id} are not completed"
        end

        if @user_report.report.data_configuration.empty?
          raise Api::Errors::ResourceNotConfigured, no_config_message(params[:id])
        end

        render json: Api::V1::ResultSerializer.new(::Reports::BuildResults.call!(report, user_report_results),
                                                   user_report: @user_report).to_h
      end

      def pdf
        raise Api::Errors::ResourceNotFound, "Report with id=#{params[:id]} was not found" unless @user_report

        render json: {
          url: @user_report.pdf&.url,
          status: @user_report.decorate.api_status,
          campaign_id: @user_report.campaign_id
        }
      end

      def dimensions
        report = current_user.available_client_admin_reports.eager_load(:dimensions).find_by(id: params[:id])
        raise Api::Errors::ResourceNotFound, "Report with id #{params[:id]} was not found." unless report
        raise Api::Errors::ResourceNotConfigured, no_config_message(params[:id]) if report.data_configuration.blank?

        render json: report,
               include: '**',
               serializer: Api::V1::ReportDimensionsSerializer,
          **serialization_params.merge(report: report)
      end

      def report
        @report ||=
          begin
            r = Report.enabled.find_by(id: params[:id])
            raise Api::Errors::ResourceNotFound, "Report with id=#{params[:id]} was not found" unless r

            # TODO: (atanych): report should be directly checked with user membership
            r
          end
      end

      def update
        @user_report.update!(user_report_params)
        audit! :api_update, @user_report, payload: params, campaign: @user_report.campaign
        user_assessments = UserAssessment.where(subject_id: user.id, evaluator_id: user.id, campaign_id: campaign_id).
                           joins(:users_result, :assessment).
                           index_by(&:assessment_id)
        render json: @user_report, user_assessments: user_assessments, serializer: Api::V1::UserReportSerializer
      end

      private

      def user_report_results
        @user_report.report.assessment_ids.present? ? @user_report.user_results : report_user_results
      end

      def report_user_results
        @report_user_results ||= begin
          user_result_ids = user.self_user_assessments.completed.where(
            campaign_id: campaign_id, assessment_id: @user_report.report.data_configuration_assessment_ids
          ).pluck(:users_result_id)
          ::UsersResult.where(id: user_result_ids)
        end
      end

      def pundit_authorize
        authorize(
          @user_report || UserReport,
          nil,
          policy_class: ::Administration::UserReportPolicy,
          project_id: project.id
        )
      end

      def set_user_report
        @user_report = UserReport.find_by(user: user, campaign_id: campaign_id, report_id: params[:id])
        unless @user_report
          raise Api::Errors::ResourceNotFound,
                "Report with id=#{params[:id]} was not found for User id=#{user.id}"
        end
      end

      def campaign_id
        @campaign.id
      end

      def serialization_params
        params.permit(:include_factors, :include_occupations, :report, :since).to_h.symbolize_keys
      end

      def user_report_params
        params.permit(:user_access)
      end

      def no_config_message(report_id)
        "Report with id #{report_id} doesn't have data configuration."
      end
    end
  end
end
