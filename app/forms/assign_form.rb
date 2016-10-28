class AssignForm < BaseForm
  attr_accessor :client_ids, :report_ids, :access_reports, :access_reports_at, :access_reports_at_date, :access_reports_at_time
  attr_accessor :admin_ids, :manager_ids, :user_ids

  def access_reports
    @access_reports || (access_reports_at.nil? ? 'immediately' : 'specific_datetime')
  end

  def access_reports_at
    return @access_reports_at if @access_reports_at
    return DateTime.parse("#{access_reports_at_date} #{access_reports_at_time}") if access_reports_at_date && access_reports_at_time
  end

  def access_reports_at_date
    return @access_reports_at_date if @access_reports_at_date
    return @access_reports_at.strftime('%Y-%m-%d') if @access_reports_at
  end

  def access_reports_at_time
    return @access_reports_at_time if @access_reports_at_time
    return @access_reports_at.strftime('%l:%M %p') if @access_reports_at
  end

  def client_ids=(ids)
    @client_ids = parse_ids(ids)
  end

  def report_ids=(ids)
    @report_ids = parse_ids(ids)
  end

  def admin_ids=(ids)
    @admin_ids = parse_ids(ids)
  end

  def manager_ids=(ids)
    @manager_ids = parse_ids(ids)
  end

  def user_ids
    @user_ids || []
  end

  def user_ids=(ids)
    @user_ids = parse_ids(ids)
  end

  private

  def parse_ids(ids)
    ids = ids.split(',') if ids.is_a?(String)
    ids = (ids || []).reject(&:blank?).uniq.map(&:to_i)
    ids
  end
end
