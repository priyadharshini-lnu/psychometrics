# frozen_string_literal: true

class AddFlatViewShaToSheet < ActiveRecord::Migration[6.1]
  def change
    add_column :sheets, :flat_view_sha, :string
  end
end
