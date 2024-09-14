# frozen_string_literal: true

module Api
  module V2
    module SkillAlias
      class UpdateContract < Api::Base::Contract
        config.messages.namespace = :skill_alias
        schema Api::V2::SkillAlias::Schema.update_request

        rule(data: { attributes: :name }) do
          key.failure(:unique_alias) if alias_changed_and_exists?(value, _context)
        end

        rule(data: { attributes: :skill_id }) do
          key.failure(:unique_skill) if skill_id_changed_and_exists?(value, _context)
        end

        private

        def alias_changed_and_exists?(name, context)
          skill_alias_id = context[:params][:id]
          existing_skill = ::SkillAlias.find(skill_alias_id)
          if existing_skill.name == name
            false
          else
            ::SkillAlias.exists?(name: name)
          end
        end

        def skill_id_changed_and_exists?(new_skill_id, context)
          skill_alias_id = context[:params][:id]
          existing_skill = ::SkillAlias.find(skill_alias_id)
          if existing_skill.skill_id.to_s == new_skill_id
            false
          else
            ::SkillAlias.exists?(skill_id: new_skill_id)
          end
        end
      end
    end
  end
end
