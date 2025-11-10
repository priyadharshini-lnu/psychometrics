# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::Administration::YoodliAssessmentPolicy do
  let(:yoodli_assessment) { create(:yoodli_assessment) }
  let(:project) { yoodli_assessment.project }

  describe 'user with integrations permission' do
    let(:project_admin) { create(:project_admin, project: project) }

    subject { described_class.new(project_admin, yoodli_assessment, project_id: project.id) }

    %i[index? create? update? destroy?].each do |permission|
      it "allows #{permission}" do
        expect(subject.public_send(permission)).to be_truthy
      end
    end
  end

  describe 'user without integrations permission' do
    let(:user) { create(:user) }

    subject { described_class.new(user, yoodli_assessment, project_id: project.id) }

    %i[index? create? update? destroy?].each do |permission|
      it "denies #{permission}" do
        expect(subject.public_send(permission)).to be_falsey
      end
    end
  end
end
