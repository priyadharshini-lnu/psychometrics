# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      class SkillFactor < ::PipedText::BaseBranch
        def call
          class_name = "Threesixty::PipedText::Branches::FactorFields::#{path.last}".safe_constantize

          context[:factors] = skill_factors
          broadcast :ok, class_name&.call!(path, params, context)
        end

        private

        def skill_factors
          filter = CampaignUsers::GetApplicableSkillIds::FilterBuilder.
                   build_filter_from_skill_rater_blocks(skill_rater_blocks)
          skill_ids = CampaignUsers::GetApplicableSkillIds.call!(campaign_user, filter: filter)

          assessment.dimension.factors.where(skill_id: skill_ids)
        end

        def skill_rater_blocks
          assessment.blocks.skill_rater
        end

        def assessment
          context[:assessment]
        end

        def campaign_user
          if context[:subject]
            ::CampaignUser.find_by(user_id: context[:subject].id,
                                   campaign_id: context[:threesixty_campaign].campaign_id)
          end
        end
      end
    end
  end
end
