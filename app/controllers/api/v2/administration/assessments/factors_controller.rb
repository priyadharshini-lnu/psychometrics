# frozen_string_literal: true

module Api
  class V2::Administration::Assessments::FactorsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::Assessment::Factor::Schema
    def questions
      factor_ids = params.dig(:filter, :factor_ids)&.split(',')
      factor_scorings = FactorsScoring.where(assessment_id: params[:assessment_id], factor: factor_ids).
                        select(:question_id, :id, :props, :factor_id)
      grouped_by_question_id = factor_scorings.group_by(&:question_id)
      questions = Question.where(id: factor_scorings.pluck(:question_id)).
                  select(:id, :name, :props, :type).map do |question|
        question.attributes.merge(id: question.id.to_s, factors: grouped_by_question_id[question.id])
      end
      render json: json_api_records(questions, :factor_questions)
    end
  end
end
