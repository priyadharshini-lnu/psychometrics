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
        allow(UserReportPolicy).to receive(:new).with(user, user_report).and_return(user_report_policy)
        allow(user_report_policy).to receive(:send).with(:check_user_report).and_return(true)

        expect(subject.pdf_download_link?).to be true
      end
    end
  end

  describe 'Scope' do
    let(:other_user) { create(:user) }
    let!(:own_report_with_access) { create(:user_report, user: user, campaign: campaign, user_access: true) }
    let!(:own_report_without_access) { create(:user_report, user: user, campaign: campaign, user_access: false) }
    let!(:other_user_report) { create(:user_report, user: other_user, campaign: campaign, user_access: false) }

    context 'when user is superadmin' do
      let(:superadmin) { create(:superadmin) }
      subject { described_class::Scope.new(superadmin, UserReport).resolve }

      it 'returns all reports' do
        expect(subject).to include(own_report_with_access, own_report_without_access, other_user_report)
      end
    end

    context 'when regular user' do
      subject { described_class::Scope.new(user, UserReport).resolve }

      before { allow(user).to receive(:accessible_records).and_return(UserReport.none) }

      it 'includes own reports with user_access enabled' do
        expect(subject).to include(own_report_with_access)
      end

      it 'excludes own reports without user_access' do
        expect(subject).not_to include(own_report_without_access)
      end

      it 'excludes other users reports' do
        expect(subject).not_to include(other_user_report)
      end
    end

    context 'when user has view_report permission' do
      subject { described_class::Scope.new(user, UserReport).resolve }

      before do
        allow(user).to receive(:accessible_records).
          with(UserReport, 'results.view_report').
          and_return(UserReport.where(id: other_user_report.id))
      end

      it 'includes permitted reports' do
        expect(subject).to include(other_user_report)
      end
    end

    context 'when user is a threesixty participant' do
      let!(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
      let!(:participant) { create(:threesixty_participant, evaluator: user, campaign: campaign) }

      subject { described_class::Scope.new(user, UserReport).resolve }

      before do
        allow(user).to receive(:accessible_records).and_return(UserReport.none)

        managed_subjects = double('managed_subjects')
        users_reports_query = double('users_reports_query', query: UserReport.where(id: other_user_report.id))

        allow(Threesixty::Evaluators::GetManagedSubjectsQuery).
          to receive(:new).with(threesixty_campaign, user).
          and_return(double(query: managed_subjects))
        allow(Threesixty::UsersReportsQuery).
          to receive(:new).with(threesixty_campaign, managed_subjects, user).
          and_return(users_reports_query)
      end

      it 'includes reports for managed subjects' do
        expect(subject).to include(other_user_report)
      end
    end
  end
end
