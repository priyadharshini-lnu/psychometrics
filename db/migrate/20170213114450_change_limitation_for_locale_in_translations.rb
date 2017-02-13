class ChangeLimitationForLocaleInTranslations < ActiveRecord::Migration[5.0]
  def up
    change_column :translations, :locale, :string, limit: 10
  end

  def down
    change_column :translations, :locale, :string, limit: 4
  end
end
