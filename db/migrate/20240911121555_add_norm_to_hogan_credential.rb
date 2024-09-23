# frozen_string_literal: true

class AddNormToHoganCredential < ActiveRecord::Migration[7.1]
  def change
    add_column :hogan_credentials, :norm, :string

    reversible do |dir|
      dir.up do
        execute <<-SQL.squish
          UPDATE hogan_credentials
          SET norm = 'Global'
        SQL
      end

      dir.down do
        execute <<-SQL.squish
          UPDATE hogan_credentials
          SET norm = NULL
        SQL
      end
    end
  end
end
