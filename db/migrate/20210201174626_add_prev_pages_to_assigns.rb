# frozen_string_literal: true

class AddPrevPagesToAssigns < ActiveRecord::Migration[5.2]
  def change
    add_column :assigns, :prev_pages, :json, default: []
  end
end
