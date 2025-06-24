# frozen_string_literal: true

class Idp::AsyncDownload < AsyncResponseRequest::AsyncRequestHandler
  include Rails.application.routes.url_helpers

  def call
    UserReports::GenerateIdpReportPdf.call!(user_idp_plan, user, {
      lang: params[:lang] || I18n.locale,
      include_reflective_questions: params[:include_reflective_questions],
      async_request_uuid: context[:async_request_uuid]
    })

    broadcast :pending
  end

  private

  def user
    @user ||= User.find(params[:user_id])
  end

  def user_idp_plan
    @user_idp_plan ||= user.association(:active_user_idp_plan).scope.
                       includes(
                         :idp_template,
                         user_idp_skills: :skill,
                         user_idp_development_actions: :development_action
                       ).first
  end
end
