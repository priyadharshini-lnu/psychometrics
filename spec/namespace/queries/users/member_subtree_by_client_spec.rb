# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ::Queries::Users::MembersSubtreeByClient do
  let(:query) { ::Queries::Users::MembersSubtreeByClient }
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, parent: client) }
  let!(:campaign) { create(:campaign_base, parent: project) }
  let!(:sub_campaign1) { create(:sub_campaign, parent: campaign) }
  let!(:sub_campaign2) { create(:sub_campaign, parent: campaign) }
  let!(:sub_campaign3) { create(:sub_campaign, parent: campaign) }
  let!(:different_project) { create(:project, parent: client) }
  let!(:campaign_from_different_project) { create(:sub_campaign, parent: different_project) }
  let!(:sub_campaign_from_different_project) { create(:sub_campaign, parent: campaign_from_different_project) }
  let!(:member_membership_from_different_project) { create(:membership, client: sub_campaign_from_different_project) }
  let!(:project_admin_membership) { create(:project_admin_membership, client: sub_campaign1.project) }
  let!(:client_admin_membership) { create(:client_admin_membership, client: sub_campaign1.client) }
  let!(:member_membership1) { create(:membership, client: sub_campaign1) }
  let!(:member_membership2) { create(:membership, client: sub_campaign2) }
  let!(:member_membership3) { create(:membership, client: sub_campaign3, user: member_membership1.user) }
  let!(:manager_membership1) { create(:manager_membership, client: sub_campaign1) }
  let!(:manager_membership2) { create(:manager_membership, client: sub_campaign2) }
  let!(:member_membership_from_other_client) { create(:membership) }
  let!(:other_client) { member_membership_from_other_client.client.client }

  context 'when call on sub_campaign level' do
    context 'when pass sub_campaign1' do
      it 'eq sub_campaign1 users' do
        expect(query.call(sub_campaign1).to_a).to match_array(sub_campaign1.users.to_a)
      end

      it 'not eq sub_campaign2 users' do
        expect(query.call(sub_campaign1).to_a).not_to match_array(sub_campaign2.users.to_a)
      end

      it 'not eq sub_campaign3 users' do
        expect(query.call(sub_campaign1).to_a).not_to match_array(sub_campaign3.users.to_a)
      end

      it 'not eq sub_campaign_from_different_project users' do
        expect(query.call(sub_campaign1).to_a).not_to match_array(sub_campaign_from_different_project.users.to_a)
      end

      it 'include user from member_membership3 as one user' do
        expect(query.call(sub_campaign1).to_a).to include(member_membership3.user)
      end
    end

    context 'when pass sub_campaign2' do
      it 'eq sub_campaign2 users' do
        expect(query.call(sub_campaign2).to_a).to match_array(sub_campaign2.users.to_a)
      end

      it 'not eq sub_campaign1 users' do
        expect(query.call(sub_campaign2).to_a).not_to match_array(sub_campaign1.users.to_a)
      end

      it 'not eq sub_campaign3 users' do
        expect(query.call(sub_campaign2).to_a).not_to match_array(sub_campaign3.users.to_a)
      end

      it 'not eq sub_campaign_from_different_project users' do
        expect(query.call(sub_campaign2).to_a).not_to match_array(sub_campaign_from_different_project.users.to_a)
      end

      it 'does not include user from member_membership3 as one user' do
        expect(query.call(sub_campaign2).to_a).not_to include(member_membership3.user)
      end
    end

    context 'when pass sub_campaign3' do
      it 'eq sub_campaign3 users' do
        expect(query.call(sub_campaign3).to_a).to match_array(sub_campaign3.users.to_a)
      end

      it 'not eq sub_campaign1 users' do
        expect(query.call(sub_campaign3).to_a).not_to match_array(sub_campaign1.users.to_a)
      end

      it 'not eq sub_campaign2 users' do
        expect(query.call(sub_campaign3).to_a).not_to match_array(sub_campaign2.users.to_a)
      end

      it 'not eq sub_campaign_from_different_project users' do
        expect(query.call(sub_campaign3).to_a).not_to match_array(sub_campaign_from_different_project.users.to_a)
      end

      it 'include user from member_membership1 as one user' do
        expect(query.call(sub_campaign3).to_a).to include(member_membership1.user)
      end
    end

    context 'when pass sub_campaign_from_different_project' do
      it 'eq campaign_from_different_project users' do
        users = sub_campaign_from_different_project.users.to_a
        expect(query.call(sub_campaign_from_different_project).to_a).to match_array(users)
      end

      it 'not eq sub_campaign1 users' do
        expect(query.call(campaign_from_different_project).to_a).not_to match_array(sub_campaign1.users.to_a)
      end

      it 'not eq sub_campaign2 users' do
        expect(query.call(campaign_from_different_project).to_a).not_to match_array(sub_campaign2.users.to_a)
      end

      it 'not eq sub_campaign3 users' do
        expect(query.call(campaign_from_different_project).to_a).not_to match_array(sub_campaign3.users.to_a)
      end
    end
  end

  context 'when call on campaign level' do
    context 'when pass campaign' do
      it "eq all users form all campaign's sub_campaigns" do
        users = (sub_campaign1.users + sub_campaign2.users + sub_campaign3.users).uniq
        expect(query.call(campaign).to_a).to match_array(users)
      end

      it 'does not include user from campaign_from_different_project' do
        expect(query.call(campaign).to_a).not_to include(member_membership_from_different_project.user)
      end
    end

    context 'when pass campaign_from_different_project' do
      it 'does not contains users from campaign' do
        users = *(sub_campaign1.users + sub_campaign2.users + sub_campaign3.users).uniq
        expect(query.call(campaign_from_different_project)).to_not include(users)
      end

      it "eq all users form all campaign_from_different_project's sub_campaigns" do
        users = sub_campaign_from_different_project.users
        expect(query.call(campaign_from_different_project).to_a).to match_array(users)
      end
    end
  end

  context 'when call on project level' do
    context 'when pass project' do
      it "eq all users form all campaign's sub_campaigns" do
        users = (sub_campaign1.users + sub_campaign2.users + sub_campaign3.users).uniq
        expect(query.call(project).to_a).to match_array(users)
      end

      it 'does not include user from different_project' do
        expect(query.call(project).to_a).not_to include(member_membership_from_different_project.user)
      end
    end

    context 'when pass different_project' do
      it 'does not contains users from campaign' do
        users = *(sub_campaign1.users + sub_campaign2.users + sub_campaign3.users).uniq
        expect(query.call(different_project)).to_not include(users)
      end

      it "eq all users form all campaign_from_different_project's sub_campaigns" do
        users = sub_campaign_from_different_project.users
        expect(query.call(different_project).to_a).to match_array(users)
      end
    end
  end

  context 'when call on client level' do
    context 'when pass client' do
      it "eq all users form all client's projects" do
        users = (sub_campaign1.users + sub_campaign2.users + sub_campaign3.users +
          sub_campaign_from_different_project.users).uniq
        expect(query.call(client).to_a).to match_array(users)
      end

      it 'does not include user from other client' do
        expect(query.call(project).to_a).not_to include(member_membership_from_other_client.user)
      end
    end

    context 'when pass other_client' do
      it 'does not contains users from campaign' do
        users = *(sub_campaign1.users + sub_campaign2.users + sub_campaign3.users +
          sub_campaign_from_different_project.users).uniq
        expect(query.call(other_client)).to_not include(users)
      end

      it "eq all users form all different_client's projects" do
        expect(query.call(other_client).to_a).to match_array(member_membership_from_other_client.user)
      end
    end
  end
end
