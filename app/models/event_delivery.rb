# frozen_string_literal: true

class EventDelivery < ApplicationRecord
  belongs_to :resource, polymorphic: true

  enum event_type: { new_assessor_assessment: 0 }

  enum delivery_type: { email: 0, sms: 1 }

  validates :resource, presence: true
  validates :event_type, presence: true
  validates :delivery_type, presence: true
end
