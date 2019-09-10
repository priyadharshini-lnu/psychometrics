# frozen_string_literal: true

Licenses::AssignReportBase.class_eval do
  define_method :fetch_licenses do
    client.licenses.with_report_family(report.report_family_ids).order(end_date: :asc)
  end
end

License.class_eval do
  define_method :"enough_licenses?" do
    number + overuse_number > used_number
  end
end

class ChangeMembershipToUserInLicenseUsages < ActiveRecord::Migration[5.1]
  def self.up
    LicenseUsage.delete_all
    License.update_all(used_number: 0, overuse_number: 0)
    add_belongs_to :license_usages, :user, foreign_key: { on_delete: :cascade }
    remove_column :license_usages, :membership_id
    AssignsReport.find_each do |ar|
      ar.send(:use_license)
      ar.save
    rescue Errors::LicenseError
      license = ar.assign.membership.client.root.licenses.find_or_initialize_by(report_family_id:
                                                                                  ar.report.report_family_ids.first)
      if license.new_record?
        license.attributes = {
          start_date: 2.days.ago,
          end_date: 1.days.ago,
          number: 1
        }
        license.save
      else
        license.increment!(:number)
      end
      retry
    end
  end
end
