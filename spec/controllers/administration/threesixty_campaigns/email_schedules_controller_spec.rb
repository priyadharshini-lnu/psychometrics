# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ThreesixtyCampaigns::EmailSchedulesController, type: :controller do
  let!(:client) { create(:tenancy) }
  let!(:template) { create(:threesixty_email_template, content: 'En', subject: 'Sub') }
  let(:current_user) { create(:superadmin) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it 'creates schedule with template content' do
    # The route segment is a Campaign id despite its name; the controller finds by campaign_id.
    post :create, params: {
      threesixty_campaign_id: template.threesixty_campaign.campaign_id,
      id: template.id,
      name: template.name,
      consolidated: template.consolidated,
      content: template.content,
      subject: template.subject,
      reply_to_email: template.reply_to_email,
      from: template.from,
      recipient_ids: [current_user.id],
      recipient_by_criteria: []
    }, as: :json

    expect(response.status).to eq(200)
    expect(Threesixty::EmailSchedule.count).to eq(1)

    created_email_schedule = Threesixty::EmailSchedule.last

    expect(created_email_schedule.name).to eq(template.name)
    expect(created_email_schedule.from).to eq(template.from)
    expect(created_email_schedule.template_id).to eq(template.id)
  end
end
