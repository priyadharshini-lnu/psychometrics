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

  def self.ransackable_attributes(_auth_object = nil)
    %w[id approval_status campaign_id report_id user_id qc_user_id approver_user_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[campaign report user]
  end
end
