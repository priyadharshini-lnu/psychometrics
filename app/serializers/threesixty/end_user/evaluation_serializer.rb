module Threesixty::EndUser
  class EvaluationSerializer < ActiveModel::Serializer
    attributes :id, :is_self, :evaluator_id, :campaign_id, :evaluator_nomination_status, :as_manager
    has_one :user, serializer: UserSerializer

    def user
      object.subject
    end

    def campaign_id
      object.campaign.threesixty_campaign.id
    end

    def is_self
      object.subject_id == current_user.id
    end

    def as_manager
      object.evaluator_id != current_user.id
    end
  end
end
