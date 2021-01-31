# frozen_string_literal: true

class Threesixty::InstructionTemplate < ApplicationRecord
  extend Mobility

  belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'

  translates :content

  scope :enabled, -> { where(enabled: true) }
end
