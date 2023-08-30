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
          increment_booked_seats(workshop_id)
        end

        broadcast(:ok)
      end

      private

      def create_workshop_subject
        WorkshopSubject.create!(
          user_id: current_user.id,
          workshop_id: workshop_id,
          campaign_id: workshop.campaign_id,
          workshop_invited_subject_id: workshop_invited_subject.id,
          scheduling_status: :scheduled,
          preferred_language: workshop_subject_details[:preferred_language],
          neurodivergent: workshop_subject_details[:neurodivergent],
          neurodivergent_comments: workshop_subject_details[:neurodivergent_comment]
        )
      end
    end
  end
end
