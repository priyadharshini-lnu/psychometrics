# frozen_string_literal: true

module Threesixty
  class Option < ApplicationRecord
    DEFAULT_PARTICIPANTS = { manager: {}, subject: {}, evaluator: {} }.freeze
    DEFAULT_REPORTS = { access: {}, approval: {}, availablity: {} }.freeze

    belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'
  end
end
