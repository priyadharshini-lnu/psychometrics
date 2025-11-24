# frozen_string_literal: true

module AI
  module Utils
    module DependencyParser
      class CampaignUser
        private_attr_reader :campaign_user

        def initialize(campaign_user)
          @campaign_user = campaign_user
        end

        def parse
          format_campaign_user_data_output
        end

        private

        def format_campaign_user_data_output
          <<~CAMPAIGN_USER_DATA
            <current_job_role>
              #{parse_job_role(campaign_user.current_job_role)}
            </current_job_role>
            <target_job_role>
              #{parse_job_role(campaign_user.target_job_role)}
            </target_job_role>
            </campaign_user>
          CAMPAIGN_USER_DATA
        end

        def parse_job_role(job_role)
          return '' if job_role.blank?

          <<~JOB_ROLE_XML
            <name>#{job_role.name}</name>
            <description>#{truncate_description(job_role.description)}</description>
            <code>#{job_role.code}</code>
            <skills>#{format_skill_names(job_role.skills)}</skills>
          JOB_ROLE_XML
        end

        def format_skill_names(skills, limit = 5)
          names = skills.blank? ? [] : skills.pluck(:name)
          return '' if names.empty?

          names.size <= limit ? names.join(', ') : "#{names.first(limit).join(', ')}..."
        end

        def truncate_description(description)
          return '' if description.blank?

          words = description.split
          words.length > 50 ? "#{words.first(50).join(' ')}..." : description
        end
      end
    end
  end
end
