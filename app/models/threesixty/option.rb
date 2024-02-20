# frozen_string_literal: true

module Threesixty
  class Option < ApplicationRecord
    audited

    DEFAULT_PARTICIPANTS = { manager: {}, subject: {}, evaluator: {}, global: {} }.freeze
    DEFAULT_REPORTS = { access: {}, approval: {}, availability: { conditions: [] } }.freeze

    belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'
  end
end
