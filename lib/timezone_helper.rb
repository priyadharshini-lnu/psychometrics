# frozen_string_literal: true

module TimezoneHelper
  DEPRECATED_TIMEZONES = {
    'Asia/Saigon' => 'Asia/Ho_Chi_Minh',
    'Asia/Calcutta' => 'Asia/Kolkata',
    'Asia/Dacca' => 'Asia/Dhaka',
    'Asia/Thimbu' => 'Asia/Thimphu',
    'Asia/Rangoon' => 'Asia/Yangon',
    'Asia/Macao' => 'Asia/Macau'
  }.freeze

  def self.normalize(timezone)
    return timezone if timezone.nil?

    DEPRECATED_TIMEZONES[timezone] || timezone
  end

  def self.valid?(timezone)
    return false if timezone.nil?

    ActiveSupport::TimeZone[normalize(timezone)].present?
  end

  def self.to_zone(timezone)
    return nil if timezone.nil?

    ActiveSupport::TimeZone[normalize(timezone)]
  end

  def self.in_timezone(time, timezone)
    return time if timezone.nil?

    zone = to_zone(timezone)
    zone.present? ? time.in_time_zone(zone) : time
  end
end
