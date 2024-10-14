# frozen_string_literal: true

module Threesixty::EndUser
  class ManagedSubjectSerializer < Panko::Serializer
    attributes :id, :campaign_id, :evaluators

    has_one :user, serializer: UserSerializer

    def evaluators
      Panko::ArraySerializer.new(
        object.evaluators.where(evaluator_nomination_status: :completed),
        each_serializer: Threesixty::EndUser::EvaluationSerializer,
        context: {
          current_user: current_user
        }
      ).to_a
    end

    def campaign_id
      object.campaign.threesixty_campaign.id
    end

    def current_user
      context[:scope]
    end
  end
end
