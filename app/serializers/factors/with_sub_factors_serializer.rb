# frozen_string_literal: true

module Factors
  class WithSubFactorsSerializer < Panko::Serializer
    attributes :id, :name, :code, :parent_id, :question_ids, :description, :icon, :alias, :scoring_strategy,
               :skill_type, :job_roles
    has_many :factors_sub_factors, each_serializer: FactorsSubFactorSerializer

    def icon
      object.icon.url
    end

    def question_ids
      context.dig(:question_ids, object.id) || []
    end

    def alias
      return if context[:alias].blank?

      context[:alias][object.id]&.first&.name
    end

    def skill_type
      object.skill&.skill_type
    end

    def campaign_user
      context[:campaign_user]
    end

    def job_roles
      return {} unless object.skill && campaign_user

      skill_job_roles = object.skill.skills_job_roles

      current_job_role = skill_job_roles.find { |sjr| sjr.job_role_id == campaign_user.current_job_role_id }
      target_job_role = skill_job_roles.find { |sjr| sjr.job_role_id == campaign_user.target_job_role_id }

      {
        current_job_role: {
          included: current_job_role.present?,
          expected_proficiency: current_job_role&.expected_proficiency_level
        },
        target_job_role: {
          included: target_job_role.present?,
          expected_proficiency: target_job_role&.expected_proficiency_level
        }
      }
    end
  end
end
