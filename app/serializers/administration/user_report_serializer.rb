# frozen_string_literal: true

module Administration
  class UserReportSerializer < ActiveModel::Serializer
    attributes :id, :report_id, :name, :user_access, :report_family_name, :status

    delegate :name, to: :report
    delegate :name, to: :report_family, prefix: true, allow_nil: true

    private

    def report
      object.report
    end

    def report_family
      object.report_family
    end
  end
end
