# frozen_string_literal: true

class ReportApproval < ApplicationRecord
  self.table_name = 'user_reports'

  belongs_to :user
  belongs_to :report
  belongs_to :campaign
  belongs_to :approval_status_owner, class_name: 'User'

  def as_user_report
    becomes(UserReport)
  end
end
