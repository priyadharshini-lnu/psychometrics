# frozen_string_literal: true

module Campaigns
  module Bookings
    class RescheduleSlotForm < Bookings::BaseForm
      attribute :new_workshop_booking_id, Integer
      attribute :status, String
      attribute :reason, String
      attribute :workshop_subject_details, Hash

      validates :status, presence: true, inclusion: { in: %w[rescheduled requested_rescheduling] }

      validate :validate_seats_availability
      validate :validate_reschedule_deadline
      validate :validate_user_finished_prework

      private

      def validate_seats_availability
        return if errors.present?

        unless new_workshop.seats_available?
          errors.add(:base, I18n.t('administration.bookings.errors.seats_not_available'))
        end
      end

      def validate_reschedule_deadline
        return if errors.present?

        if !workshop.reschedulable? && status == 'rescheduled'
          errors.add(:base, I18n.t('administration.bookings.errors.reschedule_deadline_passed'))
        end
      end

      def validate_user_finished_prework
        return if errors.present?
        return if ::Bookings::PreworkConditionsSatisfied.call!(workshop_invite.campaign_id, current_user.id)

        errors.add(:base, I18n.t('administration.bookings.errors.prework_not_completed'))
      end

      def new_workshop
        @new_workshop ||= Workshop.find(new_workshop_booking_id)
      end
    end
  end
end
