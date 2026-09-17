# frozen_string_literal: true

class ChangeTranslationsResourceIdToBigint < ActiveRecord::Migration[8.0]
  def up
    change_column :translations, :resource_id, :bigint
  end

  def down
    change_column :translations, :resource_id, :integer
  end
end
