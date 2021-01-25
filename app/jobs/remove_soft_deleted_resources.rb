# frozen_string_literal: true

class RemoveSoftDeletedResources < ApplicationJob
  def perform
    Assessment.deleted.where('deleted_at < ?', 1.months.ago).delete_all
    Report.deleted.where('deleted_at < ?', 1.months.ago).delete_all
  end
end
