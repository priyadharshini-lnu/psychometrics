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
      "Schema class 'Dummy::AuthorWithoutValidatesKeysSchema' does not have 'config.validate_keys' set to true"
    )
  end

  it 'raises error for additional keys' do
    expect { Dummy::AuthorWithAdditionalKeySerializer.new.serialize(author) }.to raise_error(
      PankoOverride::Exceptions::SchemaValidationFailed,
      [
        'Schema: Dummy::AuthorWithAdditionalKeySchema',
        'Errors: [{:title=>"is not allowed", :path=>"name"}]',
        "Response: {\"id\"=>#{author.id}, \"name\"=>\"#{author.name}\"}"
      ].join("\n")
    )
  end

  it 'raises validation failed for has_one association' do
    author = Dummy::Author.create!
    post = Dummy::Post.create!(title: 'Post title', author_id: author.id)

    expect { Dummy::PostSerializer.new.serialize(post) }.to raise_error(
      PankoOverride::Exceptions::SchemaValidationFailed,
      [
        'Schema: Dummy::PostSchema',
        'Errors: [{:title=>"must be a string", :path=>"author/name"}]',
        "Response: {\"id\"=>#{post.id}, \"title\"=>\"#{post.title}\", \"author\"=>{\"id\"=>#{author.id}, \"name\"=>nil}, \"comments\"=>[]}" # rubocop:disable Layout/LineLength
      ].join("\n")
    )
  end

  it 'raises validation failed for has_many association' do
    post = Dummy::Post.create!(title: 'Post title', author_id: author.id)
    comment = Dummy::Comment.create!(post_id: post.id, text: nil)

    expect { Dummy::PostSerializer.new.serialize(post) }.to raise_error(
      PankoOverride::Exceptions::SchemaValidationFailed,
      [
        'Schema: Dummy::PostSchema',
        'Errors: [{:title=>"must be a string", :path=>"comments/0/text"}]',
        "Response: {\"id\"=>#{post.id}, \"title\"=>\"#{post.title}\", \"author\"=>{\"id\"=>#{author.id}, \"name\"=>\"#{author.name}\"}, \"comments\"=>[{\"id\"=>#{comment.id}, \"text\"=>nil}]}" # rubocop:disable Layout/LineLength
      ].join("\n")
    )
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
