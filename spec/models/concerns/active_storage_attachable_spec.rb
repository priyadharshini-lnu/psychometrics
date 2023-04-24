# frozen_string_literal: true

require 'rails_helper'

describe ActiveStorageAttachable do
  let(:image) do
    Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/images/test_image.jpeg'), 'image/jpeg')
  end
  let(:pdf) do
    Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/reports/test.pdf'), 'application/pdf')
  end
  let(:zip) do
    Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/archives/archive.zip'))
  end

  context 'with .has_one_image_attachment' do
    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)

      subject_records = [
        @assessment = create(:assessment),
        @dashboard = create(:dashboard),
        @design_setting = create(:design_setting, project: Project.last),
        @factor = create(:factor),
        @innovation_style = create(:innovation_style),
        @occupation = create(:occupation),
        @report = create(:report),
        @user_profile = create(:user_profile, user: create(:user)),
        @media_resp = MediaResponse.create(
          question: FactoryBot.build(:question),
          users_result: FactoryBot.create(:users_result)
        )
      ]
      subject_records.each do |r|
        r.as_icon.attach(image) if r.respond_to?(:as_icon)
        r.as_logo.attach(image) if r.respond_to?(:as_logo)
        r.as_image.attach(image) if r.respond_to?(:as_image)
        r.as_photo.attach(image) if r.respond_to?(:as_photo)
        r.as_asset.attach(image) if r.respond_to?(:as_asset)
      end

      perform_enqueued_jobs
      clear_enqueued_jobs
      subject_records.each(&:reload)
    end

    it 'stores correct attachment key' do
      expect(@assessment.as_icon.blob.key).
        to match(%r{public/assessment/#{@assessment.id}/icon/})
      expect(@dashboard.as_image.blob.key).
        to match(%r{private/projects/#{@dashboard.project.id}/dashboard/#{@dashboard.id}/image/})
      expect(@design_setting.as_logo.blob.key).
        to match(%r{public/projects/#{@design_setting.project.id}/design_setting/#{@design_setting.id}/logo/})
      expect(@factor.as_icon.blob.key).
        to match(%r{public/factor/#{@factor.id}/icon/})
      expect(@innovation_style.as_icon.blob.key).
        to match(%r{public/innovation_style/#{@innovation_style.id}/icon/})
      expect(@occupation.as_icon.blob.key).
        to match(%r{public/occupation/#{@occupation.id}/icon/})
      expect(@report.as_icon.blob.key).
        to match(%r{public/report/#{@report.id}/icon/})
      expect(@user_profile.as_photo.blob.key).
        to match(%r{public/user_profile/#{@user_profile.id}/photo/})
      expect(@media_resp.as_asset.blob.key).to match(
        %r{private/projects/#{@media_resp.users_result.campaign.project.id}/media_response/#{@media_resp.id}/asset/}
      )
    end
  end

  context 'with invalid content_type' do
    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)

      @invalid_assessment = create(:assessment)
      @invalid_assessment.as_poster.attach(pdf)
    end

    it 'fails to attach' do
      expect { @invalid_assessment.save! }.
        to raise_error(ActiveRecord::RecordInvalid, 'Validation failed: As poster has an invalid content type')
    end
  end

  context 'with .has_one_attachment' do
    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)
      subject_records = [
        @library = create(:library, :image),
        @user_report = create(:user_report)
      ]
      subject_records.each do |r|
        r.as_file.attach(image) if r.respond_to?(:as_file)
        r.as_pdf_file.attach(pdf) if r.respond_to?(:as_pdf_file)
      end

      perform_enqueued_jobs
      clear_enqueued_jobs
      subject_records.each(&:reload)
    end

    it 'stores correct attachment key' do
      expect(@library.as_file.blob.key).
        to match(%r{public/library/#{@library.id}/file/})
      expect(@user_report.as_pdf_file.blob.key).
        to match(%r{private/projects/#{@user_report.project.id}/user_report/#{@user_report.id}/pdf_file/})
    end
  end

  context 'with .has_many_attachments' do
    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)

      @bulk_report = create(:bulk_report)
      @bulk_report.as_files.attach(zip, zip)
      perform_enqueued_jobs
      clear_enqueued_jobs
      @bulk_report.reload
    end

    it 'stores correct attachment key' do
      expect(@bulk_report.as_files.first.blob.key).to match(%r{private/bulk_report/#{@bulk_report.id}/files/})
    end
  end
end
