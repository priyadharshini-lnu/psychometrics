# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module CampaignUserFields
        class Field < ::PipedText::BaseField
          def call
            method_name = possible_fields[path.second]
            return broadcast :ok, '' unless method_name

            broadcast :ok, send(method_name)
          end

          protected

          def possible_fields
            {
              'CurrentJobRole' => :current_job_role,
              'TargetJobRole' => :target_job_role
            }
          end

          def current_job_role
            campaign_user.current_job_role&.name
          end

          def target_job_role
            campaign_user.target_job_role&.name
          end

          def campaign_user
            ::CampaignUser.find_by(
              user_id: context[:subject].id,
              campaign_id: context[:threesixty_campaign].campaign_id
            )
          end
        end
      end
    end
  end
end
