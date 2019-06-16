# frozen_string_literal: true

class Threesixty::EmailTemplate < ApplicationRecord
  enum category: { invitations: 0, reminders: 1, report_ready: 2, approvals: 3 }
end
