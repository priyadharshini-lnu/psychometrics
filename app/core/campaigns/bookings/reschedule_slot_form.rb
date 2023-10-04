# frozen_string_literal: true

module Campaigns
  module Bookings
    class RescheduleSlotForm < Bookings::BaseForm
      attribute :new_workshop_id, Integer
      attribute :status, String
      attribute :reason, String
      attribute :workshop_subject_details, Hash

      validates :status, presence: true, inclusion: { in: %w[rescheduled requested_rescheduling] }

      validate :validate_reschedule_deadline
      validate :validate_user_finished_prework

      private

      def validate_reschedule_deadline
        if !workshop.reschedulable? && status == 'rescheduled'
          errors.add(:base, I18n.t('administration.bookings.errors.reschedule_deadline_passed'))
        end
      end

      def validate_user_finished_prework
        return if errors.present?
        return if ::Bookings::PreworkConditionsSatisfied.call!(workshop_invite.campaign_id, current_user.id)

        errors.add(:base, I18n.t('administration.bookings.errors.prework_not_completed'))
      end
    end
  end
end
