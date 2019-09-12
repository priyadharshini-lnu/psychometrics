# frozen_string_literal: true

module Administration
  module Translations
    class AssessmentsController < Administration::BaseController
      append_before_action :pundit_authorize
      before_action :set_assessment

      def new
        @_resource = ::Imports::Translations::AssessmentImport.new(assessment_id: @assessment.id)
      end

      def export
        data = JSON.parse(params[:data])
        xlsx = ::Exports::Translations::AssessmentExport.new(@assessment.id, data)
        send_data xlsx.render.to_stream.read, filename: 'assessment_translations.xlsx'
      end

      def import
        @_resource = ::Imports::Translations::AssessmentImport.new(import_params)
        respond_to do |format|
          if resource.process!
            format.js
          else
            format.js { render :new }
          end
        end
      end

      private

      def set_assessment
        @assessment = policy_scope(Assessment).find(params[:assessment_id])
      end

      def import_params
        params.require(:import).permit(:file, :assessment_id)
      end

      # Authorisation user
      def pundit_authorize
        authorize :translation
      end
    end
  end
end
