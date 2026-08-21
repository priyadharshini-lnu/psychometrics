# frozen_string_literal: true

module ApplicationHelper
  include Rails.application.routes.url_helpers

  # Defining the constant here since this is not used anywhere else
  # instead of in an initializer.
  AUTH_BACKGROUND_IMAGES_COUNT = 7

  def license_page_url(client)
    "#{admin_url}/clients/#{client.id}/licenses"
  end

  def show_dashboard?
    return false if current_user.is?(:superadmin)
    return false unless current_user.has_grant?(:dashboards, :view)

    Api::Administration::DashboardPolicy::Scope.new(current_user, Dashboard).resolve.preview_available.exists?
  end

  def device_html_style
    current_project ? project_background : random_background
  end

  def project_background
    if current_project&.background&.image?
      "background-image: url('#{current_project.background.url}');"
    elsif current_project&.background_color.present?
      "background: #{current_project.background_color};"
    else
      random_background
    end
  end

  def random_background
    "background-image: url('#{image_path(auth_background_image)}');"
  end

  # Rotates by day of month; preview any at /assets/administration/backgrounds/lh-auth-background-<0-6>.jpg,
  # e.g. https://ttedev.me:3030/assets/administration/backgrounds/lh-auth-background-3.jpg
  def auth_background_image
    "administration/backgrounds/lh-auth-background-#{Time.zone.today.day % AUTH_BACKGROUND_IMAGES_COUNT}.jpg"
  end

  def lang_param
    params[:lang] || I18n.locale
  end

  def namespace_name
    current_client ? 'users' : 'administration'
  end

  def detect_browser(user_agent)
    browser = Browser.new(user_agent)
    platform = browser.platform.id
    settings = Settings.browser_requirements.platforms[platform.to_sym] || Settings.browser_requirements.default

    BrowserDetector.new(settings).detect(browser)
  end

  def admin_dashboard_path
    admin_path
  end

  def show_maintenance_alert?
    return false if maintenance_start_date.nil? || maintenance_end_date.nil?
    return false if Time.current > maintenance_end_date

    maintenance_subdomains.empty? || maintenance_subdomains.include?(current_project&.subdomain)
  end

  def maintenance_started?
    return false unless maintenance_start_date

    (maintenance_subdomains.empty? || maintenance_subdomains.include?(current_project&.subdomain)) &&
      Time.zone.now > maintenance_start_date && Time.zone.now < maintenance_end_date
  end

  def maintenance_subdomains
    @maintenance_subdomains ||= ENV.fetch('UAE_DATA_MIGRATION_SUBDOMAINS', '').split(',')
  end

  def maintenance_start_date
    @maintenance_start_date ||= ENV['MAINTENANCE_START_DATETIME']&.to_time
  end

  def maintenance_end_date
    maintenance_start_date + ENV.fetch('MAINTENANCE_DURATION', 0).to_i.minutes
  end

  def duration
    (ENV.fetch('MAINTENANCE_DURATION', 0).to_i / 60.0).round(1)
  end

  def maintenance_time_frame
    duration_minutes = ENV.fetch('MAINTENANCE_DURATION', 0).to_i
    formatted_duration = distance_of_time_in_words(0, duration_minutes.minutes)
    {
      start_date: maintenance_start_date.utc.strftime('%B %d, %Y at %l:%M%p GMT'), # October 30, 2021 at 3:30pm GST
      duration: formatted_duration
    }
  end

  def current_project
    instance_variable_get(:@current_project)
  end

  def current_client
    instance_variable_get(:@current_client)
  end
end
