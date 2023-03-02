# frozen_string_literal: true

class CleanerAdminJob < ApplicationJob
  def perform
    AdminJobRecord.where(status: :completed).where('created_at < ?', 1.week.ago).destroy_all
  end
end
