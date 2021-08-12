# frozen_string_literal: true

class UserReportDecorator < BaseDecorator
  NORMALIZED_STATUSES = {
    'prepared' => 'ready',
    'not_prepared' => 'not_ready'
  }.freeze

  def api_status
    NORMALIZED_STATUSES[object.status] || object.status
  end
end
