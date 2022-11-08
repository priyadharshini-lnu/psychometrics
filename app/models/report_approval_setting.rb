# frozen_string_literal: true

class ReportApprovalSetting < ApplicationRecord
  belongs_to :campaign
  belongs_to :report
end
