# frozen_string_literal: true

RSpec.shared_examples 'Filter by tags' do |model_class|
  let(:resource) { create(model_class.to_s.underscore.to_sym) }
  let(:tag) { 'example_tag' }
  let(:second_tag) { 'second_tag' }

  before(:each) do
    allow(Current).to receive(:user).and_return(superadmin)
  end

  it 'returns assessment with tags' do
    params = { filter: { tagged_with: tag } }

    get "/api/v2/administration/#{model_class.to_s.underscore.pluralize}", params: params,
        headers: { 'Content-type': 'application/vnd.api+json' }

    expect(JSON.parse(response.body)['data']).to be_empty

    resource.add_tag(tag)
    resource.save
    get "/api/v2/administration/#{model_class.to_s.underscore.pluralize}", params: params,
        headers: { 'Content-type': 'application/vnd.api+json' }

    expect(response).to have_http_status(:ok)
    data = JSON.parse(response.body)['data']
    expect(data.length).to eq(1)

    attributes = data[0]['attributes']

    expect(data[0]['id']).to eq(resource.id.to_s)
    expect(attributes['name']).to eq(resource.name)
  end

  it 'filter assessment with all tags matching' do
    resource.add_tag(tag)
    resource.save

    params = { filter: { tagged_with: [tag, second_tag] } }

    get "/api/v2/administration/#{model_class.to_s.underscore.pluralize}", params: params,
        headers: { 'Content-type': 'application/vnd.api+json' }

    expect(JSON.parse(response.body)['data']).to be_empty

    resource.add_tag(second_tag)
    resource.save

    get "/api/v2/administration/#{model_class.to_s.underscore.pluralize}", params: params,
        headers: { 'Content-type': 'application/vnd.api+json' }

    data = JSON.parse(response.body)['data']
    attributes = data[0]['attributes']

    expect(data[0]['id']).to eq(resource.id.to_s)
    expect(attributes['name']).to eq(resource.name)
  end
end
