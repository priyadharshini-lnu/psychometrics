# frozen_string_literal: true

class Api::V2::Administration::ClientFeatureResource < Api::V2::Administration::BaseResource
  attributes :sms_notification, :ai_assistants, :ai_assisted_idp, :global_skills, :idp, :enhance_with_ai,
             :ai_translation, :ai_content_analysis, :use_new_communication_center, :glint_ui,
             :superadmin_tenant_scoping

  ransack_filters %i[client_id_eq]

  audit_log_for :update, payload: '*'
end
