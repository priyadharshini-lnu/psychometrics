# frozen_string_literal: true

module Mettl
  class SetMettlAssessmentReturnUrlJob < ApplicationJob
    def perform(external_assessment_id)
      mettl_assessment = MettlAssessment.find_by(product_id: external_assessment_id)

      if mettl_assessment
        request_body = { exitRedirectionURL: assessment_redirect_url(mettl_assessment) }

        ::Mettl::EditAssessment.call!(mettl_assessment, request_body)
      end
    end

    private

    def assessment_redirect_url(mettl_assessment)
      Utility::Url.generate(
        :mettl_assessment_redirect_url,
        subdomain: mettl_assessment.project.subdomain,
        mettl_assessment_id: mettl_assessment.id
      )
    end
  end
end
