# frozen_string_literal: true

class UserIdpComment < ApplicationRecord
  belongs_to :user_idp_plan
  belongs_to :created_by, class_name: 'User'
  belongs_to :resolved_by, class_name: 'User', optional: true
  belongs_to :resource, polymorphic: true, optional: true
  has_many :replies, class_name: 'UserIdpComment', foreign_key: 'parent_id', dependent: :destroy
  belongs_to :parent, class_name: 'UserIdpComment', optional: true, counter_cache: :replies_count
  include Tenantable

  tenant_source :user_idp_plan

  validates :content, presence: true
  validate :cannot_reply_to_reply

  scope :top_level, -> { where(parent_id: nil) }
  scope :unread_by_user, lambda { |user|
    where.not('read_by_user_ids @> ARRAY[?]::integer[]', user.id).where.not(created_by_id: user.id)
  }
  scope :with_unread_replies_by_user, lambda { |user|
    where(
      <<~SQL.squish, user.id, user.id
        EXISTS (
          SELECT 1 FROM user_idp_comments replies
          WHERE replies.parent_id = user_idp_comments.id
            AND replies.created_by_id != ?
            AND NOT (replies.read_by_user_ids @> ARRAY[?]::integer[])
        )
      SQL
    )
  }

  scope :unread_or_unread_replies_for_user, lambda { |user|
    top_level.where(id: unread_by_user(user).or(with_unread_replies_by_user(user)))
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[resource_id resource_type created_at resolved]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[resolved_by]
  end

  ransacker :resolved do
    Arel.sql('CASE WHEN resolved_by_id IS NOT NULL AND resolved_at IS NOT NULL THEN true ELSE false END')
  end

  def resolve!(user)
    update!(resolved_by: user, resolved_at: Time.current)
  end

  def unresolve!
    update!(resolved_by: nil, resolved_at: nil)
  end

  def resolved?
    resolved_by.present? && resolved_at.present?
  end

  def reply?
    parent_id.present?
  end

  def unread_replies_count_for(user)
    replies.where.not('read_by_user_ids @> ARRAY[?]::integer[]', user.id).
      where.not(created_by_id: user.id).
      count
  end

  private

  def cannot_reply_to_reply
    return unless parent&.reply?

    errors.add(:parent, I18n.t('activerecord.errors.models.user_idp_comment.reply_to_reply'))
  end
end
