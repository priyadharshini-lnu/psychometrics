require 'rails_helper'

describe Clients::AssignReports::AssignReportForm do
  subject { described_class.new }
  it { is_expected.to respond_to(:report_family_id, :report_ids,
                                 :remove_report_ids, :user_access_report_ids,
                                 :apply_to_existing_users) }
end
