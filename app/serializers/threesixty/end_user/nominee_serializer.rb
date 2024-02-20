# frozen_string_literal: true

# Participant serializer

module Threesixty::EndUser
  class NomineeSerializer < ActiveModel::Serializer
    attributes :id, :approval_status, :evaluator_nomination_status, :can_remove

    has_one :evaluator, method: :evaluator
    has_one :relationship, serializer: RelationshipSerializer

    def evaluator
      UserSerializer.new.serialize(object.evaluator)
    end

    def approval_status
      object.manager_nomination_status
    end

    def can_remove
      if options.participants.dig('subject', 'cannot_remove_nomination_set_by_manager_and_admin')
        object.created_by_id == object.subject_id
      else
        true
      end
    end

    def options
      object.campaign.threesixty_campaign.option
    end
  end
end
