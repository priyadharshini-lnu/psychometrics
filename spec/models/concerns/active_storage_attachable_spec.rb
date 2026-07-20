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

  context '#copy_and_upload' do
    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)
      @media_response = create(:media_response)
      @media_response.asset.attach(image)
      @media_response_copy = @media_response.dup
      @media_response_copy.copy_and_upload(@media_response.asset, :asset)
    end

    it 'copies and uploads attachment' do
      expect(@media_response_copy.asset.attached?).to be_truthy
      expect(@media_response_copy.asset.key).to eq(
        @media_response_copy.attachment_storage_path(:asset, @media_response.asset.blob.filename)
      )
    end
  end

  context 'with .has_one_image_attachment' do
    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)

      subject_records = [
        @assessment = create(:assessment),
        @dashboard = create(:dashboard),
        @design_setting = create(:design_setting, project: Project.first),
        @factor = create(:factor),
        @innovation_style = create(:innovation_style),
        @occupation = create(:occupation),
        @report = create(:report),
        @user_profile = create(:user_profile, user: create(:user), photo: nil),
        @media_resp = MediaResponse.create(
          question: build(:question),
          users_result: create(:users_result)
        )
      ]
      subject_records.each do |r|
        r.icon.attach(image) if r.respond_to?(:icon)
        r.logo.attach(image) if r.respond_to?(:logo)
        r.image.attach(image) if r.respond_to?(:image)
        r.photo.attach(image) if r.respond_to?(:photo)
        r.asset.attach(image) if r.respond_to?(:asset)
      end
    end

    it 'stores correct attachment key' do
      expect(@assessment.icon.key).
        to match(%r{public/assessment/#{@assessment.id}/icon/\w+_test_image.jpeg})
      expect(@dashboard.image.key).
        to match(%r{private/projects/#{@dashboard.project.id}/dashboard/#{@dashboard.id}/image/\w+_test_image.jpeg})
      expect(@design_setting.logo.key).
        to match(%r{public/projects/#{@design_setting.owner.id}/design_setting/logo/\w+_test_image.jpeg})
      expect(@factor.icon.key).
        to match(%r{public/factor/#{@factor.id}/icon/\w+_test_image.jpeg})
      expect(@innovation_style.icon.key).
        to match(%r{public/innovation_style/#{@innovation_style.id}/icon/\w+_test_image.jpeg})
      expect(@occupation.icon.key).
        to match(%r{public/occupation/#{@occupation.id}/icon/\w+_test_image.jpeg})
      expect(@report.icon.key).
        to match(%r{public/report/#{@report.id}/icon/\w+_test_image.jpeg})
      expect(@user_profile.photo.key).
        to match(%r{public/user_profile/#{@user_profile.user_id}/photo/\w+_})
      expect(@media_resp.asset.key).to match(
        %r{private/projects/#{@media_resp.users_result.campaign.project.id}/media_response/#{@media_resp.users_result_id}/#{@media_resp.question_id}/#{@media_resp.id}/asset/test_image.jpeg} # rubocop:disable Layout/LineLength
      )
    end
  end

  context 'with invalid content_type' do
    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)

      @invalid_assessment = create(:assessment)
      @invalid_assessment.poster.attach(pdf)
    end

    it 'fails to attach' do
      expect { @invalid_assessment.save! }.
        to raise_error(ActiveRecord::RecordInvalid, 'Validation failed: Poster invalid content type')
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
        r.file.attach(image) if r.respond_to?(:file)
        r.pdf_file.attach(pdf) if r.respond_to?(:pdf_file)
      end

      perform_enqueued_jobs
      clear_enqueued_jobs
      subject_records.each(&:reload)
    end

    it 'stores correct attachment key' do
      expect(@library.file.key).
        to match(%r{public/library/#{@library.id}/file/\w+_test_image.jpeg})
      expect(@user_report.pdf_file.key).
        to match(%r{private/projects/#{@user_report.project.id}/user_report/#{@user_report.id}/pdf_file/\w+_test.pdf})
    end
  end

  context 'with .has_many_attachments' do
    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)

      @bulk_report = create(:bulk_report)
      @bulk_report.files.attach(zip, zip)
      perform_enqueued_jobs
      clear_enqueued_jobs
      @bulk_report.reload
    end

    it 'stores correct attachment key' do
      expect(@bulk_report.files.first.key).to match(%r{private/bulk_report/#{@bulk_report.id}/files/\w+_archive.zip})
    end
  end
end
