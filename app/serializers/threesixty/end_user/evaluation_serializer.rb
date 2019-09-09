# frozen_string_literal: true

module Threesixty::EndUser
  class EvaluationSerializer < ActiveModel::Serializer
    attributes :id, :is_self, :evaluator_id, :campaign_id, :evaluator_nomination_status, :status

    has_one :user, serializer: UserSerializer
    has_one :subject, serializer: UserSerializer

    def campaign_id
      object.campaign.threesixty_campaign.id
    end

    def status
      object.result&.status
    end

    def user
      object.evaluator
    end

    def is_self # rubocop:disable Naming/PredicateName
      object.subject_id == current_user.id
    end
  end
end
