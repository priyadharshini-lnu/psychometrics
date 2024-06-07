# frozen_string_literal: true

class AsyncResponseRequest::AsyncResponse
  include ActiveAttr::Model

  PROCESSING_STATUSES = %i[not_started in_progress completed].freeze
  RESPONSE_TYPES = %i[json redirect].freeze

  attribute :async_request_uuid
  attribute :processing_status
  attribute :response_type, default: :json
  attribute :response_data, default: {}

  validates :processing_status, inclusion: { in: PROCESSING_STATUSES }
  validates :response_type, inclusion: { in: RESPONSE_TYPES }
end
