# frozen_string_literal: true

module Administration
  class CampaignAssessmentSerializer < ActiveModel::Serializer
    attributes :id, :assessment_id, :name, :category, :norm_name, :norm_type, :norm_id, :enable_universal_links,
               :universal_link, :norms, :campaign_reports_ids

    delegate :id, :name, :category, to: :assessment
    delegate :name, to: :norm, prefix: true, allow_nil: true

    def universal_link
      assessment.decorate.anonym_link_for_campaign(object.campaign) if object.enable_universal_links
    end

    def norms
      assessment.norms.map { |n| NormSerializer.new(n).to_h }
    end

    def campaign_reports_ids
      report_ids = assessment.reports.ids
      CampaignReport.where(
        'report_id IN (?) and campaign_id = (?)', report_ids, object.campaign_id
      ).ids
    end

    private

    def norm
      object.norm
    end

    def assessment
      object.assessment
    end
  end
end
