# frozen_string_literal: true

namespace :assign do
  desc 'Invoke set_completed_status and set_completed_at'
  task set_completed: %w[assign:set_completed_status assign:set_completed_at]

  desc 'Set completed status for original assign when project assign has completed status'
  task set_completed_status: :environment do
    update_records(assigns_with_incorrect_status) do |record|
      record.update_column(:status, Assign.statuses[:completed])
    end
  end

  desc 'Set completed_at column for assigns with completed status'
  task set_completed_at: :environment do
    update_records(assigns_without_completed_at) do |record|
      record.update_column(:completed_at, record.assign_with_result.updated_at)
    end
  end

  def update_records(records)
    todo_size = records.size
    records.find_each do |record|
      yield record
    end
    puts "updated #{todo_size} records"
  end

  def assigns_with_incorrect_status
    Assign.joins(:project_assign).
      where('project_assigns_assigns.status = ?', Assign.statuses[:completed]).
      where.not('assigns.status = ?', Assign.statuses[:completed])
  end

  def assigns_without_completed_at
    Assign.where(status: 'completed', completed_at: nil)
  end
end
