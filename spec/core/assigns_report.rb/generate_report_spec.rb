# frozen_string_literal: true

require 'rails_helper'

describe AssignsReports::GenerateReport do
  let(:user) { double('User') }

  it 'return :none_successfull if there were no report generated' do
    assigns_reports = build_list(:assigns_report, 2)
    allow(Reports::IsGeneratable).to receive(:call!).and_return(false)

    result = described_class.call!(assigns_reports, user)

    expect(result).to eq(:none_successfull)
  end

  it 'return :some_successfull if there were no report generated' do
    assigns_reports = create_list(:assigns_report, 2, :licensed)
    allow(Reports::IsGeneratable).to receive(:call!).with(assigns_reports[0].report, assigns_reports[0].assign).
      and_return(true)
    allow(Reports::IsGeneratable).to receive(:call!).with(assigns_reports[1].report, assigns_reports[1].assign).
      and_return(false)

    expect(Reports::ExportJob).to receive(:perform_later).with(assigns_reports[0], user)
    result = described_class.call!(assigns_reports, user)

    expect(result).to eq(:some_successfull)
  end

  it 'return :all_successfull if there were no report generated' do
    assigns_reports = create_list(:assigns_report, 2, :licensed)
    allow(Reports::IsGeneratable).to receive(:call!).and_return(true)

    expect(Reports::ExportJob).to receive(:perform_later).with(assigns_reports[0], user)
    expect(Reports::ExportJob).to receive(:perform_later).with(assigns_reports[1], user)
    result = described_class.call!(assigns_reports, user)

    expect(result).to eq(:all_successfull)
  end
end
