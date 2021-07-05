# frozen_string_literal: true

module Api
  module V1
    class ReportsController < Api::V1::BaseController
      def index
        user_reports = UserReport.where(user: user, campaign: campaign_id).includes(:report)
        user_assessments = UserAssessment.where(subject_id: user.id, evaluator_id: user.id, campaign_id: campaign_id).
                           joins(:users_result, :assessment).
                           index_by(&:assessment_id)

        render json: user_reports.
          map { |r| Api::V1::UserReportSerializer.new(r, user_assessments: user_assessments).to_h }
      end

      def results
        user_report = UserReport.find_by(user: user, campaign_id: campaign_id, report_id: params[:id])
        results = user_report.user_results

        if results.blank?
          raise Errors::Api::AssessmentIsNotPassedError, "Assessments for report #{report.id} are not completed"
        end

        render json: Api::V1::ResultSerializer.new(::Reports::BuildResults.call!(report, results),
                                                   user_report: user_report).to_h
      end

      def pdf
        user_report = UserReport.find_by(user: user, campaign_id: campaign_id, report_id: params[:id])
        raise Errors::Api::ResourceNotFoundError, "Report with id=#{params[:id]} was not found" unless user_report

        render json: {
          url: user_report.pdf&.url,
          status: user_report.decorate.api_status,
          campaign_id: user_report.campaign_id
        }
      end

      def dimensions
        report = current_user.available_client_admin_reports.eager_load(:dimensions).find_by(id: params[:id])
        raise Errors::Api::ResourceNotFoundError, "Report with id #{params[:id]} was not found." unless report
        if report.data_configuration.blank?
          raise Errors::Api::ResourceNotConfiguredError, no_config_message(params[:id])
        end

        render json: report,
          include: '**',
          serializer: Api::V1::ReportDimensionsSerializer,
          **serialization_params.merge(report: report)
      end

      def report
        @report ||=
          begin
            r = Report.enabled.find_by(id: params[:id])
            raise Errors::Api::ResourceNotFoundError, "Report with id=#{params[:id]} was not found" unless r

            # TODO: (atanych): report should be directly checked with user membership
            r
          end
      end

      private

      def campaign_id
        @campaign_id ||= params[:campaign_id] || user.campaigns.last.id
      end

      def serialization_params
        params.permit(:include_factors, :include_occupations, :report, :since).to_h.symbolize_keys
      end

      def no_config_message(report_id)
        "Report with id #{report_id} doesn't have data configuration."
      end
    end
  end
end
