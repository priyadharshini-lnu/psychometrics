# frozen_string_literal: true

module Idp
  module IdpPlan
    class AvailableSkillsQuery < Rectify::Query
      private_attr_reader :user_idp_plan, :campaign_user, :idp_template

      def initialize(user_idp_plan)
        @user_idp_plan = user_idp_plan
        @campaign_user = user_idp_plan.campaign_user
        @idp_template = user_idp_plan.idp_template
      end

      def query
        ::Skill.where(skills_table[:id].in(combined_skill_ids_arel)).
          excluding_plan(plan_id: user_idp_plan.id)
      end

      private

      def combined_skill_ids_arel
        if both_job_roles_present?
          job_role_skill_ids_arel
        elsif any_job_role_present?
          Arel::Nodes::Union.new(job_role_skill_ids_arel, template_skill_ids_arel)
        else
          template_skill_ids_arel
        end
      end

      def job_role_skill_ids_arel
        ::SkillsJobRole.where(job_role_id: job_role_ids).
          select(:skill_id).
          arel
      end

      def template_skill_ids_arel
        idp_template.available_skills(plan_id: user_idp_plan.id).
          select(:id).
          arel
      end

      def skills_table
        @skills_table ||= ::Skill.arel_table
      end

      def job_role_ids
        @job_role_ids ||= [
          campaign_user.current_job_role_id,
          campaign_user.target_job_role_id
        ].compact
      end

      def both_job_roles_present?
        job_role_ids.length == 2
      end

      def any_job_role_present?
        job_role_ids.any?
      end
    end
  end
end
