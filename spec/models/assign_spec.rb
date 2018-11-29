require 'rails_helper'

RSpec.describe Assign, type: :model do
  let!(:membership) { create(:membership) }
  let!(:report) { membership.client.reports.first }
  let!(:license) { create(:license, client: membership.client.root, used_number: 0, report_family: report.report_families.take) }
end
