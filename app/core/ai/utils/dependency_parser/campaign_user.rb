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
          JOB_ROLE_XML
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
