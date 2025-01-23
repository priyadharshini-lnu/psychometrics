# frozen_string_literal: true

class AddDataColumnToTranslation < ActiveRecord::Migration[7.1]
  def change
    add_column :translations, :data, :jsonb, default: {}
  end
end
