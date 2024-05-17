# frozen_string_literal: true

module Administration
  module Translations
    class ReportsController < Administration::BaseController
      append_before_action :pundit_authorize
      before_action :set_report

      def new
        @_resource = ::Imports::Translations::ReportImport.new(report_id: @report.id)
      end

      def export
        data = JSON.parse(params[:data])
        xlsx = ::Exports::Translations::ReportExport.new(@report.id, data)
        send_data xlsx.render.to_stream.read, filename: 'report_translations.xlsx'
      end

      def import
        @_resource = ::Imports::Translations::ReportImport.new(import_params)

        if resource.process!
          render json: { success: true }
        else
          render json: { errors: resource.errors.messages }, status: 422
        end
      end

      private

      def set_report
        @report = policy_scope(Report).find(params[:report_id])
      end

      def import_params
        params.permit(:file, :report_id)
      end

      # Authorisation user
      def pundit_authorize
        authorize :translation
      end
    end
  end
end
