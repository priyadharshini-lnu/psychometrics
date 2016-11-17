module Administration
  module Translations
    class AssessmentsController < Administration::BaseController
      append_before_action :pundit_authorize

      def export
        data = JSON.parse(params[:data])
        xlsx = ::Exports::Translations::AssessmentExport.new(params[:assessment_id], data)
        send_data xlsx.render.to_stream.read, filename: 'translations.xlsx'
      end

      def import
        ::Imports::Translations::AssessmentImport.new(import_params)
      end

      private

      def import_params
        params.require(:import).permit(:file, :assessment_id)
      end

      # Authorisation user
      def pundit_authorize
        authorize @resource || @resource_class
      end
    end
  end
end
