# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::CanReset, type: :command do
  let(:test) { { 'test' => true } }
  let(:user) { create(:user) }
  let!(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment, :with_report) }
  let(:report) { assessment.reports.first }
  let(:norm) { create(:norm) }
  let!(:users_result) do
    users_result = create(:users_result, subject: user,
      evaluator: user,
      assessment: assessment,
      campaign: campaign,
      answers: test,
      scoring: test,
      embedded_data: test,
      step: 100,
      progress: 100,
      external_results: {},
      occupations: test)
    users_result.user_assessment.update!(
      completed_at: Time.zone.now, norm_id: norm.id, status: :completed, expiry_date: Time.zone.now,
      last_activity_at: Time.zone.now
    )
    users_result
  end
  let(:user_assessment) { users_result.user_assessment }

  subject { described_class.new(user_assessment, user, project_id: campaign.project_id, campaign_id: campaign.id) }

  describe '.call!' do
    it 'responds to .call! with unlimited arguments' do
      expect(described_class).to respond_to(:call!).with_unlimited_arguments
    end
  end

  describe '#call' do
    context 'when user has no permission' do
      before do
        allow(user).to receive(:has_permission?).and_return(false)
      end

      it 'broadcasts false' do
        expect { subject.call }.to broadcast(:ok, false)
      end
    end

    context 'when user has permission' do
      before do
        allow(user).to receive(:has_permission?).with(
          :results, :reset_responses,
          project_id: user_assessment.campaign.project_id,
          campaign_id: user_assessment.campaign_id
        ).and_return(true)
      end

      context 'with always resettable assessments' do
        context 'when assessment is common' do
          before do
            allow(user_assessment.assessment).to receive(:common?).and_return(true)
          end

          it 'broadcasts true' do
            expect { subject.call }.to broadcast(:ok, true)
          end
        end

        context 'when assessment is saville' do
          before do
            allow(user_assessment.assessment).to receive(:saville?).and_return(true)
          end

          it 'broadcasts true' do
            expect { subject.call }.to broadcast(:ok, true)
          end
        end

        context 'when assessment is simulation' do
          before do
            allow(user_assessment.assessment).to receive(:simulation?).and_return(true)
          end

          it 'broadcasts true' do
            expect { subject.call }.to broadcast(:ok, true)
          end
        end

        context 'when assessment is skillvue' do
          before do
            allow(user_assessment.assessment).to receive(:skillvue?).and_return(true)
          end

          it 'broadcasts true' do
            expect { subject.call }.to broadcast(:ok, true)
          end
        end

        context 'when assessment is yoodli' do
          before do
            allow(user_assessment.assessment).to receive(:yoodli?).and_return(true)
          end

          it 'broadcasts true' do
            expect { subject.call }.to broadcast(:ok, true)
          end
        end

        context 'when assessment is microsite' do
          before do
            allow(user_assessment.assessment).to receive(:microsite?).and_return(true)
          end

          it 'broadcasts true' do
            expect { subject.call }.to broadcast(:ok, true)
          end
        end
      end
    end
  end
end
