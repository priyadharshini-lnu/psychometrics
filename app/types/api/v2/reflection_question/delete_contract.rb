# frozen_string_literal: true

module Api
  module V2
    module ReflectionQuestion
      class DeleteContract < Api::Base::Contract
        schema do
          required(:id).filled(:string)
        end

        rule(:id) do
          key.failure(:cant_be_deleted) if IdpTemplateReflectionQuestion.exists?(reflection_question_id: value)
        end
      end
    end
  end
end
