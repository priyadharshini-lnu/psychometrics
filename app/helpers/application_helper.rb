# frozen_string_literal: true

module ApplicationHelper
  # Defining the constant here since this is not used anywhere else
  # instead of in an initializer.
  RANDOM_BACKGROUND_IMAGES_COUNT = 7

  def device_html_style
    @current_project ? project_background : random_background
  end

  def project_background
    if @current_project&.background&.url
      "background-image: url('#{@current_project.background.url}');"
    elsif @current_project&.background_color.present?
      "background: #{@current_project.background_color};"
    else
      random_background
    end
  end

  def random_background
    "background-image: url('#{image_path(randomized_background_image)}');"
  end

  def randomized_background_image
    background_images[Date.today.day % RANDOM_BACKGROUND_IMAGES_COUNT]
  end

  def background_images
    Array.new(RANDOM_BACKGROUND_IMAGES_COUNT) { |i| "administration/backgrounds/lh-background-#{i}.png" }
  end

  def lang_param
    params[:lang] || I18n.locale
  end

  def namespace_name
    @current_client ? 'users' : 'administration'
  end

  def detect_browser(user_agent)
    browser = Browser.new(user_agent)
    platform = browser.platform.id
    settings = Settings.browser_requirements.platforms[platform.to_sym] || Settings.browser_requirements.default

    BrowserDetector.new(settings).detect(browser)
  end
end
