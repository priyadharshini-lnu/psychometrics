module Threesixty::EndUser
  class EvaluationSerializer < ActiveModel::Serializer
    attributes :id, :is_self, :evaluator_id, :campaign_id, :evaluator_nomination_status

    has_one :user, serializer: UserSerializer
    has_one :subject, serializer: UserSerializer

    def campaign_id
      object.campaign.threesixty_campaign.id
    end

    def user
      object.evaluator
    end

    def subject
      object.subject
    end

    def is_self
      object.subject_id == current_user.id
    end
  end
end
