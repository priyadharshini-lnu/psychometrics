# frozen_string_literal: true

module Administration
  module Assessments
    class SkillsRaterBlockForm < Rectify::Form
      mimic :skills_rater_block_form

      attribute :block, Hash

      validate :validate_props

      private

      def validate_props
        if props.blank? || props['skills_config'].blank?
          errors.add(:base, :props_missing, block_name: block_name)
          return
        end

        skills_config = props['skills_config']
        enabled_skills = skills_config.select { |_, config| enabled_skill_type?(config) }

        if enabled_skills.empty?
          errors.add(:base, :at_least_one_skill_type_must_be_enabled_with_a_job_role_selected, block_name:)
          return
        end

        enabled_skills.each do |skill_type, config|
          validate_job_roles(skill_type, config)
        end
      end

      def validate_job_roles(skill_type, config)
        job_roles = Array(config['job_roles']).compact_blank

        if job_roles.empty?
          errors.add(:base, :at_least_one_job_role_required, skill_type: skill_type.humanize, block_name:)
          return
        end

        job_roles.each do |job_role|
          next if valid_job_roles.include?(job_role.to_s)

          errors.add(:base, :invalid_job_role_type,
                     job_role: job_role,
                     skill_type: skill_type.humanize,
                     valid_options: valid_job_roles.join(', '),
                     block_name: block_name)
        end
      end

      def enabled_skill_type?(config)
        config.is_a?(Hash) &&
          config['enabled'] == true
      end

      def valid_job_roles
        @valid_job_roles ||= %w[current_job_role target_job_role]
      end

      def block_name
        block['name']
      end

      def props
        block['props']
      end
    end
  end
end
