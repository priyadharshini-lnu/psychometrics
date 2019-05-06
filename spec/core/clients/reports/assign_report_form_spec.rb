require 'rails_helper'

describe Clients::Reports::AssignReportForm do
  subject { described_class.new }
  it { is_expected.to respond_to(:report_family_id,
                                 :adding_report_ids, :removing_report_ids,
                                 :adding_user_access_report_ids, :removing_user_access_report_ids, 
                                 :is_applying_to_existing_users) }
end
