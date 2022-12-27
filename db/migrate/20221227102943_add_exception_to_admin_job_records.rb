class AddExceptionToAdminJobRecords < ActiveRecord::Migration[6.1]
  def change
    add_column :admin_jobs, :exception, :string
  end
end
