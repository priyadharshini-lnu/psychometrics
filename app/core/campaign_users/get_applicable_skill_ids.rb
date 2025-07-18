# frozen_string_literal: true

module CampaignUsers
  class GetApplicableSkillIds < BaseCommand
    private_attr_reader :campaign_user, :filter

    def initialize(campaign_user, filter:)
      @campaign_user = campaign_user
      @filter = filter || {}
    end

    def call
      skill_ids = collect_skill_ids
      return broadcast(:ok, []) if skill_ids.empty?

      broadcast :ok, skill_ids
    end

    private

    def collect_skill_ids
      all_skill_ids = []

      filter.each do |category_type, category_config|
        case category_type.to_s
          when 'by_category'
            all_skill_ids.concat(extract_skill_ids_from_categories(category_config))
        end
      end

      all_skill_ids.uniq.compact
    end

    def extract_skill_ids_from_categories(category_config)
      skill_ids = []

      category_config.each do |skill_type, skill_config|
        next unless skill_config.is_a?(Hash)

        skill_config.each do |job_role_type, enabled|
          next unless enabled

          job_role_id = get_job_role_id(job_role_type)
          next unless job_role_id

          ids = JobRole.fetch_skills_for_types(job_role_id, [skill_type.to_s], project&.id)
          skill_ids.concat(ids)
        end
      end

      skill_ids
    end

    def get_job_role_id(role_type)
      return nil unless campaign_user

      case role_type.to_s
        when 'current_job_role'
          campaign_user.current_job_role_id
        when 'target_job_role'
          campaign_user.target_job_role_id
      end
    end

    def project
      @project ||= campaign_user&.campaign&.project
    end
  end
end
