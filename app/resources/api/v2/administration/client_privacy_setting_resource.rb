# frozen_string_literal: true

class Api::V2::Administration::ClientPrivacySettingResource < Api::V2::Administration::BaseResource
  attributes :disable_data_processing

  has_one :client

  ransack_filters %i[client_id_eq]
end
