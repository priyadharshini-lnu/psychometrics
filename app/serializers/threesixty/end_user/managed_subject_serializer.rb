module Threesixty::EndUser
  class ManagedSubjectSerializer < ActiveModel::Serializer
    attributes :id, :campaign_id

    has_one :user, serializer: UserSerializer
    has_many :evaluators, serializer: Threesixty::EndUser::EvaluationSerializer

    def user
      object.user
    end

    def evaluators
      object.evaluators.where.not(evaluator_nomination_status: :denied)
    end

    def campaign_id
      object.campaign.threesixty_campaign.id
    end
  end
end
