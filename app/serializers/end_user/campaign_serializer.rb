# frozen_string_literal: true

module EndUser
  class CampaignSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :name, :type, :status, :instructions

    has_many :user_assessments, serializer: ::EndUser::UserAssessmentSerializer

    def user_assessments
      UserAssessment.where(evaluator_id: current_user.id, campaign_id: object.id)
    end

    def instructions
      object.instruction_templates.enabled.map do |instruction|
        {
          name: instruction.name,
          content: Threesixty::PipedText::Perform.call!(instruction.content,
                                                        threesixty_campaign: object.campaign.threesixty_campaign,
                                                        user: current_user)
        }
      end
    end

    def current_user
      @current_user ||= instance_options[:current_user]
    end
  end
end
