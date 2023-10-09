# frozen_string_literal: true

class WorkshopFacilitatorsMailer < ApplicationMailer
  layout 'admin_email'

  def booking_email(workshop, user)
    @user = user
    @workshop = workshop
    ical = Workshops::GenerateIcal.call!(workshop, user, type: :booking)
    attachments['event.ics'] = { mime_type: 'text/calendar', content: ical }
    mail(
      to: @user.email,
      subject: "You have been booked for Assessment center on #{workshop.formatted_start_time}",
      template_path: 'mailer/workshop_facilitators'
    )
  end

  def booking_cancellation_email(workshop, user)
    @user = user
    @workshop = workshop
    ical = Workshops::GenerateIcal.call!(workshop, user, type: :cancel)
    attachments['event.ics'] = { mime_type: 'text/calendar', content: ical }
    mail(
      to: @user.email,
      subject: "You booking is cancelled for Assessment center on #{workshop.formatted_start_time}",
      template_path: 'mailer/workshop_facilitators'
    )
  end
end
