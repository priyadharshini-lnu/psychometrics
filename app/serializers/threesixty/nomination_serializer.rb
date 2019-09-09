# frozen_string_literal: true

module Threesixty
  class NominationSerializer < ActiveModel::Serializer
    attributes :id, :is_self, :can_send_request_approval_email

    has_many :evaluators, serializer: Threesixty::EndUser::NomineeSerializer
    has_many :relationships, serializer: RelationshipSerializer
    has_one :subject, serializer: UserSerializer
    has_one :options, serializer: CampaignOptionsSerializer
    has_one :requirements, serializer: Threesixty::EndUser::NominationRequirementSerializer
    has_many :instructions, serializer: InstructionTemplateSerializer

    def subject
      object.user
    end

    def is_self # rubocop:disable Naming/PredicateName
      object.user_id == current_user.id
    end

    def relationships
      ::Relationships::ByCampaign.new(object.campaign)
    end

    def options
      object.campaign.threesixty_campaign.option
    end

    def can_send_request_approval_email
      Threesixty::Emails::IsRequestApprovalSendable.call!(threesixty_campaign: object.campaign.threesixty_campaign)
    end

    def requirements
      Threesixty::NominationRequirements::FindForUsers.
        call!(object.user, object.campaign.threesixty_campaign)[object.user_id]
    end

    def instructions
      object.campaign.threesixty_campaign.instruction_templates
    end
  end
end
