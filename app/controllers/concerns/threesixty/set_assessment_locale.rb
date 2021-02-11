# frozen_string_literal: true

module Threesixty::SetAssessmentLocale
  extend ActiveSupport::Concern

  def set_locale_for_users_result(users_result)
    fallback_locale = @users_result.selected_locale || @current_user.locale || user_locale
    @available_translations = ::Translation.available_translation_for_assessment(users_result.assessment_id)
    valid_locales = @available_translations + [I18n.default_locale.to_s]

    if params[:lang] && valid_locales.include?(params[:lang])
      @selected_locale = params[:lang]
      @users_result.update(selected_locale: @selected_locale) if @users_result.selected_locale != selected_locale

    elsif valid_locales.include?(fallback_locale)
      @selected_locale = fallback_locale
    end

    @selected_locale ||= I18n.default_locale.to_s # rubocop:disable Naming/MemoizedInstanceVariableName
  end
end
