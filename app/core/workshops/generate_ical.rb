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
      start_time = workshop.start_time
      end_time = workshop.end_time
      cal = Icalendar::Calendar.new
      tzid = 'Asia/Dubai'
      tz_info = TZInfo::Timezone.get tzid
      cal.add_timezone tz_info.ical_timezone(start_time)
      cal.event do |e|
        e.uid = "#{workshop.id}-#{user.id}-facilitators-booking@#{Settings.domain}"
        e.status = type == :booking ? 'CONFIRMED' : 'CANCELLED'
        e.dtstart = Icalendar::Values::DateTime.new(start_time, 'tzid' => tzid)
        e.dtend = Icalendar::Values::DateTime.new(end_time, 'tzid' => tzid)
        e.organizer = Icalendar::Values::CalAddress.new("mailto:#{user.email}", cn: user.decorate.full_name,
                                                        role: 'REQ-PARTICIPANT')
        e.summary = "Booked for center on #{I18n.l(start_time, format: :workshop_date)} " \
                    "for campaign #{workshop.campaign.name} and project #{workshop.campaign.project.name}"
      end
      type == :booking ? cal.publish : cal.cancel

      broadcast :ok, cal.to_ical
    end
  end
end
