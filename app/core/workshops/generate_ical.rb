# frozen_string_literal: true

module Workshops
  class GenerateIcal < BaseCommand
    private_attr_reader :workshop, :user, :type

    def initialize(workshop, user, type: :booking)
      @workshop = workshop
      @user = user
      @type = type
    end

    def call
      tzid = workshop.timezone
      tzid = TimezoneHelper.normalize(tzid)
      start_time = workshop.start_time.in_time_zone(tzid)
      end_time = workshop.end_time.in_time_zone(tzid)
      cal = Icalendar::Calendar.new
      tz_info = TZInfo::Timezone.get tzid
      cal.add_timezone tz_info.ical_timezone(start_time)
      add_event_to_calendar(cal, start_time, end_time, tzid)

      type == :booking ? cal.publish : cal.cancel

      broadcast :ok, cal.to_ical
    end

    private

    def platform_link_for(user)
      return assessor_platform_link if user.admin?

      Utility::Url.generate(:invites_url, subdomain: user.project.subdomain)
    end

    def assessor_platform_link
      project = workshop&.campaign&.project
      host_options = admin_host_options_for(project)
      url_options = default_url_params.merge(host_options).merge(
        project_id: project,
        id: workshop&.campaign
      )
      base_url = Rails.application.routes.url_helpers.administration_project_new_campaign_url(url_options)

      "#{administration_to_admin_url(base_url)}/scheduling/assessment_center/#{workshop.id}"
    end

    def default_url_params
      mailer_defaults = ActionMailer::Base.default_url_options
      {
        protocol: Settings.protocol,
        host: mailer_defaults[:host],
        port: mailer_defaults[:port]
      }.compact
    end

    def admin_host_options_for(project)
      AdminSubdomain.host_options_for(user: user, project: project)
    end

    def generate_event_description(start_time, platform_link)
      <<~DESC.strip
        You have a workshop booked.

        Campaign: #{workshop&.campaign&.name}
        Project: #{workshop&.campaign&.project&.name}
        Date: #{I18n.l(start_time, format: :long)}
        Platform Link: #{platform_link}
      DESC
    end

    def generate_event_description_html(start_time, platform_link)
      <<~HTML.strip
        <html>
          <body>
            <p>You have a workshop booked.</p>
            <p><strong>Campaign:</strong> #{workshop&.campaign&.name}<br/>
            <strong>Project:</strong> #{workshop&.campaign&.project&.name}<br/>
            <strong>Date:</strong> #{I18n.l(start_time, format: :long)}<br/>
            <a href="#{platform_link}">Link to Platform</a></p>
          </body>
        </html>
      HTML
    end

    def administration_to_admin_url(path)
      path.gsub('/administration/', '/admin/')
    end

    def organizer_email
      no_reply_email = "no-reply@#{Settings.domain}"
      user.project&.smtp_setting&.from_email.presence || no_reply_email
    end

    def organizer_name
      user.project&.smtp_setting&.from_name.presence || Branding.display_name
    end

    def add_event_to_calendar(cal, start_time, end_time, tzid)
      cal.event do |e|
        e.uid = "#{workshop.id}-#{user.id}-facilitators-booking@#{Settings.domain}"
        e.status = type == :booking ? 'CONFIRMED' : 'CANCELLED'
        e.dtstart = Icalendar::Values::DateTime.new(start_time, 'tzid' => tzid)
        e.dtend = Icalendar::Values::DateTime.new(end_time, 'tzid' => tzid)
        e.organizer = Icalendar::Values::CalAddress.new("mailto:#{organizer_email}", cn: organizer_name,
                                                        role: 'REQ-PARTICIPANT')
        e.append_attendee(Icalendar::Values::CalAddress.new("mailto:#{user.email}", cn: user.decorate.full_name,
                                                            role: 'REQ-PARTICIPANT'))
        e.summary = "Booked for center on #{I18n.l(start_time, format: :workshop_date)} " \
                    "for campaign #{workshop.campaign.name} and project #{workshop.campaign.project.name}"

        platform_link = platform_link_for(user)

        plain_description = generate_event_description(start_time, platform_link)
        html_description = generate_event_description_html(start_time, platform_link)

        e.description = plain_description
        e.x_alt_desc = Icalendar::Values::Text.new(html_description, 'FMTTYPE' => 'text/html')
      end
    end
  end
end
