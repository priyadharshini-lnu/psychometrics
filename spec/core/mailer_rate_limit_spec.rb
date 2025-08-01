# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MailerRateLimit, type: :service do
  describe '.for' do
    context 'when project has smtp_setting' do
      let(:project) { create(:project) }

      before do
        project.smtp_setting.update!(concurrency_limit: 5, rate_limit: 50, rate_limit_period: 2)
      end

      it 'returns limits from smtp_setting' do
        result = described_class.for('UserMailer', 'test', 'deliver_now', { project_id: project.id })

        expect(result[:concurrency_limit]).to eq 5
        expect(result[:rate_limit]).to eq 50
        expect(result[:rate_period]).to eq 2.minutes
        expect(result[:key_suffix]).to eq project.id
      end
    end

    context 'when project does not have smtp_setting' do
      let(:project_without_smtp) { create(:project).tap { |p| p.smtp_setting.destroy } }

      it 'returns default limits' do
        result = described_class.for('UserMailer', 'test', 'deliver_now', { project_id: project_without_smtp.id })

        expect(result[:concurrency_limit]).to eq Settings.smtp_default.concurrency_limit
        expect(result[:rate_limit]).to eq Settings.smtp_default.rate_limit
        expect(result[:rate_period]).to eq Settings.smtp_default.rate_limit_period.minutes
        expect(result[:key_suffix]).to eq 'default'
      end
    end
  end
end
