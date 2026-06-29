# frozen_string_literal: true

RSpec.shared_examples 'taggable API endpoints' do |model_class|
  let(:resource) { create(model_class.to_s.underscore.to_sym) }
  let(:tag_name) { 'example_tag' }

  before(:each) do
    allow(Current).to receive(:user).and_return(superadmin)
  end

  describe "POST /api/v2/administration/#{model_class.to_s.underscore.pluralize}/" \
           ":#{model_class.to_s.underscore}_id/add_tag" do
    it "adds a tag to a #{model_class.to_s.underscore}" do
      body = {
        data: {
          type: model_class.to_s.underscore.pluralize,
          attributes: {
            tag: tag_name
          }
        }
      }

      post "/api/v2/administration/#{model_class.to_s.underscore.pluralize}/#{resource.id}/add_tag",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(resource.reload.all_tags_list).to include(tag_name)
    end
  end

  describe "POST /api/v2/administration/#{model_class.to_s.underscore.pluralize}/" \
           ":#{model_class.to_s.underscore}_id/remove_tag" do
    it "removes a tag from a #{model_class.to_s.underscore}" do
      resource.add_tag(tag_name)
      resource.save

      body = {
        data: {
          type: model_class.to_s.underscore.pluralize,
          attributes: {
            tag: tag_name
          }
        }
      }

      post "/api/v2/administration/#{model_class.to_s.underscore.pluralize}/#{resource.id}/remove_tag",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(resource.reload.all_tags_list).not_to include(tag_name)
    end
  end
end
