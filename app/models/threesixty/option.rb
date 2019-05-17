# frozen_string_literal: true

module Threesixty
  class Option < ApplicationRecord
    DEFAULT_PARTICIPANTS = { manager: {}, subject: {}, evaluator: {} }.freeze
    belongs_to :campaign
  end
end
