# frozen_string_literal: true

module Api
  class V2::Administration::QuestionsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::Question::Schema

    def copy
      new_name = params.dig(:data, :attributes, :name)
      owner_id = params.dig(:data, :relationships, :owner, :data, :id)
      audit! :copy, model,
             payload: { source_id: model.id, new_name: new_name, owner_id: owner_id }
      Questions::CopyQuestion.new(
        model.id,
        new_name: new_name,
        owner_id: owner_id
      ).on(:ok) do |new_question|
        jsonapi_render json: new_question
      end.on(:error) do |error|
        if error.is_a?(ActiveRecord::Base)
          jsonapi_render_errors error.errors
        else
          # error is question_id when RecordNotFound
          jsonapi_render_errors JSONAPI::Exceptions::RecordNotFound.new(error)
        end
      end.call
    end

    def toggle_status
      model.toggle!(:disabled)
      audit! :toggle_status, model, payload: { disabled: model.disabled }
      jsonapi_render json: model
    end
  end
end
