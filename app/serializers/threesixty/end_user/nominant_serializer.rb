# frozen_string_literal: true

module Threesixty::EndUser
  class NominantSerializer < ActiveModel::Serializer
    attributes :id, :is_subject, :role, :approval_status, :status

    has_one :user, serializer: UserSerializer

    def role
      object.participant_role(current_user.id).name
    end

    def approval_status
      Threesixty::Participants::GetApprovalStatus.call!(object, object.subject, @instance_options[:option], @instance_options[:nomination_requirement])
    end

    def status
      Threesixty::Participants::GetStatus.call!(object, object.subject, @instance_options[:option], @instance_options[:nomination_requirement])
    end

    def is_subject
      !!object.subject
    end
  end
end
