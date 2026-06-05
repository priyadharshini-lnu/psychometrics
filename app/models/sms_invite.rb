# frozen_string_literal: true

class SmsInvite < ApplicationRecord
  audited

  has_shortened_urls
  belongs_to :campaign
  belongs_to :creator, class_name: 'User'
  belongs_to :registered_user, class_name: 'User'
  include Tenantable

  has_one :project, through: :campaign
  has_many :sms_histories

  enum :status, { not_invited: 0, invited: 1, registered: 2, failed: 3 }

  ransacker :status, formatter: proc { |v| statuses[v] } do |parent|
    parent.table[:status]
  end

  scope :filterable_fields, lambda { |query|
    where(
      'sms_invites.first_name ILIKE :query OR sms_invites.last_name ILIKE :query OR sms_invites.mobile_no ILIKE :query',
      query: "%#{query}%"
    )
  }

  delegate :email, to: :registered_user, allow_nil: true

  def self.ransackable_attributes(_auth_object = nil)
    %w[id first_name last_name status created_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[creator registered_user]
  end

  def self.ransackable_scopes(_)
    %i[filterable_fields]
  end
end
