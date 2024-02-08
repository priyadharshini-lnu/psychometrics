# frozen_string_literal: true

module Campaigns
  module Bookings
    class CancelSlotForm < Bookings::BaseForm
      attribute :status, String
      attribute :reason, String

      validates :status, presence: true, inclusion: { in: %w[cancelled requested_cancellation] }

      validate :validate_cancellation_deadline
      validate :validate_late_cancellation_and_rescheduling

      private

      def validate_late_cancellation_and_rescheduling
        if !workshop.allow_late_cancellation_and_rescheduling? && status == 'requested_cancellation'
          errors.add(:base, I18n.t('administration.bookings.errors.late_cancellation_not_allowed'))
        end
      end

      def validate_cancellation_deadline
        if !workshop.cancellable? && status == 'cancelled'
          errors.add(:base, I18n.t('administration.bookings.errors.cancellation_deadline_passed'))
        end
      end
    end
  end
end
