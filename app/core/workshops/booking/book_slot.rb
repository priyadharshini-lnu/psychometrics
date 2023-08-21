# frozen_string_literal: true

module Workshops
  module Booking
    class BookSlot < Base
      private_attr_accessor :workshop, :workshop_subject_details, :params

      def initialize(params, current_user)
        super(params[:workshop_id], params[:id], current_user)
        @workshop ||= Workshop.find(workshop_id)
        @workshop_subject_details = params[:workshop_subject_details]
        @params = params
      end

      def call
        WorkshopInvite.transaction do
          @workshop_subject = create_workshop_subject
          workshop_invited_subject.accepted!
          create_workshop_invite_log('accepted')
          increment_booked_seats
        end

        broadcast(:ok)
      end

      private

      def create_workshop_subject
        WorkshopSubject.create!(
          user_id: current_user.id,
          workshop_id: workshop_id,
          campaign_id: workshop.campaign_id,
          preferred_language: workshop_subject_details[:preferred_language],
          neurodivergent: workshop_subject_details[:neurodivergent],
          neurodivergent_comments: workshop_subject_details[:neurodivergent_comment]
        )
      end

      def increment_booked_seats
        query = <<-SQL.squish
          UPDATE workshops
          SET booked_seats = booked_seats + 1
          WHERE id = #{workshop_id} AND booked_seats < total_seats
        SQL
        result = ActiveRecord::Base.connection.execute(query)
        updated_record_count = result.cmd_status.split.last.to_i
        I18n.t('administration.errors.bookings.seats_not_available') if updated_record_count.zero?
      end
    end
  end
end
