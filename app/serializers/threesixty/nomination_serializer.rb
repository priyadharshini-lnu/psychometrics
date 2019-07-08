module Threesixty
  class NominationSerializer < ActiveModel::Serializer
    attributes :id, :is_self, :can_send_request_approval_email

    has_many :evaluators, serializer: Threesixty::EndUser::NomineeSerializer
    has_many :relationships, serializer: RelationshipSerializer
    has_one :subject, serializer: UserSerializer
    has_one :options, serializer: CampaignOptionsSerializer
    has_one :requirements, serializer: Threesixty::EndUser::NominationRequirementSerializer

    def subject
      object.user
    end

    def is_self
      object.user_id == current_user.id
    end

    def relationships
      Relationships::ByCampaign.new(object.campaign)
    end

    def options
      object.campaign.threesixty_campaign.option
    end

    def can_send_request_approval_email
      Threesixty::Emails::IsRequestApprovalSendable.call!(object.campaign.threesixty_campaign)
    end

    def requirements
      Threesixty::NominationRequirements::FindForUsers.call!(object.user, object.campaign.threesixty_campaign)[object.user_id]
    end
  end
end
