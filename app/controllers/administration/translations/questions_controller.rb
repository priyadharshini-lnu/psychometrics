# frozen_string_literal: true

module Administration
  module Translations
    class QuestionsController < Administration::BaseController
      skip_before_action :enforce_geo_restriction
      append_before_action :pundit_authorize
      before_action :set_question

      def export
        data = JSON.parse(params[:data])
        xlsx = ::Exports::Translations::QuestionExport.call!(@question.id, data)
        send_data xlsx.to_stream.read, filename: 'question_translations.xlsx'
      end

      def import
        AdminJob.call(
          :import_question_translations,
          import_params.merge(resource_id: @question.id),
          current_user,
          params[:file]
        )
        head :ok
      end

      private

      def set_question
        @question = policy_scope(Question).find(params[:question_id])
      end

      def import_params
        params.permit(:file, :question_id)
      end

      # Authorisation user
      def pundit_authorize
        authorize :question_center
      end
    end
  end
end
