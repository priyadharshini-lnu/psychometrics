# frozen_string_literal: true

class Api::V2::Administration::ProjectFeatureResource < Api::V2::Administration::BaseResource
  attributes :sms_notification, :ai_assistants, :ai_assisted_idp, :global_skills, :idp, :enhance_with_ai,
             :ai_translation, :ai_content_analysis, :glint_ui

  ransack_filters %i[project_id_eq]

  audit_log_for :update, payload: '*'
end
