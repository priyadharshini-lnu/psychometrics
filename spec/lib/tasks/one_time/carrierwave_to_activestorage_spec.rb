# frozen_string_literal: true

require 'rails_helper'

describe 'carrierwave:migrate_to_activestorage', type: :task do
  let(:migrate_task) { Rake::Task['carrierwave:migrate_to_activestorage'] }
  let(:test_image) { Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/images/test_image.jpeg')) }

  before do
    allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)

    # creating records with attachments
    @assessment = create(:assessment, id: 123, icon: test_image)
    @user_report = create(:user_report, :with_pdf, id: 123)
    @report_wo_attachment = create(:report, id: 123, icon: test_image)
    @report = create(:report, id: 1_000, icon: test_image)

    perform_enqueued_jobs
    clear_enqueued_jobs

    # removing attachments to verify described task syncs them
    ActiveStorage::Attachment.destroy_all

    # adding record to skip syncing all Report records with ID below 1000
    ActiveRecord::Base.connection.execute(
      <<-SQL.squish
        INSERT
        INTO activesupport_tables_migrations (table_name, model_name, last_processed_id)
        VALUES ('reports', 'Report', #{@report_wo_attachment.id + 1})
      SQL
    )
    @last_processed = <<-SQL.squish
      select last_processed_id, model_name from activesupport_tables_migrations
    SQL

    migrate_task.invoke
    perform_enqueued_jobs
  end

  it 'migrates existing record to ActiveStorage' do
    expect(@assessment.reload.as_icon).to be_attached
    expect(@assessment.reload.as_icon.key).to match(%r{public/assessment/icon/})
    expect(@user_report.reload.as_pdf_file).to be_attached
    expect(@user_report.reload.as_pdf_file.key).
      to match(%r{private/projects/#{@user_report.project.id}/user_report/pdf_file/})
    expect(@report.reload.as_icon).to be_attached
    expect(@report.reload.as_icon.key).to match(%r{public/report/icon/})
    expect(@report_wo_attachment.reload.as_icon.attached?).to eq(false)
    expect(
      ActiveStorage::Attachment.
        where.not(record_type: 'ActiveStorage::VariantRecord').
        pluck(:record_type, :record_id, :name)
    ).to match_array([['Assessment', 123, 'as_icon'], ['Report', 1000, 'as_icon'], ['UserReport', 123, 'as_pdf_file']])
    expect(ActiveStorage::VariantRecord.count).to be_present
    expect(ActiveRecord::Base.connection.execute(@last_processed).values).to eq([
      [123, 'Assessment'], [1_000, 'Report'], [123, 'UserReport']
    ])
  end

  after { clear_enqueued_jobs }
end

describe 'activestorage:rename_attributes', type: :task do
  let(:rename_task) { Rake::Task['activestorage:rename_attributes'] }
  let(:test_image) { Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/images/test_image.jpeg')) }

  before do
    @record = create(:report)
    @record.as_icon.attach(test_image)

    perform_enqueued_jobs

    rename_task.invoke
  end

  it 'renames migrated attributes' do
    expect(ActiveStorage::Attachment.count).to eq(2)
    expect(ActiveStorage::Attachment.first.record_id).to eq(@record.id)
    expect(ActiveStorage::Attachment.first.record_type).to eq(@record.class.name)
    expect(ActiveStorage::Attachment.first.name).to eq('icon')
    expect(ActiveStorage::VariantRecord.count).to eq(1)
    expect(@record.reload.as_icon.attached?).to be(false)
  end

  after { clear_enqueued_jobs }
end
