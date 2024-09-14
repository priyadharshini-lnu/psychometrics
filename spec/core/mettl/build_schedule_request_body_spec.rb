# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Mettl::BuildScheduleRequestBody, type: :model do
  let(:project) { create(:project) }
  let!(:mettl_assessment) { create(:mettl_assessment, project_id: project.id) }
  let(:assessment) do
    create(:assessment, :mettl, project: project, external_settings: { assessment_id: mettl_assessment.product_id })
  end

  let(:schedule_name) { 'Test Schedule' }
  let(:web_proctoring_settings) { { enabled: true, count: 5, show_remaining_counts: true } }
  let(:secure_browser_enabled) { true }
  let(:visual_proctoring_settings) { { enabled: true, candidate_screen_capture: true, candidate_authorization: true } }

  subject do
    described_class.new(
      attributes: { schedule_name: schedule_name,
                    web_proctoring_settings: web_proctoring_settings,
                    secure_browser_enabled: secure_browser_enabled,
                    visual_proctoring_settings: visual_proctoring_settings },
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
          'sourceApp' => 'lighthouse-testing',
          'access' => { 'type' => 'OpenForAll' },
          'scheduleType' => 'AlwaysOn',
          'name' => schedule_name,
          'webProctoring' => { 'count' => 5, 'enabled' => true, 'showRemainingCounts' => true },
          'secureBrowser' => { 'enabled' => secure_browser_enabled },
          'visualProctoring' => { 'mode' => 'PHOTO',
                                  'options' => { 'candidateAuthorization' => true, 'candidateScreenCapture' => true } },
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
          'sourceApp' => 'lighthouse-testing',
          'access' => { 'type' => 'OpenForAll' },
          'scheduleType' => 'AlwaysOn',
          'name' => default_name,
          'webProctoring' => { 'count' => 5, 'enabled' => true, 'showRemainingCounts' => true },
          'secureBrowser' => { 'enabled' => secure_browser_enabled },
          'visualProctoring' => { 'mode' => 'PHOTO',
                                  'options' => { 'candidateAuthorization' => true, 'candidateScreenCapture' => true } },
          'testFinishNotificationUrl' => completion_notification_url,
          'testGradedNotificationUrl' => result_notification_url
        }

        expect(subject.call).to broadcast(:ok, expected_config)
      end
    end
  end
end
