# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserReports::FetchModuleContent, type: :service do
  let(:superadmin) { create(:superadmin) }
  let(:module1) { create(:module, name: 'Module 1', props: { 'text' => 'Module 1 Content' }) }
  let(:report) { create(:report) }
  let(:page) { create(:page, modules: [module1], report: report) }
  let(:user_report) { create(:user_report, user: superadmin, report: report) }
  let(:event_created_at) { Time.current }
  let(:service) { described_class.new(user_report_event) }

  describe '#call' do
    subject { service.call }

    context 'when module_id is nil' do
      let(:user_report_event) do
        create(
          :user_report_event,
          event_type: 'status_changed',
          initiator: superadmin,
          user_report: user_report,
          details: { 'module' => nil },
          created_at: event_created_at
        )
      end

      it 'returns nil' do
        expect(subject).to be_nil
      end
    end

    context 'when event_type is "removed_text"' do
      let(:user_report_event) do
        double(
          UserReportEvent,
          event_type: 'removed_text',
          initiator: superadmin,
          user_report: user_report,
          user_report_id: user_report.id,
          details: { 'module' => module1.id.to_s, 'content' => 'removed_content' },
          created_at: event_created_at,
          module_content: module1.props['text']
        )
      end

      it 'returns the removed content without HTML tags' do
        expect(subject).to eq('removed_content')
      end
    end

    context 'when event has content' do
      let(:user_report_event) do
        double(
          UserReportEvent,
          event_type: 'added_text',
          initiator: superadmin,
          user_report: user_report,
          user_report_id: user_report.id,
          details: { 'module' => module1.id.to_s, 'content' => '<p>Event content</p>' },
          created_at: event_created_at,
          module_content: module1.props['text']
        )
      end

      it 'returns the original content without HTML tags' do
        expect(subject).to eq(module1.props['text'])
      end
    end

    context 'when event does not have content' do
      let(:user_report_event) do
        double(
          UserReportEvent,
          event_type: 'comment_added',
          initiator: superadmin,
          user_report: user_report,
          user_report_id: user_report.id,
          details: { 'module' => module1.id.to_s },
          created_at: event_created_at,
          module_content: module1.props['text']
        )
      end

      context 'and there is a latest event with content' do
        before do
          latest_event = double(
            UserReportEvent,
            event_type: 'created_text',
            details: { 'content' => '<p>Latest event content</p>' }
          )

          allow_any_instance_of(described_class).to receive(:fetch_latest_event_with_content).and_return(latest_event)
        end

        it 'returns the latest event content without HTML tags' do
          expect(subject).to eq('Latest event content')
        end
      end

      context 'and there is no latest event with content' do
        before do
          allow_any_instance_of(described_class).to receive(:fetch_latest_event_with_content).and_return(nil)
        end

        it 'returns the original module content without HTML tags' do
          expect(subject).to eq(module1.props['text'])
        end
      end
    end
  end
end
