# frozen_string_literal: true

class CreateSheetColumns < ActiveRecord::Migration[7.1]
  COLUMN_TYPES = {
    'Email' => 0,
    'Number' => 1,
    'String' => 2,
    'Text' => 3,
    'Markdown' => 4,
    'HTML' => 5,
  }

  def change
    create_table :sheet_columns do |t|
      t.integer :column_type
      t.string :name
      t.integer :position
      t.boolean :dashboard_use, default: false
      t.boolean :accessor_access, default: false
      t.boolean :visible_in_list, default: false

      t.references :sheet, null: false, foreign_key: true
      t.timestamps
    end

    reversible do |dir|
      dir.up do
        ActiveRecord::Base.connection.execute('SELECT * from sheets').each do |sheet|
          columns = JSON.load(sheet['columns'])
          next unless columns

          columns.each.with_index do |column, i|
            sql = <<~SQL.squish
              INSERT INTO sheet_columns (column_type, name, position, sheet_id, dashboard_use, accessor_access, visible_in_list, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            SQL
            exec_query(sql, 'SQL', [
              COLUMN_TYPES[column['type']] || 2,
              column['name'],
              i,
              sheet['id'],
              column['dashboard_use'] || false ,
              column['accessor_access'] || false,
              column['visible_in_list'] || false,
              sheet['created_at'], sheet['updated_at']
            ])
          end
        end

      end
      dir.down do
        execute('DELETE FROM sheet_columns')
      end
    end
  end
end
