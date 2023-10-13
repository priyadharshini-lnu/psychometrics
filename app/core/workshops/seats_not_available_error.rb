# frozen_string_literal: true

module Workshops
  class SeatsNotAvailableError < StandardError
    def message
      I18n.t('administration.bookings.errors.seats_not_available')
    end
  end
end
