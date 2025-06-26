# frozen_string_literal: true

module Administration
  module Assessments
    class SkillsRaterBlockForm < Rectify::Form
      mimic :skills_rater_block_form

      attribute :block, Hash

      validate :validate_props

      private

      def validate_props
        if props.blank? || props['job_roles'].blank?
          errors.add(:base, :props_missing, block_name: block_name)
          return
        end

        job_roles = props['job_roles']
        enabled_roles = job_roles.select { |_, config| enabled_job_role?(config) }

        if enabled_roles.empty?
          errors.add(:base, :at_least_one_job_role_must_be_enabled_with_a_skill_type_selected, block_name:)
          return
        end

        enabled_roles.each do |role_name, config|
          validate_skill_types(role_name, config)
        end
      end

      def validate_skill_types(role_name, config)
        skill_types = Array(config['skill_types']).compact_blank

        if skill_types.empty?
          errors.add(:base, :at_least_one_skill_type_required, role_name: role_name.humanize, block_name:)
          return
        end

        skill_types.each do |skill_type|
          next if valid_skill_types.include?(skill_type.to_s)

          errors.add(:base, :invalid_skill_type,
                     skill_type: skill_type,
                     role_name: role_name.humanize,
                     valid_options: valid_skill_types.join(', '),
                     block_name: block_name)
        end
      end

      def enabled_job_role?(config)
        config.is_a?(Hash) &&
          config['enabled'] == true &&
          Array(config['skill_types']).any?(&:present?)
      end

      def valid_skill_types
        @valid_skill_types ||= Skill.skill_types.keys
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
