# frozen_string_literal: true

module Threesixty
  class EmailTemplate < ApplicationRecord
    belongs_to :threesixty_campaign, class_name: "Threesixty::Campaign"

    enum category: { invitations: 0, reminders: 1, report_ready: 2, approvals: 3 }
  end
end
