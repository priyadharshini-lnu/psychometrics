# frozen_string_literal: true

module WorkshopFacilitators
  extend ActiveSupport::Concern

  included do
    after_create :add_user_booking, :send_booking_email
    after_destroy :remove_user_booking, :send_cancel_booking_email
  end

  def add_user_booking
    UserBooking.create!(
      booked_by_resource: workshop, user: user, start_time: workshop.start_time, end_time: workshop.end_time
    )
  end

  def remove_user_booking
    UserBooking.find_by(booked_by_resource: workshop, user: user)&.destroy!
  end

  def send_booking_email
    WorkshopFacilitatorsMailer.booking_email(workshop, user).deliver_later
  end

  def send_cancel_booking_email
    WorkshopFacilitatorsMailer.booking_cancellation_email(workshop, user).deliver_later
  end
end
