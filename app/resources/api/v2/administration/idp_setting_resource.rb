# frozen_string_literal: true

class Api::V2::Administration::IdpSettingResource < Api::V2::Administration::BaseResource
  attributes :allow_global_skills, :manager_approves_idp, :manager_can_edit_idp

  has_one :project

  ransack_filters %i[project_id_eq]

  audit_log_for :update, payload: '*'
end
