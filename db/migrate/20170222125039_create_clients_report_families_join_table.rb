class CreateClientsReportFamiliesJoinTable < ActiveRecord::Migration[5.0]
  def change
    create_join_table :clients, :report_families do |t|
      t.index [:client_id, :report_family_id]
    end
  end
end
