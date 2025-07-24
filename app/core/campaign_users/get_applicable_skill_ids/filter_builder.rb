# frozen_string_literal: true

module CampaignUsers
  class GetApplicableSkillIds
    class FilterBuilder
      def self.build_filter_from_skill_rater_blocks(skill_rater_blocks)
        return {} if skill_rater_blocks.blank?

        by_category = {}

        skill_rater_blocks.each do |block|
          skills_config = block.props['skills_config'] || {}

          skills_config.each do |skill_type, config|
            next unless config.is_a?(Hash) && config['enabled'] == true

            by_category[skill_type.to_sym] ||= {}
            job_roles = Array(config['job_roles'])

            job_roles.each do |job_role|
              by_category[skill_type.to_sym][job_role.to_sym] = true
            end
          end
        end

        return {} if by_category.empty?

        { by_category: by_category }
      end
    end
  end
end
