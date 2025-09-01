# frozen_string_literal: true

module Api
  module V2
    module Administration
      class UserIdpSkillResource < Api::V2::Administration::BaseResource
        attributes :skill_id, :user_idp_plan_id, :name, :description, :skill_type, :private

        has_one :skill

        delegate :name, :description, :skill_type, to: :skill, allow_nil: true

        ransack_filters %i[user_idp_plan_id_eq private_eq]
      end
    end
  end
end
