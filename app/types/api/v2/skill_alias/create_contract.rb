# frozen_string_literal: true

module Api
  module V2
    module SkillAlias
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :skill_alias
        schema Api::V2::SkillAlias::Schema.create_request

        rule(data: { attributes: :name }) do
          skill_alias = ::SkillAlias.exists?(name: value)
          key.failure(:unique_alias) if skill_alias
        end

        rule(data: { attributes: :skill_id }) do
          skill_alias = ::SkillAlias.exists?(skill_id: value)
          key.failure(:unique_skill) if skill_alias
        end
      end
    end
  end
end
