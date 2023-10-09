# frozen_string_literal: true

module Campaigns
  module Bookings
    class CancelSlotForm < Bookings::BaseForm
      attribute :status, String
      attribute :reason, String

      validates :status, presence: true, inclusion: { in: %w[cancelled requested_cancellation] }

      validate :validate_cancellation_deadline

      private

      def validate_cancellation_deadline
        if !workshop.cancellable? && status == 'cancelled'
          errors.add(:base, I18n.t('administration.bookings.errors.cancellation_deadline_passed'))
        end
      end
    end
  end
end
