# frozen_string_literal: true

class AddTemplateIdToTemplateSchedulers < ActiveRecord::Migration[5.2]
  def change
    add_reference :threesixty_email_schedules, :template,
                  foreign_key: { on_delete: :nullify, to_table: :threesixty_email_templates }
  end
end
