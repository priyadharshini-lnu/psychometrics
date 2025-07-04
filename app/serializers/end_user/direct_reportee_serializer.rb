# frozen_string_literal: true

module EndUser
  class DirectReporteeSerializer < Panko::Serializer
    attributes :id, :status, :unread_comments_count
    has_one :user, serializer: ::UserSerializer

    def unread_comments_count
      return 0 if context[:current_user].blank?

      object.unread_comments_count_by(context[:current_user])
    end
  end
end
