# frozen_string_literal: true

module Api
  class V2::Administration::Projects::InterviewQuestionsController < Api::V2::Administration::BaseController
    validate_crud_requests V2::InterviewQuestion::Schema
    validates_request_schema :destroy, -> { Api::V2::InterviewQuestion::DeleteContract.new }

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Administration::InterviewQuestionPolicy,
            context[:user],
            @model,
            %w[
              index
              export
              import
            ],
            { project_id: context[:project_id] }
          )
        }
      }
    end

    def import
      form = ::InterviewQuestions::ImportForm.new(
        file: params[:file]
      )

      if form.valid?
        AdminJob.call(
          :import_interview_questions,
          { project_id: project.id },
          current_user,
          form.file
        )

        render json: :ok
      else
        render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def export
      AdminJob.call(
        :export_interview_questions,
        { project_id: project.id },
        current_user
      )

      render json: :ok
    end

    def project_id
      params[:project_id] || project&.id || params.dig(:filter, :project_id_eq)
    end
  end
end
