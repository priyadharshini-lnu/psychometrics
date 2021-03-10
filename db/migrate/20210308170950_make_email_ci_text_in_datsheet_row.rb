# frozen_string_literal: true

class MakeEmailCiTextInDatsheetRow < ActiveRecord::Migration[5.2]
  def change
    change_column :datasheet_rows, :email, :citext, null: false
    execute 'UPDATE datasheet_rows SET email=lower(email)'
  end
end
