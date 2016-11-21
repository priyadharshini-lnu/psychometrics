module Administration
  module Translations
    class ReportsController < Administration::BaseController
      append_before_action :pundit_authorize
      before_action :set_report

      def new
        @resource = ::Imports::Translations::ReportImport.new(report_id: @report.id)
      end

      def export
        data = JSON.parse(params[:data])
        xlsx = ::Exports::Translations::ReportExport.new(@report.id, data)
        send_data xlsx.render.to_stream.read, filename: 'report_translations.xlsx'
      end

      def import
        @resource = ::Imports::Translations::ReportImport.new(import_params)
        respond_to do |format|
          if @resource.process!
            format.js
          else
            format.js { render :new }
          end
        end
      end

      private

      def set_report
        @report = policy_scope(Report).find(params[:report_id])
      end

      def import_params
        params.require(:import).permit(:file, :report_id)
      end

      # Authorisation user
      def pundit_authorize
        authorize :translation
      end
    end
  end
end
