# frozen_string_literal: true

module Communications
  class CompletionTypeJob < ApplicationJob
    queue_as :communication

    def perform(assign)
      communications = Communication.completion.where(assessment_id: assign.assessment_id).includes(:project)

      return perform_migrated(assign, communications) if assign.is_a?(UsersResult)

      ::Services::Communications::CheckByLevelStack.call(
        membership: assign.membership,
        communications: communications.select { |c| !c.project || !c.project&.migrated? }
      )
    end

    private

    def perform_migrated(user_result, communications)
      communications = communications.select { |c| c.project&.migrated? }
      campaign_user = CampaignUser.find_by(
        campaign_id: user_result.user_assessment.campaign_id,
        user_id: user_result.user_id
      )
      communications.each do |communication|
        if communication.selected_campaign_users.include?(campaign_user)
          communication.emails.create(campaign_user_id: campaign_user.id)
        end
      end
    end
  end
end
