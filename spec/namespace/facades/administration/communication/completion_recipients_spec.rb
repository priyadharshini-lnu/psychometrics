# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Facades::Administration::Communication::CompletionRecipients do
  let(:current_user) { create(:superadmin) }
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:assessment) { create(:assessment, project_id: project.id) }

  let(:completion_communication) do
    create(:communication, client: project.parent, project_id: project.id, campaign_id: campaign.id,
      assessment_id: assessment.id, kind: :completion)
  end

  let(:invitation_communication) do
    create(:communication, client: project.parent, project_id: project.id, campaign_id: campaign.id,
      kind: :invitation)
  end

  describe '#recipient_type_options' do
    it 'returns All/Selected/Selected Admins/Selected Assessors for the completion kind' do
      facade = Facades::Administration::Communication.new(current_user, completion_communication)
      expect(facade.recipient_type_options.keys).to eq(%w[all selected selected_admins selected_assessors])
    end

    it 'returns the original four options, unchanged, for every other kind' do
      facade = Facades::Administration::Communication.new(current_user, invitation_communication)
      expect(facade.recipient_type_options.keys).to eq(%w[all selected new_users new_assignment])
    end
  end

  describe '#recipient_type_label_key' do
    it 'returns a fully-qualified, flat admin.yml key for the completion kind' do
      facade = Facades::Administration::Communication.new(current_user, completion_communication)
      expect(facade.recipient_type_label_key('all')).to eq('admin.completion_recipients_all')
    end

    it 'returns the legacy relative (administration.yml) key for every other kind' do
      facade = Facades::Administration::Communication.new(current_user, invitation_communication)
      expect(facade.recipient_type_label_key('all')).to eq('.all')
    end
  end

  describe '#show_selected_admin_recipients? / #show_selected_assessor_recipients?' do
    it 'is true only for the completion kind with the matching recipients type selected' do
      completion_communication.update!(recipients: :selected_admins)
      facade = Facades::Administration::Communication.new(current_user, completion_communication)

      expect(facade.show_selected_admin_recipients?).to be true
      expect(facade.show_selected_assessor_recipients?).to be false
    end

    it 'is false for a non-completion kind even if that recipients value is stored' do
      invitation_communication.update_column(:recipients, Communication.recipients[:selected_admins])
      facade = Facades::Administration::Communication.new(current_user, invitation_communication)

      expect(facade.show_selected_admin_recipients?).to be false
    end
  end

  describe '#assessor_recipients' do
    it 'returns only users who are assessors on the communication campaign' do
      assessor_user = create(:assessor, campaign: campaign).user
      other_campaign_assessor = create(:assessor).user
      facade = Facades::Administration::Communication.new(current_user, completion_communication)

      expect(facade.assessor_recipients).to include(assessor_user)
      expect(facade.assessor_recipients).not_to include(other_campaign_assessor)
    end

    it 'excludes disabled users' do
      disabled_assessor = create(:assessor, campaign: campaign, user: create(:user, disabled: true)).user
      facade = Facades::Administration::Communication.new(current_user, completion_communication)

      expect(facade.assessor_recipients).not_to include(disabled_assessor)
    end
  end
end
