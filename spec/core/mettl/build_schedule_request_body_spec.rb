# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Mettl::BuildScheduleRequestBody, type: :model do
  let(:project) { create(:project) }
  let!(:mettl_assessment) { create(:mettl_assessment, project_id: project.id) }
  let(:assessment) do
    create(:assessment, :mettl, project: project, external_settings: { assessment_id: mettl_assessment.product_id })
  end

  let(:schedule_name) { 'Test Schedule' }
  let(:proctoring_enabled) { true }
  let(:secure_browser_enabled) { true }

  subject do
    described_class.new(
      attributes: { schedule_name: schedule_name,
                    proctoring_enabled: proctoring_enabled,
                    secure_browser_enabled: secure_browser_enabled },
      assessment: assessment
    )
  end

  def completion_notification_url
    Rails.application.routes.url_helpers.webhooks_mettl_completion_notification_url(
      project_id: assessment.project.id,
      host: Settings.domain,
      subdomain: assessment.project.subdomain,
      protocol: Settings.protocol,
      port: Settings.port
    )
  end

  def result_notification_url
    Rails.application.routes.url_helpers.webhooks_mettl_results_notification_url(
      project_id: assessment.project.id,
      host: Settings.domain,
      subdomain: assessment.project.subdomain,
      protocol: Settings.protocol,
      port: Settings.port
    )
  end

  describe '#to_json' do
    context 'when name is passed' do
      it 'returns the correct representation with the passed name' do
        expected_config = {
          'sourceApp' => "lighthouse-#{ENV.fetch('REAL_ENV', 'dev')}",
          'access' => { 'type' => 'OpenForAll' },
          'scheduleType' => 'AlwaysOn',
          'name' => schedule_name,
          'webProctoring' => { 'enabled' => proctoring_enabled },
          'secureBrowser' => { 'enabled' => secure_browser_enabled },
          'testFinishNotificationUrl' => completion_notification_url,
          'testGradedNotificationUrl' => result_notification_url
        }

        expect(subject.call).to broadcast(:ok, expected_config)
      end
    end

    context 'when name is not passed' do
      let(:schedule_name) { nil }

      it 'returns the correct representation with the default name' do
        default_name = "#{mettl_assessment.name} - #{ENV.fetch('SERVER_NAME', 'dev')} - #{assessment.id}"

        expected_config = {
          'sourceApp' => "lighthouse-#{ENV.fetch('REAL_ENV', 'dev')}",
          'access' => { 'type' => 'OpenForAll' },
          'scheduleType' => 'AlwaysOn',
          'name' => default_name,
          'webProctoring' => { 'enabled' => proctoring_enabled },
          'secureBrowser' => { 'enabled' => secure_browser_enabled },
          'testFinishNotificationUrl' => completion_notification_url,
          'testGradedNotificationUrl' => result_notification_url
        }

        expect(subject.call).to broadcast(:ok, expected_config)
      end
    end
  end
end
