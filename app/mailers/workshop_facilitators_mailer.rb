# frozen_string_literal: true

class WorkshopFacilitatorsMailer < ApplicationMailer
  layout 'admin_email'

  def booking_email(workshop, user)
    @user = user
    @workshop = workshop
    @url = administration_project_new_campaign_url(
      @workshop&.campaign&.project, @workshop&.campaign
    ) + "/scheduling/assessment_center/#{@workshop.id}"
    ical = Workshops::GenerateIcal.call!(workshop, user, type: :booking)
    attachments['event.ics'] = { mime_type: 'text/calendar', content: ical }
    subject = "You have been booked for Assessment center on #{workshop.formatted_start_time} " \
              "for #{workshop.campaign.name} in #{workshop.campaign.project.name}"
    send_email(
      @user,
      subject:,
      template_path: 'mailer/workshop_facilitators'
    )
  end

  def booking_cancellation_email(workshop, user)
    @user = user
    @workshop = workshop
    @url = administration_project_new_campaign_url(
      @workshop&.campaign&.project, @workshop&.campaign
    ) + "/scheduling/assessment_center/#{@workshop.id}"
    ical = Workshops::GenerateIcal.call!(workshop, user, type: :cancel)
    attachments['event.ics'] = { mime_type: 'text/calendar', content: ical }
    subject = "Your booking is cancelled for Assessment center on #{workshop.formatted_start_time} " \
              "for #{workshop.campaign.name} in #{workshop.campaign.project.name}"
    send_email(
      @user,
      subject:,
      template_path: 'mailer/workshop_facilitators'
    )
  end
end
