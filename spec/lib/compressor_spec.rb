# frozen_string_literal: true

require 'rails_helper'
require 'zip'

describe Compressor do
  before(:all) do
    @report = build_stubbed(:bulk_report)
    path = Rails.root.join('tmp', 'bulk_reports').to_s
    @input_dir = File.join(path, @report.id.to_s)
    @output_dir = File.join(path, "compressed_#{@report.id}")
    @max_file_size = 200_000 # 200 Kb

    [@input_dir, @output_dir].each { |dir| FileUtils.mkdir_p(dir) unless File.exist?(dir) }

    ['one@example.com', 'two@example.com'].each_with_index do |user, index|
      FileUtils.mkdir_p(File.join(@input_dir, user))
      (2 - index).times do |i|
        File.open(File.join(@input_dir, user, "report_#{i}.txt"), 'w') do |f|
          Faker::Lorem.paragraphs(2046).each { |p| f.puts p }
        end
      end
    end
  end

  after(:all) do
    FileUtils.rm_rf(@output_dir) if File.exist?(@output_dir)
    FileUtils.rm_rf(@input_dir) if File.exist?(@input_dir)
  end

  after(:each) do
    FileUtils.rm_rf(Dir.glob("#{@output_dir}/*"))
  end

  context '.process' do
    subject { described_class.new(@input_dir, @output_dir, size_limit: @max_file_size).process }

    it 'creates multiple zip files if the size limit exceeds' do
      described_class.new(@input_dir, @output_dir, size_limit: 100_00).process # 10 Kb

      expect(Dir.glob("#{@output_dir}/*")).not_to be_empty
      expect(Dir.glob("#{@output_dir}/*").length).to be > 1
    end

    it "creates single zip file if size limit doesn't exceed" do
      subject

      expect(Dir.glob("#{@output_dir}/*")).not_to be_empty
      expect(Dir.glob("#{@output_dir}/*").length).to be == 1
    end

    it 'includes all files from input' do
      subject

      output_file = Dir.children(@output_dir).first
      original_entries = Dir.chdir(@input_dir) do
        Dir.glob('**/*').sort.join(',')
      end
      zipped_entries = Zip::File.open(File.join(@output_dir, output_file)) do |zip_file|
        zip_file.entries.sort.join(',')
      end
      zipped_entries.gsub!(%r{\/\,}, ',')
      expect(original_entries).to eq zipped_entries
    end

    it 'creates multiple zip files with default names' do
      described_class.new(@input_dir, @output_dir, size_limit: 100_000).process

      patterns = [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/, /\d{4}-\d{2}-\d{2}/, /part-0/]
      filename = Dir.children(@output_dir).first
      expect(patterns.all? { |pattern| filename.scan(pattern) }).to be_truthy
    end

    it 'creates single zip file with default name' do
      subject

      patterns = [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/, /\d{4}-\d{2}-\d{2}/]
      filename = Dir.children(@output_dir).first
      expect(patterns.all? { |pattern| filename.scan(pattern) }).to be true
      expect(filename.scan(/(_part_).*$/).length).to eq 0
    end

    it 'creates single zip file with custom name' do
      described_class.new(@input_dir, @output_dir, base_file_name: 'test-report', timestamp_file: false).process

      patterns = [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/, /test-report/]
      filename = Dir.children(@output_dir).first
      expect(patterns.all? { |pattern| filename.scan(pattern) }).to be true
      expect(filename.scan(/(_part_).*$/).length).to eq 0
      expect(filename.scan(/\d{4}-\d{2}-\d{2}/).length).to eq 0
    end
  end
end
