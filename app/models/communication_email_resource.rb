# frozen_string_literal: true

class CommunicationEmailResource < ApplicationRecord
  belongs_to :communication_email
  belongs_to :resource, polymorphic: true

  validates :resource, presence: true
end
