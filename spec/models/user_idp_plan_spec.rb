# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserIdpPlan, type: :model do
  describe '#schedule_idp_assigned_notification' do
    let(:user) { create(:user) }
    let(:campaign_user) { create(:campaign_user, user: user) }
    let(:campaign) { campaign_user.campaign }
    let(:communication) { create(:communication, kind: :idp_template_assigned, campaign_id: campaign.id) }
    let(:user_idp_plan) do
      create(:user_idp_plan, user: user, campaign_id: campaign.id)
    end

    context 'when communication exists' do
      before { communication }

      it 'creates communication email with the resource' do
        expect do
          user_idp_plan.save!
        end.to change(CommunicationEmail, :count).by(1)

        communication_email = CommunicationEmail.last
        expect(communication_email.communication).to eq(communication)
        expect(communication_email.user).to eq(user)
        expect(communication_email.campaign_user).to eq(campaign_user)
        expect(communication_email.communication_email_resources.first.resource).to eq(user_idp_plan)
      end
    end

    context 'when no communication exists' do
      it 'does not create any communication emails' do
        expect do
          user_idp_plan.save!
        end.not_to change(CommunicationEmail, :count)
      end
    end

    context 'when communication email already exists' do
      before do
        communication
        email = create(:communication_email,
                       communication: communication,
                       user: user,
                       campaign_user: campaign_user)
        create(:communication_email_resource,
               communication_email: email,
               resource: user_idp_plan)
      end

      it 'does not create another communication email' do
        expect do
          user_idp_plan.save!
        end.not_to change(CommunicationEmail, :count)
      end
    end
  end

  describe '#schedule_idp_status_notification' do
    let(:user) { create(:user) }
    let(:campaign_user) { create(:campaign_user, user: user) }
    let(:user_idp_plan) do
      create(:user_idp_plan, user: user, campaign_id: campaign_user.campaign_id, status: :pending_approval)
    end

    context 'when plan is approved' do
      let(:communication) do
        create(:communication, kind: :idp_template_approved, campaign_id: user_idp_plan.campaign_id)
      end

      context 'when communication exists' do
        before { communication }

        it 'creates communication email with the resource' do
          expect do
            user_idp_plan.update!(status: :approved)
          end.to change(CommunicationEmail, :count).by(1)

          communication_email = CommunicationEmail.last
          expect(communication_email.communication).to eq(communication)
          expect(communication_email.user).to eq(user)
          expect(communication_email.campaign_user).to eq(campaign_user)
          expect(communication_email.communication_email_resources.first.resource).to eq(user_idp_plan)
        end
      end

      context 'when no communication exists' do
        it 'does not create any communication emails' do
          expect do
            user_idp_plan.update!(status: :approved)
          end.not_to change(CommunicationEmail, :count)
        end
      end

      context 'when communication email already exists' do
        before do
          communication
          email = create(:communication_email,
                         communication: communication,
                         user: user,
                         campaign_user: campaign_user)
          create(:communication_email_resource,
                 communication_email: email,
                 resource: user_idp_plan)
        end

        it 'does not create another communication email' do
          expect do
            user_idp_plan.update!(status: :approved)
          end.not_to change(CommunicationEmail, :count)
        end
      end
    end

    context 'when plan is rejected' do
      let(:communication) do
        create(:communication, kind: :idp_template_rejected, campaign_id: user_idp_plan.campaign_id)
      end

      context 'when communication exists' do
        before { communication }

        it 'creates communication email with the resource' do
          expect do
            user_idp_plan.update!(status: :rejected)
          end.to change(CommunicationEmail, :count).by(1)

          communication_email = CommunicationEmail.last
          expect(communication_email.communication).to eq(communication)
          expect(communication_email.user).to eq(user)
          expect(communication_email.campaign_user).to eq(campaign_user)
          expect(communication_email.communication_email_resources.first.resource).to eq(user_idp_plan)
        end
      end
    end

    describe 'status workflow transitions' do
      context 'from not_started' do
        before do
          user_idp_plan.update(status: :not_started)
        end

        it 'can transition to draft' do
          expect { user_idp_plan.draft! }.to change(user_idp_plan, :status).from('not_started').to('draft')
        end
      end

      context 'from draft' do
        before { user_idp_plan.update(status: :draft) }

        it 'can transition to pending_approval' do
          expect do
            user_idp_plan.submit_for_approval!
          end.to change(user_idp_plan, :status).from('draft').to('pending_approval')
        end

        it 'can transition to approved' do
          expect { user_idp_plan.approve! }.to change(user_idp_plan, :status).from('draft').to('approved')
        end
      end

      context 'from pending_approval' do
        before do
          user_idp_plan.update(status: :pending_approval)
        end

        it 'can transition to approved' do
          expect { user_idp_plan.approve! }.to change(user_idp_plan, :status).from('pending_approval').to('approved')
        end

        it 'can transition to rejected' do
          expect { user_idp_plan.reject! }.to change(user_idp_plan, :status).from('pending_approval').to('rejected')
        end
      end

      context 'from approved' do
        before do
          user_idp_plan.update(status: :approved)
        end

        it 'can transition to in_progress and set started_at' do
          expect { user_idp_plan.start! }.to change(user_idp_plan, :status).from('approved').to('in_progress')
          expect(user_idp_plan.started_at).to be_within(2.seconds).of(Time.current)
        end

        it 'can transition to rejected' do
          expect { user_idp_plan.reject! }.to change(user_idp_plan, :status).from('approved').to('rejected')
        end

        it 'can not transition to draft' do
          expect { user_idp_plan.draft! }.to raise_error(Workflow::NoTransitionAllowed)
        end
      end

      context 'from rejected' do
        before do
          user_idp_plan.update(status: :rejected)
        end

        it 'can transition to approved' do
          expect { user_idp_plan.approve! }.to change(user_idp_plan, :status).from('rejected').to('approved')
        end

        it 'can not transition to in_progress' do
          expect { user_idp_plan.start! }.to raise_error(Workflow::NoTransitionAllowed)
        end
      end

      context 'from in_progress' do
        before do
          user_idp_plan.update(status: :in_progress)
        end

        it 'can transition to completed and set completed_at' do
          expect { user_idp_plan.complete! }.to change(user_idp_plan, :status).from('in_progress').to('completed')
          expect(user_idp_plan.completed_at).to be_within(1.second).of(Time.current)
        end
      end

      context 'from completed' do
        before do
          user_idp_plan.update(status: :completed)
        end

        it 'does not allow transitioning to draft' do
          expect { user_idp_plan.draft! }.to raise_error(Workflow::NoTransitionAllowed)
        end
      end
    end
  end

  describe '#editable?' do
    let(:user_idp_plan) { create(:user_idp_plan) }

    {
      editable: %i[not_started draft rejected],
      non_editable: %i[pending_approval approved in_progress completed]
    }.each do |editability, statuses|
      expected_result = editability == :editable

      context "#{editability} statuses" do
        statuses.each do |status|
          context "when status is #{status}" do
            before { user_idp_plan.update(status: status) }

            it "returns #{expected_result}" do
              expect(user_idp_plan.editable?).to be expected_result
            end
          end
        end
      end
    end
  end
  describe '#manager_editable?' do
    let(:user_idp_plan) { create(:user_idp_plan) }

    {
      manager_editable: %i[rejected pending_approval],
      non_manager_editable: %i[not_started draft approved in_progress completed]
    }.each do |editability, statuses|
      expected_result = editability == :manager_editable

      context "#{editability} statuses" do
        statuses.each do |status|
          context "when status is #{status}" do
            before { user_idp_plan.update(status: status) }

            it "returns #{expected_result}" do
              expect(user_idp_plan.manager_editable?).to be expected_result
            end
          end
        end
      end
    end
  end
end
