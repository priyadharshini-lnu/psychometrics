# frozen_string_literal: true

class ReportApproval < ApplicationRecord
  audited

  self.table_name = 'user_reports'

  belongs_to :user
  belongs_to :report
  belongs_to :campaign
  belongs_to :approver_user, class_name: 'User'
  belongs_to :qc_user, class_name: 'User'

  def as_user_report
    becomes(UserReport)
  end
end
