# frozen_string_literal: true

module Idp
  class SaveUserIdpSkills < BaseCommand
    private_attr_accessor :user_idp_plan, :skills_form

    def initialize(user_idp_plan, skills_form)
      @user_idp_plan = user_idp_plan
      @skills_form = skills_form
    end

    def call
      return broadcast :error, skills_form if skills_form.invalid?

      UserIdpSkill.transaction do
        skills = save_skills_to_idp
        remove_user_idp_skills_not_part_of_plan(skills)

        broadcast :ok, skills
      end
    rescue ActiveRecord::TransactionRollbackError => e
      skills_form.errors.add(:base, e.message)
      broadcast :error, skills_form
    end

    private

    def save_skills_to_idp
      skills_form.skills.map do |skill|
        UserIdpSkill.find_or_create_by!(
          user_idp_plan_id: user_idp_plan.id, skill_id: skill['skill_id']
        )
      end
    end

    def remove_user_idp_skills_not_part_of_plan(skills)
      existing_idp_skill_ids = skills.pluck(:id)

      if skills_form.skill_type.present?
        user_idp_plan.user_idp_skills.
          where.not(id: existing_idp_skill_ids).joins(:skill).
          where(skills: { skill_type: skills_form.skill_type }).destroy_all
      else
        user_idp_plan.user_idp_skills.where.not(id: existing_idp_skill_ids).destroy_all
      end
    end
  end
end
