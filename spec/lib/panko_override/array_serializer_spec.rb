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

  it 'raises error for additional keys' do
    expect do
      Panko::ArraySerializer.new([author], each_serializer: Dummy::AuthorWithAdditionalKeySerializer).to_a
    end.to raise_error(
      PankoOverride::Exceptions::SchemaValidationFailed,
      [
        'Schema: Dummy::AuthorWithAdditionalKeySchema',
        'Errors: [{:title=>"is not allowed", :path=>"0/name"}]',
        "Response: {\"id\"=>#{author.id}, \"name\"=>\"#{author.name}\"}"
      ].join("\n")
    )
  end

  it 'raises validation failed for has_one association' do
    author = Dummy::Author.create!
    post = Dummy::Post.create!(title: 'Post title', author_id: author.id)

    expect do
      Panko::ArraySerializer.new([post], each_serializer: Dummy::PostSerializer).to_a
    end.to raise_error(
      PankoOverride::Exceptions::SchemaValidationFailed,
      [
        'Schema: Dummy::PostSchema',
        'Errors: [{:title=>"must be a string", :path=>"0/author/name"}]',
        "Response: {\"id\"=>#{post.id}, \"title\"=>\"#{post.title}\", \"author\"=>{\"id\"=>#{author.id}, \"name\"=>nil}, \"comments\"=>[]}" # rubocop:disable Layout/LineLength
      ].join("\n")
    )
  end

  it 'raises validation failed for has_many association' do
    post = Dummy::Post.create!(title: 'Post title', author_id: author.id)
    comment = Dummy::Comment.create!(post_id: post.id, text: nil)

    expect do
      Panko::ArraySerializer.new([post], each_serializer: Dummy::PostSerializer).to_a
    end.to raise_error(
      PankoOverride::Exceptions::SchemaValidationFailed,
      [
        'Schema: Dummy::PostSchema',
        'Errors: [{:title=>"must be a string", :path=>"0/comments/0/text"}]',
        "Response: {\"id\"=>#{post.id}, \"title\"=>\"#{post.title}\", \"author\"=>{\"id\"=>#{author.id}, \"name\"=>\"#{author.name}\"}, \"comments\"=>[{\"id\"=>#{comment.id}, \"text\"=>nil}]}" # rubocop:disable Layout/LineLength
      ].join("\n")
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
