class UsersAssessmentsController < ApplicationController
  def show
    @users_assessment = current_user.users_assessments.find(params[:id])
    # TODO: Need to add find the subject
    @users_result = @users_assessment.
                    users_results.
                    create_with(status: :in_progress).
                    find_or_create_by(subject: params[:subject_id])

    @available_translations = ::Translation.available_translation_for_assessment(@users_assessment.assessment_id)
    if params[:lang] && (@available_translations + [I18n.default_locale.to_s]).include?(params[:lang])
      @users_assessment.update(selected_locale: params[:lang])
    end
    @selected_locale = @users_assessment.selected_locale || user_locale
    @translations = ::Translation.to_hash_for_assessment(@users_assessment.assessment_id, @selected_locale)
  end
end
