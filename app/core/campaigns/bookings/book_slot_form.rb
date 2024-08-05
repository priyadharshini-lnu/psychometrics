# frozen_string_literal: true

module Campaigns
  module Bookings
    class BookSlotForm < Bookings::BaseForm
      attribute :workshop_subject_details, Hash

      validate :validate_seats_availability
      validate :validate_user_can_book
      validate :validate_user_finished_prework
      validate :validate_rebooking_after_cancellation
      validate :validate_scheduling_deadline

      def validate_seats_availability
        return if errors.present?

        unless workshop.seats_available?
          errors.add(:base, I18n.t('administration.bookings.errors.seats_not_available'))
        end
      end

      def validate_user_can_book
        return if errors.present?

        errors.add(:base, I18n.t('administration.bookings.errors.already_booked')) if user_already_booked?
      end

      def validate_user_finished_prework
        return if errors.present?
        return if ::Bookings::PreworkConditionsSatisfied.call!(workshop_invite.campaign_id, current_user.id)

        errors.add(:base, I18n.t('administration.bookings.errors.prework_not_completed'))
      end

      def validate_rebooking_after_cancellation
        return if errors.present?

        if workshop_invited_subject.cancelled? && !workshop.cancellable?
          errors.add(:base, I18n.t('administration.bookings.errors.cancelled_and_rebook_deadline_passed'))
        end
      end

      def validate_scheduling_deadline
        return if errors.present?

        if workshop.scheduling_lead_time_passed?
          errors.add(:base, I18n.t('administration.bookings.errors.booking_deadline_passed'))
        end
      end

      private

      def user_already_booked?
        WorkshopSubject.participatable.exists?(
          campaign_id: workshop_invite.campaign_id, user_id: current_user.id
        )
      end

      def workshop_invited_subject
        @workshop_invited_subject ||= WorkshopInvitedSubject.find_by(
          workshop_invite_id: workshop_invite.id, user_id: current_user.id
        )
      end
    end
  end
end
