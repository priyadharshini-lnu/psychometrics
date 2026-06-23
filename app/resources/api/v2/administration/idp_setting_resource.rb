# frozen_string_literal: true

class Api::V2::Administration::IdpSettingResource < Api::V2::Administration::BaseResource
  attributes :manager_approves_idp, :manager_can_edit_idp,
             :require_all_development_actions_complete

  has_one :project

  ransack_filters %i[project_id_eq]

  audit_log_for :update, payload: '*'
end
