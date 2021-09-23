# frozen_string_literal: true

module SmsRecords
  class Form < Rectify::Form
    attribute :message, String
    attribute :filters, Hash
    attribute :link_expiry, DateTime

    validates :link_expiry, :message, presence: true
  end
end
