# frozen_string_literal: true

require 'rails_helper'

describe 'PankoOverride::ArraySerializer' do
  let(:author) { Dummy::Author.create(name: 'John') }

  it 'raises exception if schema is not present' do
    expect do
      Panko::ArraySerializer.new([author], each_serializer: Dummy::AuthorWithoutSchemaSerializer).to_a
    end.to raise_error(
      PankoOverride::Exceptions::SchemaNotDefined,
      "Schema not defined for serializer 'Dummy::AuthorWithoutSchemaSerializer'"
    )
  end

  it 'simple serialization if schema is present' do
    author2 = Dummy::Author.create(name: 'Smith')
    expect(Panko::ArraySerializer.new([author, author2], each_serializer: Dummy::AuthorSerializer).to_a).to eq([
      {
        'id' => author.id,
        'name' => author.name
      },
      {
        'id' => author2.id,
        'name' => author2.name
      }
    ])
  end

  it 'raises KeyValidationMissing if validate_keys is false' do
    expect do
      Panko::ArraySerializer.new([author], each_serializer: Dummy::AuthorWithoutValidatesKeysSerializer).to_a
    end.to raise_error(
      PankoOverride::Exceptions::KeyValidationMissing,
      "Schema class 'Dummy::AuthorWithoutValidatesKeysSchema' does not have 'config.validate_keys' set to true. Please set it to true or whitelist the schema in whitelisted_schemas method" # rubocop:disable Layout/LineLength
    )
  end

  it 'includes schema validation error details in the response for additional keys' do
    responses = Panko::ArraySerializer.new([author], each_serializer: Dummy::AuthorWithAdditionalKeySerializer).to_a

    expect(responses.first).to include(:schema_validation_error)
    schema_validation_error = JSON.parse(responses.first[:schema_validation_error], symbolize_names: true)

    expect(schema_validation_error).to match(
      type: 'PankoOverride::Exceptions::SchemaValidationFailed',
      message: a_string_including(
        'Schema: Dummy::AuthorWithAdditionalKeySchema',
        'is not allowed',
        '0/name'
      ),
      meta: {
        errors: [
          {
            title: 'is not allowed',
            path: '0/name'
          }
        ],
        response: {
          id: author.id,
          name: 'John'
        },
        schema: 'Dummy::AuthorWithAdditionalKeySchema'
      },
      exception: true
    )
  end

  it 'includes schema validation error details in the response for has_one association' do
    author = Dummy::Author.create!
    post = Dummy::Post.create!(title: 'Post title', author_id: author.id)
    responses = Panko::ArraySerializer.new([post], each_serializer: Dummy::PostSerializer).to_a

    expect(responses.first).to include(:schema_validation_error)

    schema_validation_error = JSON.parse(responses.first[:schema_validation_error], symbolize_names: true)
    expect(schema_validation_error).to match(
      type: 'PankoOverride::Exceptions::SchemaValidationFailed',
      message: a_string_including('Schema: Dummy::PostSchema', 'must be a string', '0/author/name'),
      meta: {
        errors: [
          {
            title: 'must be a string',
            path: '0/author/name'
          }
        ],
        response: {
          id: post.id,
          title: 'Post title',
          author: {
            id: author.id,
            name: nil
          },
          comments: []
        },
        schema: 'Dummy::PostSchema'
      },
      exception: true
    )
  end

  it 'raises validation failed for has_many association' do
    post = Dummy::Post.create!(title: 'Post title', author_id: author.id)
    comment = Dummy::Comment.create!(post_id: post.id, text: nil)

    responses = Panko::ArraySerializer.new([post], each_serializer: Dummy::PostSerializer).to_a

    expect(responses.first).to include(:schema_validation_error)
    schema_validation_error = JSON.parse(responses.first[:schema_validation_error], symbolize_names: true)

    expect(schema_validation_error).to match(
      type: 'PankoOverride::Exceptions::SchemaValidationFailed',
      message: a_string_including(
        'Schema: Dummy::PostSchema',
        'must be a string',
        '0/comments/0/text'
      ),
      meta: {
        errors: [
          {
            title: 'must be a string',
            path: '0/comments/0/text'
          }
        ],
        response: {
          id: post.id,
          title: 'Post title',
          author: {
            id: author.id,
            name: 'John'
          },
          comments: [
            {
              id: comment.id,
              text: nil
            }
          ]
        },
        schema: 'Dummy::PostSchema'
      },
      exception: true
    )
  end

  it 'serialization works with associations' do
    post = Dummy::Post.create!(title: 'Post title', author_id: author.id)
    comment1 = Dummy::Comment.create!(post_id: post.id, text: 'Comment 1')
    comment2 = Dummy::Comment.create!(post_id: post.id, text: 'Comment 2')

    expect(Panko::ArraySerializer.new([post], each_serializer: Dummy::PostSerializer).to_a).to eq([{
      'id' => post.id,
      'title' => 'Post title',
      'author' => {
        'id' => author.id,
        'name' => author.name
      },
      'comments' => [
        {
          'id' => comment1.id,
          'text' => comment1.text
        },
        {
          'id' => comment2.id,
          'text' => comment2.text
        }
      ]
    }])
  end
end
