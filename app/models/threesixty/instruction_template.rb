# frozen_string_literal: true

class Threesixty::InstructionTemplate < ApplicationRecord
  scope :enabled, -> { where(enabled: true) }
end
