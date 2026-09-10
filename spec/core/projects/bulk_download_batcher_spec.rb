# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Projects::BulkDownloadBatcher do
  def campaign_group(name, count)
    {
      campaign_name: name,
      file_entries: Array.new(count) { |index| { s3FilePath: "file-#{index}.pdf" } }
    }
  end

  it 'keeps small campaign groups in one batch' do
    batches = described_class.new([
      campaign_group('Campaign 1', 200),
      campaign_group('Campaign 2', 300)
    ]).batch

    expect(batches.length).to eq(1)
    expect(batches.first.sum { |group| group[:file_entries].length }).to eq(500)
  end

  it 'splits campaigns that reach the FaaS batch size' do
    batches = described_class.new([campaign_group('Campaign 1', 1000)]).batch

    expect(batches.length).to eq(2)
    expect(batches.map { |batch| batch.sum { |group| group[:file_entries].length } }).to eq([999, 1])
  end

  it 'packs groups without creating a batch that reaches the FaaS limit' do
    batches = described_class.new([
      campaign_group('Campaign 1', 700),
      campaign_group('Campaign 2', 299),
      campaign_group('Campaign 3', 1)
    ]).batch

    expect(batches.map { |batch| batch.sum { |group| group[:file_entries].length } }).to eq([999, 1])
  end
end
