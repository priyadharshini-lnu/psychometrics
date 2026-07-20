# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserReportDownloadPolicy do
  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:user_report) { create(:user_report, user: user, campaign: campaign, user_access: false) }

  def policy_context(current_user)
    { current_user: current_user }
  end

  describe '#pdf_download_link?' do
    context 'when user is superadmin' do
      let(:superadmin) { create(:superadmin) }
      subject { described_class.new(policy_context(superadmin), user_report) }

      it 'allows access' do
        expect(subject.pdf_download_link?).to be true
      end
    end

    context 'when user has view_report permission for the campaign' do
      subject { described_class.new(policy_context(user), user_report) }

      before do
        allow(user).to receive(:has_permission?).with(
          :results, :view_report,
          project_id: campaign.project_id,
          campaign_id: campaign.id
        ).and_return(true)
      end

      it 'allows access' do
        expect(subject.pdf_download_link?).to be true
      end
    end

    context 'when user is the report owner with user_access enabled' do
      let(:user_report) { create(:user_report, user: user, campaign: campaign, user_access: true) }
      subject { described_class.new(policy_context(user), user_report) }

      before { allow(user).to receive(:has_permission?).and_return(false) }

      it 'allows access' do
        expect(subject.pdf_download_link?).to be true
      end
    end

    context 'when user is the report owner but user_access is disabled' do
      subject { described_class.new(policy_context(user), user_report) }

      before { allow(user).to receive(:has_permission?).and_return(false) }

      it 'denies access' do
        expect(subject.pdf_download_link?).to be false
      end
    end

    context 'when user is not the report owner and has no permission' do
      let(:other_user) { create(:user) }
      subject { described_class.new(policy_context(other_user), user_report) }

      before { allow(other_user).to receive(:has_permission?).and_return(false) }

      it 'denies access' do
        expect(subject.pdf_download_link?).to be false
      end
    end

    context 'when campaign has a threesixty campaign' do
      let!(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
      subject { described_class.new(policy_context(user), user_report) }

      before { allow(user).to receive(:has_permission?).and_return(false) }

      it 'delegates to UserReportPolicy#check_user_report' do
        user_report_policy = instance_double(UserReportPolicy)
        allow(UserReportPolicy).to receive(:new).with({ current_user: user },
                                                      user_report).and_return(user_report_policy)
        allow(user_report_policy).to receive(:send).with(:check_user_report).and_return(true)

        expect(subject.pdf_download_link?).to be true
      end
    end
  end
end
