# frozen_string_literal: true

require 'rails_helper'

describe Reports::ExportJob do
  let(:assigns_report) { create(:assigns_report, :licensed, report: report, assign: assign) }
  let(:assign)         { create(:assign, membership: membership) }
  let(:membership)     { create(:membership, client: project) }
  let(:client)         { project.client }
  let(:report)         { create(:report, default_language: 'en') }
  let(:user)           { membership.user }
  let(:current_user)   { create(:user) }
  let(:project)        { create(:project) }
  let(:pdf_file)       { Rails.root.join('tmp/test.pdf') }
  let(:dirname)        { Rails.root.join('tmp') }
  let(:file)           { double('file') }

  before do
    allow(AssignsReport).to receive(:find).with(assigns_report.id).and_return(assigns_report)
    allow(User).to receive(:find).with(current_user.id).and_return(current_user)
  end

  subject { described_class.perform_now(assigns_report, current_user) }

  it '#generate_report' do
    allow_any_instance_of(described_class).to receive_messages(save_to_assign_report: nil, remove_tmp_file: nil)

    expect(Exports::Reports::Pdf::ReportExport).to receive(:export).
      with(current_user, report, user, project, lang: report.default_language)
    subject
  end

  it '#save_to_assign_report' do
    allow_any_instance_of(described_class).to receive(:remove_tmp_file)
    allow(Exports::Reports::Pdf::ReportExport).to receive(:export).and_return(pdf_file)

    expect(File).to receive(:open).with(pdf_file).and_yield(file)
    expect(assigns_report).to receive(:generating=).with(false)
    expect(assigns_report).to receive(:pdf=).with(file)
    expect(assigns_report).to receive(:save)
    subject
  end

  it '#remove_tmp_file' do
    allow_any_instance_of(described_class).to receive(:save_to_assign_report)
    allow(Exports::Reports::Pdf::ReportExport).to receive(:export).and_return(pdf_file)

    expect(File).to receive(:dirname).with(pdf_file).and_return(dirname)
    expect(FileUtils).to receive(:remove_dir).with(dirname, true)
    subject
  end
end
