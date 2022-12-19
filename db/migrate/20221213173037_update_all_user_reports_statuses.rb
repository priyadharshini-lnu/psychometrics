class UpdateAllUserReportsStatuses < ActiveRecord::Migration[6.1]
  def up
    UserReport.where.not(status: 'not_prepared').update_all(approval_status: :approved)
  end
end
