# frozen_string_literal: true

class RemoveMindmillColumns < ActiveRecord::Migration[7.1]
  def change
    remove_column :assessments, :mindmill_id, :integer
    remove_column :reports, :mindmill, :boolean
    drop_table :mindmill_credentials, if_exists: true # rubocop:disable Rails/ReversibleMigration
  end
end
