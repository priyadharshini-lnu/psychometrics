# frozen_string_literal: true

module Threesixty::EndUser
  class NomineeSerializer < ActiveModel::Serializer
    attributes :id, :is_subject, :approval_status, :status

    has_one :user, serializer: UserSerializer
    has_one :relationship, serializer: RelationshipSerializer

    def relationship
      object.participant_role(current_user.id)
    end

    def approval_status
      Threesixty::Participants::GetApprovalStatus.call!(object, object.subject)
    end

    def status
      Threesixty::Participants::GetStatus.call!(object, object.subject, @instance_options[:option], @instance_options[:nomination_requirement])
    end

    def is_subject
      !!object.subject
    end
  end
end
