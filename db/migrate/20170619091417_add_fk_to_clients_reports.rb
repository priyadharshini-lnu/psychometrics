class AddFkToClientsReports < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :clients_reports, :reports, column: :report_id, on_delete: :cascade
    add_foreign_key :clients_reports, :clients, column: :client_id, on_delete: :cascade
  end
end
