# frozen_string_literal: true

require 'rails_helper'

describe Licenses::FetchQuery do
  let(:client) { create(:tenancy) }
  let(:report) { create(:report) }
  let(:license) { create(:license, client: client, report_family: report.report_families.first) }

  it 'gets license if present for report' do
    licenses = described_class.new(client, report).query

    expect(licenses).to include(license)
  end

  it "doesn't get license if license is not present from the report" do
    licenses = described_class.new(client, create(:report)).query

    expect(licenses).to be_empty
  end

  it "doesn't get license if license is not present from the report" do
    licensees = described_class.new(create(:tenancy), report).query

    expect(licensees).to be_empty
  end
end
