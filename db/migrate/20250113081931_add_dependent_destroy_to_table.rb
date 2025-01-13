# frozen_string_literal: true

class AddDependentDestroyToTable < ActiveRecord::Migration[7.1]
  def change
    remove_foreign_key :workshop_invite_translations, :workshop_invites
    add_foreign_key :workshop_invite_translations, :workshop_invites, on_delete: :cascade

    remove_foreign_key :workshop_invite_logs, :workshop_invites
    add_foreign_key :workshop_invite_logs, :workshop_invites, on_delete: :cascade

    remove_foreign_key :admin_roles, :clients
    add_foreign_key :admin_roles, :clients, on_delete: :cascade

    remove_foreign_key :mettl_user_assessments, :user_assessments
    add_foreign_key :mettl_user_assessments, :user_assessments, on_delete: :cascade

    remove_foreign_key :assessment_translations, :assessments
    add_foreign_key :assessment_translations, :assessments, on_delete: :cascade
  end
end
