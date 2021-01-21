# frozen_string_literal: true

module Threesixty
  class EmailTemplate < ApplicationRecord
    extend Mobility
    belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'

    translates :subject, :content

    enum category: { invitations: 0, reminders: 1, report_ready: 2, approvals: 3 }
  end
end
