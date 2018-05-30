require 'rails_helper'

describe Client, type: :model do
  describe '#hogan_group_name' do
    let(:project) { create(:project) }

    it 'should not be empty' do
      expect(project.reload.hogan_group_name).not_to be_empty
    end

    it 'should be correct' do
      expect(project.reload.hogan_group_name).to eq("#{project.client.name} - #{project.subdomain}")
    end
  end
end
