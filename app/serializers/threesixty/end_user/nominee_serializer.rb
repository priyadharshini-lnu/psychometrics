# frozen_string_literal: true

# Participant serializer

module Threesixty::EndUser
  class NomineeSerializer < ActiveModel::Serializer
    attributes :id, :approval_status, :evaluator_nomination_status, :evaluation_status

    has_one :evaluator, serializer: UserSerializer
    has_one :relationship, serializer: RelationshipSerializer

    def approval_status
      object.manager_nomination_status
    end

    def evaluation_status
      Threesixty::Participants::GetStatus.call!(
        object.threesixty_subject,
        @instance_options[:option],
        @instance_options[:nomination_requirement]
      )
    end
  end
end
