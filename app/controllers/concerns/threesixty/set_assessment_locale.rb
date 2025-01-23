# frozen_string_literal: true

module Threesixty::SetAssessmentLocale
  extend ActiveSupport::Concern

  def set_locale_for_user_assessment(user_assessment)
    fallback_locale = user_assessment.selected_locale || @current_user.locale ||
                      user_assessment.assessment.default_language || user_locale
    @available_translations = ::Translation.available_translation_for_assessment(user_assessment.assessment_id)
    valid_locales = @available_translations + [user_assessment.assessment.default_language]

    if params[:lang] && valid_locales.include?(params[:lang])
      @selected_locale = params[:lang]
      user_assessment.update(selected_locale: @selected_locale) if user_assessment.selected_locale != selected_locale
    elsif valid_locales.include?(fallback_locale)
      @selected_locale = fallback_locale
    end

    @selected_locale ||= I18n.default_locale.to_s # rubocop:disable Naming/MemoizedInstanceVariableName
  end
end
