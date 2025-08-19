# frozen_string_literal: true

class ChangeMediaLibrariesToLibrariesInMembershipGrants < ActiveRecord::Migration[7.1]
  def change
    # rubocop:disable Rails/ReversibleMigration
    execute <<-SQL.squish
      UPDATE membership_grants
      SET data = data - 'media_libraries' || jsonb_build_object('libraries', data->'media_libraries')
      WHERE data ? 'media_libraries'
    SQL
    # rubocop:enable Rails/ReversibleMigration
  end
end
