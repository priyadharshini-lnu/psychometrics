# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe Api::V2::Administration::TagsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessment) { create(:assessment) }

  before do
    sign_in(superadmin)
    set_current_user(superadmin)

    assessment.add_tag('psychometric')
    assessment.save
  end

  path '/tags/' do
    get 'Tag List' do
      operationId 'TagList'
      description 'Fetch Tag List'
      tags 'Tag'
      consumes 'application/json'
      security [basic: []]
      parameter name: :'query[taggable_resource_type]', in: :query, type: :string, required: false

      response '200', 'Tag list' do
        examples 'application/json' => {
          data: [
            {
              id: '1',
              type: 'tags',
              attributes: {
                name: 'psychometric'
              }
            }
          ]
        }

        let(:'query[taggable_resource_type]') { 'Assessment' }

        run_test! do |response|
          tag =  ActsAsTaggableOn::Tag.named('psychometric').last

          data = JSON.parse(response.body)['data']
          tag_response = data.find { |d| d['id'] == tag.id.to_s }
          expect(tag_response).to have_key('id')
          expect(tag_response).to have_attribute(:name).with_value(tag.name)
        end
      end
    end
  end
end
