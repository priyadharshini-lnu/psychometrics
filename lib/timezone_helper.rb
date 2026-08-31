# frozen_string_literal: true

module TimezoneHelper
  DEPRECATED_TIMEZONES = {
    # US Time Zones
    'US/Eastern' => 'America/New_York',
    'US/Central' => 'America/Chicago',
    'US/Mountain' => 'America/Denver',
    'US/Pacific' => 'America/Los_Angeles',
    'US/Arizona' => 'America/Phoenix',
    'US/East-Indiana' => 'America/Indiana/Indianapolis',
    'US/Samoa' => 'Pacific/Pago_Pago',
    'US/Alaska' => 'America/Anchorage',
    'US/Hawaii' => 'Pacific/Honolulu',
    'US/Indiana-Starke' => 'America/Indiana/Knox',
    'US/Michigan' => 'America/Detroit',
    'US/Pacific-New' => 'America/Los_Angeles',

    # Asia Time Zones
    'Asia/Saigon' => 'Asia/Ho_Chi_Minh',
    'Asia/Calcutta' => 'Asia/Kolkata',
    'Asia/Dacca' => 'Asia/Dhaka',
    'Asia/Thimbu' => 'Asia/Thimphu',
    'Asia/Rangoon' => 'Asia/Yangon',
    'Asia/Macao' => 'Asia/Macau',
    'Asia/Chungking' => 'Asia/Shanghai',

    # Americas
    'America/Buenos_Aires' => 'America/Argentina/Buenos_Aires',
    'America/Knox_IN' => 'America/Indiana/Knox',

    # Canada
    'Canada/Atlantic' => 'America/Halifax',
    'Canada/Central' => 'America/Winnipeg',
    'Canada/Newfoundland' => 'America/St_Johns',
    'Canada/Pacific' => 'America/Vancouver',
    'Canada/Mountain' => 'America/Edmonton',
    'Canada/Eastern' => 'America/Toronto',

    # Australia/Oceania
    'Australia/Canberra' => 'Australia/Sydney',
    'Australia/Yancowinna' => 'Australia/Adelaide'
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
