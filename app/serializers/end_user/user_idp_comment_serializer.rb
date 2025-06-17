# frozen_string_literal: true

module EndUser
  class UserIdpCommentSerializer < Panko::Serializer
    attributes :id, :content, :created_at, :resource_id,
               :resource_type, :replies_count, :edited, :unread_replies_count, :parent_id, :resolved_at, :replies

    has_one :created_by, serializer: ::UserSerializer
    has_one :resolved_by, serializer: ::UserSerializer

    def unread_replies_count
      return 0 unless context[:current_user].present? && object.parent_id.blank?

      object.unread_replies_count_for(context[:current_user])
    end

    def replies
      return [] unless context[:load_replies]

      Panko::ArraySerializer.new(
        object.replies,
        each_serializer: EndUser::UserIdpCommentSerializer,
        context: context
      ).to_a
    end
  end
end
