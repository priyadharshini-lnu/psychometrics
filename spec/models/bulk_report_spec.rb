# frozen_string_literal: true

require 'rails_helper'

describe BulkReport, type: :model do
  let(:user) { create(:user) }
  let(:report) { BulkReport.create(user_id: user.id) }

  describe '#input_dir' do
    it 'not empty' do
      expect(report.input_dir).not_to be_empty
    end
  end

  describe '#output_dir' do
    it 'not empty' do
      expect(report.output_dir).not_to be_empty
    end
  end

  describe '#expiration_date' do
    it 'responds to :to_date' do
      expect(report.expiration_date).to respond_to(:to_date)
    end
  end

  describe '#public_download_urls' do
    it 'valid URI' do
      expect do
        puts "urls: #{report.public_download_urls}"
        URI(report.public_download_urls.first)
      end.not_to raise_error
    end
  end

  describe '#private_download_url' do
    before do
      file = double('file', url: '/foo/bar')
      allow(report).to receive(:files).and_return([file])
    end

    it 'valid URI' do
      expect do
        URI(report.private_download_url(0))
      end.not_to raise_error
    end
  end
end
