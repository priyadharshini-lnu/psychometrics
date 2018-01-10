module CommunicationsHelper
  def date_without_seconds_and_timezone(date = DateTime.current)
    I18n.l(date, format: :iso8601_without_seconds_and_timezone)
  end
end
