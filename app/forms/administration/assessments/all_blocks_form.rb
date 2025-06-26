# frozen_string_literal: true

module Administration
  module Assessments
    class AllBlocksForm < Rectify::Form
      mimic :all_blocks_form

      attribute :blocks, [Hash]

      validate :validate_individual_blocks
      validate :validate_no_same_skills_rater_blocks

      private

      def validate_individual_blocks
        return if blocks.blank?

        blocks.each do |block|
          validate_block_by_type(block)
        end
      end

      def validate_block_by_type(block)
        case block['block_type']
          when 'skills_rater'
            validate_skills_rater_block(block)
        end
      end

      def validate_skills_rater_block(block)
        form = SkillsRaterBlockForm.new(block: block)

        return if form.valid?

        form.errors.each do |error|
          errors.add(:base, error.message.to_s)
        end
      end

      def validate_no_same_skills_rater_blocks
        seen_configs = Set.new
        conflicts = {}

        skills_rater_blocks.each do |block|
          duplicates = find_duplicate_configs(block, seen_configs)
          conflicts[block['name']] = duplicates if duplicates.any?
        end

        add_conflict_errors(conflicts) if conflicts.any?
      end

      def skills_rater_blocks
        blocks.select { |b| b['block_type'] == 'skills_rater' }
      end

      def find_duplicate_configs(block, seen_configs)
        duplicates = []

        (block.dig('props', 'job_roles') || {}).each do |role, config|
          next unless config['enabled']

          Array(config['skill_types']).each do |skill_type|
            next if skill_type.blank?

            key = "#{role}:#{skill_type}"
            if seen_configs.include?(key)
              duplicates << "#{role.humanize} (#{skill_type.to_s.humanize})"
            else
              seen_configs.add(key)
            end
          end
        end

        duplicates
      end

      def add_conflict_errors(conflicts)
        conflicts.each do |block_name, duplicate_configs|
          errors.add(
            :base,
            :duplicate_block,
            block_name: block_name,
            duplicate_configurations: duplicate_configs.to_sentence
          )
        end
      end
    end
  end
end
