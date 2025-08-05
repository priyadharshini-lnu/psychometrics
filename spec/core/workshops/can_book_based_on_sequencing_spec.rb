# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Workshops::CanBookBasedOnSequencing do
  describe '#call' do
    let(:campaign) { create(:campaign) }
    let(:user) { create(:user) }
    let(:user_assessment) { create(:user_assessment, campaign: campaign, subject: user, evaluator: user) }

    subject { described_class.new(campaign_assessment_group, user.id).call }

    context 'when sequencing is disabled' do
      let(:campaign_assessment_group) do
        create(:campaign_assessment_group,
               campaign: campaign,
               require_previous_groups_completion_for_booking: false,
               position: 2)
      end

      it 'allows booking regardless of position' do
        expect { subject }.to broadcast(:ok, true)
      end
    end

    context 'when sequencing is enabled' do
      let(:campaign_assessment_group) do
        create(:campaign_assessment_group,
               campaign: campaign,
               require_previous_groups_completion_for_booking: true,
               position: position)
      end

      context 'when it is the first group' do
        let(:position) { 1 }

        it 'allows booking' do
          expect { subject }.to broadcast(:ok, true)
        end
      end

      context 'when it is not the first group' do
        let(:position) { 2 }
        let(:assessment1) { create(:assessment) }
        let(:assessment2) { create(:assessment) }

        let!(:previous_group) do
          create(:campaign_assessment_group,
                 campaign: campaign,
                 position: 1)
        end

        let!(:previous_campaign_assessment) do
          create(:campaign_assessment,
                 campaign: campaign,
                 assessment: assessment1,
                 campaign_assessment_group: previous_group)
        end

        context 'when previous group assessments are completed' do
          before do
            create(:user_assessment,
                   campaign: campaign,
                   subject: user,
                   evaluator: user,
                   assessment: assessment1,
                   status: 'completed')
          end

          it 'allows booking' do
            expect { subject }.to broadcast(:ok, true)
          end
        end

        context 'when previous group has incomplete assessments' do
          before do
            create(:user_assessment,
                   campaign: campaign,
                   subject: user,
                   evaluator: user,
                   assessment: assessment1,
                   status: 'in_progress')
          end

          it 'denies booking' do
            expect { subject }.to broadcast(:ok, false)
          end
        end

        context 'when previous group has multiple assessments with mixed completion' do
          let!(:previous_campaign_assessment2) do
            create(:campaign_assessment,
                   campaign: campaign,
                   assessment: assessment2,
                   campaign_assessment_group: previous_group)
          end

          before do
            # One completed assessment
            create(:user_assessment,
                   campaign: campaign,
                   subject: user,
                   evaluator: user,
                   assessment: assessment1,
                   status: 'completed')

            # One deemed incomplete assessment
            create(:user_assessment,
                   campaign: campaign,
                   subject: user,
                   evaluator: user,
                   assessment: assessment2,
                   status: 'in_progress')
          end

          it 'denies booking due to incomplete assessment' do
            expect { subject }.to broadcast(:ok, false)
          end
        end

        context 'when previous group has all assessments completed' do
          let!(:previous_campaign_assessment2) do
            create(:campaign_assessment,
                   campaign: campaign,
                   assessment: assessment2,
                   campaign_assessment_group: previous_group)
          end

          before do
            # All assessments completed
            create(:user_assessment,
                   campaign: campaign,
                   subject: user,
                   evaluator: user,
                   assessment: assessment1,
                   status: 'completed')

            create(:user_assessment,
                   campaign: campaign,
                   subject: user,
                   evaluator: user,
                   assessment: assessment2,
                   status: 'completed')
          end

          it 'allows booking' do
            expect { subject }.to broadcast(:ok, true)
          end
        end

        context 'when user has no assessments in previous group' do
          it 'allows booking when no user assessments exist' do
            expect { subject }.to broadcast(:ok, true)
          end
        end
      end
    end
  end
end
