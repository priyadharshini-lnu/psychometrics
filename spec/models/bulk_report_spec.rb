require 'rails_helper'

describe BulkReport, type: :model do
  let(:user) { create(:user) }
  let(:initial_size) { 3 }
  let(:report) { BulkReport.create(user_id: user.id, queue_size: initial_size) }

  describe '#save' do
    context 'when queue_size is zero' do
      let(:report) { BulkReport.new(user_id: user.id, queue_size: 0) }

      it 'calls #compress' do
        expect(report).to receive(:compress).and_return(nil)
        report.save
      end
    end
  end

  describe '#decrement_queue_size' do
    it 'descrements queue_size by 1' do
      expect {
        report.decrement_queue_size
      }.to change { report.queue_size }.from(initial_size).to(initial_size - 1)
    end
  end

  describe '#input_dir' do
    it 'not empty' do
      expect(report.input_dir).not_to be_empty
    end
  end

  describe '#output_file' do
    it 'not empty' do
      expect(report.output_file).not_to be_empty
    end
  end

  describe '#compress' do
    it 'runs' do
      expect(BulkReports::CompressJob).to receive(:perform_later).with(report).and_return(nil)
      expect(report).to receive(:decrement_queue_size).and_return(nil)
      report.compress
    end
  end

  describe '#expiration_date' do
    it 'responds to :to_date' do
      expect(report.expiration_date).to respond_to(:to_date)
    end
  end

  describe '#public_download_url' do
    it 'valid URI' do
      expect {
        URI(report.public_download_url)
      }.not_to raise_error
    end
  end

  describe '#private_download_url' do
    before do
      file = double('file', url: '/foo/bar')
      allow(report).to receive(:file).and_return(file)
    end

    it 'valid URI' do
      expect {
        URI(report.private_download_url)
      }.not_to raise_error
    end
  end
end
