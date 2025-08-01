# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'ApplicationMailer throttling arguments', type: :job do
  include ActiveJob::TestHelper

  after { clear_enqueued_jobs }

  let(:project) { create(:project) }
  let(:user) do
    create(:user, project: project, memberships_options: [{ client: project }])
  end

  describe 'project_id extraction for throttling' do
    it 'automatically extracts project_id from user argument via GlobalID' do
      # Just call the mailer normally - it should extract project_id from the user's GlobalID
      expect do
        UserMailer.inactivity_warning(user).deliver_later
      end.to change { enqueued_jobs.size }.by(1)

      # Find the enqueued ProjectMailDeliveryJob
      mail_job = enqueued_jobs.find { |j| j[:job] == ProjectMailDeliveryJob }
      expect(mail_job).not_to be_nil, 'Expected ProjectMailDeliveryJob to be enqueued'

      # The throttling should extract project_id from the user's GlobalID
      raw_args = mail_job[:args]
      extracted_project_id = MailerRateLimit.send(:extract_project_id, raw_args)

      expect(extracted_project_id).to eq(project.id)
    end

    it 'prefers explicit project_id from .with() over GlobalID extraction' do
      different_project = create(:project)

      expect do
        UserMailer.with(project_id: different_project.id).inactivity_warning(user).deliver_later
      end.to change { enqueued_jobs.size }.by(1)

      mail_job = enqueued_jobs.find { |j| j[:job] == ProjectMailDeliveryJob }
      raw_args = mail_job[:args]
      extracted_project_id = MailerRateLimit.send(:extract_project_id, raw_args)

      # Should use the explicit project_id, not the user's project_id
      expect(extracted_project_id).to eq(different_project.id)
      expect(extracted_project_id).not_to eq(user.project_id)
    end

    it 'falls back to default when user has no project_id' do
      user_without_project = create(:user, project: nil)

      expect do
        UserMailer.inactivity_warning(user_without_project).deliver_later
      end.to change { enqueued_jobs.size }.by(1)

      mail_job = enqueued_jobs.find { |j| j[:job] == ProjectMailDeliveryJob }
      raw_args = mail_job[:args]
      extracted_project_id = MailerRateLimit.send(:extract_project_id, raw_args)

      # Should return nil, causing fallback to default throttling bucket
      expect(extracted_project_id).to be_nil
    end

    it 'handles multiple arguments and finds the first with project_id' do
      # Simulate job args with multiple arguments where user is in the middle
      job_args = [
        'UserMailer',
        'some_multi_arg_method',
        'deliver_now',
        {
          'args' => [
            'some_string',
            { '_aj_globalid' => user.to_global_id.to_s },
            42
          ]
        }
      ]

      extracted_project_id = MailerRateLimit.send(:extract_project_id, job_args)
      expect(extracted_project_id).to eq(project.id)
    end

    it 'handles invalid GlobalID gracefully' do
      job_args = [
        'UserMailer',
        'inactivity_warning',
        'deliver_now',
        {
          'args' => [
            { '_aj_globalid' => 'gid://psychometrics/Users::Regular/99999' } # non-existent user
          ]
        }
      ]

      extracted_project_id = MailerRateLimit.send(:extract_project_id, job_args)
      expect(extracted_project_id).to be_nil
    end

    it 'handles malformed job arguments gracefully' do
      # Test various malformed argument structures
      [
        [],
        ['UserMailer'],
        %w[UserMailer method deliver_now],
        %w[UserMailer method deliver_now not_a_hash],
        ['UserMailer', 'method', 'deliver_now', { 'args' => 'not_an_array' }],
        ['UserMailer', 'method', 'deliver_now', { 'args' => [{ 'not_a_globalid' => 'value' }] }]
      ].each do |malformed_args|
        extracted_project_id = MailerRateLimit.send(:extract_project_id, malformed_args)
        expect(extracted_project_id).to be_nil
      end
    end
  end

  describe 'throttling integration' do
    let(:smtp_project) { create(:project) }
    let(:smtp_user) { create(:user, project: smtp_project) }

    before do
      # Configure custom SMTP limits for the project
      smtp_project.smtp_setting.update!(
        concurrency_limit: 3,
        rate_limit: 20,
        rate_limit_period: 5
      )
    end

    it 'applies project-specific throttling limits when project_id is extracted' do
      expect do
        UserMailer.inactivity_warning(smtp_user).deliver_later
      end.to change { enqueued_jobs.size }.by(1)

      mail_job = enqueued_jobs.find { |j| j[:job] == ProjectMailDeliveryJob }
      raw_args = mail_job[:args]

      # Should use the project's custom SMTP limits
      limits = ProjectMailDeliveryJob.limits_for(*raw_args)

      expect(limits[:key_suffix]).to eq(smtp_project.id)
      expect(limits[:concurrency_limit]).to eq(3)
      expect(limits[:rate_limit]).to eq(20)
      expect(limits[:rate_period]).to eq(5.minutes)
    end

    it 'applies default throttling limits when no project_id is found' do
      user_without_project = create(:user, project: nil)

      expect do
        UserMailer.inactivity_warning(user_without_project).deliver_later
      end.to change { enqueued_jobs.size }.by(1)

      mail_job = enqueued_jobs.find { |j| j[:job] == ProjectMailDeliveryJob }
      raw_args = mail_job[:args]

      # Should use default SMTP limits
      limits = ProjectMailDeliveryJob.limits_for(*raw_args)

      expect(limits[:key_suffix]).to eq('default')
      expect(limits[:concurrency_limit]).to eq(Settings.smtp_default.concurrency_limit)
      expect(limits[:rate_limit]).to eq(Settings.smtp_default.rate_limit)
    end
  end
end
