# frozen_string_literal: true

module Api
  module V2
    module Skill
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :skill
        schema Api::V2::Skill::Schema.create_request

        rule(data: { attributes: :name }) do
          project_id = values.dig(:data, :relationships, :project, :data, :id)

          key.failure(:already_added) if ::Skill.exists?(name: value, project_id: project_id)
        end
      end
    end
  end
end
