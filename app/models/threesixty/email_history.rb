# frozen_string_literal: true

class Threesixty::EmailHistory < ApplicationRecord
  audited

  belongs_to :threesixty_campaign, class_name: 'Threesixty::Campaign'
  belongs_to :email_schedule, class_name: 'Threesixty::EmailSchedule', foreign_key: :threesixty_email_schedule_id
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  include Tenantable

  enum :status, { success: 0, bounce: 1 }
end
