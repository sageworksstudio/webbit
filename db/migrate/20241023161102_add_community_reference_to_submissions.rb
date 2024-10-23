class AddCommunityReferenceToSubmissions < ActiveRecord::Migration[7.2]
  def change
    add_reference :submissions, :community, null: false, foreign_key: true
  end
end
