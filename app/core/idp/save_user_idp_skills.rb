# frozen_string_literal: true

module Idp
  class SaveUserIdpSkills < BaseCommand
    private_attr_accessor :user_idp_plan, :skills_form, :current_user

    def initialize(user_idp_plan, skills_form, current_user)
      @user_idp_plan = user_idp_plan
      @skills_form = skills_form
      @current_user = current_user
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
      existing_ids = skills.pluck(:id)
      skills_to_remove = user_idp_plan.user_idp_skills.where.not(id: existing_ids)

      if skills_form.skill_type.present?
        skills_to_remove = skills_to_remove.joins(:skill).where(skills: { skill_type: skills_form.skill_type })
      end

      if user_idp_plan.pre_submission?
        skills_to_remove.destroy_all
        return
      end

      last_approved_or_rejected_version = user_idp_plan.versions.where(
        "object ->> 'approval_status' IN (?)", %w[approved rejected]
      ).last

      if last_approved_or_rejected_version && user_idp_plan.draft?
        skill_ids_in_last_version = last_approved_or_rejected_version.reify(
          has_many: true
        )&.user_idp_skills&.pluck(:id) || []

        skills_to_remove.where(id: skill_ids_in_last_version).find_each do |skill|
          skill.soft_delete!(current_user)
        end
        skills_to_remove.where.not(id: skill_ids_in_last_version).destroy_all
      else
        skills_to_remove.destroy_all
      end
    end
  end
end
