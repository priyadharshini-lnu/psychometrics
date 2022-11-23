# frozen_string_literal: true

class ReportApproval < ApplicationRecord
  self.table_name = 'user_reports'

  belongs_to :user
  belongs_to :report
  belongs_to :campaign
end
