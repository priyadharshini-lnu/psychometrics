# frozen_string_literal: true

require 'rails_helper'

describe Assigns::GenerateReport do
  it 'calls generate report on enabled assign reports' do
    user = double('User')
    assign = create(:assign, :with_assign_reports)

    expect(AssignsReports::GenerateReport).to receive(:call).with(assign.assigns_reports, user, assign)

    described_class.call!(assign, user)
  end
end
