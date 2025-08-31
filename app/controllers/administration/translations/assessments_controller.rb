# frozen_string_literal: true

module Administration
  module Translations
    class AssessmentsController < Administration::BaseController
      append_before_action :pundit_authorize
      before_action :set_assessment

      def new
        @_resource = ::Imports::Translations::AssessmentImport.new(resource_id: @assessment.id)
      end

      def export
        data = JSON.parse(params[:data])
        xlsx = ::Exports::Translations::AssessmentExport.new(@assessment.id, data)
        send_data xlsx.render.to_stream.read, filename: 'assessment_translations.xlsx'
      end

      def import
        form = ::Imports::Translations::AssessmentImport.new(
          resource_id: import_params[:resource_id], file: import_params[:file]
        )

        respond_to do |format|
          if form.valid?
            AdminJob.call(:import_assessment_translations,
                          { assessment_id: import_params[:resource_id] },
                          current_user,
                          import_params[:file])
            format.js
          else
            format.js { render :new, errors: form.errors.full_messages }
          end
        end
      end

      private

      def set_assessment
        @assessment = policy_scope(Assessment).find(params[:assessment_id])
      end

      def import_params
        params.require(:import).permit(:file, :resource_id)
      end

      # Authorisation user
      def pundit_authorize
        authorize :translation
      end
    end
  end
end
