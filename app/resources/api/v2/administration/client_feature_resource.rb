# frozen_string_literal: true

class Api::V2::Administration::ClientFeatureResource < Api::V2::Administration::BaseResource
  attributes :sms_notification

  ransack_filters %i[client_id_eq]

  audit_log_for :update, payload: '*'
end
