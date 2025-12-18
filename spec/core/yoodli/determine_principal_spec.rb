# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Yoodli::DeterminePrincipal do
  subject { described_class.new(user_assessment: user_assessment) }

  let(:project) { create(:project) }
  let(:user) { create(:user, project: project) }
  let(:assessment) { create(:assessment, :yoodli, project: project) }
  let(:user_assessment) { create(:user_assessment, subject: user, evaluator: user, assessment: assessment) }

  describe '#call' do
    context 'when Yoodli assessment has email' do
      let!(:yoodli_user_assessment) do
        create(:yoodli_user_assessment,
               user_assessment: user_assessment,
               email: 'user@yoodli.com',
               active: true)
      end

      context 'when masking is disabled' do
        before do
          allow(user_assessment.project).to receive(:mask_identity_for_yoodli?).and_return(false)
        end

        it 'returns principal with real user details and Yoodli email' do
          subject.call do
            on(:ok) do |principal|
              expect(principal.email).to eq('user@yoodli.com')
              expect(principal.name).to eq(user.name)
              expect(principal.first_name).to eq(user.first_name)
              expect(principal.last_name).to eq(user.last_name)
              expect(principal.id).to eq(user.id)
              expect(principal.groups).to eq([user_assessment.campaign.name])
            end
          end
        end
      end

      context 'when masking is enabled' do
        before do
          allow(user_assessment.project).to receive(:mask_identity_for_yoodli?).and_return(true)
        end

        it 'returns principal with masked user details and Yoodli email' do
          masked_identity = double('MaskedIdentity',
                                   name: 'Anonymous User',
                                   first_name: 'Anonymous',
                                   last_name: 'User')
          allow(user).to receive(:maskable_identity).with(mask: true).and_return(masked_identity)

          subject.call do
            on(:ok) do |principal|
              expect(principal.email).to eq('user@yoodli.com')
              expect(principal.name).to eq('Anonymous User')
              expect(principal.first_name).to eq('Anonymous')
              expect(principal.last_name).to eq('User')
              expect(principal.id).to eq(user.id)
              expect(principal.groups).to eq([user_assessment.campaign.name])
            end
          end
        end
      end
    end
  end
end
