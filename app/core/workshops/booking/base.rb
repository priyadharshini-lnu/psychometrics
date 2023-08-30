# frozen_string_literal: true

module Workshops
  module Booking
    class Base < BaseCommand
      private_attr_accessor :workshop_invite, :workshop_id, :current_user

      def initialize(workshop_id, workshop_invite_id, current_user)
        @workshop_invite = WorkshopInvite.find(workshop_invite_id)
        @workshop_id = workshop_id
        @current_user = current_user
      end

      protected

      def workshop_invited_subject
        @workshop_invited_subject ||= WorkshopInvitedSubject.find_by(
          workshop_invite_id: workshop_invite.id, user_id: current_user.id
        )
      end

      def workshop
        @workshop ||= Workshop.find(workshop_id)
      end

      def create_workshop_invite_log(action)
        WorkshopInviteLog.create!(
          workshop_invite_id: workshop_invite.id,
          user_id: current_user.id,
          created_by_id: current_user.id,
          action: action
        )
      end

      def increment_booked_seats(workshop_id)
        query = <<-SQL.squish
          UPDATE workshops
          SET booked_seats = booked_seats + 1
          WHERE id = #{workshop_id.to_i} AND booked_seats < total_seats
        SQL
        result = ActiveRecord::Base.connection.execute(query)
        updated_record_count = result.cmd_status.split.last.to_i
        I18n.t('administration.errors.bookings.seats_not_available') if updated_record_count.zero?
      end
    end
  end
end
