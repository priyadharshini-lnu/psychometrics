# frozen_string_literal: true

module Administration
  class CampaignReportSerializer < ActiveModel::Serializer
    attributes :id, :report_id, :name, :user_access, :assessor_access, :report_family_name

    delegate :name, to: :report
    delegate :name, to: :report_family, prefix: true

    private

    def report
      object.report
    end

    def report_family
      object.report_family
    end
  end
end
