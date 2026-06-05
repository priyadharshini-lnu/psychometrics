# frozen_string_literal: true

class Threesixty::InstructionTemplate < ApplicationRecord
  audited

  extend Mobility

  belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'
  include Tenantable

  translates :content

  scope :enabled, -> { where(enabled: true) }
end
