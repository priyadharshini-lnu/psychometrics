# frozen_string_literal: true

require 'rails_helper'

describe 'PankoOverride::Serializer' do
  let(:author) { Dummy::Author.create(name: 'John') }

  it 'raises exception if schema is not present' do
    expect { Dummy::AuthorWithoutSchemaSerializer.new.serialize(author) }.to raise_error(
      PankoOverride::Exceptions::SchemaNotDefined,
      "Schema not defined for serializer 'Dummy::AuthorWithoutSchemaSerializer'"
    )
  end

  it 'simple serialization if schema is present' do
    expect(Dummy::AuthorSerializer.new.serialize(author)).to eq({
      'id' => author.id,
      'name' => 'John'
    })
  end

  it 'raises KeyValidationMissing if validate_keys is false' do
    expect { Dummy::AuthorWithoutValidatesKeysSerializer.new.serialize(author) }.to raise_error(
      PankoOverride::Exceptions::KeyValidationMissing,
      "Schema class 'Dummy::AuthorWithoutValidatesKeysSchema' does not have 'config.validate_keys' set to true. Please set it to true or whitelist the schema in whitelisted_schemas method" # rubocop:disable Layout/LineLength
    )
  end

  it 'raises error for additional keys' do
    response = Dummy::AuthorWithAdditionalKeySerializer.new.serialize(author)

    expect(response).to include(:schema_validation_error)

    schema_validation_error = JSON.parse(response[:schema_validation_error], symbolize_names: true)

    expect(schema_validation_error).to match({
      type: 'PankoOverride::Exceptions::SchemaValidationFailed',
      message: a_string_including(
        'Schema: Dummy::AuthorWithAdditionalKeySchema',
        'is not allowed'
      ),
      meta: {
        errors: [
          {
            title: 'is not allowed',
            path: 'name'
          }
        ],
        response: {
          id: author.id,
          name: 'John'
        },
        schema: 'Dummy::AuthorWithAdditionalKeySchema'
      },
      exception: true
    })
  end

  it 'raises validation failed for has_one association' do
    author = Dummy::Author.create!
    post = Dummy::Post.create!(title: 'Post title', author_id: author.id)

    response = Dummy::PostSerializer.new.serialize(post)

    expect(response).to include(:schema_validation_error)
    schema_validation_error = JSON.parse(response[:schema_validation_error], symbolize_names: true)

    expect(schema_validation_error).to match({
      type: 'PankoOverride::Exceptions::SchemaValidationFailed',
      message: a_string_including('Schema: Dummy::PostSchema', 'must be a string', 'author/name'),
      meta: {
        errors: [
          {
            title: 'must be a string',
            path: 'author/name'
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
    })
  end

  it 'raises validation failed for has_many association' do
    post = Dummy::Post.create!(title: 'Post title', author_id: author.id)
    comment = Dummy::Comment.create!(post_id: post.id, text: nil)

    response = Dummy::PostSerializer.new.serialize(post)

    schema_validation_error = JSON.parse(response[:schema_validation_error], symbolize_names: true)

    expect(schema_validation_error).to match({
      type: 'PankoOverride::Exceptions::SchemaValidationFailed',
      message: a_string_including(
        'Schema: Dummy::PostSchema',
        'must be a string'
      ),
      meta: {
        errors: [
          {
            title: 'must be a string',
            path: 'comments/0/text'
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
    })
  end

  it 'serialization works with associations' do
    post = Dummy::Post.create!(title: 'Post title', author_id: author.id)
    comment1 = Dummy::Comment.create!(post_id: post.id, text: 'Comment 1')
    comment2 = Dummy::Comment.create!(post_id: post.id, text: 'Comment 2')

    expect(Dummy::PostSerializer.new.serialize(post)).to eq({
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
    })
  end
end
