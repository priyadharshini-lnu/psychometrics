# frozen_string_literal: true

module Threesixty::SetAssessmentLocale
  extend ActiveSupport::Concern

  def set_locale_for_assessment(assessment_id)
    @available_translations = ::Translation.available_translation_for_assessment(assessment_id)
    if params[:lang] && (@available_translations + [I18n.default_locale.to_s]).include?(params[:lang])
      @selected_locale = params[:lang]
    end
    @selected_locale ||= user_locale # rubocop:disable Naming/MemoizedInstanceVariableName
  end
end
