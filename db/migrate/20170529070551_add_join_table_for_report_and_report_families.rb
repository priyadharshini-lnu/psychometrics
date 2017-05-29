class AddJoinTableForReportAndReportFamilies < ActiveRecord::Migration[5.0]
  def change
    create_table :report_families_reports, id: false do |t|
      t.belongs_to :report, index: true
      t.belongs_to :report_family, index: true
    end

    reversible do |direction|
      direction.up {
        remove_reference :reports, :report_family, index: true
      }

      direction.down {
        add_reference :reports, :report_family, index: true
      }
    end
  end
end
