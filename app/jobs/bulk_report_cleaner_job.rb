# frozen_string_literal: true

class BulkReportCleanerJob < ApplicationJob
  def perform
    BulkReport.where(created_at: ..1.week.ago).destroy_all
  end
end
