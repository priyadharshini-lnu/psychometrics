class AddConstraints < ActiveRecord::Migration[5.0]
  def change
    remove_foreign_key :licenses, :report_families
    remove_foreign_key :assigns,  :memberships

    add_foreign_key :assessments,     :clients,         column: :owner_id,              on_delete: :nullify
    add_foreign_key :libraries,       :clients,         column: :owner_id,              on_delete: :nullify
    add_foreign_key :questions,       :clients,         column: :owner_id,              on_delete: :nullify
    add_foreign_key :dimensions,      :clients,         column: :owner_id,              on_delete: :nullify
    add_foreign_key :norms,           :clients,         column: :owner_id,              on_delete: :nullify
    add_foreign_key :reports,         :clients,         column: :owner_id,              on_delete: :nullify
    add_foreign_key :communications,  :clients,         column: :owner_id,              on_delete: :nullify

    add_foreign_key :assessments,     :dimensions,      column: :dimension_id,          on_delete: :restrict
    add_foreign_key :norms,           :dimensions,      column: :dimension_id,          on_delete: :restrict

    add_foreign_key :clients,         :users,           column: :modified_by_id,        on_delete: :nullify
    add_foreign_key :users,           :users,           column: :modified_by_id,        on_delete: :nullify
    add_foreign_key :users,           :users,           column: :created_by_id,         on_delete: :nullify
    add_foreign_key :clients,         :users,           column: :created_by_id,         on_delete: :nullify

    add_foreign_key :assigns,         :assigns,         column: :project_assign_id
    add_foreign_key :assigns,         :memberships,     column: :membership_id,         on_delete: :cascade
    add_foreign_key :assigns_reports, :assigns,         column: :assign_id,             on_delete: :cascade
    add_foreign_key :assigns_reports, :reports,         column: :report_id,             on_delete: :restrict

    add_foreign_key :memberships,     :memberships,     column: :project_membership_id
    add_foreign_key :license_usages,  :licenses,        column: :license_id,            on_delete: :cascade
    add_foreign_key :license_usages,  :assigns_reports, column: :assigns_report_id,     on_delete: :nullify
    add_foreign_key :licenses,        :report_families, column: :report_family_id,      on_delete: :restrict
  end
end
