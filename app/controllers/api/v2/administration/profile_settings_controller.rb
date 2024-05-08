# frozen_string_literal: true

module Api
  class V2::Administration::ProfileSettingsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::ProfileSetting::Schema

    AWAILABLE_TYPES = %i[MultipleChoice TextEntry].freeze

    private

    def base_response_meta
      return {} if params[:action] != 'index'

      {
        field_questions: Panko::ArraySerializer.new(
          Question.where(view: 'templates').
          where(owner_id: [nil, Client.find(params['filter']['project_id_eq']).parent.id]).
          where(type: AWAILABLE_TYPES),
          each_serializer: QuestionFieldSerializer
        )
      }
    end
  end
end
