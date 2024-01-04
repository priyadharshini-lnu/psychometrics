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
        @user_profile = create(:user_profile, user: create(:user), photo: nil),
        @media_resp = MediaResponse.create(
          question: build(:question),
          users_result: create(:users_result)
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
      expect(@assessment.as_icon.key).
        to match(%r{public/assessment/#{@assessment.id}/icon/\w+_test_image.jpeg})
      expect(@dashboard.as_image.key).
        to match(%r{private/projects/#{@dashboard.project.id}/dashboard/#{@dashboard.id}/image/\w+_test_image.jpeg})
      expect(@design_setting.as_logo.key).
        to match(%r{public/projects/#{@design_setting.project.id}/design_setting/logo/\w+_test_image.jpeg})
      expect(@factor.as_icon.key).
        to match(%r{public/factor/#{@factor.id}/icon/\w+_test_image.jpeg})
      expect(@innovation_style.as_icon.key).
        to match(%r{public/innovation_style/#{@innovation_style.id}/icon/\w+_test_image.jpeg})
      expect(@occupation.as_icon.key).
        to match(%r{public/occupation/#{@occupation.id}/icon/\w+_test_image.jpeg})
      expect(@report.as_icon.key).
        to match(%r{public/report/#{@report.id}/icon/\w+_test_image.jpeg})
      expect(@user_profile.as_photo.key).
        to match(%r{public/user_profile/#{@user_profile.user_id}/photo/\w+_})
      expect(@media_resp.as_asset.key).to match(
        %r{private/projects/#{@media_resp.users_result.campaign.project.id}/media_response/#{@media_resp.users_result_id}/#{@media_resp.question_id}/asset/\w+_test_image.jpeg} # rubocop:disable Layout/LineLength
      )
    end

    context 'without :users_result attribute (for old records)' do
      before do
        allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)

        @membership = create(:membership, :for_campaign)
        @assign = create(:assign, membership: @membership)
        @media_response = build_stubbed(
          :media_response,
          question: build(:question),
          users_result: nil,
          assign: @assign,
          as_asset: image
        )
      end

      it 'stores correct attachment key' do
        expect(@media_response.as_asset.key).to match(
          %r{private/projects/#{@media_response.assign.membership.project_membership.client_id}/media_response/#{@media_response.assign_id}/#{@media_response.question_id}/asset/\w+_test_image.jpeg} # rubocop:disable Layout/LineLength
        )
      end
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
      expect(@library.as_file.key).
        to match(%r{public/library/#{@library.id}/file/\w+_test_image.jpeg})
      expect(@user_report.as_pdf_file.key).
        to match(%r{private/projects/#{@user_report.project.id}/user_report/#{@user_report.id}/pdf_file/\w+_test.pdf})
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
      expect(@bulk_report.as_files.first.key).to match(%r{private/bulk_report/files/\w+_archive.zip})
    end
  end
end
