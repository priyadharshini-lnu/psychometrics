# frozen_string_literal: true

module DummyTables
  def self.create
    conn.create_table :authors do |t|
      t.integer :campaign_id
      t.string :name
    end
    conn.create_table :posts do |t|
      t.string :title
      t.references :author
    end
    conn.create_table :comments do |t|
      t.string :text
      t.references :post
    end
  end

  def self.drop
    conn.drop_table :posts, if_exists: true, force: :cascade
    conn.drop_table :authors, if_exists: true,  force: :cascade
    conn.drop_table :comments, if_exists: true, force: :cascade
  end

  def self.conn
    ActiveRecord::Base.connection
  end
end
