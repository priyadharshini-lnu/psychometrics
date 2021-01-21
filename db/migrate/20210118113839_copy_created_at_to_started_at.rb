# frozen_string_literal: true

class CopyCreatedAtToStartedAt < ActiveRecord::Migration[5.2]
  def change
    UsersResult.update_all('started_at=created_at')
  end
end
