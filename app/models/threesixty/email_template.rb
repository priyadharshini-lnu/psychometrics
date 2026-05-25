# frozen_string_literal: true

module Threesixty
  class EmailTemplate < ApplicationRecord
    audited

    extend Mobility

    belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'
    include Tenantable

    has_one :project, through: :threesixty_campaign

    translates :subject, :content

    enum :category, { invitations: 0, reminders: 1, report_ready: 2, approvals: 3 }
  end
end
