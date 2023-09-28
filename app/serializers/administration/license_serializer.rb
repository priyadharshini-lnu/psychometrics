# frozen_string_literal: true

module Administration
  class LicenseSerializer < ActiveModel::Serializer
    attributes :number, :overuse_number, :used_number, :start_date, :end_date, :report_family_id, :disabled, :type
  end
end
