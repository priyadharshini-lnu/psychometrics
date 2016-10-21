class AssignForm < BaseForm
  attr_accessor :client_ids, :report_ids, :access_reports, :access_reports_at
  attr_accessor :admin_ids, :manager_ids, :user_ids

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
    ids = ids.reject(&:blank?).uniq
    ids
  end
end
