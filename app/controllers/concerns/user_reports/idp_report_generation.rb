# frozen_string_literal: true

module UserReports::IdpReportGeneration
  extend ActiveSupport::Concern

  include AuthenticateByToken

  included do
    prepend_before_action :authenticate_by_token!, only: %i[pdf_preview]
  end

  # This action is used to generate pdf by puppeter
  def pdf_preview
    I18n.locale = params[:lang] || resource.campaign.project.available_locales.first

    Mobility.with_locale(I18n.locale) do
      @data = {
        template: IdpTemplateSerializer.new.serialize(resource.idp_template),
        user_idp: UserIdpPlanSerializer.new(
          context: {
            reflection_answers: user_reflection_question_answers,
            without_deleted: true
          }
        ).serialize(resource)
      }
    end

    @pdf_export = true

    render 'administration/campaigns/user_idp_reports/idp_report', layout: 'pdf'
  end
end
