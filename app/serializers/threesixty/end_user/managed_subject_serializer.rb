# frozen_string_literal: true

module Threesixty::EndUser
  class ManagedSubjectSerializer < ActiveModel::Serializer
    attributes :id, :campaign_id

    has_one :user, method: :user
    has_many :evaluators, serializer: Threesixty::EndUser::EvaluationSerializer

    def user
      UserSerializer.new.serialize(object.user)
    end

    def evaluators
      object.evaluators.where(evaluator_nomination_status: :completed)
    end

    def campaign_id
      object.campaign.threesixty_campaign.id
    end
  end
end
