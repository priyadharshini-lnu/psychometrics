# frozen_string_literal: true

module Threesixty
  class NominationSerializer < Panko::Serializer
    attributes :id, :is_self, :can_send_request_approval_email, :evalaution_completed_for_subject, :relationships,
               :options, :instructions, :requirements, :subject

    has_many :evaluators, serializer: Threesixty::EndUser::NomineeSerializer

    def evalaution_completed_for_subject
      object.evaluation_status_completed?
    end

    def is_self
      object.user_id == current_user.id
    end

    def relationships
      Panko::ArraySerializer.new(
        ::Relationships::ByCampaign.new(object.campaign),
        each_serializer: RelationshipSerializer
      ).to_a
    end

    def options
      ::Threesixty::CampaignOptionsSerializer.new(
        context: { current_user: current_user }
      ).serialize(object.campaign.threesixty_campaign.option)
    end

    def can_send_request_approval_email
      Threesixty::Emails::IsRequestApprovalSendable.call!(threesixty_campaign: object.campaign.threesixty_campaign)
    end

    def requirements
      requirements = Threesixty::NominationRequirements::FindForUsers.
                     call!(object.user, object.campaign.threesixty_campaign)[object.user_id]
      return {} unless requirements

      Threesixty::EndUser::NominationRequirementSerializer.new.serialize(requirements)
    end

    def instructions
      Panko::ArraySerializer.new(
        object.campaign.threesixty_campaign.instruction_templates.enabled.includes(:translations),
        each_serializer: ::Threesixty::InstructionTemplateSerializer
      ).to_a
    end

    def subject
      UserSerializer.new.serialize(object.user)
    end

    private

    def current_user
      context[:current_user]
    end
  end
end
