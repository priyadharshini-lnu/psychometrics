# frozen_string_literal: true

module AssessmentUtilities
  extend ActiveSupport::Concern

  private

  def redirect_and_ensure_valid_assessment_locale
    return unless current_assessment
    return if params[:lang].blank?

    return if current_assessment.available_languages.map(&:to_s).include?(params[:lang].to_s)

    redirect_to(url_for(request.query_parameters.merge(lang: current_assessment.default_language, only_path: true)))
  end
end
