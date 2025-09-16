# frozen_string_literal: true

class ChangeTranslateableIdToBigintForTranslations < ActiveRecord::Migration[7.1]
  def change
    reversible do |dir|
      dir.up do
        change_column :translations, :translateable_id, :bigint
      end
    end
  end
end
