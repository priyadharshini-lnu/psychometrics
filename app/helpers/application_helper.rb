# frozen_string_literal: true

module ApplicationHelper
  def device_html_style
    if @current_project&.background&.url
      "background-image: url('#{@current_project.background.url}');"
    elsif @current_project&.background_color
      "background: #{@current_project.background_color};"
    end
  end

  def lang_param
    params[:lang] || I18n.locale
  end
end
