# frozen_string_literal: true

module Threesixty
  class Option < ApplicationRecord
    audited

    DEFAULT_PARTICIPANTS = { manager: {}, subject: { can_evaluate_self: true },
                             evaluator: {}, global: { can_not_edit_evaluation: true } }.freeze
    DEFAULT_REPORTS = { access: {}, approval: {}, availability: { conditions: [] } }.freeze

    belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'
    include Tenantable
  end
end
