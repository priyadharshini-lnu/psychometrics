# frozen_string_literal: true

require 'rails_helper'

describe Users::PasswordResetForm do
  it 'validates presence of email' do
    form = described_class.new(email: nil).with_context(subdomain: nil)
    form.valid?

    expect(form.errors.messages[:email]).to include("can't be blank")
  end

  it 'validates email format' do
    form = described_class.new(email: 'abc').with_context(subdomain: nil)
    form.valid?

    expect(form.errors.messages[:email]).to include('is invalid')
  end

  it 'validates existence of project user' do
    subdomain = 'tte'
    project = create(:project, subdomain: subdomain)
    user = create(:user, project: project)
    create(:membership, client_id: project.id, user_id: user.id)
    form = described_class.new(email: user.email).with_context(subdomain: subdomain)

    expect(form.valid?).to eq(true)

    expect(form.user).to eq(user)
  end

  it 'validates existence of admin user' do
    user = create(:user, project: nil)
    form = described_class.new(email: user.email).with_context(subdomain: nil)

    expect(form.valid?).to eq(true)

    expect(form.user).to eq(user)
  end

  it "doesn't find admin user when subdomain is provided" do
    subdomain = 'tte'
    create(:project, subdomain: subdomain)
    user = create(:user, project: nil)
    form = described_class.new(email: user.email).with_context(subdomain: subdomain)

    expect(form.valid?).to eq(false)
    expect(form.errors.messages[:email]).to include("We couldn't find any user with the email you provided.")
    expect(form.user).to eq(nil)
  end

  it "doesn't find project user when no subdomain is provided" do
    project = create(:project, subdomain: 'tte')
    user = create(:user, project: project)
    form = described_class.new(email: user.email).with_context(subdomain: nil)

    expect(form.valid?).to eq(false)
    expect(form.errors.messages[:email]).to include("We couldn't find any user with the email you provided.")
    expect(form.user).to eq(nil)
  end
end
