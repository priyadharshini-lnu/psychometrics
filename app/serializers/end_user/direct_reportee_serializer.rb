# frozen_string_literal: true

module EndUser
  class DirectReporteeSerializer < Panko::Serializer
    attributes :id, :status, :unread_comments_count, :pending_initial_review
    has_one :user, serializer: ::UserSerializer

    delegate :status, to: :object

    def unread_comments_count
      return 0 if context[:current_user].blank?

      object.unread_comments_count_by(context[:current_user])
    end
  end
end
