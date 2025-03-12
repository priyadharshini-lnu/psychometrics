# frozen_string_literal: true

RSpec.shared_examples 'taggable API endpoints' do |model_class|
  let(:resource) { create(model_class.to_s.underscore.to_sym) }
  let(:tag) { 'example_tag' }

  before(:each) do
    allow(Current).to receive(:user).and_return(superadmin)
  end

  path "/#{model_class.to_s.underscore.pluralize}/{#{model_class.to_s.underscore}_id}/add_tag" do
    post "Add tag to a #{model_class.to_s.underscore}" do
      operationId "AddTagTo#{model_class}"

      description "Add a tag to an #{model_class.to_s.underscore}"
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :"#{model_class.to_s.underscore}_id", in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/AddTagRequest' }, required: true

      response '200', 'Tag added successfully' do
        let(:"#{model_class.to_s.underscore}_id") { resource.id }
        let(:tag) { 'example_tag' }

        let(:body) do
          {
            data: {
              type: model_class.to_s.underscore.pluralize,
              attributes: {
                tag: tag
              }
            }
          }
        end

        run_test! do |response|
          expect(response).to have_http_status(:ok)
          expect(resource.reload.all_tags_list).to include(tag)
        end
      end
    end
  end

  path "/#{model_class.to_s.underscore.pluralize}/{#{model_class.to_s.underscore}_id}/remove_tag" do
    post "Remove tag from a #{model_class.to_s.underscore}" do
      operationId "RemoveTagFrom#{model_class}"

      description "Remove a tag from an #{model_class.to_s.underscore}"
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :"#{model_class.to_s.underscore}_id", in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/RemoveTagRequest' }, required: true

      response '200', 'Tag removed successfully' do
        let(:"#{model_class.to_s.underscore}_id") { resource.id }
        let(:tag) { 'example_tag' }

        let(:body) do
          {
            data: {
              type: model_class.to_s.underscore.pluralize,
              attributes: {
                tag: tag
              }
            }
          }
        end

        before do
          resource.add_tag(tag)
          resource.save
        end

        run_test! do |response|
          expect(response).to have_http_status(:ok)
          expect(resource.reload.all_tags_list).not_to include(tag)
        end
      end
    end
  end
end
