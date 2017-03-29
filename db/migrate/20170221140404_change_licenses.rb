class ChangeLicenses < ActiveRecord::Migration[5.0]
  def change
    reversible do |dir|
      dir.up { License.destroy_all }
    end

    remove_column :clients, :licenses_expire, :date
    remove_column :clients, :licenses_final_expire, :date

    remove_column :licenses, :type, :integer
    remove_column :licenses, :unlimited, :boolean
    remove_column :licenses, :assessment_id, :integer
    remove_column :licenses, :report_id, :integer

    add_column :licenses, :end_date, :date, null: false
    add_column :licenses, :start_date, :date, null: false
    add_reference :licenses, :report_family, index: { unique: true }, foreign_key: true, null: false
  end
end
